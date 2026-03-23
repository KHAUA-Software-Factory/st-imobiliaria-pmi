import React from 'react';
import { Modal, Row, Col, Button, Badge } from 'react-bootstrap';
import { Edit, FileText, Trash2, Download } from 'lucide-react';

const ModalGestao = ({ 
    show, 
    onHide, 
    onEdit, 
    onDelete, 
    analise, 
    onGerarPdf 
}) => {

    // --- LÓGICA DE CÁLCULO (Sincronizada com seu gerarPMI.js) ---
    const calcularValorBase = (item) => {
        if (!item || !item.comparativos || item.comparativos.length === 0) return 0;

        const areaAlvo = item.dados_alvo?.atributos?.area_construida || 0;
        
        // 1. Prepara os comparativos convertendo valores se necessário
        const comps = item.comparativos.map(comp => ({
            valor: typeof comp.valor_venda === 'string' 
                   ? Number(comp.valor_venda) / 100 
                   : Number(comp.valor_venda || 0),
            area: Number(comp.area_construida || 1)
        }));

        // 2. Calcula a média do m²
        const somaM2 = comps.reduce((acc, c) => acc + (c.valor / c.area), 0);
        const mediaM2 = somaM2 / comps.length;

        // 3. Valor Bruto e Arredondamento para o milhar (Regra do PDF)
        const valorBruto = mediaM2 * areaAlvo;
        return Math.round(valorBruto / 1000) * 1000;
    };

    const valorBase = calcularValorBase(analise);

    const formatarMoeda = (valor) => {
        return new Intl.NumberFormat('pt-BR', { 
            style: 'currency', 
            currency: 'BRL' 
        }).format(valor);
    };

    return (
        <Modal show={show} onHide={onHide} centered size="lg" className="animate__animated animate__fadeIn">
            <Modal.Header closeButton className="bg-primary text-white border-0 shadow-sm">
                <Modal.Title className="fw-bold fs-5">
                    GESTÃO: {analise?.dados_alvo?.cliente?.toUpperCase() || 'ANÁLISE'}
                </Modal.Title>
            </Modal.Header>
            
            <Modal.Body className="p-4 bg-light">
                {/* AÇÕES DE EDIÇÃO E EXCLUSÃO */}
                <Row className="g-3 mb-4 text-center">
                    <Col xs={6}>
                        <Button variant="warning" className="w-100 py-3 fw-bold shadow-sm" onClick={onEdit}>
                            <Edit size={20} className="me-2" /> EDITAR DADOS
                        </Button>
                    </Col>
                    <Col xs={6}>
                        <Button variant="danger" className="w-100 py-3 fw-bold shadow-sm" onClick={onDelete}>
                            <Trash2 size={20} className="me-2" /> EXCLUIR REGISTRO
                        </Button>
                    </Col>
                </Row>

                <hr className="my-4" />
                
                {/* SEÇÃO DE RELATÓRIOS PDF */}
                <div className="text-center mb-3">
                    <h6 className="fw-bold text-secondary text-uppercase small m-0">
                        Gerar Pesquisa de Mercado (PMI)
                    </h6>
                    <small className="text-muted">Selecione a estratégia de precificação para o PDF</small>
                </div>

                <div className="d-grid gap-2">
                    
                    {/* 0% - MÉDIA */}
                    <Button 
                        variant="outline-primary" 
                        className="w-100 py-3 d-flex justify-content-between align-items-center px-4 shadow-sm bg-white" 
                        onClick={() => onGerarPdf(0)}
                    >
                        <div className="text-start d-flex align-items-center">
                            <Badge bg="primary" className="me-3 px-2 py-2">0%</Badge>
                            <div>
                                <div className="fw-bold text-dark mb-0">MÉDIA DE MERCADO</div>
                                <small className="text-muted d-block" style={{fontSize: '10px'}}>Valor nominal da pesquisa</small>
                            </div>
                        </div>
                        <Badge bg="primary" className="fs-6 p-2">{formatarMoeda(valorBase)}</Badge>
                    </Button>

                    {/* 10% - MARGEM */}
                    <Button 
                        variant="outline-secondary" 
                        className="w-100 py-3 d-flex justify-content-between align-items-center px-4 shadow-sm bg-white" 
                        onClick={() => onGerarPdf(10)}
                    >
                        <div className="text-start d-flex align-items-center">
                            <Badge bg="secondary" className="me-3 px-2 py-2">-10%</Badge>
                            <div>
                                <div className="fw-bold text-dark mb-0">MARGEM DE NEGOCIAÇÃO</div>
                                <small className="text-muted d-block" style={{fontSize: '10px'}}>Ideal para anúncios iniciais</small>
                            </div>
                        </div>
                        <Badge bg="secondary" className="fs-6 p-2">{formatarMoeda(valorBase * 0.90)}</Badge>
                    </Button>

                    {/* 15% - LIQUIDEZ */}
                    <Button 
                        variant="outline-danger" 
                        className="w-100 py-3 d-flex justify-content-between align-items-center px-4 shadow-sm bg-white" 
                        onClick={() => onGerarPdf(15)}
                    >
                        <div className="text-start d-flex align-items-center">
                            <Badge bg="danger" className="me-3 px-2 py-2">-15%</Badge>
                            <div>
                                <div className="fw-bold text-dark mb-0">VALOR DE LIQUIDEZ</div>
                                <small className="text-muted d-block" style={{fontSize: '10px'}}>Para acelerar a venda</small>
                            </div>
                        </div>
                        <Badge bg="danger" className="fs-6 p-2">{formatarMoeda(valorBase * 0.85)}</Badge>
                    </Button>

                    {/* 20% - URGÊNCIA */}
                    <Button 
                        variant="danger" 
                        className="w-100 py-3 d-flex justify-content-between align-items-center px-4 shadow-sm" 
                        onClick={() => onGerarPdf(20)}
                    >
                        <div className="text-start d-flex align-items-center">
                            <Badge bg="white" text="danger" className="me-3 px-2 py-2">-20%</Badge>
                            <div>
                                <div className="fw-bold text-white mb-0">VENDA DE URGÊNCIA</div>
                                <small className="text-white-50 d-block" style={{fontSize: '10px'}}>Liquidação forçada</small>
                            </div>
                        </div>
                        <Badge bg="white" text="danger" className="fs-6 p-2">{formatarMoeda(valorBase * 0.80)}</Badge>
                    </Button>
                </div>
            </Modal.Body>
            
            <Modal.Footer className="bg-white border-0 justify-content-center pb-4">
                <small className="text-muted italic">
                    * Cálculos baseados em {analise?.comparativos?.length || 0} imóveis comparativos.
                </small>
            </Modal.Footer>
        </Modal>
    );
};

export default ModalGestao;