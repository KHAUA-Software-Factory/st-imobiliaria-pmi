import React, { useState, useEffect } from 'react';
import { Container, Button, Badge, Spinner } from 'react-bootstrap';
import { ArrowLeft, Plus } from 'lucide-react';
import { db, storage, auth } from '../services/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';

// IMPORTAÇÃO DOS SUB-COMPONENTES MODULARIZADOS
import EtapaAlvo from './EtapaAlvo';
import CardComparativo from './CardComparativo';
import { obterDadosCorretor } from '../services/userService';

const FormularioAnalise = ({ user, dadosPreenchidos, aoFinalizar }) => {
    const [etapa, setEtapa] = useState(1);
    const [carregando, setCarregando] = useState(false);

    // ESTADO INICIAL DO IMÓVEL ALVO
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
        fotos: ["", "", "", ""]
    });

    const [comparativos, setComparativos] = useState([]);

    useEffect(() => {
        if (dadosPreenchidos) {
            if (dadosPreenchidos.dados_alvo) setDadosAlvo(dadosPreenchidos.dados_alvo);
            if (dadosPreenchidos.comparativos) setComparativos(dadosPreenchidos.comparativos);
        }
    }, [dadosPreenchidos]);

    // --- LÓGICA DE CEP ---
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
            } catch (e) { console.error("Erro ao buscar CEP", e); }
        }
    };

    // --- 🚀 LÓGICA DE UPLOAD UNIFICADA (INPUT + PASTE) ---
    const executarUpload = async (arquivo, pasta) => {
        if (!arquivo) return "";
        const nomeLimpo = arquivo.name.replace(/[^a-zA-Z0-9.]/g, "_");
        const idUnico = `${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        const arquivoRef = ref(storage, `fotos_${pasta}/${idUnico}_${nomeLimpo}`);
        const result = await uploadBytes(arquivoRef, arquivo);
        return await getDownloadURL(result.ref);
    };

    const processarNovoUpload = async (file, index, tipo = 'alvo', idxComp = null) => {
        if (!file) return;
        setCarregando(true);
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
                    const novos = [...prev];
                    novos[idxComp].fotos[index] = url;
                    return novos;
                });
            }
        } catch (err) {
            alert("Erro no upload da imagem.");
            console.error(err);
        } finally {
            setCarregando(false);
        }
    };

    // Captura o clique tradicional
    const handleFotoAlvo = (e, index) => processarNovoUpload(e.target.files[0], index, 'alvo');
    const handleFotoComparativo = (e, idxComp, idxFoto) => processarNovoUpload(e.target.files[0], idxFoto, 'comp', idxComp);

    // MÁGICA DO PASTE: Captura o Ctrl+V / Cmd+V
    const handlePasteFoto = async (e, index, tipo = 'alvo', idxComp = null) => {
        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf("image") !== -1) {
                const blob = items[i].getAsFile();
                const file = new File([blob], `pasted_image_${Date.now()}.png`, { type: blob.type });
                await processarNovoUpload(file, index, tipo, idxComp);
                break;
            }
        }
    };

    // --- VALIDAÇÕES OBRIGATÓRIAS ETAPA 1 ---
    const validarEtapa1 = () => {
        const { cliente, descricao, endereco, atributos } = dadosAlvo;
        if (!cliente.trim()) return "O nome do cliente é obrigatório.";
        if (!descricao.trim()) return "A descrição narrativa é obrigatória.";
        if (!endereco.cep.trim()) return "O CEP é obrigatório.";
        if (!endereco.logradouro.trim()) return "O logradouro é obrigatório.";
        if (!endereco.bairro.trim()) return "O bairro é obrigatório.";
        if (!endereco.numero.trim()) return "O número é obrigatório.";
        if (!atributos.area_total || atributos.area_total <= 0) return "Informe a Área Total.";
        if (!atributos.area_construida || atributos.area_construida <= 0) return "Informe a Área Construída.";
        if (!dadosAlvo.fotos[0]) return "A foto principal do imóvel alvo é obrigatória.";
        return null;
    };

    // --- 🧹 SALVAMENTO COM CLEANUP DE NUVEM (STORAGE) ---
    const handleSalvarFinal = async () => {
        const qtd = comparativos.length;
        if (qtd !== 3 && qtd !== 5) {
            return alert(`Regra ST Imobiliária: O PMI deve conter exatamente 3 ou 5 comparativos. (Atual: ${qtd})`);
        }

        setCarregando(true);
        try {
            const emailGmail = (user?.email || auth.currentUser?.email)?.toLowerCase();
            const perfil = await obterDadosCorretor(emailGmail);

            // 1. Lógica de Limpeza de Fotos Antigas
            if (dadosPreenchidos?.id) {
                const fotosAntigasAlvo = dadosPreenchidos.dados_alvo?.fotos || [];
                const fotosNovasAlvo = dadosAlvo.fotos;
                const fotosAntigasComp = (dadosPreenchidos.comparativos || []).flatMap(c => c.fotos);
                const fotosNovasComp = comparativos.flatMap(c => c.fotos);

                const todasAntigas = [...fotosAntigasAlvo, ...fotosAntigasComp];
                const todasNovas = [...fotosNovasAlvo, ...fotosNovasComp];

                const paraDeletar = todasAntigas.filter(url => 
                    url && url.includes("firebase") && !todasNovas.includes(url)
                );

                if (paraDeletar.length > 0) {
                    console.log("KHAUA Cleanup: Removendo fotos substituídas...");
                    await Promise.allSettled(paraDeletar.map(url => deleteObject(ref(storage, url))));
                }
            }

            const payload = {
                id_corretor: emailGmail,
                email_pdf: perfil?.emailPDF?.toLowerCase() || '',
                ultima_atualizacao: serverTimestamp(),
                dados_alvo: dadosAlvo, 
                comparativos: comparativos.map((comp) => ({
                    ...comp,
                    valor_venda: typeof comp.valor_venda === 'string' 
                        ? Number(comp.valor_venda.replace(/\D/g, '')) / 100 
                        : comp.valor_venda
                })),
                status: 'concluido'
            };

            if (dadosPreenchidos?.id) {
                await updateDoc(doc(db, "analises", dadosPreenchidos.id), payload);
                alert("Análise atualizada com sucesso na ST!");
            } else {
                payload.data_criacao = serverTimestamp();
                await addDoc(collection(db, "analises"), payload);
                alert("Nova análise criada com sucesso na ST!");
            }

            aoFinalizar();

        } catch (e) {
            console.error("Erro ao salvar:", e);
            alert("Erro técnico ao salvar.");
        } finally {
            setCarregando(false);
        }
    };

    return (
        <Container className="mt-2 pb-5">
            {carregando && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-white opacity-75" style={{ zIndex: 9999 }}>
                    <Spinner animation="border" variant="primary" />
                    <span className="ms-2 fw-bold text-primary text-uppercase">Processando...</span>
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
                        handlePasteAlvo={handlePasteFoto} // Passando função de Paste
                        buscarCEP={buscarCEP}
                    />
                    <Button variant="primary" className="w-100 py-3 fw-bold shadow-sm" onClick={() => {
                        const erro = validarEtapa1();
                        if (erro) alert(erro); else { setEtapa(2); window.scrollTo(0, 0); }
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
                            onClick={() => setComparativos([...comparativos, {
                                bairro: '', valor_venda: 0, area_construida: 0, area_total: 0,
                                suites: 0, vagas: 0, salas: 0, dormitorios: 0,
                                has_piscina: false, has_area_gourmet: false,
                                fotos: ["", "", "", ""], link_anuncio: ''
                            }])}
                            disabled={comparativos.length >= 5}
                        >
                            <Plus size={16} className="me-1" /> Adicionar Referência
                        </Button>
                        <Badge bg={comparativos.length === 3 || comparativos.length === 5 ? "success" : "warning"} className="p-2">
                            {comparativos.length === 3 || comparativos.length === 5 ? "✓ Padrão Atingido" : `Mínimo 3 ou 5 (Atual: ${comparativos.length})`}
                        </Badge>
                    </div>

                    {comparativos.map((comp, idx) => (
                        <CardComparativo
                            key={idx}
                            idx={idx}
                            comp={comp}
                            handleFoto={handleFotoComparativo}
                            handlePaste={(e, fIdx) => handlePasteFoto(e, fIdx, 'comp', idx)} // Passando função de Paste
                            onChange={(i, campo, val) => {
                                const novos = [...comparativos];
                                novos[i][campo] = val;
                                setComparativos(novos);
                            }}
                            onRemove={(i) => setComparativos(comparativos.filter((_, index) => index !== i))}
                        />
                    ))}

                    <Button
                        variant="success"
                        size="lg"
                        className="w-100 py-3 mt-4 fw-bold shadow"
                        onClick={handleSalvarFinal}
                        style={{ opacity: (comparativos.length === 3 || comparativos.length === 5) ? 1 : 0.6 }}
                    >
                        SALVAR ANÁLISE NA ST IMOBILIÁRIA
                    </Button>
                </>
            )}
        </Container>
    );
};

export default FormularioAnalise;