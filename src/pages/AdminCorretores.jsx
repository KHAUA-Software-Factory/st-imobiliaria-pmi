import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Table, Card, Badge, Spinner } from 'react-bootstrap';
import { ArrowLeft, Save, UserPlus, Trash2, Edit } from 'lucide-react';
import { tiposImagemPermitidos } from '../utils/fileValidators';

// SERVIÇOS
import { db } from '../services/firebase';
import { cadastrarCorretor } from '../services/userService';
import { collection, query, onSnapshot, doc, deleteDoc, orderBy } from 'firebase/firestore';

const AdminCorretores = ({ aoVoltar }) => {
    // --- ESTADOS DO FORMULÁRIO ---
    const [form, setForm] = useState({
        nome: '',
        creci: '',
        emailPDF: '',
        emailGmail: '',
        nivel: 'corretor', // Valor padrão seguro
        arquivoFoto: null,
        fotoUrlAntiga: ''
    });

    // --- ESTADOS DE DADOS ---
    const [corretores, setCorretores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [salvando, setSalvando] = useState(false);

    // --- BUSCAR CORRETORES EM TEMPO REAL ---
    useEffect(() => {
        // Adicionada ordenação por nome para facilitar a gestão da equipe
        const q = query(collection(db, "usuarios"), orderBy("nome", "asc"));
        
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const lista = [];
            querySnapshot.forEach((doc) => {
                lista.push({ id: doc.id, ...doc.data() });
            });
            setCorretores(lista);
            setLoading(false);
        }, (error) => {
            console.error("Erro ao buscar corretores:", error);
            setLoading(false);
        });
        
        return () => unsubscribe();
    }, []);

    // --- AÇÕES ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSalvando(true);
        
        try {
            // Chamada para o serviço que faz o upload da foto e salva no Firestore
            await cadastrarCorretor(form);
            
            alert("Corretor salvo com sucesso!");
            
            // Limpa o formulário após salvar
            setForm({ 
                nome: '', 
                creci: '', 
                emailPDF: '', 
                emailGmail: '', 
                nivel: 'corretor', 
                arquivoFoto: null, 
                fotoUrlAntiga: '' 
            });
        } catch (error) {
            console.error("Erro ao salvar:", error);
            alert("Erro ao salvar corretor. Verifique a conexão.");
        } finally {
            setSalvando(false);
        }
    };

    const handleEditar = (corretor) => {
        setForm({
            nome: corretor.nome || '',
            creci: corretor.creci || '',
            emailPDF: corretor.emailPDF || '',
            emailGmail: corretor.emailGmail || '',
            nivel: corretor.nivel || 'corretor',
            arquivoFoto: null,
            fotoUrlAntiga: corretor.fotoUrl || ''
        });
        
        // Scroll suave para o topo do formulário no Mac
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleExcluir = async (idDocumento) => {
        if (window.confirm(`AVISO: Deseja realmente remover este acesso? O usuário perderá o login imediatamente.`)) {
            try {
                await deleteDoc(doc(db, "usuarios", idDocumento));
            } catch (error) {
                alert("Erro ao excluir usuário.", error);
            }
        }
    };

    return (
        <Container className="mt-2 pb-5 animate__animated animate__fadeIn">
            {/* Cabeçalho de Navegação */}
            <div className="d-flex align-items-center mb-4">
                <Button variant="outline-dark" onClick={aoVoltar} className="rounded-circle p-2 me-3 shadow-sm border-0 bg-white">
                    <ArrowLeft size={20} />
                </Button>
                <div>
                    <h3 className="fw-bold mb-0 text-primary">Gestão de Equipe</h3>
                    <small className="text-muted text-uppercase fw-bold" style={{fontSize: '10px'}}>ST Imobiliária - Itupeva/SP</small>
                </div>
            </div>

            {/* Formulário de Cadastro/Edição */}
            <Card className="shadow-sm mb-5 border-0 rounded-4 overflow-hidden">
                <div className="bg-primary py-2 px-4">
                    <small className="text-white fw-bold text-uppercase" style={{fontSize: '11px'}}>
                        {form.fotoUrlAntiga ? "Modo de Edição" : "Novo Cadastro"}
                    </small>
                </div>
                <Card.Body className="p-4">
                    <h5 className="mb-4 d-flex align-items-center fw-bold">
                        <UserPlus size={22} className="me-2 text-primary" /> 
                        {form.fotoUrlAntiga ? "Atualizar Dados do Corretor" : "Cadastrar Novo Corretor"}
                    </h5>
                    
                    <Form onSubmit={handleSubmit}>
                        <Row className="g-3">
                            <Col md={6}>
                                <Form.Label className="fw-bold small text-secondary">Nome Completo</Form.Label>
                                <Form.Control required value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} className="py-2" />
                            </Col>
                            <Col md={6}>
                                <Form.Label className="fw-bold small text-secondary">Número do CRECI</Form.Label>
                                <Form.Control required value={form.creci} onChange={e => setForm({...form, creci: e.target.value})} placeholder="000.000-F" className="py-2" />
                            </Col>
                            <Col md={6}>
                                <Form.Label className="fw-bold small text-secondary">E-mail Profissional (Exibe no PDF)</Form.Label>
                                <Form.Control required type="email" value={form.emailPDF} onChange={e => setForm({...form, emailPDF: e.target.value})} className="py-2" />
                            </Col>
                            <Col md={6}>
                                <Form.Label className="fw-bold small text-secondary">E-mail Gmail (Acesso ao Sistema)</Form.Label>
                                <Form.Control required type="email" value={form.emailGmail} disabled={!!form.fotoUrlAntiga} onChange={e => setForm({...form, emailGmail: e.target.value})} className="py-2" />
                            </Col>
                            <Col md={6}>
                                <Form.Label className="fw-bold small text-secondary">Nível de Permissão</Form.Label>
                                <Form.Select value={form.nivel} onChange={e => setForm({...form, nivel: e.target.value})} className="py-2 fw-bold text-primary">
                                    <option value="corretor">CORRETOR (Acesso básico)</option>
                                    <option value="admin">ADMINISTRADOR (Gere Equipe)</option>
                                    <option value="master">MASTER (Acesso Total)</option>
                                </Form.Select>
                            </Col>
                            <Col md={6}>
                                <Form.Label className="fw-bold small text-secondary">Foto de Perfil (Opcional)</Form.Label>
                                <Form.Control type="file" accept={tiposImagemPermitidos} onChange={e => setForm({...form, arquivoFoto: e.target.files[0]})} className="py-2" />
                            </Col>
                            
                            <Col md={12} className="text-end mt-4">
                                {form.fotoUrlAntiga && (
                                    <Button variant="link" className="me-3 text-muted text-decoration-none" onClick={() => setForm({ nome: '', creci: '', emailPDF: '', emailGmail: '', nivel: 'corretor', arquivoFoto: null, fotoUrlAntiga: '' })}>
                                        Cancelar Edição
                                    </Button>
                                )}
                                <Button variant="primary" type="submit" size="lg" className="fw-bold px-5 shadow-sm" disabled={salvando}>
                                    {salvando ? <Spinner size="sm" animation="border" /> : <><Save size={18} className="me-2" /> {form.fotoUrlAntiga ? "ATUALIZAR" : "SALVAR"} CORRETOR</>}
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                </Card.Body>
            </Card>

            {/* Lista de Equipe */}
            <div className="d-flex justify-content-between align-items-end mb-3">
                <h5 className="fw-bold text-secondary mb-0">Corretores Ativos</h5>
                <Badge bg="light" text="dark" className="border shadow-sm">Total: {corretores.length}</Badge>
            </div>
            
            <div className="bg-white rounded-4 shadow-sm border overflow-hidden">
                <Table responsive hover className="mb-0 align-middle">
                    <thead className="bg-primary text-white border-0">
                        <tr>
                            <th className="py-3 ps-4 border-0">Membro</th>
                            <th className="py-3 border-0">Acesso</th>
                            <th className="py-3 border-0">Nível</th>
                            <th className="py-3 text-center border-0">Gerenciar</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5" className="text-center py-5"><Spinner animation="grow" variant="primary" /></td></tr>
                        ) : corretores.length === 0 ? (
                            <tr><td colSpan="5" className="text-center py-5 text-muted">Nenhum corretor cadastrado ainda.</td></tr>
                        ) : corretores.map(c => (
                            <tr key={c.id}>
                                <td className="ps-4">
                                    <div className="d-flex align-items-center py-2">
                                        <img 
                                            src={c.fotoUrl || 'https://via.placeholder.com/100'} 
                                            alt="Perfil" 
                                            className="rounded-circle border me-3 shadow-sm" 
                                            style={{ width: '45px', height: '45px', objectFit: 'cover' }}
                                        />
                                        <div>
                                            <div className="fw-bold text-dark">{c.nome}</div>
                                            <small className="text-muted fw-bold" style={{fontSize: '11px'}}>{c.creci || 'CRECI NÃO INF.'}</small>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div className="small text-muted">{c.emailGmail}</div>
                                    <div className="small fw-bold text-primary" style={{fontSize: '10px'}}>{c.emailPDF}</div>
                                </td>
                                <td>
                                    <Badge 
                                        bg={c.nivel === 'master' ? 'danger' : c.nivel === 'admin' ? 'primary' : 'secondary'}
                                        className="px-3 py-2 shadow-xs"
                                    >
                                        {c.nivel?.toUpperCase()}
                                    </Badge>
                                </td>
                                <td className="text-center">
                                    <Button variant="outline-primary" size="sm" className="me-2 border-0 bg-light-primary" onClick={() => handleEditar(c)}>
                                        <Edit size={18} />
                                    </Button>
                                    <Button variant="outline-danger" size="sm" className="border-0 bg-light-danger" onClick={() => handleExcluir(c.id)}>
                                        <Trash2 size={18} />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>
        </Container>
    );
};

export default AdminCorretores;
