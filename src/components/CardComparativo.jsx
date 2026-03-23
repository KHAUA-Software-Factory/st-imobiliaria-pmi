import React from 'react';
import { Card, Row, Col, Form, Button, InputGroup } from 'react-bootstrap';
import { Trash2, Link as LinkIcon, Home, CheckCircle } from 'lucide-react';
import { NumberFormatBase } from 'react-number-format';

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
    const cleaned = String(value)
        .replace(/[^\d,]/g, '')
        .replace(/(,.*),/g, '$1'); // mantém só a primeira vírgula
    return cleaned;
};

const parseDecimal = (value) => {
    const cleaned = String(value || '')
        .replace(/\./g, '')
        .replace(',', '.')
        .replace(/[^\d.]/g, '');
    const parsed = Number(cleaned);
    return Number.isNaN(parsed) ? 0 : parsed;
};

const formatInteger = (value) => onlyDigits(String(value || ''));

const CardComparativo = ({ idx, comp, handleFoto, onChange, onRemove }) => {
    return (
        <Card className="shadow-sm border-0 mb-4 overflow-hidden">
            <Card.Header className="bg-dark text-white d-flex justify-content-between align-items-center py-2">
                <h6 className="mb-0 fw-bold small">COMPARATIVO {idx + 1}</h6>
                <Button variant="link" className="text-danger p-0" onClick={() => onRemove(idx)}>
                    <Trash2 size={18} />
                </Button>
            </Card.Header>

            <Card.Body className="p-3">
                <Row className="g-3">
                    <Col md={4}>
                        <Form.Label className="small fw-bold">
                            Bairro <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                            size="sm"
                            type="text"
                            placeholder="Ex: Pacaembu"
                            value={comp.bairro}
                            onChange={(e) => onChange(idx, 'bairro', e.target.value)}
                        />
                    </Col>

                    <Col md={4}>
                        <Form.Label className="small fw-bold">
                            Valor de Venda <span className="text-danger">*</span>
                        </Form.Label>
                        <InputGroup size="sm">
                            <NumberFormatBase
                                className="form-control form-control-sm"
                                value={comp.valor_venda ?? ''}
                                format={formatCurrencyFromCents}
                                removeFormatting={(value) => value.replace(/\D/g, '')}
                                onValueChange={(values) => {
                                    onChange(idx, 'valor_venda', values.value);
                                }}
                                onFocus={(e) => {
                                    const len = e.target.value.length;
                                    setTimeout(() => {
                                        e.target.setSelectionRange(len, len);
                                    }, 0);
                                }}
                                // onKeyDown={(e) => {
                                //     // bloqueia mover cursor com setas
                                //     if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                                //         e.preventDefault();
                                //     }
                                // }}
                            />
                        </InputGroup>
                    </Col>

                    <Col md={4}>
                        <Form.Label className="small fw-bold">
                            Link do Anúncio <span className="text-danger">*</span>
                        </Form.Label>
                        <InputGroup size="sm">
                            <InputGroup.Text>
                                <LinkIcon size={14} />
                            </InputGroup.Text>
                            <Form.Control
                                type="url"
                                placeholder="https://..."
                                value={comp.link_anuncio}
                                onChange={(e) => onChange(idx, 'link_anuncio', e.target.value)}
                            />
                        </InputGroup>
                    </Col>

                    <Col md={3}>
                        <Form.Label className="small fw-bold">
                            Área Total (m²) <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                            size="sm"
                            type="text"
                            inputMode="decimal"
                            placeholder="Terreno"
                            value={formatDecimal(comp.area_total)}
                            onChange={(e) =>
                                onChange(idx, 'area_total', parseDecimal(e.target.value))
                            }
                        />
                    </Col>

                    <Col md={3}>
                        <Form.Label className="small fw-bold">
                            Área Const. (m²) <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                            size="sm"
                            type="text"
                            inputMode="decimal"
                            placeholder="Construção"
                            value={formatDecimal(comp.area_construida)}
                            onChange={(e) =>
                                onChange(idx, 'area_construida', parseDecimal(e.target.value))
                            }
                        />
                    </Col>

                    <Col md={2}>
                        <Form.Label className="small fw-bold">
                            Dorms <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                            size="sm"
                            type="text"
                            inputMode="numeric"
                            value={formatInteger(comp.dormitorios)}
                            onChange={(e) =>
                                onChange(idx, 'dormitorios', Number(formatInteger(e.target.value) || 0))
                            }
                        />
                    </Col>

                    <Col md={2}>
                        <Form.Label className="small fw-bold">Suítes</Form.Label>
                        <Form.Control
                            size="sm"
                            type="text"
                            inputMode="numeric"
                            value={formatInteger(comp.suites)}
                            onChange={(e) =>
                                onChange(idx, 'suites', Number(formatInteger(e.target.value) || 0))
                            }
                        />
                    </Col>

                    <Col md={2}>
                        <Form.Label className="small fw-bold">Vagas</Form.Label>
                        <Form.Control
                            size="sm"
                            type="text"
                            inputMode="numeric"
                            value={formatInteger(comp.vagas)}
                            onChange={(e) =>
                                onChange(idx, 'vagas', Number(formatInteger(e.target.value) || 0))
                            }
                        />
                    </Col>
                </Row>

                <div className="d-flex gap-3 mt-3 p-2 bg-light rounded border">
                    <Form.Check
                        type="switch"
                        id={`piscina-${idx}`}
                        label={<span className="small fw-bold">Piscina</span>}
                        checked={comp.has_piscina}
                        onChange={(e) => onChange(idx, 'has_piscina', e.target.checked)}
                    />
                    <Form.Check
                        type="switch"
                        id={`gourmet-${idx}`}
                        label={<span className="small fw-bold">Área Gourmet</span>}
                        checked={comp.has_area_gourmet}
                        onChange={(e) => onChange(idx, 'has_area_gourmet', e.target.checked)}
                    />
                </div>

                <Row className="g-2 mt-2">
                    {comp.fotos.map((url, fIdx) => (
                        <Col xs={6} md={3} key={fIdx}>
                            <div className="border rounded p-1 text-center bg-white">
                                <Form.Label
                                    className="x-small d-block mb-1 fw-bold text-muted"
                                    style={{ fontSize: '10px' }}
                                >
                                    {fIdx === 0 ? 'FOTO PRINCIPAL *' : `FOTO ${fIdx + 1}`}
                                </Form.Label>
                                <Form.Control
                                    type="file"
                                    size="sm"
                                    className="d-none"
                                    id={`foto-${idx}-${fIdx}`}
                                    onChange={(e) => handleFoto(e, idx, fIdx)}
                                />
                                <label
                                    htmlFor={`foto-${idx}-${fIdx}`}
                                    className="btn btn-outline-primary btn-sm w-100 py-1"
                                >
                                    <Home size={14} />
                                </label>
                                {url && (
                                    <div
                                        className="text-success x-small mt-1"
                                        style={{ fontSize: '10px' }}
                                    >
                                        <CheckCircle size={10} /> Ok
                                    </div>
                                )}
                            </div>
                        </Col>
                    ))}
                </Row>
            </Card.Body>
        </Card>
    );
};

export default CardComparativo;