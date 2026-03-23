import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// 1. IMPORTANTE: Importe o PROVIDER (que abraça o app) 
// e o HOOK (que busca os dados). Verifique os caminhos!
import { AuthProvider, useAuth } from './context/AuthContext';
// COMPONENTES
import Login from './components/Login';
import Painel from './pages/Painel';
import Institucional from './pages/Institucional';

// Componente de Proteção
const RotaPrivada = ({ children }) => {
    const { user, loading } = useAuth();
    
    if (loading) return <div className="p-5 text-center fw-bold">Carregando ST Imobiliária...</div>;
    
    // Se não tiver usuário, manda para o login do PMI
    return user ? children : <Navigate to="/pmi/login" />;
};

function App() {
    return (
        /* 2. MUDANÇA AQUI: Use AuthProvider em vez de AuthContext */
        <AuthProvider> 
            <Router>
                <Routes>
                    {/* Site institucional na raiz */}
                    <Route path="/" element={<Institucional />} />
                    
                    {/* Login do sistema */}
                    <Route path="/pmi/login" element={<Login />} />

                    {/* Painel protegido */}
                    <Route 
                        path="/pmi" 
                        element={
                            <RotaPrivada>
                                <Painel />
                            </RotaPrivada>
                        } 
                    />

                    {/* Redirecionamento de segurança */}
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;