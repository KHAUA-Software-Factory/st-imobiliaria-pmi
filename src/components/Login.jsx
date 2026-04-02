import React, { useState } from 'react';
import { auth, db } from '../services/firebase'; 
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { Container, Button, Card, Alert, Spinner } from 'react-bootstrap';
import { ShieldCheck } from 'lucide-react'; 
import { useNavigate } from 'react-router-dom'; // IMPORTANTE: Para redirecionar
import logoST from '../assets/logo_st_2.png'; // Importe o logo da ST Imobiliária

const Login = () => { // Removemos a prop onLogin daqui
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Hook para mudar de página

  // Cores Oficiais ST
  const azulST = "#052739";
  const douradoST = "#d6bf47";

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const email = result.user.email.toLowerCase(); // Garantir que busca em minúsculo

      // 1. Verifica se o e-mail está na coleção de corretores autorizados
      const userDoc = await getDoc(doc(db, "usuarios", email));
      
      if (userDoc.exists()) {
        // 2. Se existe, o AuthContext vai detectar a mudança de estado automaticamente.
        // Só precisamos mandar o corretor para a rota do Painel.
        navigate('/painel'); 
      } else {
        setError(`Acesso negado: o e-mail ${email} não possui autorização no sistema ST.`);
        await signOut(auth); // Desloga para não deixar a sessão "suja"
      }
    } catch (err) {
      if (err.code === 'auth/unauthorized-domain') {
        setError("Erro: Este endereço IP/Domínio não está autorizado no console do Firebase.");
      } else {
        setError("Falha na autenticação. Verifique sua conexão.");
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="d-flex align-items-center justify-content-center" 
      style={{ 
        minHeight: "100vh", 
        backgroundColor: azulST,
        backgroundImage: "radial-gradient(circle, #0a3a54 0%, #052739 100%)" 
      }}>
      
      <Card style={{ width: '100%', maxWidth: '400px' }} className="shadow-lg border-0 text-center p-2">
        <Card.Body className="p-5">
{/* LOGO DA ST IMOBILIÁRIA */}
<div className="mb-3">
    <img 
        src={logoST} 
        alt="ST Imobiliária" 
        style={{ 
            width: '180px', // Ajuste o tamanho conforme preferir
            height: 'auto', 
            objectFit: 'contain' 
        }} 
        className="img-fluid"
    />
</div>
          <p className="text-muted small mb-4">Pesquisa de Mercado Imobiliário (PMI)</p>
          
          <hr className="my-4" style={{ opacity: 0.1 }} />

          {error && (
            <Alert variant="danger" className="py-2 small border-0 shadow-sm mb-4 text-start">
              {error}
            </Alert>
          )}
          
          <Button 
            variant="light" 
            className="w-100 d-flex align-items-center justify-content-center gap-3 p-3 shadow-sm border"
            style={{ 
                borderRadius: '10px', 
                fontWeight: '600'
            }}
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            {loading ? (
              <Spinner animation="border" size="sm" variant="primary" />
            ) : (
              <>
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: '18px' }} />
                Entrar com Google
              </>
            )}
          </Button>

          <div className="mt-5 d-flex align-items-center justify-content-center gap-2 text-muted" style={{ fontSize: '0.75rem' }}>
            <ShieldCheck size={14} style={{ color: douradoST }} />
            Acesso Restrito a Corretores Autorizados
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Login;