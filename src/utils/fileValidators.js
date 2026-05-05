export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const MAX_IMAGE_MB = MAX_IMAGE_BYTES / (1024 * 1024);

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const validarImagem = (file, { required = false } = {}) => {
    if (!file) return required ? 'Selecione uma imagem.' : null;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        return 'Use uma imagem JPG, PNG ou WebP.';
    }

    if (file.size > MAX_IMAGE_BYTES) {
        return `A imagem deve ter no máximo ${MAX_IMAGE_MB} MB.`;
    }

    return null;
};

export const tiposImagemPermitidos = ALLOWED_IMAGE_TYPES.join(',');
