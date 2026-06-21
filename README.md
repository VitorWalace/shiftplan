# ShiftPlan

Micro-SaaS para donos de pequenos comércios (bares, salões, cafeterias, lojas) montarem a
escala semanal da equipe sem conflitos de horário e exportarem pronto pro WhatsApp.

Toda a validação de escala roda no cliente, em TypeScript puro e determinístico — sem IA,
sem chamadas pagas por ação do usuário. O Supabase só cuida de auth, CRUD e dados.

## Stack

- React 18 + TypeScript + Vite + Tailwind CSS
- @dnd-kit para o drag-and-drop da escala
- Supabase (Postgres + Auth + Row Level Security)
- TanStack Query para estado de servidor
- Asaas (Pix) para cobrança, via uma camada `PaymentProvider` abstrata
- Vitest para testar a engine de validação
- Vercel para hospedagem (frontend + funções serverless em `/api`)

## Setup local

```bash
npm install
cp .env.example .env   # preencha as variáveis (veja abaixo)
npm run dev
```

Rode o conteúdo de `supabase/schema.sql` no SQL Editor do seu projeto Supabase antes do
primeiro uso — ele cria as tabelas, as políticas de RLS e os triggers de limite de plano.

### Variáveis de ambiente

| Variável | Onde usar | Onde encontrar |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | Frontend | Supabase → Project Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | Frontend | Supabase → Project Settings → API → anon public |
| `SUPABASE_URL` | Funções serverless (`/api`) | Mesma URL acima, sem o prefixo `VITE_` |
| `SUPABASE_SERVICE_ROLE_KEY` | Funções serverless | Supabase → Project Settings → API → service_role (secreta) |
| `ASAAS_API_URL` | Funções serverless | `https://sandbox.asaas.com/api/v3` para testes |
| `ASAAS_API_KEY` | Funções serverless | Painel do Asaas (sandbox) → Integrações |
| `ASAAS_WEBHOOK_TOKEN` | Funções serverless | Você escolhe um token e cola também no Asaas |

As rotas `/api/*` só funcionam implantadas na Vercel (ou com `vercel dev`); `npm run dev`
sozinho não executa funções serverless.

## Scripts

- `npm run dev` — servidor de desenvolvimento
- `npm run build` — typecheck + build de produção
- `npm run test` — suíte de testes (Vitest), principalmente a engine de validação
- `npm run lint` — ESLint
- `npm run typecheck:api` — typecheck isolado das funções serverless em `api/`

## Estrutura

Organizado por feature em `src/features/` (`schedule`, `employees`, `settings`,
`billing`, `auth`, `landing`, `onboarding`), não por tipo de arquivo. A lógica de negócio
fica em `engine.ts`/hooks, não nos componentes.
