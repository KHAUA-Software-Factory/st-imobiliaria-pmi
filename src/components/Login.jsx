import React, { useState } from 'react';
import { auth, db } from '../services/firebase'; // Verifique se o caminho está correto
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { Container, Button, Card, Alert, Spinner } from 'react-bootstrap';
import { ShieldCheck } from 'lucide-react'; 

const Login = ({ onLogin }) => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Cores Oficiais ST
  const azulST = "#052739";
  const douradoST = "#d6bf47";

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const email = result.user.email;

      // Verifica se o e-mail está na coleção de corretores autorizados
      const userDoc = await getDoc(doc(db, "usuarios", email));
      
      if (userDoc.exists()) {
        const dados = userDoc.data();
        onLogin(dados); 
      } else {
        setError(`Acesso negado: o e-mail ${email} não possui autorização no sistema ST.`);
        await signOut(auth);
      }
    } catch (err) {
      setError("Falha na autenticação. Verifique sua conexão.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="d-flex align-items-center justify-content-center" 
      style={{ 
        minHeight: "100vh", 
        backgroundColor: azulST, // Fundo Azul Noturno
        backgroundImage: "radial-gradient(circle, #0a3a54 0%, #052739 100%)" 
      }}>
      
      <Card style={{ width: '100%', maxWidth: '400px' }} className="shadow-lg border-0 text-center p-2">
        <Card.Body className="p-5">
          {/* Logo ou Título */}
          <h1 className="fw-bold mb-1" style={{ color: azulST }}>ST</h1>
          <h4 className="fw-bold mb-2" style={{ color: azulST }}>IMOBILIÁRIA</h4>
          <p className="text-muted small mb-4">Pesquisa de Mercado Imobiliário (PMI)</p>
          
          <hr className="my-4" style={{ opacity: 0.1 }} />

          {error && (
            <Alert variant="danger" className="py-2 small border-0 shadow-sm mb-4">
              {error}
            </Alert>
          )}
          
          <Button 
            variant="light" 
            className="w-100 d-flex align-items-center justify-content-center gap-3 p-3 shadow-sm border"
            style={{ 
                borderRadius: '10px', 
                fontWeight: '600',
                transition: 'all 0.3s ease' 
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