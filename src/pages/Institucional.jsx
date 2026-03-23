import React from 'react';
import { Container, Button, Navbar, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Monitor, ShieldCheck, Layers, ArrowRight } from 'lucide-react';

const Institucional = () => {
    // Cores Sugeridas para a KHAUA (Tecnologia/Sóbrio)
    const COLORS = {
        KHAUA_DARK: "#0f172a", // Azul Slate bem escuro
        KHAUA_ACCENT: "#3b82f6", // Azul vibrante tecnológico
        ST_GOLD: "#c29d58", // Dourado da ST (para o botão)
        ST_BLUE: "#052739" // Azul da ST (para o botão)
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f1f5f9', fontFamily: 'sans-serif' }}>
            
            {/* NAVBAR KHAUA */}
            <Navbar style={{ backgroundColor: COLORS.KHAUA_DARK }} variant="dark" className="shadow-sm p-3">
                <Container>
                    <Navbar.Brand href="/" className="fw-bold fs-3 letter-spacing-2">
                        KHAUA<span style={{ color: COLORS.KHAUA_ACCENT }}>.</span>
                    </Navbar.Brand>
                    <Link to="/pmi/login">
                        <Button 
                            style={{ backgroundColor: COLORS.ST_BLUE, borderColor: COLORS.ST_GOLD, color: COLORS.ST_GOLD }} 
                            className="fw-bold px-4 shadow-sm"
                        >
                            SISTEMA ST <ArrowRight size={16} className="ms-2" />
                        </Button>
                    </Link>
                </Container>
            </Navbar>

            {/* HERO SECTION KHAUA */}
            <Container className="flex-grow-1 d-flex align-items-center py-5">
                <Row className="align-items-center">
                    <Col lg={6} className="text-start">
                        <div className="badge bg-primary mb-3 px-3 py-2 text-uppercase fw-bold" style={{ letterSpacing: '1px' }}>
                            Em Desenvolvimento
                        </div>
                        <h1 className="display-3 fw-bold mb-4" style={{ color: COLORS.KHAUA_DARK }}>
                            Inovação e Inteligência <br />
                            <span style={{ color: COLORS.KHAUA_ACCENT }}>Digital.</span>
                        </h1>
                        <p className="lead text-muted mb-5" style={{ fontSize: '1.2rem' }}>
                            A <strong>KHAUA</strong> está construindo o futuro das soluções digitais. 
                            Atualmente, nosso portal está em manutenção para a implementação de novas tecnologias e parcerias estratégicas.
                        </p>
                        
                        <div className="d-flex gap-3">
                            <div className="p-3 bg-white shadow-sm rounded-3 border-start border-4" style={{ borderColor: COLORS.KHAUA_ACCENT }}>
                                <Monitor size={24} className="mb-2" style={{ color: COLORS.KHAUA_ACCENT }} />
                                <h6 className="fw-bold mb-0">Sistemas sob medida</h6>
                            </div>
                            <div className="p-3 bg-white shadow-sm rounded-3 border-start border-4" style={{ borderColor: COLORS.KHAUA_ACCENT }}>
                                <Layers size={24} className="mb-2" style={{ color: COLORS.KHAUA_ACCENT }} />
                                <h6 className="fw-bold mb-0">Data Analytics</h6>
                            </div>
                        </div>
                    </Col>
                    
                    <Col lg={6} className="d-none d-lg-block text-center">
                        {/* Um visual abstrato ou ícone grande */}
                        <div style={{ position: 'relative' }}>
                            <div style={{ 
                                width: '400px', 
                                height: '400px', 
                                background: COLORS.KHAUA_ACCENT, 
                                borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%', 
                                opacity: '0.1',
                                position: 'absolute',
                                top: '0',
                                left: '50%',
                                transform: 'translateX(-50%)'
                            }}></div>
                            <ShieldCheck size={280} strokeWidth={1} style={{ color: COLORS.KHAUA_DARK, opacity: '0.8' }} />
                        </div>
                    </Col>
                </Row>
            </Container>

            {/* ÁREA DE ACESSO RÁPIDO (FOOTER INTERMEDIÁRIO) */}
            <div style={{ backgroundColor: '#e2e8f0' }} className="py-4 border-top border-bottom">
                <Container className="text-center text-muted">
                    <small className="fw-bold text-uppercase" style={{ letterSpacing: '2px' }}>
                        Parceiro Oficial: ST Imobiliária - Itupeva/SP
                    </small>
                </Container>
            </div>

            {/* RODAPÉ FINAL */}
            <footer className="py-4 text-center" style={{ backgroundColor: COLORS.KHAUA_DARK, color: '#94a3b8' }}>
                <Container>
                    <p className="mb-0">© 2026 <strong>KHAUA</strong>. Todos os direitos reservados.</p>
                    <small>Soluções inteligentes para o mercado imobiliário e corporativo.</small>
                </Container>
            </footer>
        </div>
    );
};

export default Institucional;