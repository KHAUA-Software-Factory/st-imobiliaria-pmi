import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Spinner, Modal } from 'react-bootstrap';
import { PlusCircle, Users } from 'lucide-react';

// COMPONENTES MODULARIZADOS
import FormularioAnalise from '../components/FormularioAnalise';
import BotaoLogout from '../components/BotaoLogout';
import CardAnalise from '../components/CardAnalise';
import ModalGestao from '../components/ModalGestao';
import AdminCorretores from './AdminCorretores';

// SERVIÇOS
import { db, auth } from '../services/firebase';
import { gerarPMI } from '../services/pdf/pdfService';
import { obterDadosCorretor } from '../services/userService';
import { collection, query, onSnapshot, orderBy, doc, deleteDoc, where } from 'firebase/firestore';

const Home = ({ user }) => {
    // --- ESTADOS DE DADOS ---
    const [analises, setAnalises] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    // --- ESTADOS DE INTERFACE ---
    const [exibirFormulario, setExibirFormulario] = useState(false);
    const [verCorretores, setVerCorretores] = useState(false);
    const [analiseSelecionada, setAnaliseSelecionada] = useState(null);
    const [exibirOpcoesPDF, setExibirOpcoesPDF] = useState(false);
    const [dadosParaEditar, setDadosParaEditar] = useState(null);
    const [gerandoPDF, setGerandoPDF] = useState(false);

    // --- EFEITO: PERMISSÕES E DADOS EM TEMPO REAL ---
    useEffect(() => {
        let unsubscribeAnalises;

        const inicializarPainel = async () => {
            const emailGmail = (user?.email || auth.currentUser?.email)?.toLowerCase();

            if (emailGmail) {
                try {
                    const dadosPerfil = await obterDadosCorretor(emailGmail);

                    // --- PROTEÇÃO: Se o perfil não existir, não tentamos fazer a query ---
                    if (!dadosPerfil) {
                        console.warn("Perfil não localizado para:", emailGmail);
                        setLoading(false);
                        return;
                    }

                    const eAdmin = dadosPerfil.nivel === 'admin' || dadosPerfil.nivel === 'master';
                    setIsAdmin(eAdmin);

                    const analisesRef = collection(db, "analises");
                    let q;

                    if (eAdmin) {
                        // Admin continua vendo absolutamente tudo
                        q = query(analisesRef, orderBy("data_criacao", "desc"));
                    } else {
                        const emailGmail = dadosPerfil.emailGmail?.toLowerCase();
                        const emailST = dadosPerfil.emailPDF?.toLowerCase();

                        // FILTRO HÍBRIDO: Busca pelos dois e-mails ao mesmo tempo
                        q = query(
                            analisesRef,
                            where("id_corretor", "in", [emailGmail, emailST].filter(Boolean)),
                            orderBy("data_criacao", "desc")
                        );
                    }
                    unsubscribeAnalises = onSnapshot(q, (querySnapshot) => {
                        const docs = [];
                        querySnapshot.forEach((doc) => docs.push({ id: doc.id, ...doc.data() }));
                        setAnalises(docs);
                        setLoading(false);
                    }, (error) => {
                        // SE O ERRO DE ÍNDICE ACONTECER, ELE VAI APARECER AQUI
                        console.error("Erro no Snapshot:", error);
                        setLoading(false);
                    });

                } catch (e) {
                    console.error("Erro ao inicializar:", e);
                    setLoading(false);
                }
            }
        };

        inicializarPainel();
        return () => unsubscribeAnalises && unsubscribeAnalises();
    }, [user]);
    // --- LÓGICA DE GERAÇÃO DO PDF (CORRIGIDA) ---
    const handleConfirmarPDF = async (margem) => {
        setExibirOpcoesPDF(false);
        setGerandoPDF(true);
        try {
            // 1. Identifica os e-mails
            const emailDonoAnalise = analiseSelecionada.id_corretor?.toLowerCase();
            const emailLogadoGmail = (user?.email || auth.currentUser?.email)?.toLowerCase();

            // 2. Tenta buscar os dados do dono da análise
            let dadosCorretor = await obterDadosCorretor(emailDonoAnalise);

            // 3. A CHAVE DO PROBLEMA: Se não achou pelo e-mail da análise, 
            // busca pelo e-mail logado (Gmail), que é onde estão os dados reais no seu Firestore
            if (!dadosCorretor && emailLogadoGmail) {
                console.log("Dados não encontrados pelo ID da análise, buscando pelo Gmail logado...");
                dadosCorretor = await obterDadosCorretor(emailLogadoGmail);
            }

            if (!dadosCorretor) {
                throw new Error("Não encontramos seu perfil de corretor. Verifique o cadastro na aba EQUIPE.");
            }

            // 4. Gera o PDF passando os dados encontrados
            // Passamos o emailLogadoGmail como fallback para o texto do PDF
            await gerarPMI(analiseSelecionada, dadosCorretor, emailLogadoGmail, margem);

            setAnaliseSelecionada(null);
        } catch (err) {
            alert(`Erro ao gerar o PDF: ${err.message}`);
            console.error(err);
        } finally {
            setGerandoPDF(false);
        }
    };

    // --- RENDERIZAÇÃO ---

    if (loading) return (
        <Container className="text-center mt-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2 text-muted fw-bold text-uppercase">Carregando Painel ST...</p>
        </Container>
    );

    if (verCorretores && isAdmin) {
        return <AdminCorretores aoVoltar={() => setVerCorretores(false)} />;
    }

    return (
        <Container className="mt-4 pb-5">
            {/* HEADER */}
            <div className="d-flex justify-content-between align-items-center mb-4 p-3 bg-white shadow-sm rounded border-start border-primary border-4">
                <div>
                    <h5 className="mb-0 fw-bold" style={{ color: "#052739" }}>ST Imobiliária | Gestão PMI</h5>
                    <small className="text-muted">Olá, {user?.nome || 'Corretor'}</small>
                </div>
                <div className="d-flex align-items-center">
                    {isAdmin && (
                        <Button
                            variant="outline-primary"
                            size="sm"
                            className="me-2 fw-bold d-flex align-items-center shadow-sm"
                            onClick={() => setVerCorretores(true)}
                        >
                            <Users size={16} className="me-1" /> EQUIPE
                        </Button>
                    )}
                    <BotaoLogout />
                </div>
            </div>

            {/* BARRA DE AÇÕES */}
            <div className="d-flex justify-content-between align-items-center mb-4 p-4 bg-white rounded shadow-sm border">
                <h2 className="fw-bold mb-0 text-primary">Avaliações</h2>
                <Button
                    variant="primary"
                    size="lg"
                    className="fw-bold shadow"
                    onClick={() => { setExibirFormulario(true); setDadosParaEditar(null); }}
                >
                    <PlusCircle size={20} className="me-2" /> NOVA ANÁLISE
                </Button>
            </div>

            {/* FORMULÁRIO */}
            {exibirFormulario && (
                <div className="mb-5 bg-white p-4 rounded shadow-lg border">
                    <FormularioAnalise
                        user={user}
                        dadosPreenchidos={dadosParaEditar}
                        aoFinalizar={() => setExibirFormulario(false)}
                    />
                </div>
            )}

            {/* LISTA DE CARDS */}
            <Row>
                {analises.length === 0 && !exibirFormulario && (
                    <Col className="text-center py-5">
                        <p className="text-muted italic">Nenhuma análise cadastrada em Itupeva ainda.</p>
                    </Col>
                )}
                {analises.map(item => (
                    <CardAnalise
                        key={item.id}
                        item={item}
                        onGerir={(analise) => setAnaliseSelecionada(analise)}
                    />
                ))}
            </Row>

            {/* MODAL DE GESTÃO */}
            <ModalGestao
                show={!!analiseSelecionada && !exibirOpcoesPDF}
                onHide={() => setAnaliseSelecionada(null)}
                onEdit={() => {
                    setDadosParaEditar(analiseSelecionada);
                    setExibirFormulario(true);
                    setAnaliseSelecionada(null);
                    window.scrollTo(0, 0);
                }}
                onOpenPdfOptions={() => setExibirOpcoesPDF(true)}
                onDelete={() => {
                    if (window.confirm("Deseja excluir permanentemente este registro da ST Imobiliária?")) {
                        deleteDoc(doc(db, "analises", analiseSelecionada.id));
                        setAnaliseSelecionada(null);
                    }
                }}
            />

            {/* MODAL DE MARGEM PDF */}
            <Modal show={exibirOpcoesPDF} onHide={() => setExibirOpcoesPDF(false)} centered size="sm">
                <Modal.Header closeButton className="bg-dark text-white">
                    <Modal.Title className="fs-6 fw-bold text-uppercase">Margem Estratégica</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4 text-center">
                    <div className="d-grid gap-3">
                        <Button variant="outline-primary" className="fw-bold py-2" onClick={() => handleConfirmarPDF(0)}>Média (0%)</Button>
                        <Button variant="outline-warning" className="fw-bold py-2" onClick={() => handleConfirmarPDF(10)}>-10% (Gordura)</Button>
                        <Button variant="outline-danger" className="fw-bold py-2" onClick={() => handleConfirmarPDF(15)}>-15% (Liquidez)</Button>
                        <Button variant="danger" className="fw-bold py-2" onClick={() => handleConfirmarPDF(20)}>-20% (Urgência)</Button>
                    </div>
                </Modal.Body>
            </Modal>

            {/* OVERLAY DE CARREGAMENTO PDF */}
            {gerandoPDF && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center bg-white bg-opacity-75" style={{ zIndex: 9999 }}>
                    <Spinner animation="grow" variant="primary" />
                    <h5 className="mt-3 fw-bold text-primary animate-pulse">Gerando PMI Profissional...</h5>
                </div>
            )}
        </Container>
    );
};

export default Home;