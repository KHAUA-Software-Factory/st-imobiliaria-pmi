import { describe, expect, it } from 'vitest';
import { MAX_IMAGE_BYTES, validarImagem } from './fileValidators';

const arquivo = (overrides = {}) => ({
    type: 'image/jpeg',
    size: 1024,
    ...overrides,
});

describe('validarImagem', () => {
    it('aceita imagens suportadas dentro do limite', () => {
        expect(validarImagem(arquivo())).toBeNull();
        expect(validarImagem(arquivo({ type: 'image/png' }))).toBeNull();
        expect(validarImagem(arquivo({ type: 'image/webp' }))).toBeNull();
    });

    it('permite arquivo ausente quando não obrigatório', () => {
        expect(validarImagem(null)).toBeNull();
    });

    it('exige arquivo quando obrigatório', () => {
        expect(validarImagem(null, { required: true })).toMatch(/selecione/i);
    });

    it('rejeita tipos fora da lista segura', () => {
        expect(validarImagem(arquivo({ type: 'image/svg+xml' }))).toMatch(/JPG, PNG ou WebP/i);
    });

    it('rejeita imagens acima do limite', () => {
        expect(validarImagem(arquivo({ size: MAX_IMAGE_BYTES + 1 }))).toMatch(/máximo/i);
    });
});
