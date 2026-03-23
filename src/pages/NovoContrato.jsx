// import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card, InputGroup, Spinner, Badge } from 'react-bootstrap';
import { MapPin, FileText, Upload, Save, ArrowLeft, Search, Home, DollarSign, ShieldCheck } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';

const NovoContrato = () => {
    // const navigate = useNavigate();
    // const [buscandoCep, setBuscandoCep] = useState(false);

    // // ESTADO ESTRUTURADO PARA CONTRATO JURÍDICO
    // const [dados, setDados] = useState({
    //     // 1. LOCALIZAÇÃO E REGISTRO
    //     cep: '',
    //     logradouro: '',
    //     numero: '',
    //     complemento: '',
    //     bairro: '',
    //     cidade: 'Itupeva',
    //     uf: 'SP',
    //     numMatricula: '',       // ESSENCIAL
    //     cartorio: 'Jundiaí',    // COMUM NA REGIÃO
    //     inscricaoMunicipal: '', // CAPA DO IPTU
        
    //     // 2. ATRIBUTOS TÉCNICOS
    //     areaTerreno: '',
    //     areaConstruida: '',
    //     statusOcupacao: 'Vazio', // Vazio, Proprietário, Inquilino
        
    //     // 3. FINANCEIRO
    //     valorVenda: '',
    //     valorCondominio: '',
    //     iptuAnual: '',
    //     comissaoPorcentagem: '6', // PADRÃO CRECI

    //     // 4. ARQUIVOS (BLOB/FILE)
    //     fileMatricula: null,
    //     fileIptu: null,
    //     fileCnd: null,
    //     fileHabitese: null
    // });

    // const buscarCep = async () => {
    //     const cepLimpo = dados.cep.replace(/\D/g, '');
    //     if (cepLimpo.length !== 8) return;
    //     setBuscandoCep(true);
    //     try {
    //         const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
    //         const data = await res.json();
    //         if (!data.erro) {
    //             setDados(prev => ({
    //                 ...prev,
    //                 logradouro: data.logradouro,
    //                 bairro: data.bairro,
    //                 cidade: data.localidade,
    //                 uf: data.uf
    //             }));
    //         }
    //     } finally { setBuscandoCep(false); }
    // };

    return (
        <Container className="py-4 pb-5 animate__animated animate__fadeIn">
         <Row>
                <Col md={12}>
                    <h2 className="fw-bold text-primary mb-4">NOVO CONTRATO</h2>
                </Col>
            </Row>
  
        </Container>
    );
};

export default NovoContrato;