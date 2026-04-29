import { describe, it, expect } from 'vitest';
import {
    valorVendaEmReais,
    validarEtapa1,
    validarEtapa2,
    mapComparativoParaFirestore,
} from './analiseValidators';

const dadosAlvoValido = () => ({
    cliente: 'Maria Silva',
    descricao: 'Imóvel amplo e ventilado.',
    endereco: {
        logradouro: 'Rua das Flores',
        bairro: 'Centro',
        cidade: 'Itupeva',
        estado: 'SP',
        cep: '13330000',
        numero: '100',
    },
    atributos: {
        area_total: 300,
        area_construida: 200,
        suites: 1,
        vagas: 2,
        dormitorios: 3,
        salas: 1,
        has_piscina: false,
        has_area_gourmet: true,
    },
    fotos: ['https://exemplo.com/capa.jpg', '', '', ''],
});

const comparativoMinimo = (overrides = {}) => ({
    bairro: 'Jardim',
    valor_venda: 850_000,
    link_anuncio: 'https://portal.com/anuncio/1',
    fotos: ['https://storage/foto1.jpg', '', '', ''],
    area_total: 250,
    area_construida: 180,
    _localId: 'ref-local-1',
    ...overrides,
});

describe('valorVendaEmReais', () => {
    it('retorna 0 para vazio', () => {
        expect(valorVendaEmReais('')).toBe(0);
        expect(valorVendaEmReais(null)).toBe(0);
        expect(valorVendaEmReais(undefined)).toBe(0);
    });

    it('interpreta string só com dígitos como centavos', () => {
        expect(valorVendaEmReais('450000')).toBe(4500);
        expect(valorVendaEmReais('100')).toBe(1);
    });

    it('aceita número em reais', () => {
        expect(valorVendaEmReais(500_000)).toBe(500_000);
        expect(valorVendaEmReais(0)).toBe(0);
    });

    it('retorna 0 para número não finito', () => {
        expect(valorVendaEmReais(Number.NaN)).toBe(0);
    });
});

describe('validarEtapa1', () => {
    it('retorna null quando dados completos', () => {
        expect(validarEtapa1(dadosAlvoValido())).toBeNull();
    });

    it('exige cliente', () => {
        const d = dadosAlvoValido();
        d.cliente = '   ';
        expect(validarEtapa1(d)).toMatch(/cliente/i);
    });

    it('exige descrição', () => {
        const d = dadosAlvoValido();
        d.descricao = '';
        expect(validarEtapa1(d)).toMatch(/descrição/i);
    });

    it('exige endereço completo', () => {
        const d = dadosAlvoValido();
        d.endereco.cep = '';
        expect(validarEtapa1(d)).toMatch(/CEP/i);
        d.endereco.cep = '13330000';
        d.endereco.numero = '';
        expect(validarEtapa1(d)).toMatch(/número/i);
    });

    it('exige áreas positivas', () => {
        const d = dadosAlvoValido();
        d.atributos.area_total = 0;
        expect(validarEtapa1(d)).toMatch(/Área Total/i);
    });

    it('exige foto principal', () => {
        const d = dadosAlvoValido();
        d.fotos = ['', '', '', ''];
        expect(validarEtapa1(d)).toMatch(/foto principal/i);
    });
});

describe('validarEtapa2', () => {
    it('exige exatamente 3 ou 5 comparativos', () => {
        expect(validarEtapa2([])).toMatch(/Atual: 0/);
        expect(validarEtapa2([1, 2])).toMatch(/Atual: 2/);
        expect(validarEtapa2([1, 2, 3, 4])).toMatch(/Atual: 4/);
    });

    it('retorna null com três comparativos válidos', () => {
        const lista = [
            comparativoMinimo({ _localId: 'a' }),
            comparativoMinimo({ _localId: 'b', bairro: 'Outro' }),
            comparativoMinimo({ _localId: 'c', bairro: 'Norte' }),
        ];
        expect(validarEtapa2(lista)).toBeNull();
    });

    it('retorna null com cinco comparativos válidos', () => {
        const lista = Array.from({ length: 5 }, (_, i) =>
            comparativoMinimo({ _localId: `id-${i}`, bairro: `B${i}` })
        );
        expect(validarEtapa2(lista)).toBeNull();
    });

    it('rejeita link sem http(s)', () => {
        const lista = [
            comparativoMinimo({ link_anuncio: 'ftp://x.com' }),
            comparativoMinimo({ _localId: 'b', link_anuncio: 'https://ok.com' }),
            comparativoMinimo({ _localId: 'c', link_anuncio: 'https://ok2.com' }),
        ];
        expect(validarEtapa2(lista)).toMatch(/http/);
    });

    it('aceita http em minúsculas no link', () => {
        const lista = [
            comparativoMinimo({ link_anuncio: 'http://a.com' }),
            comparativoMinimo({ _localId: 'b', link_anuncio: 'https://b.com' }),
            comparativoMinimo({ _localId: 'c', link_anuncio: 'https://c.com' }),
        ];
        expect(validarEtapa2(lista)).toBeNull();
    });

    it('rejeita valor de venda inválido', () => {
        const lista = [
            comparativoMinimo({ valor_venda: '', _localId: 'a' }),
            comparativoMinimo({ _localId: 'b' }),
            comparativoMinimo({ _localId: 'c' }),
        ];
        expect(validarEtapa2(lista)).toMatch(/valor de venda/i);
    });
});

describe('mapComparativoParaFirestore', () => {
    it('remove _localId', () => {
        const out = mapComparativoParaFirestore(
            comparativoMinimo({ _localId: 'local-only' })
        );
        expect(out._localId).toBeUndefined();
        expect(out.bairro).toBe('Jardim');
    });

    it('converte valor_venda string (centavos) para número', () => {
        const out = mapComparativoParaFirestore({
            ...comparativoMinimo(),
            valor_venda: '450000',
        });
        expect(out.valor_venda).toBe(4500);
    });

    it('mantém valor_venda numérico', () => {
        const out = mapComparativoParaFirestore(comparativoMinimo({ valor_venda: 999 }));
        expect(out.valor_venda).toBe(999);
    });
});
