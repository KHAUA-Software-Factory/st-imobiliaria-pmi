const FIREBASE_STORAGE_HOST = 'firebasestorage.googleapis.com';
const IMAGE_FETCH_TIMEOUT_MS = 15000;
const IMAGE_PROXY_URL = 'https://images.weserv.nl/?url=';

const blobParaDataUrl = (blob) => new Promise((resolve) => {
    const leitor = new FileReader();
    leitor.onloadend = () => resolve(leitor.result);
    leitor.readAsDataURL(blob);
});

const buscarBlobImagem = async (url) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), IMAGE_FETCH_TIMEOUT_MS);

    try {
        const resposta = await fetch(url, { signal: controller.signal });
        if (!resposta.ok) return null;

        const contentType = resposta.headers.get('content-type') || '';
        if (contentType && !contentType.startsWith('image/')) return null;

        return resposta.blob();
    } finally {
        clearTimeout(timeoutId);
    }
};

/**
 * Converte imagens do Firebase Storage em Base64 para o jsPDF.
 */
export const carregarImagem = async (url) => {
    if (!url) return null;

    const imageUrl = String(url);
    if (!/^https:\/\//i.test(imageUrl) || !imageUrl.includes(FIREBASE_STORAGE_HOST)) {
        return null;
    }

    // Tenta direto primeiro; usa proxy apenas quando CORS do Storage ainda bloqueia a leitura.
    const candidatos = [
        imageUrl,
        `${IMAGE_PROXY_URL}${encodeURIComponent(imageUrl)}`
    ];

    for (const candidato of candidatos) {
        try {
            const blob = await buscarBlobImagem(candidato);
            if (blob) return blobParaDataUrl(blob);
        } catch (e) {
            console.warn("Tentativa de carregar imagem para o PDF falhou:", e);
        }
    }

    return null;
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
