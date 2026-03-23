import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Spinner, Modal } from 'react-bootstrap';
import { PlusCircle, Users } from 'lucide-react';

// CONTEXTO
import { useAuth } from '../context/AuthContext';

// COMPONENTES MODULARIZADOS
import FormularioAnalise from '../components/FormularioAnalise';
import BotaoLogout from '../components/BotaoLogout';
import CardAnalise from '../components/CardAnalise';
import ModalGestao from '../components/ModalGestao';
import AdminCorretores from './AdminCorretores';

// SERVIÇOS
import { db } from '../services/firebase';
import { gerarPMI } from '../services/pdf/pdfService';
import { obterDadosCorretor } from '../services/userService';
import { collection, query, onSnapshot, orderBy, doc, deleteDoc, where } from 'firebase/firestore';

const Painel = () => {
    // --- CONSUMINDO O CONTEXTO ---
    const { user } = useAuth();

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

    // --- EFEITO: DADOS EM TEMPO REAL ---
    useEffect(() => {
        if (!user) return;

        let unsubscribeAnalises;

        const carregarDados = () => {
            try {
                // Definimos se é admin baseado nos dados que já estão no contexto
                const eAdmin = user.nivel === 'admin' || user.nivel === 'master';
                setIsAdmin(eAdmin);

                const analisesRef = collection(db, "analises");
                let q;

                if (eAdmin) {
                    q = query(analisesRef, orderBy("data_criacao", "desc"));
                } else {
                    const emailGmail = user.emailGmail?.toLowerCase();
                    const emailST = user.emailPDF?.toLowerCase();

                    // Busca análises vinculadas a qualquer um dos e-mails do corretor
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
                    console.error("Erro no Snapshot:", error);
                    setLoading(false);
                });

            } catch (e) {
                console.error("Erro ao carregar dados:", e);
                setLoading(false);
            }
        };

        carregarDados();
        return () => unsubscribeAnalises && unsubscribeAnalises();
    }, [user]);

    // --- LÓGICA DE GERAÇÃO DO PDF ---
    const handleConfirmarPDF = async (margem) => {
        setExibirOpcoesPDF(false);
        setGerandoPDF(true);
        try {
            const emailDonoAnalise = analiseSelecionada.id_corretor?.toLowerCase();
            
            // Busca dados atualizados do dono da análise (Foto, CRECI, Nome)
            let dadosCorretorParaPDF = await obterDadosCorretor(emailDonoAnalise);

            // Fallback: Se não achar pelo email da análise, usa os dados do usuário logado
            if (!dadosCorretorParaPDF) {
                dadosCorretorParaPDF = user;
            }

            await gerarPMI(analiseSelecionada, dadosCorretorParaPDF, user.emailGmail, margem);
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
            <p className="mt-2 text-muted fw-bold text-uppercase">Sincronizando com ST Imobiliária...</p>
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
                    <small className="text-muted">Bem-vindo, <strong>{user?.nome || 'Corretor'}</strong></small>
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
                        <p className="text-muted italic">Nenhuma análise encontrada em sua carteira.</p>
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

            {/* MODAL DE GESTÃO E PDF (Mantenha igual ao seu código original) */}
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
                    if (window.confirm("Deseja excluir permanentemente este registro?")) {
                        deleteDoc(doc(db, "analises", analiseSelecionada.id));
                        setAnaliseSelecionada(null);
                    }
                }}
            />

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

            {gerandoPDF && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center bg-white bg-opacity-75" style={{ zIndex: 9999 }}>
                    <Spinner animation="grow" variant="primary" />
                    <h5 className="mt-3 fw-bold text-primary">Gerando Relatório Profissional...</h5>
                </div>
            )}
        </Container>
    );
};

export default Painel;