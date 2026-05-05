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
npm run lint
npm run test:run
npm run build
npm audit --omit=dev
```

## Firebase

As regras versionadas ficam em:

- `firestore.rules`
- `storage.rules`
- `firebase.json`

Antes de publicar, confira se os documentos em `usuarios` usam o e-mail Gmail em minúsculas como ID, pois as regras usam esse ID para autorizar corretores, admins e masters.

## Deploy

O workflow `.github/workflows/deploy.yml` roda instalação limpa, lint, testes, auditoria de dependências de produção e build antes do envio por FTP.
