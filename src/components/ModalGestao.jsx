import React from 'react';
import { Modal, Row, Col, Button } from 'react-bootstrap';
import { Edit, FileText, Trash2 } from 'lucide-react';

const ModalGestao = ({ 
    show, 
    onHide, 
    onEdit, 
    onDelete, 
    onOpenPdfOptions 
}) => {
    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton className="bg-primary text-white">
                <Modal.Title>Gestão do PMI</Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4">
                <Row className="g-2">
                    <Col xs={4}>
                        <Button variant="warning" className="w-100 py-3" onClick={onEdit}>
                            <Edit size={20} /><br />EDITAR
                        </Button>
                    </Col>
                    <Col xs={4}>
                        <Button variant="success" className="w-100 py-3" onClick={onOpenPdfOptions}>
                            <FileText size={20} /><br />PDF
                        </Button>
                    </Col>
                    <Col xs={4}>
                        <Button variant="danger" className="w-100 py-3" onClick={onDelete}>
                            <Trash2 size={20} /><br />EXCLUIR
                        </Button>
                    </Col>
                </Row>
            </Modal.Body>
        </Modal>
    );
};

export default ModalGestao;