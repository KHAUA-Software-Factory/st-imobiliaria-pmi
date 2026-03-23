import React from 'react';
import { Card, Row, Col, Form } from 'react-bootstrap';
import { Save, MapPin, Home, Camera, CheckCircle } from 'lucide-react';

const EtapaAlvo = ({ dadosAlvo, setDadosAlvo, buscarCEP, handleFotoAlvo }) => {
    
    // Função para evitar que o formulário recarregue a página acidentalmente
    const impedirSubmit = (e) => e.preventDefault();

    return (
        <Form onSubmit={impedirSubmit}>
            {/* IDENTIFICAÇÃO */}
            <Card className="shadow-sm border-0 mb-4 p-4">
                <h6 className="fw-bold text-primary mb-3">
                    <Save size={18} className="me-2" /> Identificação e Descrição
                </h6>
                <Row className="g-3">
                    <Col md={12}>
                        <Form.Label className="fw-bold">Cliente / Proprietário <span className="text-danger">*</span></Form.Label>
                        <Form.Control 
                            type="text" 
                            placeholder="Nome completo do cliente" 
                            value={dadosAlvo.cliente} 
                            onChange={(e) => setDadosAlvo({ ...dadosAlvo, cliente: e.target.value })} 
                        />
                    </Col>
                    <Col md={12}>
                        <Form.Label className="fw-bold">Descrição Narrativa <span className="text-danger">*</span></Form.Label>
                        <Form.Control 
                            as="textarea" 
                            rows={3} 
                            placeholder="Descreva os diferenciais: acabamento, vista, móveis planejados..." 
                            value={dadosAlvo.descricao} 
                            onChange={(e) => setDadosAlvo({ ...dadosAlvo, descricao: e.target.value })} 
                        />
                    </Col>
                </Row>
            </Card>

            {/* LOCALIZAÇÃO */}
            <Card className="shadow-sm border-0 mb-4 p-4">
                <h6 className="fw-bold text-primary mb-3">
                    <MapPin size={18} className="me-2" /> Localização do Alvo
                </h6>
                <Row className="g-3">
                    <Col md={2}>
                        <Form.Label className="fw-bold">CEP <span className="text-danger">*</span></Form.Label>
                        <Form.Control 
                            type="text" 
                            placeholder="00000-000"
                            value={dadosAlvo.endereco.cep || ''} 
                            onChange={(e) => setDadosAlvo({ ...dadosAlvo, endereco: { ...dadosAlvo.endereco, cep: e.target.value } })} 
                            onBlur={(e) => buscarCEP(e.target.value)} 
                        />
                    </Col>
                    <Col md={5}>
                        <Form.Label className="fw-bold">Logradouro <span className="text-danger">*</span></Form.Label>
                        <Form.Control 
                            type="text" 
                            placeholder="Rua, Avenida..."
                            value={dadosAlvo.endereco.logradouro} 
                            onChange={(e) => setDadosAlvo({ ...dadosAlvo, endereco: { ...dadosAlvo.endereco, logradouro: e.target.value } })} 
                        />
                    </Col>
                    <Col md={2}>
                        <Form.Label className="fw-bold">Número <span className="text-danger">*</span></Form.Label>
                        <Form.Control 
                            type="text" 
                            placeholder="S/N, 123..."
                            value={dadosAlvo.endereco.numero} 
                            onChange={(e) => setDadosAlvo({ ...dadosAlvo, endereco: { ...dadosAlvo.endereco, numero: e.target.value } })} 
                        />
                    </Col>
                    <Col md={3}>
                        <Form.Label className="fw-bold">Bairro <span className="text-danger">*</span></Form.Label>
                        <Form.Control 
                            type="text" 
                            placeholder="Ex: Pacaembu"
                            value={dadosAlvo.endereco.bairro} 
                            onChange={(e) => setDadosAlvo({ ...dadosAlvo, endereco: { ...dadosAlvo.endereco, bairro: e.target.value } })} 
                        />
                    </Col>
                </Row>
            </Card>

            {/* ATRIBUTOS TÉCNICOS */}
            <Card className="shadow-sm border-0 mb-4 p-4">
                <h6 className="fw-bold text-primary mb-3">
                    <Home size={18} className="me-2" /> Atributos Técnicos
                </h6>
                <Row className="g-3 mb-3">
                    <Col md={3}>
                        <Form.Label className="fw-bold">Área Total (m²) <span className="text-danger">*</span></Form.Label>
                        <Form.Control 
                            type="number" 
                            placeholder="Terreno"
                            value={dadosAlvo.atributos.area_total || ''} 
                            onChange={(e) => setDadosAlvo({ ...dadosAlvo, atributos: { ...dadosAlvo.atributos, area_total: Number(e.target.value) } })} 
                        />
                    </Col>
                    <Col md={3}>
                        <Form.Label className="fw-bold">Área Construída (m²) <span className="text-danger">*</span></Form.Label>
                        <Form.Control 
                            type="number" 
                            placeholder="Construção"
                            value={dadosAlvo.atributos.area_construida || ''} 
                            onChange={(e) => setDadosAlvo({ ...dadosAlvo, atributos: { ...dadosAlvo.atributos, area_construida: Number(e.target.value) } })} 
                        />
                    </Col>
                    <Col md={2}>
                        <Form.Label className="fw-bold">Dorms <span className="text-danger">*</span></Form.Label>
                        <Form.Control 
                            type="number" 
                            value={dadosAlvo.atributos.dormitorios} 
                            onChange={(e) => setDadosAlvo({ ...dadosAlvo, atributos: { ...dadosAlvo.atributos, dormitorios: Number(e.target.value) } })} 
                        />
                    </Col>
                    <Col md={2}>
                        <Form.Label className="fw-bold">Suítes <span className="text-danger">*</span></Form.Label>
                        <Form.Control 
                            type="number" 
                            value={dadosAlvo.atributos.suites} 
                            onChange={(e) => setDadosAlvo({ ...dadosAlvo, atributos: { ...dadosAlvo.atributos, suites: Number(e.target.value) } })} 
                        />
                    </Col>
                    <Col md={2}>
                        <Form.Label className="fw-bold">Vagas <span className="text-danger">*</span></Form.Label>
                        <Form.Control 
                            type="number" 
                            value={dadosAlvo.atributos.vagas} 
                            onChange={(e) => setDadosAlvo({ ...dadosAlvo, atributos: { ...dadosAlvo.atributos, vagas: Number(e.target.value) } })} 
                        />
                    </Col>
                </Row>
                
                <div className="d-flex gap-4 p-3 bg-light rounded border">
                    <Form.Check 
                        type="switch" 
                        label={<span className="fw-bold">Piscina</span>} 
                        checked={dadosAlvo.atributos.has_piscina} 
                        onChange={(e) => setDadosAlvo({ ...dadosAlvo, atributos: { ...dadosAlvo.atributos, has_piscina: e.target.checked } })} 
                    />
                    <Form.Check 
                        type="switch" 
                        label={<span className="fw-bold">Área Gourmet</span>} 
                        checked={dadosAlvo.atributos.has_area_gourmet} 
                        onChange={(e) => setDadosAlvo({ ...dadosAlvo, atributos: { ...dadosAlvo.atributos, has_area_gourmet: e.target.checked } })} 
                    />
                </div>
            </Card>

            {/* FOTOS */}
            <Card className="shadow-sm border-0 mb-4 p-4">
                <h6 className="fw-bold text-primary mb-3">
                    <Camera size={18} className="me-2" /> Fotos do Alvo
                </h6>
                <Row className="g-2">
                    {dadosAlvo.fotos.map((url, i) => (
                        <Col md={6} key={i}>
                            <Form.Label className="small fw-bold">Foto {i === 0 ? 'Principal (Capa) *' : i + 1}</Form.Label>
                            <Form.Control type="file" size="sm" onChange={(e) => handleFotoAlvo(e, i)} />
                            {url && <div className="text-success small fw-bold mt-1"><CheckCircle size={12} /> Foto Carregada</div>}
                        </Col>
                    ))}
                </Row>
            </Card>
        </Form>
    );
};

export default EtapaAlvo;