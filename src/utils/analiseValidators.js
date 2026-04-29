import { stripLocalId } from './comparativoUtils';

/** Converte valor do campo de moeda (string em centavos) ou número em reais. */
export const valorVendaEmReais = (v) => {
    if (v === '' || v === null || v === undefined) return 0;
    if (typeof v === 'string') {
        const d = v.replace(/\D/g, '');
        return d ? Number(d) / 100 : 0;
    }
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
};

/**
 * @param {object} dadosAlvo
 * @returns {string|null} mensagem de erro ou null se válido
 */
export const validarEtapa1 = (dadosAlvo) => {
    const { cliente, descricao, endereco, atributos, fotos } = dadosAlvo;
    if (!cliente?.trim()) return 'O nome do cliente é obrigatório.';
    if (!descricao?.trim()) return 'A descrição narrativa é obrigatória.';
    if (!endereco?.cep?.trim()) return 'O CEP é obrigatório.';
    if (!endereco?.logradouro?.trim()) return 'O logradouro é obrigatório.';
    if (!endereco?.bairro?.trim()) return 'O bairro é obrigatório.';
    if (!endereco?.numero?.trim()) return 'O número é obrigatório.';
    if (!atributos?.area_total || atributos.area_total <= 0) return 'Informe a Área Total.';
    if (!atributos?.area_construida || atributos.area_construida <= 0) return 'Informe a Área Construída.';
    if (!fotos?.[0]) return 'A foto principal do imóvel alvo é obrigatória.';
    return null;
};

const linkAnuncioOk = (s) => /^https?:\/\//i.test(String(s || '').trim());

/**
 * @param {Array<object>} comparativos
 * @returns {string|null} mensagem de erro ou null se válido
 */
export const validarEtapa2 = (comparativos) => {
    const n = comparativos?.length ?? 0;
    if (n !== 3 && n !== 5) {
        return `O PMI deve conter exatamente 3 ou 5 comparativos. (Atual: ${n})`;
    }
    for (let i = 0; i < comparativos.length; i++) {
        const c = comparativos[i];
        if (!c.bairro?.trim()) return `Referência ${i + 1}: o bairro é obrigatório.`;
        const valor = valorVendaEmReais(c.valor_venda);
        if (!valor || valor <= 0) return `Referência ${i + 1}: informe o valor de venda.`;
        if (!linkAnuncioOk(c.link_anuncio)) return `Referência ${i + 1}: informe um link de anúncio válido (http/https).`;
        if (!c.fotos?.[0]) return `Referência ${i + 1}: a foto principal é obrigatória.`;
        if (!c.area_total || c.area_total <= 0) return `Referência ${i + 1}: informe a área total.`;
        if (!c.area_construida || c.area_construida <= 0) return `Referência ${i + 1}: informe a área construída.`;
    }
    return null;
};

/** Prepara um comparativo para persistência (sem _localId, valor em reais). */
export const mapComparativoParaFirestore = (comp) => {
    const c = stripLocalId(comp);
    return {
        ...c,
        valor_venda: typeof comp.valor_venda === 'string'
            ? Number(String(comp.valor_venda).replace(/\D/g, '')) / 100
            : comp.valor_venda
    };
};
