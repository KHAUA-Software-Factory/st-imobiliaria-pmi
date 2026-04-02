import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// COMPONENTES
import Login from './components/Login';
import Painel from './pages/Painel';
import NovoContrato from './pages/NovoContrato';

// Componente de Proteção KHAUA.
const RotaPrivada = ({ children }) => {
    const { user, loading } = useAuth();
    
    if (loading) return (
        <div className="d-flex justify-content-center align-items-center vh-100 fw-bold text-primary">
            SINCRONIZANDO KHAUA...
        </div>
    );
    
    // Agora o login é a raiz do subdomínio
    return user ? children : <Navigate to="/" />;
};

function App() {
    return (
        <AuthProvider> 
            {/* Se o subdomínio aponta direto para a pasta, o basename é "/" */}
            <Router basename="/">
                <Routes>
                    {/* 1. LOGIN AGORA É A RAIZ DO SUBDOMÍNIO */}
                    <Route path="/" element={<Login />} />

                    {/* 2. PAINEL PRINCIPAL */}
                    <Route 
                        path="/painel" 
                        element={
                            <RotaPrivada>
                                <Painel />
                            </RotaPrivada>
                        } 
                    />

                    {/* 3. WORKFLOW DE CONTRATOS */}
                    <Route 
                        path="/novo-contrato" 
                        element={
                            <RotaPrivada>
                                <NovoContrato />
                            </RotaPrivada>
                        } 
                    />

                    {/* Redirecionamento de segurança para o Login */}
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;