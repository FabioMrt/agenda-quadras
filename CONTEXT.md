# Contexto Completo da Aplicacao — Agenda Quadras

> Documento para onboarding de agentes AI. Contem toda a informacao necessaria para entender e trabalhar no projeto.

---

## 1. Visao Geral

**O que e**: SaaS multi-tenant de agendamento de quadras esportivas (society, beach tennis, futsal, etc).
**Nome**: Temporario ("agenda-quadras"). Nome final ainda nao foi decidido.
**Repo**: https://github.com/FabioMrt/agenda-quadras
**Deploy**: https://agenda-quadras.vercel.app
**Stack**: Next.js 16 (App Router) + Tailwind CSS 4 + shadcn/ui + Prisma 6 + Supabase (PostgreSQL + Storage) + Auth.js v5 + Vercel

## 2. Tres Niveis de Usuario

| Role | Quem | Acesso | Login |
|---|---|---|---|
| **SUPER_ADMIN** | Dono da plataforma (Fabio) | `/super-admin/*` — gerencia empresas, cadastra quadras | Email + senha (Credentials) |
| **COMPANY_ADMIN** | Dono da quadra (cliente do SaaS) | `/admin/*` — dashboard, agenda, relatorios, horarios fixos | Email + senha (Credentials) |
| **END_USER** | Jogador que reserva | `/:slug/*` — ve quadras, reserva horarios | Sem auth — usa nome + telefone |

**Decisao importante**: O SUPER_ADMIN controla as quadras das empresas (CRUD de courts), NAO o COMPANY_ADMIN. Isso e intencional para criar dependencia.

## 3. Rotas

### Publicas (usuario final)
```
/                                    → redirect para /arena-elite
/:slug                               → pagina da empresa (lista quadras)
/:slug/quadra/:courtId               → agenda da quadra (data + horarios)
/:slug/quadra/:courtId/confirmar     → confirmacao (nome + WhatsApp + resumo)
/meus-agendamentos                   → busca reservas por telefone
```

### Admin (dono da quadra)
```
/admin/login                         → login Credentials
/admin                               → dashboard (stats, pendentes, reservas do dia)
/admin/agenda                        → 3 views: dia, semana, lista
/admin/recorrentes                   → horarios fixos (reservas recorrentes)
/admin/relatorios                    → receita, ocupacao, pico
```

### Super-admin
```
/super-admin/login                   → login Credentials
/super-admin                         → dashboard global
/super-admin/empresas                → lista + criar empresas
/super-admin/empresas/:id            → detalhe + editar + quadras da empresa
```

### API Routes
```
/api/auth/[...nextauth]              → Auth.js handler
/api/availability                    → POST: slots disponiveis para court+date
/api/bookings                        → GET: por telefone | POST: criar reserva
/api/bookings/:id                    → PATCH: confirmar/cancelar (admin)
/api/bookings/manual                 → POST: reserva manual (admin)
/api/bookings/recurring              → POST: horarios fixos (admin)
/api/admin/agenda                    → GET: week bookings por offset
/api/admin/bookings                  → GET: bookings por data (admin dashboard)
/api/admin/pending-count             → GET: count + lista de pendentes
/api/admin/companies                 → POST: criar empresa (super-admin)
/api/admin/companies/:id             → PATCH/DELETE: editar/excluir empresa
/api/upload                          → POST: upload imagem para Supabase Storage
/api/webhooks/payment                → POST: webhook pagamento (placeholder)
```

## 4. Database (Prisma Schema)

**12 modelos**: User, Company, CourtType, Court, AvailabilityRule, BlockedSlot, Booking, Payment, Account, Session, VerificationToken

Pontos chave:
- `Booking.userId` e **opcional** — reservas de guests (nome + telefone) nao tem user
- `Booking.isRecurring` — flag para horarios fixos
- `Booking.guestName` / `guestPhone` — dados do guest sem auth
- `AvailabilityRule` — regras de disponibilidade por dia da semana
- `BlockedSlot` — bloqueios manuais de horarios
- `Company.logoUrl` — URL da logo no Supabase Storage
- Campo `date` usa `@db.Date` — armazena so a data, sem hora

**Seed** (prisma/seed.ts):
- Super admin: admin@agendaquadras.com / super-admin-123
- Company admin: ricardo@arenaelite.com / admin-123
- Empresa: Arena Elite Sports (/arena-elite) com 2 quadras

## 5. Autenticacao

- **Auth.js v5** (next-auth beta) com PrismaAdapter
- **3 providers**: Google OAuth (nao configurado), Resend Magic Link (nao configurado), Credentials (funcional)
- **Middleware** (`middleware.ts`): usa `getToken()` do next-auth/jwt (leve, sem Prisma) para proteger /admin/* e /super-admin/*
- **JWT callbacks**: injetam `role` e `companyId` no token
- **SessionProvider**: apenas nos layouts admin/super-admin (nao no root)
- **Usuario final NAO precisa de auth** — reserva com nome + telefone direto

## 6. Design System — "Midnight Arena"

### Fonts
- **Headings**: Sora (geometric, futuristic) via next/font/google
- **Body**: Plus Jakarta Sans (warm, rounded)

### Cores (CSS variables que alternam light/dark)
```
arena-bg:               dark #060B18 / light #F5F7FA
arena-surface:          dark #0C1424 / light #FFFFFF
arena-surface-elevated: dark #111D32 / light #F0F2F5
arena-accent:           dark #00E87B / light #00C968
arena-text:             dark #F1F5F9 / light #0F172A
arena-text-secondary:   dark #8B9DC3 / light #475569
arena-text-muted:       dark #4A5E80 / light #94A3B8
arena-gold:             dark #FFD036 / light #D97706
```

### Efeitos
- `.noise` — textura de ruido sutil (dark only)
- `.glow-accent` / `.glow-accent-strong` — neon glow verde
- `.glass` / `.glass-strong` — backdrop-blur frosted
- `.hero-overlay` — classe para conteudo sobre imagens (mantem texto branco em light mode)

### Tema claro/escuro
- `next-themes` com `ThemeProvider` no root layout
- Toggle de tema na sidebar admin e no hero da pagina publica
- Gradients sobre imagens usam `from-black/80` (sempre escuro, independente do tema)
- Botoes sobre hero usam `bg-black/40 backdrop-blur-sm` (sempre escuros)

### Tailwind v4
- Classes canonicas: `bg-linear-to-t` (nao `bg-gradient-to-t`), `bg-white/4` (nao `bg-white/[0.04]`)
- Temas definidos via `@theme inline` + CSS variables no `globals.css`

## 7. Estrutura de Arquivos

```
app/
  (public)/[slug]/                    — paginas publicas
  (admin)/admin/                      — painel admin com layout + sidebar
  (super-admin)/super-admin/          — painel super-admin com layout + sidebar
  api/                                — API routes
  layout.tsx                          — root layout (fonts, ThemeProvider)
  globals.css                         — design system completo

components/
  public/                             — company-page, court-schedule, confirm-booking, my-bookings
  admin/                              — dashboard, agenda (3 views), recorrentes, relatorios, whatsapp-confirm
  super-admin/                        — dashboard, empresas-list, empresa-detail
  auth/                               — credentials-login-form
  booking/                            — booking-summary
  ui/                                 — shadcn components
  theme-provider.tsx, theme-toggle.tsx

lib/
  auth.ts                             — Auth.js config
  auth-types.ts                       — type augmentation para session
  prisma.ts                           — PrismaClient singleton
  supabase.ts                         — Supabase client (lazy init para Storage)
  availability.ts                     — logica de slots (Prisma based)
  dates.ts                            — helpers de data (toLocalDateString, toUTCDateString, todayString, etc)
  types.ts                            — interfaces compartilhadas (Company, Court, TimeSlot, Booking)
  utils.ts                            — cn() utility
  queries/
    admin.ts                          — queries admin (stats, bookings, agenda, relatorios)
    company.ts                        — queries publicas (company, court por slug)
    availability.ts                   — slots disponiveis
    super-admin.ts                    — queries super-admin (stats, companies, detail)

middleware.ts                         — protecao de rotas via getToken() (Edge compatible)
prisma/schema.prisma                  — schema completo
prisma/seed.ts                        — dados iniciais
```

## 8. Fluxos Principais

### Reserva pelo usuario final
1. Acessa `/:slug` → ve empresa e quadras (dados do Prisma)
2. Clica numa quadra → `/:slug/quadra/:courtId` → seleciona data e horario
3. Horarios buscados via `POST /api/availability` (AvailabilityRule - Bookings - BlockedSlots)
4. Clica "Reservar Agora" → navega para `/confirmar?date=...&time=...&price=...`
5. Digita nome + WhatsApp → `POST /api/bookings` → salva como PENDING
6. Tela de sucesso com codigo da reserva

### Admin confirma reserva
1. Admin ve notificacao (badge no sino) → abre popover com pendentes
2. Vai pro dashboard → secao "Aguardando Confirmacao" (gold)
3. Clica "Confirmar" → PATCH /api/bookings/:id → toast verde
4. Dialog de confirmacao WhatsApp → preview da mensagem → abre em nova aba
5. Ou clica "Cancelar" → pede motivo → PATCH → WhatsApp com motivo

### Reserva manual (admin)
1. Admin vai em Agenda (view dia ou semana)
2. Clica num slot livre → form aparece (quadra, nome, whatsapp, obs)
3. POST /api/bookings/manual → salva como CONFIRMED

### Horarios fixos (recorrentes)
1. Admin vai em "Horarios Fixos"
2. Seleciona: quadra, dia da semana, horario, N semanas
3. POST /api/bookings/recurring → cria N bookings CONFIRMED com isRecurring=true
4. Na agenda, aparece com borda tracejada + icone de repeat

## 9. Pontos Criticos / Bugs Conhecidos

### Timezone
- Prisma `@db.Date` retorna `2026-04-07T00:00:00.000Z` (UTC midnight)
- **Server-side**: SEMPRE usar `getUTC*()` para datas do Prisma
- **Client-side**: usar `getDate()` etc (timezone local do usuario e correto)
- **Armazenamento**: criar datas com `T12:00:00Z` (noon UTC) para evitar shift
- Helpers em `lib/dates.ts`: `toLocalDateString()` (client), `toUTCDateString()` (server)

### Vercel
- Middleware usa `getToken()` (leve) em vez de `auth()` (pesado) — limite Edge 1MB
- `prisma generate` no build script (`package.json`)
- `DATABASE_URL` precisa de `?pgbouncer=true` para Supabase pooler

### Supabase Storage
- Bucket `logos` (publico) para imagens de empresas
- Upload via `/api/upload` com `getSupabaseAdmin()` (lazy init)
- Service role key necessaria

## 10. Env Variables

```
DATABASE_URL          — Supabase pooler connection (porta 6543, com ?pgbouncer=true)
DIRECT_URL            — Supabase direct connection (porta 5432, para migrations)
NEXT_PUBLIC_SUPABASE_URL — URL do projeto Supabase
SUPABASE_SERVICE_ROLE_KEY — chave service_role para Storage
NEXTAUTH_SECRET       — secret para JWT
NEXTAUTH_URL          — URL da app (http://localhost:3000 ou https://...)
GOOGLE_CLIENT_ID      — (nao configurado)
GOOGLE_CLIENT_SECRET  — (nao configurado)
RESEND_API_KEY        — (nao configurado)
```

## 11. O Que Falta Implementar

| Feature | Status |
|---|---|
| CRUD de quadras pelo super-admin | Botao existe, form nao implementado |
| Google OAuth (usuario final) | Auth.js configurado, credenciais faltam |
| Magic Link / Resend | Auth.js configurado, credenciais faltam |
| Pagamento online (Mercado Pago) | Schema tem Payment model, webhook placeholder |
| Emails transacionais | Nao implementado |
| PWA / Notificacoes push | Nao implementado |
| Edicao de perfil do admin | Nao implementado |

## 12. Convencoes de Codigo

- **Server components** buscam dados via Prisma e passam para client components via props
- **Client components** usam `"use client"` e fazem fetch para APIs quando precisam de dados dinamicos
- **shadcn/ui** para componentes base (Button, Badge, Sheet, Dialog, etc)
- **Tailwind v4** com classes canonicas
- **Font classes**: `font-heading` (Sora), `font-body` (Jakarta Sans)
- **Color classes**: `text-arena-text`, `bg-arena-surface`, `text-arena-accent`, etc
- **Toast**: sonner via `toast.success()` / `toast.error()`
- **Nao usar** `toISOString().split("T")[0]` no client — usar `toLocalDateString()` de `lib/dates.ts`
- **Nao usar** `getDate()` no server com datas Prisma — usar `getUTCDate()`
