import React, { useState, useEffect, useRef } from 'react';
import { Container, Button, Badge, Spinner } from 'react-bootstrap';
import { ArrowLeft, Plus } from 'lucide-react';
import { db, storage, auth } from '../services/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';

import EtapaAlvo from './EtapaAlvo';
import CardComparativo from './CardComparativo';
import { obterDadosCorretor } from '../services/userService';
import { novoComparativoVazio, withLocalId } from '../utils/comparativoUtils';
import { validarEtapa1, validarEtapa2, mapComparativoParaFirestore } from '../utils/analiseValidators';
import { validarImagem } from '../utils/fileValidators';

const deletarFotoNoStorage = async (url) => {
    if (!url || typeof url !== 'string' || !url.includes('firebasestorage.googleapis.com')) return;
    try {
        await deleteObject(ref(storage, url));
    } catch (e) {
        console.error('Erro ao remover arquivo do Storage:', e);
    }
};

const FormularioAnalise = ({ user, dadosPreenchidos, aoFinalizar }) => {
    const [etapa, setEtapa] = useState(1);
    const [carregandoUpload, setCarregandoUpload] = useState(false);
    const [carregandoSalvar, setCarregandoSalvar] = useState(false);
    const uploadsEmAndamento = useRef(0);

    const iniciarUpload = () => {
        uploadsEmAndamento.current += 1;
        setCarregandoUpload(true);
    };

    const finalizarUpload = () => {
        uploadsEmAndamento.current = Math.max(0, uploadsEmAndamento.current - 1);
        if (uploadsEmAndamento.current === 0) setCarregandoUpload(false);
    };

    const [dadosAlvo, setDadosAlvo] = useState({
        cliente: '',
        descricao: '',
        endereco: { logradouro: '', bairro: '', cidade: 'Itupeva', estado: 'SP', cep: '', numero: '' },
        atributos: {
            area_total: 0,
            area_construida: 0,
            suites: 0, vagas: 0, dormitorios: 0, salas: 0,
            has_piscina: false, has_area_gourmet: false
        },
        fotos: ['', '', '', '']
    });

    const [comparativos, setComparativos] = useState([]);

    useEffect(() => {
        if (!dadosPreenchidos) return;
        if (dadosPreenchidos.dados_alvo) setDadosAlvo(dadosPreenchidos.dados_alvo);
        if (dadosPreenchidos.comparativos?.length) {
            setComparativos(dadosPreenchidos.comparativos.map(withLocalId));
        }
    }, [dadosPreenchidos]);

    const buscarCEP = async (cep) => {
        const valor = cep.replace(/\D/g, '');
        if (valor.length === 8) {
            try {
                const response = await fetch(`https://viacep.com.br/ws/${valor}/json/`);
                const data = await response.json();
                if (!data.erro) {
                    setDadosAlvo(prev => ({
                        ...prev,
                        endereco: {
                            ...prev.endereco,
                            cep: valor,
                            logradouro: data.logradouro,
                            bairro: data.bairro,
                            cidade: data.localidade,
                            estado: data.uf
                        }
                    }));
                }
            } catch (e) { console.error('Erro ao buscar CEP', e); }
        }
    };

    const executarUpload = async (arquivo, pasta) => {
        if (!arquivo) return '';
        const erroArquivo = validarImagem(arquivo);
        if (erroArquivo) throw new Error(erroArquivo);

        const nomeLimpo = arquivo.name.replace(/[^a-zA-Z0-9.]/g, '_');
        const idUnico = `${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        const arquivoRef = ref(storage, `fotos_${pasta}/${idUnico}_${nomeLimpo}`);
        const result = await uploadBytes(arquivoRef, arquivo, { contentType: arquivo.type });
        return getDownloadURL(result.ref);
    };

    const processarNovoUpload = async (file, index, tipo = 'alvo', idxComp = null) => {
        if (!file) return;
        iniciarUpload();
        try {
            const pasta = tipo === 'alvo' ? 'alvo' : `comp_${idxComp}`;
            const url = await executarUpload(file, pasta);

            if (tipo === 'alvo') {
                setDadosAlvo(prev => {
                    const novas = [...prev.fotos];
                    novas[index] = url;
                    return { ...prev, fotos: novas };
                });
            } else {
                setComparativos(prev => {
                    if (idxComp == null || idxComp < 0 || idxComp >= prev.length) return prev;
                    const alvo = prev[idxComp];
                    if (!alvo) return prev;
                    const novos = [...prev];
                    const fotos = [...(alvo.fotos || [])];
                    fotos[index] = url;
                    novos[idxComp] = { ...alvo, fotos };
                    return novos;
                });
            }
        } catch (err) {
            alert(err.message || 'Erro no upload da imagem.');
            console.error(err);
        } finally {
            finalizarUpload();
        }
    };

    const handleFotoAlvo = (e, index) => {
        const f = e.target.files?.[0];
        if (f) processarNovoUpload(f, index, 'alvo');
        e.target.value = '';
    };

    const handleFotoComparativo = (e, idxComp, idxFoto) => {
        const f = e.target.files?.[0];
        if (f) processarNovoUpload(f, idxFoto, 'comp', idxComp);
        e.target.value = '';
    };

    const handlePasteFoto = async (e, index, tipo = 'alvo', idxComp = null) => {
        const items = e.clipboardData?.items;
        if (!items) return;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                e.preventDefault();
                e.stopPropagation();
                const blob = items[i].getAsFile();
                const file = new File([blob], `pasted_image_${Date.now()}.png`, { type: blob.type });
                await processarNovoUpload(file, index, tipo, idxComp);
                break;
            }
        }
    };

    const mensagemErroEtapa2 = validarEtapa2(comparativos);

    const handleSalvarFinal = async () => {
        const erro = mensagemErroEtapa2;
        if (erro) {
            alert(erro);
            return;
        }

        setCarregandoSalvar(true);
        try {
            const emailLogado = (user?.emailGmail || user?.email || auth.currentUser?.email)?.toLowerCase();

            if (dadosPreenchidos?.id) {
                const fotosAntigasAlvo = dadosPreenchidos.dados_alvo?.fotos || [];
                const fotosNovasAlvo = dadosAlvo.fotos;
                const fotosAntigasComp = (dadosPreenchidos.comparativos || []).flatMap(c => c.fotos || []);
                const fotosNovasComp = comparativos.flatMap(c => c.fotos || []);

                const todasAntigas = [...fotosAntigasAlvo, ...fotosAntigasComp];
                const todasNovas = [...fotosNovasAlvo, ...fotosNovasComp];

                const paraDeletar = todasAntigas.filter(url =>
                    url && url.includes('firebasestorage.googleapis.com') && !todasNovas.includes(url)
                );

                await Promise.all(paraDeletar.map(deletarFotoNoStorage));
            }

            const comparativosFirestore = comparativos.map(mapComparativoParaFirestore);

            /** Em edição, mantém o corretor dono da análise (admin não rouba o id_corretor). */
            let idCorretorPayload = emailLogado;
            let emailPdfPayload = '';
            if (dadosPreenchidos?.id) {
                idCorretorPayload = String(dadosPreenchidos.id_corretor || emailLogado).toLowerCase();
                emailPdfPayload = String(dadosPreenchidos.email_pdf || '').toLowerCase();
                if (!emailPdfPayload && idCorretorPayload) {
                    const perfilDono = await obterDadosCorretor(idCorretorPayload);
                    emailPdfPayload = perfilDono?.emailPDF?.toLowerCase() || '';
                }
            } else {
                const perfil = await obterDadosCorretor(emailLogado);
                emailPdfPayload = perfil?.emailPDF?.toLowerCase() || '';
            }

            const payload = {
                id_corretor: idCorretorPayload,
                email_pdf: emailPdfPayload,
                ultima_atualizacao: serverTimestamp(),
                dados_alvo: dadosAlvo,
                comparativos: comparativosFirestore,
                status: 'concluido'
            };

            if (dadosPreenchidos?.id) {
                await updateDoc(doc(db, 'analises', dadosPreenchidos.id), payload);
                alert('Análise atualizada com sucesso na ST!');
            } else {
                payload.data_criacao = serverTimestamp();
                await addDoc(collection(db, 'analises'), payload);
                alert('Nova análise criada com sucesso na ST!');
            }

            aoFinalizar();
        } catch (e) {
            console.error('Erro ao salvar:', e);
            alert('Erro técnico ao salvar.');
        } finally {
            setCarregandoSalvar(false);
        }
    };

    const overlayAtivo = carregandoUpload || carregandoSalvar;
    const textoOverlay = carregandoSalvar ? 'Salvando...' : 'Enviando imagem...';

    const podeSalvar = mensagemErroEtapa2 === null;

    return (
        <Container className="mt-2 pb-5">
            {overlayAtivo && (
                <div
                    className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-white bg-opacity-75"
                    style={{ zIndex: 9999, pointerEvents: 'all' }}
                    role="status"
                    aria-live="polite"
                >
                    <Spinner animation="border" variant="primary" />
                    <span className="ms-2 fw-bold text-primary text-uppercase">{textoOverlay}</span>
                </div>
            )}

            <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                <Button variant="outline-dark" size="sm" onClick={etapa === 1 ? aoFinalizar : () => setEtapa(1)}>
                    <ArrowLeft size={16} /> Voltar
                </Button>
                <h4 className="fw-bold mb-0">PMI ST Imobiliária</h4>
                <Badge bg="primary" className="px-3 py-2">Etapa {etapa}/2</Badge>
            </div>

            {etapa === 1 ? (
                <>
                    <EtapaAlvo
                        dadosAlvo={dadosAlvo}
                        setDadosAlvo={setDadosAlvo}
                        handleFotoAlvo={handleFotoAlvo}
                        handlePasteAlvo={handlePasteFoto}
                        buscarCEP={buscarCEP}
                    />
                    <Button variant="primary" className="w-100 py-3 fw-bold shadow-sm" onClick={() => {
                        const erro = validarEtapa1(dadosAlvo);
                        if (erro) alert(erro);
                        else { setEtapa(2); window.scrollTo(0, 0); }
                    }}>
                        AVANÇAR PARA COMPARATIVOS
                    </Button>
                </>
            ) : (
                <>
                    <div className="d-flex justify-content-between align-items-center mb-4 p-3 bg-light rounded border">
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={() => setComparativos([...comparativos, novoComparativoVazio()])}
                            disabled={comparativos.length >= 5}
                        >
                            <Plus size={16} className="me-1" /> Adicionar Referência
                        </Button>
                        <Badge
                            bg={podeSalvar ? 'success' : 'warning'}
                            className="p-2 text-wrap text-start"
                            style={{ maxWidth: 'min(100%, 22rem)' }}
                            title={mensagemErroEtapa2 || undefined}
                        >
                            {podeSalvar
                                ? '✓ Pronto para salvar'
                                : (mensagemErroEtapa2 || `Ajuste os comparativos (atual: ${comparativos.length})`)}
                        </Badge>
                    </div>

                    {comparativos.map((comp, idx) => (
                        <CardComparativo
                            key={comp._localId}
                            idx={idx}
                            comp={comp}
                            handleFoto={handleFotoComparativo}
                            handlePaste={(e, fIdx) => handlePasteFoto(e, fIdx, 'comp', idx)}
                            onChange={(i, campo, val) => {
                                setComparativos(prev => {
                                    const novos = [...prev];
                                    if (i < 0 || i >= novos.length) return prev;
                                    novos[i] = { ...novos[i], [campo]: val };
                                    return novos;
                                });
                            }}
                            onRemove={(i) => setComparativos(prev => prev.filter((_, index) => index !== i))}
                        />
                    ))}

                    <Button
                        variant="success"
                        size="lg"
                        className="w-100 py-3 mt-4 fw-bold shadow"
                        onClick={handleSalvarFinal}
                        disabled={!podeSalvar || carregandoSalvar || carregandoUpload}
                        style={{ opacity: podeSalvar ? 1 : 0.6 }}
                    >
                        SALVAR ANÁLISE NA ST IMOBILIÁRIA
                    </Button>
                </>
            )}
        </Container>
    );
};

export default FormularioAnalise;
