import React, { useState, useEffect } from 'react';
import { Container, Button, Badge, Spinner } from 'react-bootstrap';
import { ArrowLeft, Plus } from 'lucide-react';
import { db, storage, auth } from '../services/firebase';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';

// IMPORTAÇÃO DOS SUB-COMPONENTES MODULARIZADOS
import EtapaAlvo from './EtapaAlvo';
import CardComparativo from './CardComparativo';
import { obterDadosCorretor } from '../services/userService';

const FormularioAnalise = ({ user, dadosPreenchidos, aoFinalizar }) => {
    const [etapa, setEtapa] = useState(1);
    const [carregando, setCarregando] = useState(false);

    // ESTADO INICIAL DO IMÓVEL ALVO
    // No estado inicial do dadosAlvo
    const [dadosAlvo, setDadosAlvo] = useState({
        cliente: '',
        descricao: '',
        endereco: { logradouro: '', bairro: '', cidade: 'Itupeva', estado: 'SP', cep: '', numero: '' },
        atributos: {
            area_total: 0,        // NOVO CAMPO
            area_construida: 0,   // ESPECIFICADO COMO CONSTRUÍDA
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

    // --- LÓGICA DE UPLOAD ---
    const executarUpload = async (arquivo, pasta) => {
        if (!arquivo) return "";
        const nomeLimpo = arquivo.name.replace(/[^a-zA-Z0-9.]/g, "_");
        const idUnico = `${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        const arquivoRef = ref(storage, `fotos_${pasta}/${idUnico}_${nomeLimpo}`);
        const result = await uploadBytes(arquivoRef, arquivo);
        return await getDownloadURL(result.ref);
    };

    const handleFotoAlvo = async (e, index) => {
        const file = e.target.files[0];
        if (!file) return;
        setCarregando(true);
        try {
            const url = await executarUpload(file, 'alvo');
            setDadosAlvo(prev => {
                const novas = [...prev.fotos];
                novas[index] = url;
                return { ...prev, fotos: novas };
            });
        } catch (err) { alert("Erro no upload da foto do alvo.", err); }
        finally { setCarregando(false); }
    };

    const handleFotoComparativo = async (e, idxComp, idxFoto) => {
        const file = e.target.files[0];
        if (!file) return;
        setCarregando(true);
        try {
            const url = await executarUpload(file, `comp_${idxComp}`);
            const novos = [...comparativos];
            novos[idxComp].fotos[idxFoto] = url;
            setComparativos(novos);
        } catch (err) { alert("Erro no upload da foto do comparativo.", err); }
        finally { setCarregando(false); }
    };

    // --- VALIDAÇÕES OBRIGATÓRIAS ETAPA 1 ---
    // --- VALIDAÇÕES OBRIGATÓRIAS ETAPA 1 ---
    const validarEtapa1 = () => {
        const { cliente, descricao, endereco, atributos } = dadosAlvo;

        // 1. Validação de Dados do Cliente e Narrativa
        if (!cliente.trim()) return "O nome do cliente é obrigatório.";
        if (!descricao.trim()) return "A descrição narrativa (texto do PDF) é obrigatória.";

        // 2. Validação de Endereço (Essencial para localização e CEP)
        if (!endereco.cep.trim()) return "O CEP é obrigatório.";
        if (!endereco.logradouro.trim()) return "O logradouro (rua) é obrigatório.";
        if (!endereco.bairro.trim()) return "O bairro é obrigatório.";
        if (!endereco.numero.trim()) return "O número do imóvel é obrigatório.";
        if (!endereco.cidade.trim()) return "A cidade é obrigatória.";

        // 3. Validação de Áreas (Especificando Construída vs Total)
        if (!atributos.area_total || atributos.area_total <= 0) {
            return "Informe a Área Total do Terreno (m²).";
        }
        if (!atributos.area_construida || atributos.area_construida <= 0) {
            return "Informe a Área Construída do imóvel (m²).";
        }

        // 4. Atributos de Composição (Obrigatórios >= 0)
        // Usamos verificação de undefined/null para permitir que o valor seja 0 (ex: zero suítes)
        if (atributos.dormitorios === undefined || atributos.dormitorios === null || atributos.dormitorios < 0) {
            return "Informe a quantidade de dormitórios.";
        }
        if (atributos.vagas === undefined || atributos.vagas === null || atributos.vagas < 0) {
            return "Informe a quantidade de vagas de garagem.";
        }
        if (atributos.suites === undefined || atributos.suites === null || atributos.suites < 0) {
            return "Informe a quantidade de suítes.";
        }

        // 5. Validação de Mídia
        // Garante que pelo menos a primeira foto (capa do PDF) foi carregada
        if (!dadosAlvo.fotos[0] || dadosAlvo.fotos[0] === "") {
            return "A foto principal do imóvel alvo é obrigatória para a capa do PDF.";
        }

        // Se passou por tudo, retorna null (sem erros)
        return null;
    };

    const handleSalvarFinal = async () => {
        // 1. Validação de Quantidade (Regra de Negócio ST Imobiliária)
        const qtd = comparativos.length;
        if (qtd !== 3 && qtd !== 5) {
            return alert(`Regra ST Imobiliária: O PMI deve conter exatamente 3 ou 5 comparativos. (Atual: ${qtd})`);
        }

        // 2. Validação Rigorosa de cada Comparativo
        for (let i = 0; i < comparativos.length; i++) {
            const comp = comparativos[i];
            const n = i + 1; // Número para identificar o card no alerta

            // Campos de texto e links
            if (!comp.bairro?.trim()) return alert(`Comparativo ${n}: O bairro é obrigatório.`);
            if (!comp.link_anuncio?.trim()) return alert(`Comparativo ${n}: O link do anúncio é obrigatório para conferência.`);

            // Áreas (Diferenciando Total de Construída)
            if (!comp.area_total || comp.area_total <= 0) {
                return alert(`Comparativo ${n}: Informe a Área Total do Terreno (m²).`);
            }
            if (!comp.area_construida || comp.area_construida <= 0) {
                return alert(`Comparativo ${n}: Informe a Área Construída (m²).`);
            }

            // Valores e Atributos
            if (!comp.valor_venda || comp.valor_venda <= 0) {
                return alert(`Comparativo ${n}: O valor de venda é obrigatório.`);
            }
            if (comp.dormitorios === undefined || comp.dormitorios === null || comp.dormitorios < 0) {
                return alert(`Comparativo ${n}: Informe a quantidade de dormitórios.`);
            }

            // Foto Obrigatória
            if (!comp.fotos[0] || comp.fotos[0] === "") {
                return alert(`Comparativo ${n}: A foto principal é obrigatória para o relatório.`);
            }
        }

        // 3. Início do Processo de Salvamento
        setCarregando(true);

        try {
            // Identificação do Corretor (Ponte Gmail -> ST Imobiliária)
            const emailGmail = (user?.email || auth.currentUser?.email)?.toLowerCase();
            const perfil = await obterDadosCorretor(emailGmail);

            if (!emailGmail) {
                setCarregando(false);
                return alert("Erro crítico: Não foi possível identificar o corretor.");
            }

            const payload = {
                id_corretor: emailGmail,
                email_pdf: perfil?.emailPDF?.toLowerCase() || '',
                ultima_atualizacao: serverTimestamp(),
                dados_alvo: dadosAlvo,
                comparativos: comparativos.map((comp) => ({
                    ...comp,
                    valor_venda: Number(comp.valor_venda || 0) / 100
                })),
                status: 'concluido'
            };

            // 4. Gravação no Firestore (Update ou Create)
            if (dadosPreenchidos?.id) {
                // Se já existe um ID, estamos editando
                await updateDoc(doc(db, "analises", dadosPreenchidos.id), payload);
            } else {
                // Se não existe ID, é uma nova análise
                payload.data_criacao = serverTimestamp();
                await addDoc(collection(db, "analises"), payload);
            }

            alert("Análise salva com sucesso na ST Imobiliária!");
            aoFinalizar(); // Volta para a Home

        } catch (e) {
            alert("Erro técnico ao salvar no banco de dados.");
            console.error("Erro no salvamento:", e);
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
                                bairro: '', valor_venda: 0, area_construida: 0,
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