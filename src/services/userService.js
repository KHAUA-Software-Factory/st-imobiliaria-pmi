import { db, storage } from './firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

/**
 * Cadastra ou atualiza um corretor no sistema
 */
export const cadastrarCorretor = async (dados) => {
    try {
        let urlFoto = dados.fotoUrlAntiga || "";
        
        if (dados.arquivoFoto) {
            const fotoRef = ref(storage, `corretores/${dados.emailGmail}_perfil`);
            // Pegamos o resultado do upload
            const uploadResult = await uploadBytes(fotoRef, dados.arquivoFoto);
            // Pegamos a URL da referência que acabou de ser confirmada
            urlFoto = await getDownloadURL(uploadResult.ref);
        }

        const usuarioRef = doc(db, "usuarios", dados.emailGmail);
        await setDoc(usuarioRef, {
            nome: dados.nome,
            creci: dados.creci || "", 
            emailPDF: dados.emailPDF,
            emailGmail: dados.emailGmail,
            fotoUrl: urlFoto,
            nivel: dados.nivel || 'corretor',
            ultimaAtualizacao: new Date().toISOString()
        }, { merge: true });

        return { success: true };
    } catch (error) {
        console.error("Erro no cadastro:", error);
        throw error;
    }
};

export const obterDadosCorretor = async (email) => {
    try {
        // Garante que o email existe e remove espaços acidentais
        const emailLimpo = email?.trim();
        console.log("Buscando no banco o ID:", emailLimpo);
        if (!emailLimpo) return null;
        
        const docRef = doc(db, "usuarios", emailLimpo);
        const docSnap = await getDoc(docRef);

        return docSnap.exists() ? docSnap.data() : null;
    } catch (error) {
        // Se cair aqui, verifique se o 'db' está sendo importado corretamente de './firebase'
        console.error("Erro crítico no Firestore getDoc:", error.message);
        return null;
    }
};