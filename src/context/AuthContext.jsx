import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

// 1. Exportamos o objeto do contexto
// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

// 2. Exportamos o Provider (O "abraço")
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
            try {
                if (fbUser) {
                    const docSnap = await getDoc(doc(db, "usuarios", fbUser.email.toLowerCase()));
                    if (docSnap.exists()) {
                        setUser({ ...docSnap.data(), uid: fbUser.uid });
                    }
                } else {
                    setUser(null);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

// 3. Exportamos o Hook (A "ponte")
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth deve estar dentro de AuthProvider");
    return context;
};