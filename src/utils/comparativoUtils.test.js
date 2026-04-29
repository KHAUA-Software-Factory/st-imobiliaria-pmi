import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { withLocalId, stripLocalId, novoComparativoVazio } from './comparativoUtils';

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('withLocalId', () => {
    it('preserva _localId existente', () => {
        const comp = { bairro: 'X', _localId: 'id-fixo' };
        expect(withLocalId(comp)._localId).toBe('id-fixo');
    });

    it('adiciona _localId quando ausente', () => {
        vi.stubGlobal('crypto', { randomUUID: () => 'novo-uuid-teste' });
        const comp = { bairro: 'Y' };
        expect(withLocalId(comp)._localId).toBe('novo-uuid-teste');
        expect(withLocalId(comp).bairro).toBe('Y');
    });
});

describe('stripLocalId', () => {
    it('remove _localId e mantém demais campos', () => {
        const comp = { bairro: 'Z', valor_venda: 100, _localId: 'x' };
        expect(stripLocalId(comp)).toEqual({ bairro: 'Z', valor_venda: 100 });
    });

    it('retorna o valor original para não-objeto', () => {
        expect(stripLocalId(null)).toBe(null);
        expect(stripLocalId(undefined)).toBe(undefined);
    });
});

describe('novoComparativoVazio', () => {
    beforeEach(() => {
        vi.stubGlobal('crypto', { randomUUID: () => 'uuid-novo-item' });
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('retorna estrutura esperada com _localId', () => {
        const c = novoComparativoVazio();
        expect(c._localId).toBe('uuid-novo-item');
        expect(c.bairro).toBe('');
        expect(c.valor_venda).toBe('');
        expect(c.fotos).toEqual(['', '', '', '']);
        expect(c.link_anuncio).toBe('');
        expect(c.area_total).toBe(0);
        expect(c.area_construida).toBe(0);
        expect(c.has_piscina).toBe(false);
    });
});
