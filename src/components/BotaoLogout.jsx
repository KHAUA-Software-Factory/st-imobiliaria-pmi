import React from 'react';
import { Button } from 'react-bootstrap';
import { LogOut } from 'lucide-react';
import { auth } from '../services/firebase';
import { signOut } from 'firebase/auth';

const BotaoLogout = () => {
    const handleLogout = async () => {
        try {
            await signOut(auth);
            // O AuthContext cuidará de limpar o estado 'user' automaticamente
        } catch (error) {
            console.error("Erro ao deslogar:", error);
        }
    };

    return (
        <Button 
            variant="outline-danger" 
            size="sm" 
            className="fw-bold d-flex align-items-center shadow-sm"
            onClick={handleLogout}
        >
            <LogOut size={16} className="me-1" /> SAIR
        </Button>
    );
};

export default BotaoLogout;