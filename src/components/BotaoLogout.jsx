import React from 'react';
import { Button, Spinner } from 'react-bootstrap';
import { LogOut } from 'lucide-react';
import { auth } from '../services/firebase'; // Caminho do seu arquivo modularizado
import { signOut } from 'firebase/auth';

const BotaoLogout = () => {
  const [loading, setLoading] = React.useState(false);

  const handleLogout = async () => {
    if (window.confirm("Deseja realmente sair do sistema ST?")) {
      setLoading(true);
      try {
        await signOut(auth);
        // O Firebase Observer no App.jsx cuidará de redirecionar para o Login
        window.location.reload(); 
      } catch (error) {
        console.error("Erro ao sair:", error);
        alert("Erro ao encerrar sessão.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Button 
      variant="outline-danger" 
      size="sm" 
      className="d-flex align-items-center gap-2 fw-bold px-3"
      onClick={handleLogout}
      disabled={loading}
      style={{ borderRadius: '8px', border: '1px solid #dc3545' }}
    >
      {loading ? (
        <Spinner animation="border" size="sm" />
      ) : (
        <>
          <LogOut size={16} />
          Sair
        </>
      )}
    </Button>
  );
};

export default BotaoLogout;