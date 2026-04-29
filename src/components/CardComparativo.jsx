import React from 'react';
import { Card, Row, Col, Form, Button, InputGroup } from 'react-bootstrap';
import { Trash2, Link as LinkIcon, Home, CheckCircle } from 'lucide-react';
import { NumberFormatBase } from 'react-number-format';

// --- FUNÇÕES DE FORMATAÇÃO MANTIDAS ---
const onlyDigits = (value) => value.replace(/\D/g, '');

const formatCurrencyFromCents = (value) => {
    const digits = String(value || '').replace(/\D/g, '');
    if (!digits) return '';
    const number = Number(digits) / 100;
    return number.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};

const formatDecimal = (value) => {
    if (value === null || value === undefined || value === '') return '';
    const cleaned = String(value).replace(/[^\d,]/g, '').replace(/(,.*),/g, '$1'); 
    return cleaned;
};

const parseDecimal = (value) => {
    const cleaned = String(value || '').replace(/\./g, '').replace(',', '.').replace(/[^\d.]/g, '');
    const parsed = Number(cleaned);
    return Number.isNaN(parsed) ? 0 : parsed;
};

const formatInteger = (value) => onlyDigits(String(value || ''));

// --- COMPONENTE ---
const CardComparativo = ({ idx, comp, handleFoto, handlePaste, onChange, onRemove }) => {
    const uid = comp._localId ?? `idx-${idx}`;
    return (
        <Card className="shadow-sm border-0 mb-4 overflow-hidden">
            <Card.Header className="bg-dark text-white d-flex justify-content-between align-items-center py-2">
                <h6 className="mb-0 fw-bold small text-uppercase" style={{ letterSpacing: '0.5px' }}>
                    Referência {idx + 1}
                </h6>
                <Button variant="link" className="text-danger p-0" onClick={() => onRemove(idx)}>
                    <Trash2 size={18} />
                </Button>
            </Card.Header>

            <Card.Body className="p-3">
                {/* DADOS DO IMÓVEL */}
                <Row className="g-3 mb-3">
                    <Col md={4}>
                        <Form.Label className="small fw-bold text-muted text-uppercase" style={{ fontSize: '10px' }}>Bairro *</Form.Label>
                        <Form.Control size="sm" type="text" placeholder="Ex: Pacaembu" value={comp.bairro} onChange={(e) => onChange(idx, 'bairro', e.target.value)} />
                    </Col>
                    <Col md={4}>
                        <Form.Label className="small fw-bold text-muted text-uppercase" style={{ fontSize: '10px' }}>Valor de Venda *</Form.Label>
                        <InputGroup size="sm">
                            <NumberFormatBase className="form-control form-control-sm" value={comp.valor_venda ?? ''} format={formatCurrencyFromCents} onValueChange={(values) => onChange(idx, 'valor_venda', values.value)} />
                        </InputGroup>
                    </Col>
                    <Col md={4}>
                        <Form.Label className="small fw-bold text-muted text-uppercase" style={{ fontSize: '10px' }}>Link Anúncio *</Form.Label>
                        <InputGroup size="sm">
                            <InputGroup.Text><LinkIcon size={14} /></InputGroup.Text>
                            <Form.Control type="url" placeholder="https://..." value={comp.link_anuncio} onChange={(e) => onChange(idx, 'link_anuncio', e.target.value)} />
                        </InputGroup>
                    </Col>
                </Row>

                <Row className="g-3 mb-3">
                    <Col md={2}><Form.Label className="small fw-bold text-muted text-uppercase" style={{ fontSize: '10px' }}>Área Total *</Form.Label><Form.Control size="sm" type="text" value={formatDecimal(comp.area_total)} onChange={(e) => onChange(idx, 'area_total', parseDecimal(e.target.value))} /></Col>
                    <Col md={2}><Form.Label className="small fw-bold text-muted text-uppercase" style={{ fontSize: '10px' }}>Área Const. *</Form.Label><Form.Control size="sm" type="text" value={formatDecimal(comp.area_construida)} onChange={(e) => onChange(idx, 'area_construida', parseDecimal(e.target.value))} /></Col>
                    <Col md={2}><Form.Label className="small fw-bold text-muted text-uppercase" style={{ fontSize: '10px' }}>Dorms</Form.Label><Form.Control size="sm" type="text" value={formatInteger(comp.dormitorios)} onChange={(e) => onChange(idx, 'dormitorios', Number(formatInteger(e.target.value)))} /></Col>
                    <Col md={2}><Form.Label className="small fw-bold text-muted text-uppercase" style={{ fontSize: '10px' }}>Suítes</Form.Label><Form.Control size="sm" type="text" value={formatInteger(comp.suites)} onChange={(e) => onChange(idx, 'suites', Number(formatInteger(e.target.value)))} /></Col>
                    <Col md={2}><Form.Label className="small fw-bold text-muted text-uppercase" style={{ fontSize: '10px' }}>Vagas</Form.Label><Form.Control size="sm" type="text" value={formatInteger(comp.vagas)} onChange={(e) => onChange(idx, 'vagas', Number(formatInteger(e.target.value)))} /></Col>
                    <Col md={2}><Form.Label className="small fw-bold text-muted text-uppercase" style={{ fontSize: '10px' }}>Salas</Form.Label><Form.Control size="sm" type="text" value={formatInteger(comp.salas)} onChange={(e) => onChange(idx, 'salas', Number(formatInteger(e.target.value)))} /></Col>
                </Row>

                <div className="d-flex gap-3 mb-4 p-2 bg-light rounded border">
                    <Form.Check type="switch" id={`piscina-${uid}`} label={<span className="small fw-bold text-muted text-uppercase" style={{ fontSize: '10px' }}>Piscina</span>} checked={comp.has_piscina} onChange={(e) => onChange(idx, 'has_piscina', e.target.checked)} />
                    <Form.Check type="switch" id={`gourmet-${uid}`} label={<span className="small fw-bold text-muted text-uppercase" style={{ fontSize: '10px' }}>Área Gourmet</span>} checked={comp.has_area_gourmet} onChange={(e) => onChange(idx, 'has_area_gourmet', e.target.checked)} />
                </div>

                <hr className="my-3" />

                {/* --- SEÇÃO DE FOTOS IDENTICA AO ALVO --- */}
                <h6 className="fw-bold small text-muted mb-3 text-uppercase" style={{ fontSize: '10px', letterSpacing: '1px' }}>Fotos do Comparativo</h6>
                
                <Row className="g-2">
                    {comp.fotos.map((url, fIdx) => (
                        <Col xs={6} md={3} key={fIdx}>
                            <Form.Group className="text-center h-100 d-flex flex-column">
                                <Form.Label className="fw-bold text-muted mb-1 text-uppercase" style={{ fontSize: '9px' }}>
                                    {fIdx === 0 ? 'Foto Principal' : `Foto ${fIdx + 1}`}
                                </Form.Label>
                                
                                <div className="border rounded p-2 bg-white flex-grow-1 d-flex flex-column shadow-sm">
                                    {/* 1. BOTÃO PROCURAR (INPUT CLÁSSICO) */}
                                    <div className="mb-2">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="d-none"
                                            id={`foto-comp-${uid}-${fIdx}`}
                                            onChange={(e) => handleFoto(e, idx, fIdx)}
                                        />
                                        <label
                                            htmlFor={`foto-comp-${uid}-${fIdx}`}
                                            className={`btn btn-sm w-100 d-flex align-items-center justify-content-center gap-1 ${url ? 'btn-success' : 'btn-outline-primary'}`}
                                            style={{ fontSize: '10px', fontWeight: 'bold' }}
                                        >
                                            {url ? <CheckCircle size={14} /> : <Home size={14} />}
                                            {url ? 'SUBSTITUIR' : 'PROCURAR'}
                                        </label>
                                    </div>

                                    {/* 2. ÁREA DE COLAR + EXIBIÇÃO DA MINIATURA */}
                                    <div
                                        onPaste={(e) => handlePaste(e, fIdx)}
                                        tabIndex="0"
                                        className={`rounded border flex-grow-1 d-flex flex-column align-items-center justify-content-center p-1 ${url ? 'bg-success-subtle border-success' : 'bg-light'}`}
                                        style={{ 
                                            minHeight: '60px', 
                                            borderStyle: 'dashed !important',
                                            cursor: 'pointer',
                                            outline: 'none',
                                            transition: 'all 0.2s',
                                            overflow: 'hidden'
                                        }}
                                        onFocus={(e) => e.currentTarget.classList.add('border-primary', 'shadow')}
                                        onBlur={(e) => e.currentTarget.classList.remove('border-primary', 'shadow')}
                                    >
                                        {url ? (
                                            <img 
                                                src={url} 
                                                alt="Preview" 
                                                className="img-fluid rounded" 
                                                style={{ maxHeight: '55px', width: '100%', objectFit: 'cover' }} 
                                            />
                                        ) : (
                                            <span className="text-muted fw-bold text-uppercase text-center" style={{ fontSize: '8px', lineHeight: '1.2' }}>
                                                Clique aqui <br /> Ctrl+V / Cmd+V
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </Form.Group>
                        </Col>
                    ))}
                </Row>
            </Card.Body>
        </Card>
    );
};

export default CardComparativo;