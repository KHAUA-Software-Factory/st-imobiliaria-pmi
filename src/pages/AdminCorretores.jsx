import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Table, Card, Badge, Spinner } from 'react-bootstrap';
import { ArrowLeft, Save, UserPlus, Trash2, Edit, CheckCircle } from 'lucide-react';

// SERVIÇOS
import { db } from '../services/firebase';
import { cadastrarCorretor } from '../services/userService';
import { collection, query, onSnapshot, doc, deleteDoc } from 'firebase/firestore';

const AdminCorretores = ({ aoVoltar }) => {
    // --- ESTADOS DO FORMULÁRIO ---
    const [form, setForm] = useState({
        nome: '',
        creci: '',
        emailPDF: '',
        emailGmail: '',
        nivel: 'corretor',
        arquivoFoto: null,
        fotoUrlAntiga: ''
    });

    // --- ESTADOS DE DADOS ---
    const [corretores, setCorretores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [salvando, setSalvando] = useState(false);

    // --- BUSCAR CORRETORES EM TEMPO REAL ---
    useEffect(() => {
        const q = query(collection(db, "usuarios"));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const lista = [];
            querySnapshot.forEach((doc) => {
                lista.push({ id: doc.id, ...doc.data() });
            });
            setCorretores(lista);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // --- AÇÕES ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSalvando(true);
        try {
            await cadastrarCorretor(form);
            alert("Corretor salvo com sucesso!");
            setForm({ nome: '', creci: '', emailPDF: '', emailGmail: '', nivel: 'corretor', arquivoFoto: null, fotoUrlAntiga: '' });
        } catch (error) {
            alert("Erro ao salvar corretor.", error);
        } finally {
            setSalvando(false);
        }
    };

    const handleEditar = (corretor) => {
        setForm({
            nome: corretor.nome,
            creci: corretor.creci || '',
            emailPDF: corretor.emailPDF,
            emailGmail: corretor.emailGmail,
            nivel: corretor.nivel || 'corretor',
            arquivoFoto: null,
            fotoUrlAntiga: corretor.fotoUrl || ''
        });
        window.scrollTo(0, 0); // Sobe para o formulário
    };

    const handleExcluir = async (email) => {
        if (window.confirm(`Deseja realmente remover o acesso de ${email}?`)) {
            try {
                await deleteDoc(doc(db, "usuarios", email));
            } catch (error) {
                alert("Erro ao excluir.", error);
            }
        }
    };

    return (
        <Container className="mt-4 pb-5">
            {/* Cabeçalho */}
            <div className="d-flex align-items-center mb-4">
                <Button variant="link" onClick={aoVoltar} className="p-0 me-3 text-dark">
                    <ArrowLeft size={28} />
                </Button>
                <h3 className="fw-bold mb-0 text-primary">Gestão de Equipe ST</h3>
            </div>

            {/* Formulário de Cadastro/Edição */}
            <Card className="shadow-sm mb-5 border-0 bg-light">
                <Card.Body className="p-4">
                    <h5 className="mb-4 d-flex align-items-center">
                        <UserPlus size={20} className="me-2 text-primary" /> 
                        {form.fotoUrlAntiga ? "Editar Corretor" : "Cadastrar Novo Corretor"}
                    </h5>
                    <Form onSubmit={handleSubmit}>
                        <Row className="g-3">
                            <Col md={6}>
                                <Form.Label className="fw-bold">Nome Completo</Form.Label>
                                <Form.Control required value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} />
                            </Col>
                            <Col md={6}>
                                <Form.Label className="fw-bold">CRECI</Form.Label>
                                <Form.Control required value={form.creci} onChange={e => setForm({...form, creci: e.target.value})} placeholder="Ex: 123.456-F" />
                            </Col>
                            <Col md={6}>
                                <Form.Label className="fw-bold">E-mail (Aparece no PDF)</Form.Label>
                                <Form.Control required type="email" value={form.emailPDF} onChange={e => setForm({...form, emailPDF: e.target.value})} />
                            </Col>
                            <Col md={6}>
                                <Form.Label className="fw-bold">E-mail Gmail (Login)</Form.Label>
                                <Form.Control required type="email" value={form.emailGmail} disabled={!!form.fotoUrlAntiga} onChange={e => setForm({...form, emailGmail: e.target.value})} />
                            </Col>
                            <Col md={6}>
                                <Form.Label className="fw-bold">Nível de Acesso</Form.Label>
                                <Form.Select value={form.nivel} onChange={e => setForm({...form, nivel: e.target.value})}>
                                    <option value="corretor">Corretor (Só PMI)</option>
                                    <option value="admin">Administrador (Gere Equipe)</option>
                                    <option value="master">Master</option>
                                </Form.Select>
                            </Col>
                            <Col md={6}>
                                <Form.Label className="fw-bold">Foto de Perfil</Form.Label>
                                <Form.Control type="file" accept="image/*" onChange={e => setForm({...form, arquivoFoto: e.target.files[0]})} />
                            </Col>
                            <Col md={12} className="text-end mt-4">
                                <Button variant="primary" type="submit" size="lg" className="fw-bold px-5 shadow" disabled={salvando}>
                                    {salvando ? <Spinner size="sm" /> : <><Save size={18} className="me-2" /> SALVAR CORRETOR</>}
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                </Card.Body>
            </Card>

            {/* Lista de Corretores */}
            <h5 className="fw-bold mb-3 text-secondary">Corretores Ativos</h5>
            <div className="bg-white rounded shadow-sm border">
                <Table responsive hover className="mb-0 align-middle">
                    <thead className="bg-dark text-white">
                        <tr>
                            <th>Foto</th>
                            <th>Nome / CRECI</th>
                            <th>E-mail Login</th>
                            <th>Nível</th>
                            <th className="text-center">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5" className="text-center py-4"><Spinner animation="border" /></td></tr>
                        ) : corretores.map(c => (
                            <tr key={c.id}>
                                <td>
                                    <img 
                                        src={c.fotoUrl || 'https://via.placeholder.com/40'} 
                                        alt="Perfil" 
                                        className="rounded-circle border" 
                                        style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                    />
                                </td>
                                <td>
                                    <div className="fw-bold">{c.nome}</div>
                                    <small className="text-muted">{c.creci || 'Sem CRECI'}</small>
                                </td>
                                <td>{c.emailGmail}</td>
                                <td>
                                    <Badge bg={c.nivel === 'master' ? 'danger' : c.nivel === 'admin' ? 'primary' : 'secondary'}>
                                        {c.nivel?.toUpperCase()}
                                    </Badge>
                                </td>
                                <td className="text-center">
                                    <Button variant="outline-primary" size="sm" className="me-2 border-0" onClick={() => handleEditar(c)}>
                                        <Edit size={18} />
                                    </Button>
                                    <Button variant="outline-danger" size="sm" className="border-0" onClick={() => handleExcluir(c.id)}>
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