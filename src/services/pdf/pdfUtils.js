const FIREBASE_STORAGE_HOST = 'firebasestorage.googleapis.com';
const IMAGE_FETCH_TIMEOUT_MS = 15000;

const blobParaDataUrl = (blob) => new Promise((resolve) => {
    const leitor = new FileReader();
    leitor.onloadend = () => resolve(leitor.result);
    leitor.readAsDataURL(blob);
});

/**
 * Converte imagens do Firebase Storage em Base64 para o jsPDF.
 */
export const carregarImagem = async (url) => {
    try {
        if (!url) return null;

        const imageUrl = String(url);
        if (!/^https:\/\//i.test(imageUrl) || !imageUrl.includes(FIREBASE_STORAGE_HOST)) {
            return null;
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), IMAGE_FETCH_TIMEOUT_MS);

        let resposta;
        try {
            resposta = await fetch(imageUrl, { signal: controller.signal });
        } finally {
            clearTimeout(timeoutId);
        }

        if (!resposta.ok) return null;
        const contentType = resposta.headers.get('content-type') || '';
        if (contentType && !contentType.startsWith('image/')) return null;

        const blob = await resposta.blob();

        return blobParaDataUrl(blob);
    } catch (e) {
        console.error("Erro ao carregar imagem para o PDF:", e);
        return null;
    }
};

/**
 * Formata valores para moeda brasileira
 */
export const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 0, // Remove os centavos
        maximumFractionDigits: 0, // Remove os centavos
    }).format(valor);
};
