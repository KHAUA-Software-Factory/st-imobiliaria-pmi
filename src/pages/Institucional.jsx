import React from 'react';
import { Container, Button, Navbar, Row, Col, Card, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  ArrowRight,
  Code2,
  Cpu,
  Globe,
  Construction,
  Terminal,
  Database,
  Layers
} from 'lucide-react';

const Institucional = () => {
  const COLORS = {
    KHAUA_DARK: '#0f172a',
    KHAUA_ACCENT: '#3b82f6',
    ST_GOLD: '#c29d58',
    ST_BLUE: '#052739',
    TEXT_SOFT: '#64748b'
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'linear-gradient(180deg, #f8fafc 0%, #eef4fb 100%)', fontFamily: 'Inter, sans-serif' }}>
      
      {/* NAVBAR: KHAUA. HUB */}
      <Navbar expand="lg" style={{ backgroundColor: COLORS.KHAUA_DARK, borderBottom: `1px solid rgba(255,255,255,0.06)` }} variant="dark" className="shadow-sm py-3 sticky-top">
        <Container>
          <div className="d-flex align-items-center gap-3">
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(59,130,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(59,130,246,0.2)' }}>
              <Terminal size={22} color={COLORS.KHAUA_ACCENT} />
            </div>
            <Navbar.Brand href="/" className="mb-0 fw-bold fs-4">
              KHAUA<span style={{ color: COLORS.KHAUA_ACCENT }}>.</span>
            </Navbar.Brand>
          </div>

          <div className="d-flex align-items-center gap-3">
            {/* LINK DISCRETO PARA O CLIENTE ATUAL */}
            <Link to="/pmi/login">
              <Button style={{ backgroundColor: 'transparent', border: `1px solid ${COLORS.KHAUA_ACCENT}`, color: COLORS.KHAUA_ACCENT, borderRadius: '12px', fontWeight: 700, padding: '8px 20px', fontSize: '13px' }} className="hover-accent">
                Portal do Cliente <ArrowRight size={14} className="ms-2" />
              </Button>
            </Link>
          </div>
        </Container>
      </Navbar>

      {/* HERO: POSICIONAMENTO SOFTWARE FACTORY */}
      <Container className="flex-grow-1 d-flex align-items-center py-5">
        <Row className="align-items-center w-100 g-5">
          <Col lg={7}>
            <div className="d-inline-flex align-items-center gap-2 px-3 py-2 rounded-pill mb-4" style={{ backgroundColor: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', color: COLORS.KHAUA_ACCENT, fontWeight: 700, fontSize: '0.75rem', letterSpacing: '1px' }}>
              <Construction size={16} /> LABORATÓRIO DE DESENVOLVIMENTO EM EXPANSÃO
            </div>

            <h1 className="fw-bold mb-4" style={{ color: COLORS.KHAUA_DARK, fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', lineHeight: '1', letterSpacing: '-2px' }}>
              Engenharia de Software <br/>
              <span style={{ color: COLORS.KHAUA_ACCENT }}>para processos complexos.</span>
            </h1>

            <p className="mb-5" style={{ color: COLORS.TEXT_SOFT, fontSize: '1.2rem', lineHeight: '1.7', maxWidth: '650px' }}>
                A <strong>KHAUA.</strong> é uma Software Factory focada em arquitetura de dados, automação e sistemas sob medida. Desenvolvemos soluções escaláveis que resolvem gargalos operacionais em diversos setores, utilizando tecnologia de ponta para converter desafios em ativos digitais.
            </p>

            <div className="p-4 rounded-4 border bg-white shadow-sm d-inline-block">
                <p className="small fw-bold text-dark mb-3 text-uppercase" style={{ letterSpacing: '1px' }}>Acesso à aplicação em produção:</p>
                <Link to="/pmi/login">
                    <Button size="lg" style={{ backgroundColor: COLORS.ST_BLUE, border: `1px solid ${COLORS.ST_GOLD}`, color: COLORS.ST_GOLD, borderRadius: '12px', padding: '12px 30px', fontWeight: 700 }}>
                        Plataforma ST Imobiliária <ArrowRight size={18} className="ms-2" />
                    </Button>
                </Link>
            </div>
          </Col>

          <Col lg={5}>
            <div style={{ background: 'rgba(255,255,255,0.7)', padding: '40px', borderRadius: '30px', boxShadow: '0 40px 80px rgba(15,23,42,0.08)', border: '1px solid rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)' }}>
              <h5 className="fw-bold mb-4 d-flex align-items-center" style={{ color: COLORS.KHAUA_DARK }}>
                <Database size={20} className="me-2 text-primary" /> Stack & Ecosystem
              </h5>
              
              <div className="d-flex align-items-center p-3 mb-3 rounded-4 border bg-white">
                <Code2 size={24} className="text-primary me-3" />
                <div className="flex-grow-1">
                    <h6 className="fw-bold mb-0" style={{ fontSize: '14px' }}>Custom Software Development</h6>
                    <small className="text-muted">Soluções Enterprise & Web</small>
                </div>
              </div>

              <div className="d-flex align-items-center p-3 mb-3 rounded-4 border bg-white">
                <Database size={24} className="text-primary me-3" />
                <div className="flex-grow-1">
                    <h6 className="fw-bold mb-0" style={{ fontSize: '14px' }}>Data Architecture</h6>
                    <small className="text-muted">Modelagem PostgreSQL & Cloud</small>
                </div>
              </div>

              <div className="d-flex align-items-center p-3 mb-1 rounded-4 border" style={{ opacity: 0.7 }}>
                <Layers size={24} className="text-secondary me-3" />
                <div className="flex-grow-1">
                    <h6 className="fw-bold mb-0" style={{ fontSize: '14px' }}>Workflow Automation</h6>
                    <small className="text-muted">Otimização de processos internos</small>
                </div>
              </div>

              <hr className="my-4" />
              <div className="text-center">
                 <Badge bg="light" text="dark" className="p-2 border">#SoftwareFactory</Badge>
                 <Badge bg="light" text="dark" className="ms-2 p-2 border">#DigitalTransformation</Badge>
              </div>
            </div>
          </Col>
        </Row>
      </Container>

      {/* FOOTER CORPORATIVO */}
      <footer className="py-4 mt-auto border-top" style={{ backgroundColor: COLORS.KHAUA_DARK, color: '#94a3b8' }}>
        <Container className="d-flex flex-column flex-md-row justify-content-between align-items-center">
            <div>
                <h5 className="fw-bold text-white mb-0">KHAUA<span style={{ color: COLORS.KHAUA_ACCENT }}>.</span></h5>
                <small style={{ fontSize: '11px' }}>Engineering Digital Results.</small>
            </div>
            <div className="mt-3 mt-md-0 text-md-end">
                <small>© 2026 KHAUA. Labs | Software Factory</small><br/>
                <small style={{ fontSize: '10px' }}>Itupeva, SP · Brasil</small>
            </div>
        </Container>
      </footer>
    </div>
  );
};

export default Institucional;