/** Garante id estável no cliente (não persiste no Firestore). */
export const withLocalId = (comp) => ({
    ...comp,
    _localId: comp._localId || crypto.randomUUID(),
});

export const stripLocalId = (comp) => {
    if (!comp || typeof comp !== 'object') return comp;
    const { _localId, ...rest } = comp;
    return rest;
};

export const novoComparativoVazio = () => ({
    _localId: crypto.randomUUID(),
    bairro: '',
    valor_venda: '',
    area_construida: 0,
    area_total: 0,
    suites: 0,
    vagas: 0,
    salas: 0,
    dormitorios: 0,
    has_piscina: false,
    has_area_gourmet: false,
    fotos: ['', '', '', ''],
    link_anuncio: '',
});
