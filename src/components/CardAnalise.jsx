import React from 'react';
import { Card, Button, Badge, Row, Col } from 'react-bootstrap';
import { 
    Home as HomeIcon, 
    Bed, 
    Car, 
    MapPin, 
    FileText, 
    LayoutGrid, 
    User as UserIcon 
} from 'lucide-react';

const CardAnalise = ({ item, onGerir }) => {
    // 1. Extração segura dos dados do Firebase
    const dados = item.dados_alvo || {};
    const atributos = dados.atributos || {};
    
    // 2. Lógica para exibir o Nome do Corretor (Prioriza o nome, fallback para e-mail)
    const nomeExibicao = item.nome_corretor || item.id_corretor || 'Corretor ST';

    return (
        <Card className="shadow-sm border-0 h-100 p-2 overflow-hidden bg-white hover-shadow transition-all">
            {/* CABEÇALHO DO CARD */}
            <Card.Header className="bg-white border-0 d-flex justify-content-between align-items-center pt-3">
                <Badge bg="success" className="px-3 py-2 shadow-sm" style={{ fontSize: '0.7rem' }}>
                    CONCLUÍDO
                </Badge>
                <small className="text-muted fw-bold" style={{ fontSize: '10px' }}>
                    {item.data_criacao?.seconds 
                        ? new Date(item.data_criacao.seconds * 1000).toLocaleDateString('pt-BR') 
                        : 'Recente'}
                </small>
            </Card.Header>

            <Card.Body className="d-flex flex-column">
                {/* NOME DO CLIENTE */}
                <Card.Title className="fw-bold mb-1 text-truncate" style={{ color: "#052739", fontSize: '1.15rem' }}>
                    {dados.cliente || 'Cliente s/ nome'}
                </Card.Title>

                {/* LOCALIZAÇÃO (ITUPEVA/SP) */}
                <div className="text-muted mb-3 d-flex align-items-center" style={{ fontSize: '0.8rem' }}>
                    <MapPin size={14} className="me-1 text-primary flex-shrink-0" />
                    <span className="text-truncate">{dados.endereco?.bairro || 'Itupeva/SP'}</span>
                </div>

                {/* GRID DE ATRIBUTOS (Dormitórios, Suítes, Vagas) */}
                <div className="bg-light p-3 rounded-3 mb-3 border shadow-inner">
                    <Row className="g-0 text-center">
                        <Col xs={3} className="border-end">
                            <HomeIcon size={16} className="text-secondary mb-1" />
                            <div className="fw-bold small text-dark">{atributos.area_construida || '0'}m²</div>
                        </Col>
                        
                        <Col xs={3} className="border-end">
                            <Bed size={16} className="text-secondary mb-1" />
                            <div className="fw-bold small text-dark">{atributos.dormitorios || '0'} D</div>
                        </Col>

                        <Col xs={3} className="border-end">
                            <LayoutGrid size={16} className="text-secondary mb-1" />
                            <div className="fw-bold small text-dark">{atributos.suites || '0'} S</div>
                        </Col>

                        <Col xs={3}>
                            <Car size={16} className="text-secondary mb-1" />
                            <div className="fw-bold small text-dark">{atributos.vagas || '0'} V</div>
                        </Col>
                    </Row>
                </div>

                {/* RODAPÉ DO CORRETOR (Identificação de autoria) */}
                <div className="mt-auto mb-3 pt-2 border-top d-flex align-items-center">
                    <div className="bg-primary bg-opacity-10 p-1 rounded-circle me-2 d-flex align-items-center justify-content-center" style={{ width: '24px', height: '24px' }}>
                        <UserIcon size={14} className="text-primary" />
                    </div>
                    <div className="text-truncate">
                        <span className="text-muted" style={{ fontSize: '0.7rem', display: 'block', lineHeight: '1' }}>Elaborado por:</span>
                        <span className="fw-bold text-dark" style={{ fontSize: '0.85rem' }}>{nomeExibicao}</span>
                    </div>
                </div>

                {/* BOTÃO DE OPÇÕES (Abre o ModalGestao) */}
                <Button 
                    variant="primary" 
                    className="w-100 fw-bold py-2 shadow-sm d-flex align-items-center justify-content-center"
                    onClick={() => onGerir(item)}
                >
                    <FileText size={18} className="me-2" /> 
                    OPÇÕES DE RELATÓRIO
                </Button>
            </Card.Body>
        </Card>
    );
};

export default CardAnalise;