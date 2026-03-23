import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Spinner, Modal, Nav } from 'react-bootstrap';
import {
    PlusCircle, Users, FileText, LayoutDashboard,
    FilePlus, LogOut, Menu, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // Certifique-se de que esta linha existe

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
    const { user } = useAuth();
    const navigate = useNavigate();
    // --- ESTADOS DE INTERFACE ---
    const [menuAberto, setMenuAberto] = useState(true);
    const [loading, setLoading] = useState(true);
    const [exibirFormulario, setExibirFormulario] = useState(false);
    const [verCorretores, setVerCorretores] = useState(false);
    const [exibirNovoContrato, setExibirNovoContrato] = useState(false); // NOVO WORKFLOW

    // --- ESTADOS DE DADOS ---
    const [analises, setAnalises] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [analiseSelecionada, setAnaliseSelecionada] = useState(null);
    const [exibirOpcoesPDF, setExibirOpcoesPDF] = useState(false);
    const [dadosParaEditar, setDadosParaEditar] = useState(null);
    const [gerandoPDF, setGerandoPDF] = useState(false);

    useEffect(() => {
        if (!user) return;
        const eAdmin = user.nivel === 'admin' || user.nivel === 'master';
        setIsAdmin(eAdmin);

        const analisesRef = collection(db, "analises");
        let q;
        if (eAdmin) {
            q = query(analisesRef, orderBy("data_criacao", "desc"));
        } else {
            const emails = [user.emailGmail?.toLowerCase(), user.emailPDF?.toLowerCase()].filter(Boolean);
            q = query(analisesRef, where("id_corretor", "in", emails), orderBy("data_criacao", "desc"));
        }

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const docs = [];
            snapshot.forEach((doc) => docs.push({ id: doc.id, ...doc.data() }));
            setAnalises(docs);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const handleConfirmarPDF = async (margem) => {
        setExibirOpcoesPDF(false);
        setGerandoPDF(true);
        try {
            const emailDono = analiseSelecionada.id_corretor?.toLowerCase();
            let dadosCorretor = await obterDadosCorretor(emailDono) || user;
            await gerarPMI(analiseSelecionada, dadosCorretor, user.emailGmail, margem);
            setAnaliseSelecionada(null);
        } catch (err) {
            alert(`Erro: ${err.message}`);
        } finally {
            setGerandoPDF(false);
        }
    };

    if (loading) return (
        <Container className="text-center mt-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2 text-muted fw-bold text-uppercase">Sincronizando ST Imobiliária...</p>
        </Container>
    );

    return (
        <Container fluid className="p-0" style={{ backgroundColor: '#f4f7f6', minHeight: '100vh' }}>
            <Row className="g-0">

                {/* --- SIDEBAR DINÂMICA --- */}
                <Col
                    xs="auto"
                    className="bg-white shadow-sm d-flex flex-column py-4"
                    style={{
                        width: menuAberto ? '240px' : '80px',
                        height: '100vh',
                        position: 'sticky',
                        top: 0,
                        transition: 'width 0.3s ease',
                        zIndex: 1000
                    }}
                >
                    {/* TOGGLE BUTTON */}
                    <Button
                        variant="light"
                        onClick={() => setMenuAberto(!menuAberto)}
                        className="mx-auto mb-4 rounded-circle shadow-sm p-1"
                    >
                        {menuAberto ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                    </Button>

                    {/* PERFIL */}
                    <div className="text-center mb-4 px-2">
                        <img
                            src={user?.foto || 'https://via.placeholder.com/100'}
                            alt="Perfil"
                            className="rounded-circle mb-2 border border-2 border-primary"
                            style={{
                                width: menuAberto ? '70px' : '45px',
                                height: menuAberto ? '70px' : '45px',
                                objectFit: 'cover',
                                transition: '0.3s'
                            }}
                        />
                        {menuAberto && (
                            <div className="animate__animated animate__fadeIn">
                                <h6 className="fw-bold mb-0 text-truncate px-2">{user?.nome || 'Gilberto'}</h6>
                                <small className="text-muted fw-bold" style={{ fontSize: '10px' }}>MASTER</small>
                            </div>
                        )}
                    </div>

                    <hr className="mx-3" />

                    {/* NAVEGAÇÃO */}
                    <Nav className="flex-column gap-2 px-2">
                        <Nav.Link
                            className={`d-flex align-items-center p-2 rounded ${!exibirNovoContrato && !verCorretores ? 'bg-primary text-white shadow' : 'text-dark'}`}
                            onClick={() => { setExibirNovoContrato(false); setVerCorretores(false); }}
                        >
                            <LayoutDashboard size={20} />
                            {menuAberto && <span className="ms-2 fw-bold">DASHBOARD</span>}
                        </Nav.Link>

                        <Nav.Link
                            className={`d-flex align-items-center p-2 rounded ${exibirNovoContrato ? 'bg-primary text-white shadow' : 'text-dark'}`}
                            onClick={() => navigate('/pmi/novo-contrato')}
                        >
                            <FilePlus size={20} />
                            {menuAberto && <span className="ms-2 fw-bold">NOVO CONTRATO</span>}
                        </Nav.Link>

                        {isAdmin && (
                            <Nav.Link
                                className={`d-flex align-items-center p-2 rounded ${verCorretores ? 'bg-primary text-white shadow' : 'text-dark'}`}
                                onClick={() => setVerCorretores(true)}
                            >
                                <Users size={20} />
                                {menuAberto && <span className="ms-2 fw-bold">MINHA EQUIPE</span>}
                            </Nav.Link>
                        )}
                    </Nav>

                    {/* LOGOUT NO RODAPÉ */}
                    <div className="mt-auto px-2 border-top pt-3">
                        <BotaoLogout contraido={!menuAberto} />
                    </div>
                </Col>

                {/* --- ÁREA DE CONTEÚDO --- */}
                <Col className="p-4 p-lg-5 overflow-auto">

                    {verCorretores && isAdmin ? (
                        <AdminCorretores aoVoltar={() => setVerCorretores(false)} />
                    ) : exibirNovoContrato ? (
                        <div className="text-center py-5 bg-white rounded shadow-sm border">
                            <h2 className="fw-bold text-primary">Workflow de Minutas</h2>
                            <p className="text-muted">Módulo em desenvolvimento para a ST Imobiliária.</p>
                            <Button onClick={() => setExibirNovoContrato(false)}>Voltar ao Início</Button>
                        </div>
                    ) : (
                        <>
                            {/* HEADER DE AÇÕES */}
                            <div className="d-flex justify-content-between align-items-center mb-5">
                                <h2 className="fw-bold mb-0 text-primary">Painel de Avaliações</h2>
                                <Button
                                    variant="primary"
                                    size="lg"
                                    className="fw-bold shadow d-flex align-items-center"
                                    onClick={() => { setExibirFormulario(true); setDadosParaEditar(null); }}
                                >
                                    <PlusCircle size={22} className="me-2" /> NOVA ANÁLISE
                                </Button>
                            </div>

                            {/* FORMULÁRIO DE ANÁLISE */}
                            {exibirFormulario && (
                                <div className="mb-5 bg-white p-4 rounded shadow border-start border-primary border-4 animate__animated animate__fadeInDown">
                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                        <h4 className="fw-bold">Inserir Nova Avaliação</h4>
                                        <Button variant="outline-secondary" size="sm" onClick={() => setExibirFormulario(false)}>Fechar</Button>
                                    </div>
                                    <FormularioAnalise
                                        user={user}
                                        dadosPreenchidos={dadosParaEditar}
                                        aoFinalizar={() => setExibirFormulario(false)}
                                    />
                                </div>
                            )}

                            {/* GRID DE CARDS COM ESPAÇAMENTO REAL */}
                            <Row className="g-4 pb-5">
                                {analises.length === 0 && !exibirFormulario && (
                                    <Col xs={12} className="text-center py-5">
                                        <p className="text-muted h5">Nenhuma análise encontrada.</p>
                                    </Col>
                                )}

                                {analises.map(item => (
                                    /* xs={12}: 1 card por linha no celular
                                       md={6}:  2 cards por linha no tablet
                                       lg={4}:  3 cards por linha no MacBook (telas comuns)
                                       xxl={3}: 4 cards por linha em monitores UltraWide
                                    */
                                    <Col key={item.id} xs={12} md={6} lg={4} xxl={3}>
                                        <div className="h-100 shadow-sm rounded border bg-white p-2">
                                            <CardAnalise
                                                item={item}
                                                onGerir={(analise) => setAnaliseSelecionada(analise)}
                                            />
                                        </div>
                                    </Col>
                                ))}
                            </Row>
                        </>
                    )}
                </Col>
            </Row>

            {/* MODAIS DE GESTÃO E PDF */}
            <ModalGestao
                show={!!analiseSelecionada}
                onHide={() => setAnaliseSelecionada(null)}
                analise={analiseSelecionada} // PASSANDO OS DADOS AQUI
                onEdit={() => {
                    setDadosParaEditar(analiseSelecionada);
                    setExibirFormulario(true);
                    setAnaliseSelecionada(null);
                }}
                onGerarPdf={(margem) => handleConfirmarPDF(margem)} // CHAMA O PDF DIRETO
                onDelete={() => {
                    if (window.confirm("Confirmar exclusão desta análise?")) {
                        deleteDoc(doc(db, "analises", analiseSelecionada.id));
                        setAnaliseSelecionada(null);
                    }
                }}
            />

            <Modal show={exibirOpcoesPDF} onHide={() => setExibirOpcoesPDF(false)} centered size="sm">
                <Modal.Header closeButton className="bg-primary text-white border-0">
                    <Modal.Title className="fs-6 fw-bold">AJUSTE DE MARGEM</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4 text-center d-grid gap-3">
                    <Button variant="outline-primary" className="fw-bold py-2" onClick={() => handleConfirmarPDF(0)}>MÉDIA (0%)</Button>
                    <Button variant="outline-danger" className="fw-bold py-2" onClick={() => handleConfirmarPDF(15)}>-15% (LIQUIDEZ)</Button>
                    <Button variant="danger" className="fw-bold py-2" onClick={() => handleConfirmarPDF(20)}>-20% (URGÊNCIA)</Button>
                </Modal.Body>
            </Modal>

            {/* LOADING OVERLAY PDF */}
            {gerandoPDF && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center bg-white bg-opacity-75" style={{ zIndex: 9999 }}>
                    <Spinner animation="grow" variant="primary" />
                    <h5 className="mt-3 fw-bold text-primary">Formatando Relatório...</h5>
                </div>
            )}
        </Container>
    );
};

export default Painel;