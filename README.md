# ST Imobiliária PMI

Aplicação React/Vite para criação de Pesquisas de Mercado Imobiliário (PMI), gestão de corretores autorizados e geração de relatórios PDF.

## Requisitos

- Node.js 22
- npm
- Projeto Firebase com Auth Google, Firestore e Storage habilitados

## Configuração local

Crie um arquivo `.env` com as variáveis públicas do app Firebase:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
```

Essas chaves identificam o app web Firebase. A segurança dos dados depende das regras em `firestore.rules` e `storage.rules`.

## Scripts

```bash
npm ci
npm run dev
npm run facebook:generate
npm run lint
npm run test:run
npm run build
npm audit --omit=dev
```

## Feed Facebook Real Estate Ads

O projeto gera um feed XML estático para Meta/Facebook em:

- `https://st.khaua.com.br/facebook`
- (alias) `https://st.khaua.com.br/facebook/catalogo.xml`

O arquivo é gerado no build em `public/facebook/index.xml` pelo script:

- `scripts/generate-facebook-feed.mjs`

### Variáveis esperadas (ambiente de build)

```env
FACEBOOK_SOURCE_XML_URL=https://www.stimobiliaria.com.br/integracao/facebook
FACEBOOK_BASE_PUBLIC_URL=https://st.khaua.com.br
FACEBOOK_FETCH_TIMEOUT_MS=12000
FACEBOOK_FETCH_RETRIES=2
FACEBOOK_GEOCODER_USER_AGENT=st-facebook-feed-bot/1.0 (+https://st.khaua.com.br/facebook)
```

Para customizar o botão de geração manual no painel admin, você pode definir:

```env
VITE_FACEBOOK_WORKFLOW_URL=https://github.com/<org>/<repo>/actions/workflows/facebook-feed.yml
```

### O que o gerador faz

- Busca XML de origem com timeout + retry
- Faz parse de `<listing>`
- Converte para o padrão Facebook Real Estate Ads
- Oculta endereço real (`addr1` recebe bairro)
- Resolve coordenadas por fallback (origem -> bairro/cidade/estado -> CEP -> centro da cidade)
- Aplica deslocamento pequeno e determinístico de privacidade
- Descarta imóveis sem campos obrigatórios
- Gera logs de descarte em `.cache/facebook-discarded.log`

### Geração automática e manual

- Workflow: `.github/workflows/facebook-feed.yml`
- Execução automática: diariamente à meia-noite de Brasília (03:00 UTC no cron do GitHub)
- Execução manual: aba Actions (workflow_dispatch) ou botão `GERAR FEED` no Painel (admin)

## Firebase

As regras versionadas ficam em:

- `firestore.rules`
- `storage.rules`
- `firebase.json`

Antes de publicar, confira se os documentos em `usuarios` usam o e-mail Gmail em minúsculas como ID, pois as regras usam esse ID para autorizar corretores, admins e masters.

## Deploy

O workflow `.github/workflows/deploy.yml` roda instalação limpa, lint, testes, auditoria de dependências de produção e build antes do envio por FTP.
