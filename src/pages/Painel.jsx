import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Spinner, Nav } from 'react-bootstrap';
import {
    PlusCircle, Users, LayoutDashboard,
    FilePlus, ChevronLeft, ChevronRight, ClipboardList
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// CONTEXTO E COMPONENTES
import { useAuth } from '../context/AuthContext';
import FormularioAnalise from '../components/FormularioAnalise';
import BotaoLogout from '../components/BotaoLogout';
import CardAnalise from '../components/CardAnalise';
import ModalGestao from '../components/ModalGestao';
import AdminCorretores from './AdminCorretores';

// FIREBASE
import { db } from '../services/firebase';
import { gerarPMI } from '../services/pdf/pdfService';
import { obterDadosCorretor } from '../services/userService';
import { collection, query, onSnapshot, orderBy, doc, deleteDoc, where } from 'firebase/firestore';

const Painel = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // --- ESTADOS ---
    const [menuAberto, setMenuAberto] = useState(true);
    const [loading, setLoading] = useState(true);
    const [exibirFormulario, setExibirFormulario] = useState(false);
    const [verCorretores, setVerCorretores] = useState(false);
    const [gerandoPDF, setGerandoPDF] = useState(false);
    const [analises, setAnalises] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [analiseSelecionada, setAnaliseSelecionada] = useState(null);
    const [dadosParaEditar, setDadosParaEditar] = useState(null);

    useEffect(() => {
        // 1. Se não houver usuário, encerra o loading
        if (!user) {
            setLoading(false);
            return;
        }

        // 2. Identifica o nível (Admin/Master vê tudo)
        const nivelLimpo = String(user.nivel || 'corretor').toLowerCase();
        const eAdmin = nivelLimpo === 'admin' || nivelLimpo === 'master';
        setIsAdmin(eAdmin);

        const analisesRef = collection(db, "analises");
        let q;

        try {
            if (eAdmin) {
                // Admin/Master da KHAUA. vê todas as análises
                q = query(analisesRef, orderBy("data_criacao", "desc"));
            } else {
                // Filtro para Corretor (Busca por e-mail no id_corretor)
                const listaEmails = [
                    user.emailGmail?.toLowerCase(),
                    user.emailPDF?.toLowerCase(),
                    user.email?.toLowerCase()
                ].filter((email, index, self) => email && self.indexOf(email) === index);

                if (listaEmails.length > 0) {
                    q = query(analisesRef, where("id_corretor", "in", listaEmails), orderBy("data_criacao", "desc"));
                } else {
                    // Caso o corretor não tenha e-mail nenhum no cadastro, mostra painel vazio
                    setAnalises([]);
                    setLoading(false);
                    return;
                }
            }

            // 3. Escuta em Tempo Real (onSnapshot)
            const unsubscribe = onSnapshot(q, (snapshot) => {
                const docs = [];
                snapshot.forEach((doc) => {
                    docs.push({ id: doc.id, ...doc.data() });
                });
                
                // Sucesso: Atualiza análises e para o Spinner
                setAnalises(docs);
                setLoading(false); 
            }, (error) => {
                console.error("Erro Firestore:", error);
                // Erro (ex: Permissão): Para o Spinner mesmo assim para não travar a tela do Mac
                setAnalises([]);
                setLoading(false);
            });

            return () => unsubscribe();
        } catch (err) {
            console.error("Erro na montagem da Query:", err);
            setLoading(false);
        }
    }, [user]);

    const handleConfirmarPDF = async (margem) => {
        if (!analiseSelecionada) return;
        setGerandoPDF(true);
        try {
            const emailDono = analiseSelecionada.id_corretor?.toLowerCase();
            let dadosCorretor = await obterDadosCorretor(emailDono) || user;
            await gerarPMI(analiseSelecionada, dadosCorretor, user.emailGmail, margem);
            setAnaliseSelecionada(null);
        } catch (err) {
            alert(`Erro PDF: ${err.message}`);
        } finally {
            setGerandoPDF(false);
        }
    };

    // TELA DE CARREGAMENTO (SPINNER)
    if (loading) return (
        <Container className="text-center mt-5 py-5 h-100 d-flex flex-column align-items-center justify-content-center">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3 text-muted fw-bold text-uppercase" style={{letterSpacing: '2px', fontSize: '12px'}}>
                Sincronizando KHAUA...
            </p>
        </Container>
    );

    return (
        <Container fluid className="p-0" style={{ backgroundColor: '#f4f7f6', minHeight: '100vh' }}>
            <Row className="g-0">
                {/* SIDEBAR */}
                <Col xs="auto" className="bg-white shadow-sm d-flex flex-column py-4"
                    style={{ width: menuAberto ? '240px' : '80px', height: '100vh', position: 'sticky', top: 0, transition: '0.3s', zIndex: 1000 }}>
                    
                    <Button variant="light" onClick={() => setMenuAberto(!menuAberto)} className="mx-auto mb-4 rounded-circle shadow-sm p-1 border">
                        {menuAberto ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                    </Button>

                    <div className="text-center mb-4 px-2">
                        <img src={user?.foto || 'https://via.placeholder.com/100'} alt="Perfil"
                            className="rounded-circle mb-2 border border-2 border-primary shadow-sm"
                            style={{ width: menuAberto ? '70px' : '40px', height: menuAberto ? '70px' : '40px', objectFit: 'cover' }} />
                        {menuAberto && (
                            <div className="animate__animated animate__fadeIn">
                                <h6 className="fw-bold mb-0 text-truncate text-dark">{user?.nome || 'Membro KHAUA.'}</h6>
                                <small className="text-primary fw-bold text-uppercase" style={{ fontSize: '9px' }}>{user?.nivel || 'Corretor'}</small>
                            </div>
                        )}
                    </div>

                    <hr className="mx-3" />

                    <Nav className="flex-column gap-2 px-2">
                        <Nav.Link className={`d-flex align-items-center p-2 rounded transition-all ${!verCorretores ? 'bg-primary text-white shadow' : 'text-dark hover-bg-light'}`}
                            onClick={() => setVerCorretores(false)}>
                            <LayoutDashboard size={20} />
                            {menuAberto && <span className="ms-2 fw-bold text-uppercase" style={{fontSize: '11px'}}>Dashboard</span>}
                        </Nav.Link>

                        <Nav.Link className="d-flex align-items-center p-2 rounded text-dark hover-bg-light" onClick={() => navigate('/pmi/novo-contrato')}>
                            <FilePlus size={20} />
                            {menuAberto && <span className="ms-2 fw-bold text-uppercase" style={{fontSize: '11px'}}>Novo Contrato</span>}
                        </Nav.Link>

                        {isAdmin && (
                            <Nav.Link className={`d-flex align-items-center p-2 rounded transition-all ${verCorretores ? 'bg-primary text-white shadow' : 'text-dark hover-bg-light'}`}
                                onClick={() => setVerCorretores(true)}>
                                <Users size={20} />
                                {menuAberto && <span className="ms-2 fw-bold text-uppercase" style={{fontSize: '11px'}}>Gerir Equipe</span>}
                            </Nav.Link>
                        )}
                    </Nav>

                    <div className="mt-auto px-2 border-top pt-3">
                        <BotaoLogout contraido={!menuAberto} />
                    </div>
                </Col>

                {/* CONTEÚDO PRINCIPAL */}
                <Col className="p-4 p-lg-5 overflow-auto">
                    {verCorretores && isAdmin ? (
                        <AdminCorretores aoVoltar={() => setVerCorretores(false)} />
                    ) : (
                        <>
                            <div className="d-flex justify-content-between align-items-center mb-5">
                                <h2 className="fw-bold mb-0 text-primary">Painel de Avaliações</h2>
                                <Button variant="primary" size="lg" className="fw-bold shadow d-flex align-items-center"
                                    onClick={() => { setExibirFormulario(true); setDadosParaEditar(null); }}>
                                    <PlusCircle size={22} className="me-2" /> NOVA ANÁLISE
                                </Button>
                            </div>

                            {exibirFormulario && (
                                <div className="mb-5 bg-white p-4 rounded shadow border-start border-primary border-4 animate__animated animate__fadeInDown">
                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                        <h4 className="fw-bold m-0 text-dark">Inserir Nova Avaliação</h4>
                                        <Button variant="outline-secondary" size="sm" onClick={() => setExibirFormulario(false)}>Fechar</Button>
                                    </div>
                                    <FormularioAnalise user={user} dadosPreenchidos={dadosParaEditar} aoFinalizar={() => setExibirFormulario(false)} />
                                </div>
                            )}

                            <Row className="g-4 pb-5">
                                {analises.length === 0 && !exibirFormulario && (
                                    <Col xs={12} className="text-center py-5">
                                        <div className="text-muted opacity-50">
                                            <ClipboardList size={64} className="mb-3" />
                                            <p className="h5 fw-bold">Nenhuma análise cadastrada ainda.</p>
                                            <p className="small">Clique em "Nova Análise" para começar sua primeira avaliação na KHAUA.</p>
                                        </div>
                                    </Col>
                                )}

                                {analises.map(item => (
                                    <Col key={item.id} xs={12} md={6} lg={4} xxl={3}>
                                        <CardAnalise item={item} onGerir={(analise) => setAnaliseSelecionada(analise)} />
                                    </Col>
                                ))}
                            </Row>
                        </>
                    )}
                </Col>
            </Row>

            <ModalGestao
                show={!!analiseSelecionada}
                onHide={() => setAnaliseSelecionada(null)}
                analise={analiseSelecionada}
                onEdit={() => {
                    setDadosParaEditar(analiseSelecionada);
                    setExibirFormulario(true);
                    setAnaliseSelecionada(null);
                }}
                onGerarPdf={(margem) => handleConfirmarPDF(margem)}
                onDelete={() => {
                    if (window.confirm("Confirmar exclusão? Esta ação não pode ser desfeita.")) {
                        deleteDoc(doc(db, "analises", analiseSelecionada.id));
                        setAnaliseSelecionada(null);
                    }
                }}
            />

            {gerandoPDF && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center bg-white bg-opacity-75" style={{ zIndex: 9999 }}>
                    <Spinner animation="grow" variant="primary" />
                    <h5 className="mt-3 fw-bold text-primary">PROCESSANDO RELATÓRIO KHAUA...</h5>
                </div>
            )}
        </Container>
    );
};

export default Painel;