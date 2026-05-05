import React from 'react';
import { Card, Row, Col, Form, Button } from 'react-bootstrap';
import { Save, MapPin, Home, Camera, CheckCircle, ClipboardPaste, Upload } from 'lucide-react';
import { tiposImagemPermitidos } from '../utils/fileValidators';

const EtapaAlvo = ({ dadosAlvo, setDadosAlvo, buscarCEP, handleFotoAlvo, handlePasteAlvo }) => {
    const impedirSubmit = (e) => e.preventDefault();

    return (
        <Form onSubmit={impedirSubmit}>
            <Card className="shadow-sm border-0 mb-4 p-4">
                <h6 className="fw-bold text-primary mb-3">
                    <Save size={18} className="me-2" /> Identificação e Descrição
                </h6>
                <Row className="g-3">
                    <Col md={12}>
                        <Form.Label className="fw-bold small text-muted">CLIENTE / PROPRIETÁRIO <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Nome completo do cliente"
                            value={dadosAlvo.cliente}
                            onChange={(e) => setDadosAlvo(prev => ({ ...prev, cliente: e.target.value }))}
                        />
                    </Col>
                    <Col md={12}>
                        <Form.Label className="fw-bold small text-muted">DESCRIÇÃO NARRATIVA <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            placeholder="Descreva os diferenciais: acabamento, vista, móveis planejados..."
                            value={dadosAlvo.descricao}
                            onChange={(e) => setDadosAlvo(prev => ({ ...prev, descricao: e.target.value }))}
                        />
                    </Col>
                </Row>
            </Card>

            <Card className="shadow-sm border-0 mb-4 p-4">
                <h6 className="fw-bold text-primary mb-3">
                    <MapPin size={18} className="me-2" /> Localização do Imóvel Alvo
                </h6>
                <Row className="g-3">
                    <Col md={2}>
                        <Form.Label className="fw-bold small text-muted">CEP <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="00000-000"
                            value={dadosAlvo.endereco.cep || ''}
                            onChange={(e) => setDadosAlvo(prev => ({
                                ...prev,
                                endereco: { ...prev.endereco, cep: e.target.value }
                            }))}
                            onBlur={(e) => buscarCEP(e.target.value)}
                        />
                    </Col>
                    <Col md={5}>
                        <Form.Label className="fw-bold small text-muted">LOGRADOURO <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Rua, Avenida..."
                            value={dadosAlvo.endereco.logradouro}
                            onChange={(e) => setDadosAlvo(prev => ({
                                ...prev,
                                endereco: { ...prev.endereco, logradouro: e.target.value }
                            }))}
                        />
                    </Col>
                    <Col md={2}>
                        <Form.Label className="fw-bold small text-muted">NÚMERO <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Ex: 123"
                            value={dadosAlvo.endereco.numero}
                            onChange={(e) => setDadosAlvo(prev => ({
                                ...prev,
                                endereco: { ...prev.endereco, numero: e.target.value }
                            }))}
                        />
                    </Col>
                    <Col md={3}>
                        <Form.Label className="fw-bold small text-muted">BAIRRO <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Ex: Pacaembu"
                            value={dadosAlvo.endereco.bairro}
                            onChange={(e) => setDadosAlvo(prev => ({
                                ...prev,
                                endereco: { ...prev.endereco, bairro: e.target.value }
                            }))}
                        />
                    </Col>
                </Row>
            </Card>

            <Card className="shadow-sm border-0 mb-4 p-4">
                <h6 className="fw-bold text-primary mb-3">
                    <Home size={18} className="me-2" /> Atributos Técnicos
                </h6>
                <Row className="g-3 mb-3">
                    <Col md={3}>
                        <Form.Label className="fw-bold small text-muted">ÁREA TOTAL (M²) <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                            type="number"
                            placeholder="Terreno"
                            value={dadosAlvo.atributos.area_total || ''}
                            onChange={(e) => setDadosAlvo(prev => ({
                                ...prev,
                                atributos: { ...prev.atributos, area_total: Number(e.target.value) }
                            }))}
                        />
                    </Col>
                    <Col md={3}>
                        <Form.Label className="fw-bold small text-muted">ÁREA CONSTRUÍDA (M²) <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                            type="number"
                            placeholder="Construção"
                            value={dadosAlvo.atributos.area_construida || ''}
                            onChange={(e) => setDadosAlvo(prev => ({
                                ...prev,
                                atributos: { ...prev.atributos, area_construida: Number(e.target.value) }
                            }))}
                        />
                    </Col>
                    <Col md={2}>
                        <Form.Label className="fw-bold small text-muted">DORMS <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                            type="number"
                            value={dadosAlvo.atributos.dormitorios}
                            onChange={(e) => setDadosAlvo(prev => ({
                                ...prev,
                                atributos: { ...prev.atributos, dormitorios: Number(e.target.value) }
                            }))}
                        />
                    </Col>
                    <Col md={2}>
                        <Form.Label className="fw-bold small text-muted">SUÍTES <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                            type="number"
                            value={dadosAlvo.atributos.suites}
                            onChange={(e) => setDadosAlvo(prev => ({
                                ...prev,
                                atributos: { ...prev.atributos, suites: Number(e.target.value) }
                            }))}
                        />
                    </Col>
                    <Col md={2}>
                        <Form.Label className="fw-bold small text-muted">VAGAS <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                            type="number"
                            value={dadosAlvo.atributos.vagas}
                            onChange={(e) => setDadosAlvo(prev => ({
                                ...prev,
                                atributos: { ...prev.atributos, vagas: Number(e.target.value) }
                            }))}
                        />
                    </Col>
                </Row>

                <div className="d-flex gap-4 p-3 bg-light rounded border">
                    <Form.Check
                        type="switch"
                        label={<span className="fw-bold small text-muted">PISCINA</span>}
                        checked={dadosAlvo.atributos.has_piscina}
                        onChange={(e) => setDadosAlvo(prev => ({
                            ...prev,
                            atributos: { ...prev.atributos, has_piscina: e.target.checked }
                        }))}
                    />
                    <Form.Check
                        type="switch"
                        label={<span className="fw-bold small text-muted">ÁREA GOURMET</span>}
                        checked={dadosAlvo.atributos.has_area_gourmet}
                        onChange={(e) => setDadosAlvo(prev => ({
                            ...prev,
                            atributos: { ...prev.atributos, has_area_gourmet: e.target.checked }
                        }))}
                    />
                </div>
            </Card>

            <Card className="shadow-sm border-0 mb-4 p-4">
                <h6 className="fw-bold text-primary mb-3">
                    <Camera size={18} className="me-2" /> Fotos do Imóvel Alvo
                </h6>
                <Row className="g-3">
                    {dadosAlvo.fotos.map((url, i) => (
                        <Col md={6} key={i}>
                            <Form.Label className="small fw-bold text-muted text-uppercase">
                                {i === 0 ? 'Foto de Capa (Principal)' : `Foto Auxiliar ${i}`}
                            </Form.Label>

                            <div className="border rounded bg-white p-2 shadow-sm border-light">
                                <div
                                    onPaste={(e) => handlePasteAlvo(e, i)}
                                    tabIndex={0}
                                    className={`d-flex flex-column align-items-center justify-content-center rounded mb-2 ${url ? 'border-success' : ''}`}
                                    style={{
                                        minHeight: '140px',
                                        backgroundColor: '#f8fafc',
                                        border: '2px dashed #e2e8f0',
                                        cursor: 'default',
                                        transition: 'all 0.2s',
                                        outlineColor: '#052739'
                                    }}
                                >
                                    {url ? (
                                        <img src={url} alt="Preview" className="img-fluid rounded shadow-sm" style={{ maxHeight: '130px', objectFit: 'contain' }} />
                                    ) : (
                                        <div className="text-center text-muted">
                                            <ClipboardPaste size={20} className="mb-2 opacity-50" />
                                            <div style={{ fontSize: '11px' }}>Clique aqui e use <br /><strong>Ctrl+V</strong> ou <strong>Cmd+V</strong> para colar</div>
                                        </div>
                                    )}
                                </div>

                                <div className="d-flex justify-content-between align-items-center bg-light p-2 rounded">
                                    <div className="small text-muted d-flex align-items-center">
                                        {url ? (
                                            <><CheckCircle size={14} className="text-success me-1" /> Pronta</>
                                        ) : (
                                            'Nenhum arquivo'
                                        )}
                                    </div>

                                    <div className="position-relative">
                                        <Button variant="primary" size="sm" className="d-flex align-items-center gap-1 py-1 px-3" style={{ fontSize: '11px', fontWeight: '600' }}>
                                            <Upload size={12} /> PROCURAR...
                                        </Button>
                                        <input
                                            type="file"
                                            accept={tiposImagemPermitidos}
                                            onChange={(e) => handleFotoAlvo(e, i)}
                                            className="position-absolute top-0 start-0 w-100 h-100 opacity-0"
                                            style={{ cursor: 'pointer' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </Col>
                    ))}
                </Row>
                <div className="mt-3 text-muted" style={{ fontSize: '11px' }}>
                    <strong>Dica:</strong> clique no quadro acima e use colar para agilizar, ou o botão &quot;Procurar&quot; para arquivo local.
                </div>
            </Card>
        </Form>
    );
};

export default EtapaAlvo;
