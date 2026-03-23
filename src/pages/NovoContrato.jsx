import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card, InputGroup, Spinner, Badge } from 'react-bootstrap';
import { MapPin, FileText, Upload, Save, ArrowLeft, Search, Home, DollarSign, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NovoContrato = () => {
    const navigate = useNavigate();
    const [buscandoCep, setBuscandoCep] = useState(false);

    // ESTADO ESTRUTURADO PARA CONTRATO JURÍDICO
    const [dados, setDados] = useState({
        // 1. LOCALIZAÇÃO E REGISTRO
        cep: '',
        logradouro: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: 'Itupeva',
        uf: 'SP',
        numMatricula: '',       // ESSENCIAL
        cartorio: 'Jundiaí',    // COMUM NA REGIÃO
        inscricaoMunicipal: '', // CAPA DO IPTU
        
        // 2. ATRIBUTOS TÉCNICOS
        areaTerreno: '',
        areaConstruida: '',
        statusOcupacao: 'Vazio', // Vazio, Proprietário, Inquilino
        
        // 3. FINANCEIRO
        valorVenda: '',
        valorCondominio: '',
        iptuAnual: '',
        comissaoPorcentagem: '6', // PADRÃO CRECI

        // 4. ARQUIVOS (BLOB/FILE)
        fileMatricula: null,
        fileIptu: null,
        fileCnd: null,
        fileHabitese: null
    });

    const buscarCep = async () => {
        const cepLimpo = dados.cep.replace(/\D/g, '');
        if (cepLimpo.length !== 8) return;
        setBuscandoCep(true);
        try {
            const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
            const data = await res.json();
            if (!data.erro) {
                setDados(prev => ({
                    ...prev,
                    logradouro: data.logradouro,
                    bairro: data.bairro,
                    cidade: data.localidade,
                    uf: data.uf
                }));
            }
        } finally { setBuscandoCep(false); }
    };

    return (
        <Container className="py-4 pb-5 animate__animated animate__fadeIn">
            <div className="d-flex align-items-center justify-content-between mb-4">
                <div className="d-flex align-items-center">
                    <Button variant="outline-dark" onClick={() => navigate('/pmi')} className="me-3 border-0 shadow-sm">
                        <ArrowLeft size={24} />
                    </Button>
                    <div>
                        <h3 className="fw-bold mb-0 text-primary">Workflow de Venda</h3>
                        <small className="text-muted text-uppercase fw-bold">Passo 1: Dados do Imóvel</small>
                    </div>
                </div>
                <Badge bg="primary" className="p-2 px-3 shadow-sm">ST IMOBILIÁRIA - UNIDADE ITUPEVA</Badge>
            </div>

            <Form>
                <Row className="g-4">
                    {/* COLUNA DA ESQUERDA: DADOS TÉCNICOS */}
                    <Col lg={8}>
                        <Card className="shadow-sm border-0 p-4 mb-4">
                            <h5 className="fw-bold mb-4 d-flex align-items-center text-dark">
                                <MapPin size={20} className="me-2 text-primary"/> LOCALIZAÇÃO E REGISTRO IMOBILIÁRIO
                            </h5>
<Row className="g-3">
    <Col md={3}>
        <Form.Label className="small fw-bold">CEP</Form.Label>
        <InputGroup>
            <Form.Control 
                placeholder="00000-000"
                value={dados.cep}
                disabled={buscandoCep} // Trava o campo enquanto busca
                onChange={e => setDados({...dados, cep: e.target.value})} 
                onBlur={buscarCep} 
            />
            <Button 
                variant="primary" 
                onClick={buscarCep} 
                disabled={buscandoCep || !dados.cep}
            >
                {buscandoCep ? <Spinner size="sm" animation="border" /> : <Search size={14}/>}
            </Button>
        </InputGroup>
    </Col>

    <Col md={6}>
        <Form.Label className="small fw-bold">Endereço</Form.Label>
        <Form.Control 
            value={dados.logradouro} 
            readOnly 
            placeholder={buscandoCep ? "Buscando..." : ""} 
            className={buscandoCep ? "bg-light text-muted" : "bg-light"} 
        />
    </Col>

    <Col md={3}>
        <Form.Label className="small fw-bold">Número</Form.Label>
        <Form.Control 
            value={dados.numero} 
            disabled={buscandoCep}
            onChange={e => setDados({...dados, numero: e.target.value})} 
        />
    </Col>
</Row>

                            <hr className="my-4" />

                            <h5 className="fw-bold mb-4 d-flex align-items-center text-dark">
                                <Home size={20} className="me-2 text-primary"/> CARACTERÍSTICAS FÍSICAS
                            </h5>
                            <Row className="g-3">
                                <Col md={4}><Form.Label className="small fw-bold">Área Terreno (m²)</Form.Label><Form.Control type="number" value={dados.areaTerreno} onChange={e => setDados({...dados, areaTerreno: e.target.value})} /></Col>
                                <Col md={4}><Form.Label className="small fw-bold">Área Construída (m²)</Form.Label><Form.Control type="number" value={dados.areaConstruida} onChange={e => setDados({...dados, areaConstruida: e.target.value})} /></Col>
                                <Col md={4}>
                                    <Form.Label className="small fw-bold">Status de Ocupação</Form.Label>
                                    <Form.Select value={dados.statusOcupacao} onChange={e => setDados({...dados, statusOcupacao: e.target.value})}>
                                        <option value="Vazio">Imóvel Vazio</option>
                                        <option value="Proprietário">Ocupado pelo Proprietário</option>
                                        <option value="Inquilino">Locado (Inquilino)</option>
                                    </Form.Select>
                                </Col>
                            </Row>
                        </Card>

                        <Card className="shadow-sm border-0 p-4">
                            <h5 className="fw-bold mb-4 d-flex align-items-center text-dark">
                                <DollarSign size={20} className="me-2 text-primary"/> CONDIÇÕES FINANCEIRAS
                            </h5>
                            <Row className="g-3">
                                <Col md={4}><Form.Label className="small fw-bold">Valor de Venda</Form.Label><InputGroup><InputGroup.Text>R$</InputGroup.Text><Form.Control type="number" value={dados.valorVenda} onChange={e => setDados({...dados, valorVenda: e.target.value})} /></InputGroup></Col>
                                <Col md={4}><Form.Label className="small fw-bold">Condomínio (Mensal)</Form.Label><InputGroup><InputGroup.Text>R$</InputGroup.Text><Form.Control type="number" value={dados.valorCondominio} onChange={e => setDados({...dados, valorCondominio: e.target.value})} /></InputGroup></Col>
                                <Col md={4}><Form.Label className="small fw-bold">Comissão (%)</Form.Label><Form.Control type="number" value={dados.comissaoPorcentagem} onChange={e => setDados({...dados, comissaoPorcentagem: e.target.value})} /></Col>
                            </Row>
                        </Card>
                    </Col>

                    {/* COLUNA DA DIREITA: CHECKLIST DOCUMENTAL */}
                    <Col lg={4}>
                        <Card className="shadow-sm border-0 bg-dark text-white p-4 sticky-top" style={{ top: '20px' }}>
                            <h5 className="fw-bold mb-4 d-flex align-items-center text-primary">
                                <ShieldCheck size={20} className="me-2"/> DOCUMENTOS (PDF/IMG)
                            </h5>
                            
                            <div className="d-grid gap-3 mb-4">
                                <div className="p-3 rounded border border-secondary border-opacity-50 bg-secondary bg-opacity-10">
                                    <Form.Label className="small fw-bold mb-2 d-block">Matrícula Atualizada (30 dias)</Form.Label>
                                    <Form.Control type="file" size="sm" onChange={e => setDados({...dados, fileMatricula: e.target.files[0]})} />
                                </div>
                                <div className="p-3 rounded border border-secondary border-opacity-50 bg-secondary bg-opacity-10">
                                    <Form.Label className="small fw-bold mb-2 d-block">Espelho do IPTU (SQL)</Form.Label>
                                    <Form.Control type="file" size="sm" onChange={e => setDados({...dados, fileIptu: e.target.files[0]})} />
                                </div>
                                <div className="p-3 rounded border border-secondary border-opacity-50 bg-secondary bg-opacity-10">
                                    <Form.Label className="small fw-bold mb-2 d-block">Habite-se / Planta</Form.Label>
                                    <Form.Control type="file" size="sm" onChange={e => setDados({...dados, fileHabitese: e.target.files[0]})} />
                                </div>
                            </div>

                            <Button variant="primary" size="lg" className="w-100 fw-bold py-3 shadow">
                                PRÓXIMO: DADOS DO VENDEDOR <ArrowLeft className="ms-2 rotate-180" style={{ transform: 'rotate(180deg)' }}/>
                            </Button>
                            <p className="text-center small text-muted mt-3 mb-0">Os arquivos serão salvos com segurança no servidor da ST Imobiliária.</p>
                        </Card>
                    </Col>
                </Row>
            </Form>
        </Container>
    );
};

export default NovoContrato;