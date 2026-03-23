/**
 * Converte URLs em Base64 para o jsPDF usando proxy para evitar CORS
 */
export const carregarImagem = async (url) => {
    try {
        if (!url) return null;
        // O proxy weserv ajuda a evitar problemas de CORS no seu MacBook/Navegador
        const proxyUrl = "https://images.weserv.nl/?url=" + encodeURIComponent(url);
        const resposta = await fetch(proxyUrl);
        const blob = await resposta.blob();
        
        return new Promise((resolve) => {
            const leitor = new FileReader();
            leitor.onloadend = () => resolve(leitor.result);
            leitor.readAsDataURL(blob);
        });
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