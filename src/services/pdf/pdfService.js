import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import logoST from '../../assets/logo_st.png';
import { COLORS, PDF_CONFIG } from './pdfConstants';
import { carregarImagem, formatarMoeda } from './pdfUtils';

export const gerarPMI = async (item, dadosCorretor, emailCorretor, margem = 0) => {
    try {
        const doc = new jsPDF(PDF_CONFIG);

        // --- CÁLCULOS ---
        const areaAlvo = item.dados_alvo?.atributos?.area_construida || 0;
        const comparativos = (item.comparativos || []).map((comp) => ({
            ...comp,
            valor_venda:
                typeof comp.valor_venda === 'string'
                    ? Number(comp.valor_venda || 0) / 100
                    : Number(comp.valor_venda || 0)
        }));

        
        // Mantemos o m² com decimais para precisão do cálculo interno
        const somaM2 = comparativos.reduce((acc, c) => acc + ((c.valor_venda || 0) / (c.area_construida || 1)), 0);
        const mediaM2 = somaM2 / (comparativos.length || 1);

        // Cálculo do valor cheio
        const valorBruto = mediaM2 * areaAlvo;

        // --- ARREDONDAMENTO PARA O MILHAR MAIS PRÓXIMO ---
        const valorMedioTotal = Math.round(valorBruto / 1000) * 1000;

        // Cálculo da sugestão com a margem aplicada sobre o valor já arredondado
        const valorSugeridoBruto = valorMedioTotal * (1 - (margem / 100));
        const valorSugeridoST = Math.round(valorSugeridoBruto / 1000) * 1000;

        // // --- 1. CAPA ---
        // doc.setFillColor(...COLORS.AZUL);
        // doc.rect(0, 0, 297, 167, 'F');
        // doc.setFillColor(...COLORS.DOURADO);
        // doc.rect(0, 162, 297, 5, 'F');

        // try {
        //     const tamLogo = 40;
        //     doc.addImage(logoST, 'PNG', (297 - tamLogo) / 2, 20, tamLogo, tamLogo);
        // } catch (e) { console.warn("Logo não carregada na capa.", e); }

        // doc.setTextColor(...COLORS.DOURADO);
        // doc.setFontSize(36);
        // doc.text("Parecer de Mercado Imobiliário (PMI)", 148, 85, { align: "center" });
        // doc.setTextColor(...COLORS.BRANCO);
        // doc.setFontSize(26);
        // doc.text(`Cliente: ${item.dados_alvo?.cliente || 'Interessado'}`, 148, 105, { align: "center" });

        // --- 1. CAPA (Layout Split 50/50 - Estilo Slide) ---
        doc.setFillColor(...COLORS.AZUL);
        doc.rect(0, 0, 297, 167, 'F');
        // Define a fonte padrão (Helvetica é nativa e não precisa carregar nada)
        doc.setFont("helvetica", "normal");
        // Faixa dourada decorativa na base
        doc.setFillColor(...COLORS.DOURADO);
        doc.rect(0, 162, 297, 5, 'F');

        // 1. LADO ESQUERDO: LOGOTIPO (50% da página)
        try {
            // A largura total é 297, metade é 148.5. 
            // Vamos centralizar a logo dentro desse bloco da esquerda.
            const larguraBloco = 148.5;
            const tamLogo = 100; // Aumentei o tamanho da logo para ter mais presença
            const posXLogo = (larguraBloco - tamLogo) / 2;
            const posYLogo = (167 - tamLogo) / 2;

            doc.addImage(logoST, 'PNG', posXLogo, posYLogo, tamLogo, tamLogo);

            // Divisória vertical sutil
            doc.setDrawColor(...COLORS.DOURADO);
            doc.setLineWidth(0.5);
            doc.line(148.5, 30, 148.5, 137);
        } catch (e) {
            console.warn("Logo não carregada na capa.", e);
        }

        // 2. LADO DIREITO: TEXTOS (Centralizados na metade direita)
        const centroDireito = 148.5 + (148.5 / 2); // Coordenada X = 222.75

        // Título do PMI
        doc.setTextColor(...COLORS.DOURADO);
        doc.setFontSize(32);
        // splitTextToSize para garantir que o título não estoure a margem direita
        const tituloPMI = doc.splitTextToSize("Pesquisa de Mercado Imobiliário (PMI)", 120);

        doc.text(tituloPMI, centroDireito, 50, { align: "center" });

        // Dados do Cliente
        doc.setTextColor(...COLORS.BRANCO);
        doc.setFontSize(20);
        doc.text("Apresentado a:", centroDireito, 105, { align: "center" });

        doc.setFontSize(28);
        doc.setFont(undefined, 'bold'); // Deixa o nome do cliente em negrito
        doc.text(`${item.dados_alvo?.cliente || 'Interessado'}`, centroDireito, 118, { align: "center" });
        doc.setFont(undefined, 'normal'); // Volta ao normal para as próximas páginas

        // --- 2. DESCRIÇÃO NARRATIVA ---
        doc.addPage();
        doc.setTextColor(...COLORS.AZUL);
        doc.setFontSize(36);
        doc.text("Descrição do Imóvel", 15, 20);
        doc.setFillColor(...COLORS.DOURADO);
        doc.rect(15, 23, 40, 1, 'F');

        doc.setFontSize(26);
        doc.setTextColor(...COLORS.TEXTO_ESCURO);
        const textoDesc = doc.splitTextToSize(item.dados_alvo?.descricao || "Sem descrição informada.", 260);
        doc.text(textoDesc, 15, 40, { lineHeightFactor: 1.5 });

        // --- 3. FICHA TÉCNICA + FOTOS ---
        doc.addPage();
        doc.setTextColor(...COLORS.AZUL);
        doc.setFontSize(36);
        doc.text("Ficha Técnica: Imóvel Alvo", 15, 18);

        autoTable(doc, {
            startY: 25,
            margin: { right: 155 },
            head: [['Atributo', 'Detalhes']],
            body: [
                ['Bairro', item.dados_alvo?.endereco?.bairro || 'N/I'],
                ['Área Total', `${item.dados_alvo?.atributos?.area_total || 0} m²`],
                ['Área Construída', `${areaAlvo} m²`],
                ['Dormitórios', `${item.dados_alvo?.atributos?.dormitorios || 0}`],
                ['Suítes', `${item.dados_alvo?.atributos?.suites || 0}`],
                // ['Salas', `${item.dados_alvo?.atributos?.salas || 0}`],
                ['Vagas', `${item.dados_alvo?.atributos?.vagas || 0}`],
                ['Piscina', item.dados_alvo?.atributos?.has_piscina ? 'Sim' : 'Não'],
                ['Área Gourmet', item.dados_alvo?.atributos?.has_area_gourmet ? 'Sim' : 'Não']
            ],
            headStyles: { fillColor: COLORS.AZUL, textColor: COLORS.DOURADO },
            styles: { fontSize: 12, cellPadding: 2 }
        });

        // Carregamento de fotos do ALVO com proteção
        const fotosAlvo = item.dados_alvo?.fotos?.filter(f => f && f.includes('http')) || [];
        for (let i = 0; i < Math.min(fotosAlvo.length, 4); i++) {
            try {
                const img = await carregarImagem(fotosAlvo[i]);
                if (img) doc.addImage(img, 'JPEG', i % 2 === 0 ? 155 : 220, i < 2 ? 30 : 75, 60, 40);
            } catch (err) { console.error("Erro na foto do alvo", i, err); }
        }

        // --- 4. COMPARATIVOS ---
        for (const [idx, comp] of comparativos.entries()) {
            doc.addPage();
            doc.setFontSize(36);
            doc.setTextColor(...COLORS.AZUL);
            doc.text(`Imóvel de Referência ${idx + 1}`, 15, 18);

            autoTable(doc, {
                startY: 25,
                margin: { right: 155 },
                head: [['Atributo', 'Dados do Mercado']],
                body: [
                    ['Bairro', comp.bairro || 'N/I'],
                    ['Valor Venda', formatarMoeda(comp.valor_venda)],
                    ['Área Total', `${comp.area_total || 0} m²`],
                    ['Área Útil', `${comp.area_construida || 0} m²`],
                    ['Valor por m²', formatarMoeda((comp.valor_venda || 0) / (comp.area_construida || 1)) + "/m²"],
                    ['Dormitórios', comp.dormitorios || '0'],
                    ['Suítes', comp.suites || '0'],
                    ['Vagas', comp.vagas || '0'],
                    ['Link do Anúncio', comp.link_anuncio ? 'Clique aqui para acessar' : 'Não informado']
                ],
                headStyles: { fillColor: [80, 80, 80], textColor: COLORS.DOURADO },
                styles: { fontSize: 12, cellPadding: 2 },
                didDrawCell: (data) => {
                    if (
                        data.section === 'body' &&
                        data.column.index === 1 &&
                        data.row.index === 8 &&
                        comp.link_anuncio
                    ) {
                        doc.link(
                            data.cell.x,
                            data.cell.y,
                            data.cell.width,
                            data.cell.height,
                            { url: comp.link_anuncio }
                        );

                        doc.setTextColor(0, 0, 255);
                    }
                }
            });

            const fotosComp = comp.fotos?.filter(f => f && f.includes('http')) || [];
            for (let i = 0; i < Math.min(fotosComp.length, 4); i++) {
                try {
                    const img = await carregarImagem(fotosComp[i]);
                    if (img) doc.addImage(img, 'JPEG', i % 2 === 0 ? 155 : 220, i < 2 ? 30 : 75, 60, 40);
                } catch (err) { console.error("Erro na foto do comp", idx, i, err); }
            }
        }

        // --- 5. QUADRO RESUMO ---
        doc.addPage();
        doc.setFontSize(30);
        doc.setTextColor(...COLORS.AZUL);
        doc.text("Análise Comparativa de Mercado", 148, 20, { align: "center" });

        //const mediaValTotal = comparativos.reduce((acc, c) => acc + (c.valor_venda || 0), 0) / (comparativos.length || 1);

        autoTable(doc, {
            startY: 30,
            head: [['Referência', 'Bairro', 'Valor Total', 'Metragem', 'Valor p/ m²']],
            body: [
                ...comparativos.map((c, i) => [
                    `REF ${i + 1}`, c.bairro,
                    formatarMoeda(c.valor_venda),
                    `${c.area_construida}m²`,
                    formatarMoeda(c.valor_venda / c.area_construida) + "/m²"
                ]),
                ["MÉDIA DE MERCADO", "-", "-", "-", formatarMoeda(mediaM2) + "/m²"]
            ],
            headStyles: { fillColor: COLORS.AZUL, textColor: COLORS.DOURADO, halign: 'center' },
            styles: { halign: 'center', fontSize: 15, cellPadding: 2 },
            didParseCell: (d) => {
                if (d.section === 'body' && d.row.index === comparativos.length) {
                    d.cell.styles.fillColor = COLORS.DOURADO;
                    d.cell.styles.textColor = COLORS.AZUL;
                    d.cell.styles.fontStyle = 'bold';
                }
            }
        });

        // --- 6. CONCLUSÃO ---
        doc.addPage();
        doc.setFillColor(...COLORS.CINZA);
        doc.rect(0, 0, 297, 167, 'F');
        doc.setTextColor(...COLORS.AZUL);
        doc.setFontSize(24);
        doc.text("Valor Médio de Avaliação", 148, 45, { align: "center" });
        doc.setFontSize(36);
        doc.text(formatarMoeda(valorMedioTotal), 148, 60, { align: "center" });

        if (margem > 0) {
            doc.setDrawColor(...COLORS.DOURADO);
            doc.setLineWidth(1);
            doc.line(100, 75, 197, 75);
            doc.setTextColor(...COLORS.AZUL);
            doc.setFontSize(24);
            // let sufixo = margem === 20 ? "(Liquidez Imediata)" : margem === 15 ? "(Valor de Liquidez)" : "(Margem de Negociação)";
            doc.text(`Sugestão ST Imobiliária`, 148, 95, { align: "center" });
            doc.setTextColor(...COLORS.DOURADO);
            doc.setFontSize(48);
            doc.text(formatarMoeda(valorSugeridoST), 148, 115, { align: "center" });
            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.text("* Valor sugerido para posicionamento estratégico de venda perante a concorrência atual.", 148, 125, { align: "center" });
        }

        // --- 7. FECHAMENTO (Layout Split com Foto Circular Perfeita) ---
        doc.addPage();
        doc.setFillColor(...COLORS.AZUL);
        doc.rect(0, 0, 297, 167, 'F');

        // 1. LADO ESQUERDO: TEXTOS (DADOS DO CORRETOR)
        const centroEsquerdo = 74.25;
        const nomeCorretor = dadosCorretor?.nome || "Corretor Autorizado";
        const creciCorretor = dadosCorretor?.creci || "Consulte o Corretor";
        const emailExibicao = dadosCorretor?.emailPDF || emailCorretor || "contato@stimobiliaria.com.br";

        doc.setTextColor(...COLORS.BRANCO);
        doc.setFontSize(26);
        doc.text(nomeCorretor, centroEsquerdo, 70, { align: "center" });

        doc.setTextColor(...COLORS.DOURADO);
        doc.setFontSize(18);
        doc.text(`CRECI: ${creciCorretor}`, centroEsquerdo, 82, { align: "center" });

        doc.setFontSize(12);
        doc.text(emailExibicao, centroEsquerdo, 90, { align: "center" });


        doc.setTextColor(...COLORS.BRANCO);
        doc.setFontSize(14);
        doc.text("https://www.stimobiliaria.com.br", centroEsquerdo, 110, { align: "center" });

        doc.setTextColor(...COLORS.BRANCO);
        doc.setFontSize(14);
        doc.text("ST Imobiliária - Itupeva/SP", centroEsquerdo, 115, { align: "center" });

        // 2. LADO DIREITO: A FOTO REDONDA
        const centroDireitoX = 222.75;
        const centroY = 83.5;
        const raioCirculo = 40;

        const urlFotoParaPDF = dadosCorretor?.fotoUrl;

        if (urlFotoParaPDF) {
            try {
                const fotoCorretor = await carregarImagem(urlFotoParaPDF);

                if (fotoCorretor) {
                    const props = doc.getImageProperties(fotoCorretor);
                    const imgW = props.width;
                    const imgH = props.height;

                    const boxSize = raioCirculo * 2;

                    // efeito cover sem distorcer
                    const scale = Math.max(boxSize / imgW, boxSize / imgH);
                    const renderW = imgW * scale;
                    const renderH = imgH * scale;

                    const imgX = centroDireitoX - renderW / 2;
                    const imgY = centroY - renderH / 2;

                    doc.advancedAPI(() => {
                        doc.saveGraphicsState();

                        // cria o caminho do círculo sem pintar
                        doc.circle(centroDireitoX, centroY, raioCirculo, null);

                        // ativa o recorte
                        doc.clip();

                        // descarta o path atual para evitar resíduos
                        doc.discardPath();

                        // desenha a imagem já recortada
                        doc.addImage(
                            fotoCorretor,
                            props.fileType || 'JPEG',
                            imgX,
                            imgY,
                            renderW,
                            renderH
                        );

                        doc.restoreGraphicsState();
                    });

                    // borda dourada por cima
                    doc.setDrawColor(...COLORS.DOURADO);
                    doc.setLineWidth(1.5);
                    doc.circle(centroDireitoX, centroY, raioCirculo, 'S');
                } else {
                    doc.setFillColor(...COLORS.DOURADO);
                    doc.circle(centroDireitoX, centroY, raioCirculo, 'F');
                }
            } catch (e) {
                console.warn("Falha ao processar foto circular:", e);
                doc.setFillColor(...COLORS.DOURADO);
                doc.circle(centroDireitoX, centroY, raioCirculo, 'F');
            }
        } else {
            doc.setFillColor(...COLORS.DOURADO);
            doc.circle(centroDireitoX, centroY, raioCirculo, 'F');
        }
        // FINALIZAÇÃO DO PDF
        doc.save(`PMI_ST_${item.dados_alvo?.cliente || 'Relatorio'}.pdf`);
        return true;

    } catch (err) {
        console.error("Erro fatal no PDF:", err);
        alert("Ocorreu um erro ao gerar o PDF. Verifique o console do navegador.");
        throw err;
    }

};