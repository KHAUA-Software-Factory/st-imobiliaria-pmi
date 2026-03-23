import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { auth, db } from './services/firebase'; // Certifique-se de que o caminho está correto
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import Login from './components/Login';
import Home from './pages/Home';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      try {
        if (fbUser) {
          const docRef = doc(db, "usuarios", fbUser.email);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUser(docSnap.data());
          } else {
            console.error("Usuário não cadastrado no Firestore");
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Erro na autenticação:", err);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div className="p-5 text-center">Carregando ST Imobiliária...</div>;

  return (
    <div className="App">
      {!user ? <Login onLogin={setUser} /> : <Home user={user} />}
    </div>
  );
}

export default App;