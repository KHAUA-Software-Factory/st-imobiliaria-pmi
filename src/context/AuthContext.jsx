import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';

// 1. Exportamos o objeto do contexto
// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

// 2. Exportamos o Provider (O "abraço")
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let unsubscribeUserDoc = null;

        const unsubscribeAuth = onAuthStateChanged(auth, (fbUser) => {
            if (unsubscribeUserDoc) {
                unsubscribeUserDoc();
                unsubscribeUserDoc = null;
            }

            const email = fbUser?.email?.toLowerCase();
            if (!fbUser || !email) {
                setUser(null);
                setLoading(false);
                return;
            }

            setLoading(true);
            unsubscribeUserDoc = onSnapshot(doc(db, "usuarios", email), (docSnap) => {
                if (docSnap.exists()) {
                    setUser({ ...docSnap.data(), uid: fbUser.uid, email });
                } else {
                    setUser(null);
                }
                setLoading(false);
            }, (e) => {
                console.error(e);
                setUser(null);
                setLoading(false);
            });
        });

        return () => {
            unsubscribeAuth();
            if (unsubscribeUserDoc) unsubscribeUserDoc();
        };
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
