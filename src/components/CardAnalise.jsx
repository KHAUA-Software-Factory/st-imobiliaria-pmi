import React from 'react';
import { Col, Card, Button, Badge } from 'react-bootstrap';
import { Home as HomeIcon, Bed, List, Car, MapPin } from 'lucide-react';

const CardAnalise = ({ item, onGerir }) => {
    return (
        <Col md={6} lg={4} className="mb-4">
            <Card className="shadow-sm border-0 h-100">
                <Card.Header className="bg-white border-0 pt-3">
                    <Badge bg="success">CONCLUÍDO</Badge>
                </Card.Header>
                <Card.Body>
                    <Card.Title className="fw-bold text-truncate" style={{ color: "#052739", fontSize: '1.25rem' }}>
                        {item.dados_alvo?.cliente || 'Cliente s/ nome'}
                    </Card.Title>
                    <div className="text-muted mb-3 d-flex align-items-center" style={{ fontSize: '0.85rem' }}>
                        <MapPin size={14} className="me-1 text-primary" />
                        {item.dados_alvo?.endereco?.bairro || 'Itupeva'}
                    </div>

                    <div className="d-flex justify-content-between bg-light p-2 rounded mb-3 border text-center">
                        <div><HomeIcon size={16} /><br /><small>{item.dados_alvo?.atributos?.area_construida}m²</small></div>
                        <div><Bed size={16} /><br /><small>{item.dados_alvo?.atributos?.suites} S</small></div>
                        <div><List size={16} /><br /><small>{item.dados_alvo?.atributos?.salas} Sl</small></div>
                        <div><Car size={16} /><br /><small>{item.dados_alvo?.atributos?.vagas} V</small></div>
                    </div>

                    <Button variant="outline-primary" className="w-100 fw-bold" onClick={() => onGerir(item)}>
                        OPÇÕES DE RELATÓRIO
                    </Button>
                </Card.Body>
            </Card>
        </Col>
    );
};

export default CardAnalise;