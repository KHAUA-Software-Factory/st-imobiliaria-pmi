import React from 'react';
import { Container, Button, Navbar, Row, Col, Card, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import logoSt from '../assets/logo_st_2.png';
import logoGfjr from '../assets/logo_gfjr.png';
import {
  ArrowRight,
  Code2,
  Database,
  Layers,
  Construction,
  Terminal,
  Mail,
  Phone,
  MapPin,
  Building2,
  Handshake,
  Globe
} from 'lucide-react';

const Institucional = () => {
  const COLORS = {
    KHAUA_DARK: '#0f172a',
    KHAUA_ACCENT: '#3b82f6',
    TEXT_SOFT: '#64748b',
    LIGHT_BG: '#f8fafc',
    SOFT_BG: '#eef4fb'
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(180deg, #f8fafc 0%, #eef4fb 100%)',
        fontFamily: 'Inter, sans-serif'
      }}
    >
      {/* NAVBAR */}
      <Navbar
        expand="lg"
        style={{
          backgroundColor: COLORS.KHAUA_DARK,
          borderBottom: '1px solid rgba(255,255,255,0.06)'
        }}
        variant="dark"
        className="shadow-sm py-3 sticky-top"
      >
        <Container>
          <div className="d-flex align-items-center gap-3">
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'rgba(59,130,246,0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(59,130,246,0.2)'
              }}
            >
              <Terminal size={22} color={COLORS.KHAUA_ACCENT} />
            </div>

            <Navbar.Brand href="/" className="mb-0 fw-bold fs-4">
              KHAUA<span style={{ color: COLORS.KHAUA_ACCENT }}>.</span>
            </Navbar.Brand>
          </div>

          <div className="d-flex align-items-center gap-2">
            <a href="#parceiros" className="text-decoration-none d-none d-md-inline">
              <span style={{ color: '#cbd5e1', fontSize: '14px', fontWeight: 600 }}>Parceiros</span>
            </a>
            <a href="#contato" className="text-decoration-none d-none d-md-inline ms-3">
              <span style={{ color: '#cbd5e1', fontSize: '14px', fontWeight: 600 }}>Contato</span>
            </a>

            <Link to="/pmi/login" className="ms-3">
              <Button
                style={{
                  backgroundColor: COLORS.KHAUA_ACCENT,
                  border: `1px solid ${COLORS.KHAUA_ACCENT}`,
                  color: '#fff',
                  borderRadius: '12px',
                  fontWeight: 700,
                  padding: '8px 20px',
                  fontSize: '13px'
                }}
              >
                Acesso do Cliente
              </Button>
            </Link>
          </div>
        </Container>
      </Navbar>

      {/* HERO */}
      <Container className="flex-grow-1 d-flex align-items-center py-5">
        <Row className="align-items-center w-100 g-5">
          <Col lg={7}>


            <h1
              className="fw-bold mb-4"
              style={{
                color: COLORS.KHAUA_DARK,
                fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
                lineHeight: '1',
                letterSpacing: '-2px'
              }}
            >
              Engenharia de Software <br />
              <span style={{ color: COLORS.KHAUA_ACCENT }}>
                para processos complexos.
              </span>
            </h1>

            <p
              className="mb-4"
              style={{
                color: COLORS.TEXT_SOFT,
                fontSize: '1.2rem',
                lineHeight: '1.7',
                maxWidth: '650px'
              }}
            >
              A <strong>KHAUA.</strong> é uma Software Factory focada em arquitetura de dados,
              automação e sistemas sob medida. Desenvolvemos soluções escaláveis que resolvem
              gargalos operacionais em diversos setores, utilizando tecnologia de ponta para
              converter desafios em ativos digitais.
            </p>

            {/* CTA reposicionado */}
            <div className="d-flex flex-wrap gap-3 mt-4">


              <a href="#contato" className="text-decoration-none">
                <Button
                  size="lg"
                  variant="light"
                  style={{
                    borderRadius: '12px',
                    padding: '12px 24px',
                    fontWeight: 700,
                    border: '1px solid #cbd5e1'
                  }}
                >
                  Falar com a KHAUA
                  <span style={{ color: COLORS.KHAUA_ACCENT }}>.</span>
                </Button>
              </a>

            </div>

            <div className="mt-4 d-flex flex-wrap gap-2">
              <Badge bg="light" text="dark" className="p-2 border">
                #SoftwareFactory
              </Badge>
              <Badge bg="light" text="dark" className="p-2 border">
                #DigitalTransformation
              </Badge>
              <Badge bg="light" text="dark" className="p-2 border">
                #CustomSystems
              </Badge>
            </div>
          </Col>

          <Col lg={5}>
            <div
              className="d-inline-flex align-items-center gap-2 px-3 py-2 rounded-pill mb-4"
              style={{
                backgroundColor: 'rgba(59,130,246,0.1)',
                border: '1px solid rgba(59,130,246,0.2)',
                color: COLORS.KHAUA_ACCENT,
                fontWeight: 700,
                fontSize: '0.75rem',
                letterSpacing: '1px'
              }}
            >
              <small style={{ fontSize: '11px', justifyContent: 'center', display: 'flex', color: COLORS.TEXT_SOFT }}>
                <Construction size={16} /> &nbsp;
                LABORATÓRIO DE DESENVOLVIMENTO EM EXPANSÃO</small>

            </div>


            <div
              style={{
                background: 'rgba(255,255,255,0.7)',
                padding: '40px',
                borderRadius: '30px',
                boxShadow: '0 40px 80px rgba(15,23,42,0.08)',
                border: '1px solid rgba(255,255,255,0.8)',
                backdropFilter: 'blur(10px)'
              }}
            >

              <h5 className="fw-bold mb-4 d-flex align-items-center" style={{ color: COLORS.KHAUA_DARK }}>
                <Database size={20} className="me-2 text-primary" /> Stack & Ecosystem
              </h5>

              <div className="d-flex align-items-center p-3 mb-3 rounded-4 border bg-white">
                <Code2 size={24} className="text-primary me-3" />
                <div className="flex-grow-1">
                  <h6 className="fw-bold mb-0" style={{ fontSize: '14px' }}>
                    Custom Software Development
                  </h6>
                  <small className="text-muted">Soluções Enterprise & Web</small>
                </div>
              </div>

              <div className="d-flex align-items-center p-3 mb-3 rounded-4 border bg-white">
                <Database size={24} className="text-primary me-3" />
                <div className="flex-grow-1">
                  <h6 className="fw-bold mb-0" style={{ fontSize: '14px' }}>
                    Data Architecture
                  </h6>
                  <small className="text-muted">Modelagem PostgreSQL & Cloud</small>
                </div>
              </div>

              <div className="d-flex align-items-center p-3 mb-3 rounded-4 border bg-white">
                <Layers size={24} className="text-primary me-3" />
                <div className="flex-grow-1">
                  <h6 className="fw-bold mb-0" style={{ fontSize: '14px' }}>
                    Workflow Automation
                  </h6>
                  <small className="text-muted">Otimização de processos internos</small>
                </div>
              </div>




            </div>
          </Col>
        </Row>
      </Container>

      {/* SEÇÃO PARCEIROS */}
      <section id="parceiros" className="py-5" style={{ backgroundColor: '#ffffff' }}>
        <Container>
          <div className="text-center mb-5">
            <h2 className="fw-bold" style={{ color: COLORS.KHAUA_DARK }}>
              Parceiros & Operações
            </h2>
            <p style={{ color: COLORS.TEXT_SOFT }}>
              Projetos desenvolvidos e operações em execução com nossos parceiros.
            </p>
          </div>

          <Row className="g-4 justify-content-center">
            {/* ST */}
            <Col md={5} lg={4}>
              <Card
                className="h-100 border-0 shadow-sm text-center"
                style={{ borderRadius: '22px' }}
              >
                <Card.Body className="p-4">
                  <img
                    src={logoSt}
                    alt="ST Imobiliária"
                    style={{
                      height: 150,
                      objectFit: 'contain',
                      marginBottom: 20
                    }}
                  />

                  <h5 className="fw-bold">ST Imobiliária</h5>
                  <p style={{ color: COLORS.TEXT_SOFT }}>
                    Plataforma operacional desenvolvida e em uso pela equipe.
                  </p>

                </Card.Body>
              </Card>
            </Col>

            {/* GFJr */}
            <Col md={5} lg={4}>
              <Card
                className="h-100 border-0 shadow-sm text-center"
                style={{ borderRadius: '22px' }}
              >
                <Card.Body className="p-4">
                  <img
                    src={logoGfjr}
                    alt="GFJr"
                    style={{
                      height: 150,
                      objectFit: 'contain',
                      marginBottom: 20,
                      borderRadius: '100%',

                    }}
                  />

                  <h5 className="fw-bold">GFJr</h5>
                  <p style={{ color: COLORS.TEXT_SOFT }}>
                    Plataforma institucional e consultoria em transformação digital.
                  </p>

                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>



      {/* SEÇÃO CONTATO */}
      <section id="contato" className="py-5" style={{ background: 'rgba(255,255,255,0.7)', }}>
        <Container >
          <Row className="g-4 align-items-stretch">
            <Col lg={5}>
              <div
                className="h-100 p-4 p-md-5"
                style={{
                  borderRadius: '24px',
                  backgroundColor: COLORS.KHAUA_DARK,
                  color: '#fff',
                  boxShadow: '0 24px 60px rgba(15,23,42,0.12)'
                }}
              >
                <small
                  className="fw-bold d-block mb-3"
                  style={{
                    color: COLORS.KHAUA_ACCENT,
                    letterSpacing: '1.5px'
                  }}
                >
                  CONTATO
                </small>

                <h3 className="fw-bold mb-3">Vamos conversar sobre sua operação?</h3>
                <p style={{ color: 'rgba(255,255,255,0.75)', lineHeight: '1.7' }}>
                  Entre em contato para falar sobre desenvolvimento de sistemas,
                  arquitetura de dados, automação ou projetos sob medida.
                </p>
              </div>
            </Col>

            <Col lg={7}>
              <Row className="g-4">
                <Col md={6}>
                  <Card className="h-100 border-0 shadow-sm" style={{ borderRadius: '20px' }}>
                    <Card.Body className="p-4">
                      <Mail size={22} className="mb-3" color={COLORS.KHAUA_ACCENT} />
                      <h6 className="fw-bold">E-mail</h6>
                      <p className="mb-0" style={{ color: COLORS.TEXT_SOFT }}>
                        contato@khaua.com.br
                      </p>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={6}>
                  <Card className="h-100 border-0 shadow-sm" style={{ borderRadius: '20px' }}>
                    <Card.Body
                      className="p-4"
                      style={{ cursor: 'pointer' }}
                      onClick={() => window.open('https://wa.me/5511988296774?text=Olá! Gostaria de falar sobre um projeto com a KHAUA.', '_blank')}
                    >
                      <div className="d-flex flex-column align-items-start">
                        <Phone size={22} className="mb-3" color={COLORS.KHAUA_ACCENT} />
                        <h6 className="fw-bold">WhatsApp Profissional</h6>
                        <p className="mb-0" style={{ color: COLORS.TEXT_SOFT }}>
                          +55 (11) 98829-6774
                        </p>
                        <small className="mt-2 fw-bold text-primary" style={{ fontSize: '11px' }}>
                          CLIQUE PARA INICIAR CONVERSA <ArrowRight size={12} />
                        </small>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={6}>
                  <Card className="h-100 border-0 shadow-sm" style={{ borderRadius: '20px' }}>
                    <Card.Body className="p-4">
                      <MapPin size={22} className="mb-3" color={COLORS.KHAUA_ACCENT} />
                      <h6 className="fw-bold">Localização</h6>
                      <p className="mb-0" style={{ color: COLORS.TEXT_SOFT }}>
                        Itupeva, SP · Brasil
                      </p>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={6}>
                  <Card className="h-100 border-0 shadow-sm" style={{ borderRadius: '20px' }}>
                    <Card.Body className="p-4">
                      <Building2 size={22} className="mb-3" color={COLORS.KHAUA_ACCENT} />
                      <h6 className="fw-bold">Atendimento</h6>
                      <p className="mb-0" style={{ color: COLORS.TEXT_SOFT }}>
                        Projetos, suporte e soluções digitais sob demanda.
                      </p>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Col>
          </Row>
        </Container>
      </section>

      {/* FOOTER */}
      <footer
        className="py-4 mt-auto border-top"
        style={{ backgroundColor: COLORS.KHAUA_DARK, color: '#94a3b8' }}
      >
        <Container className="d-flex flex-column flex-md-row justify-content-between align-items-center">
          <div>
            <h5 className="fw-bold text-white mb-0">
              KHAUA<span style={{ color: COLORS.KHAUA_ACCENT }}>.</span>
            </h5>
            <small style={{ fontSize: '11px' }}>Engineering Digital Results.</small>
          </div>

          <div className="mt-3 mt-md-0 text-md-end">
            <small>© 2026 KHAUA. Labs | Software Factory</small>
            <br />
            <small style={{ fontSize: '10px' }}>Itupeva, SP · Brasil</small>
          </div>
        </Container>
      </footer>
    </div>
  );
};

export default Institucional;