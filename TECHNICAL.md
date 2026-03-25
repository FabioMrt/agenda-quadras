# [Nome a Definir] — Technical Reference

> SaaS multi-tenant de agendamento de quadras esportivas  
> Stack: Next.js 14 · Supabase · Auth.js v5 · Prisma · Tailwind · Vercel  
> PRD v1.1 — atualizado após definições de produto

---

## Índice

1. [Estrutura do Projeto](#1-estrutura-do-projeto)
2. [Banco de Dados (Schema Prisma)](#2-banco-de-dados)
3. [Autenticação (Auth.js v5)](#3-autenticação)
4. [Rotas e Middleware](#4-rotas-e-middleware)
5. [Variáveis de Ambiente](#5-variáveis-de-ambiente)
6. [Setup Inicial](#6-setup-inicial)
7. [Decisões de Arquitetura](#7-decisões-de-arquitetura)
8. [Roadmap de Fases](#8-roadmap)

---

## 1. Estrutura do Projeto

```
.
├── app/
│   ├── (public)/
│   │   ├── [slug]/                  # Pagina da empresa — lista quadras
│   │   │   ├── page.tsx
│   │   │   ├── not-found.tsx
│   │   │   └── quadra/
│   │   │       └── [courtId]/
│   │   │           ├── page.tsx     # Agenda da quadra (data + horarios)
│   │   │           └── confirmar/
│   │   │               └── page.tsx # Auth lazy + resumo + confirmacao
│   │   └── meus-agendamentos/
│   │       └── page.tsx
│   ├── (admin)/
│   │   └── admin/
│   │       ├── layout.tsx           # Guard: COMPANY_ADMIN only
│   │       ├── login/page.tsx
│   │       ├── page.tsx             # Dashboard
│   │       ├── agenda/page.tsx
│   │       ├── quadras/page.tsx
│   │       └── relatorios/page.tsx
│   ├── (super-admin)/
│   │   └── super-admin/
│   │       ├── layout.tsx           # Guard: SUPER_ADMIN only
│   │       ├── login/page.tsx
│   │       ├── page.tsx
│   │       └── empresas/
│   │           ├── page.tsx
│   │           └── [id]/page.tsx
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── bookings/route.ts
│   │   ├── availability/route.ts
│   │   └── webhooks/payment/route.ts
│   └── layout.tsx
├── components/
│   ├── public/
│   │   ├── company-page.tsx         # Pagina da empresa (client component)
│   │   ├── court-schedule.tsx       # Agenda da quadra (client component)
│   │   ├── confirm-booking.tsx      # Fluxo de confirmacao (auth + resumo + sucesso)
│   │   └── my-bookings.tsx          # Lista de agendamentos do usuario
│   ├── booking/
│   │   └── booking-summary.tsx      # Card de resumo da reserva
│   ├── auth/
│   │   └── auth-modal.tsx           # Google + Magic Link — aparece na confirmacao
│   └── ui/                          # shadcn/ui components
├── lib/
│   ├── data/
│   │   └── mock-data.ts             # Dados mock (sera substituido por Prisma)
│   ├── utils.ts                     # cn() utility
│   ├── auth.ts                      # Auth.js config (futuro)
│   ├── prisma.ts                    # Prisma client singleton (futuro)
│   ├── availability.ts              # Logica de slots disponiveis (futuro)
│   └── emails/                      # React Email templates (futuro)
├── middleware.ts                    # Protecao de rotas por role (futuro)
├── prisma/
│   └── schema.prisma               # (futuro)
└── .env.local                       # (futuro)
```

---

## 2. Banco de Dados

### Schema Prisma completo

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")   // Supabase: necessário para migrations
}

// ─── Auth.js tables (obrigatórias) ──────────────────────────────────────────

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

// ─── Core ────────────────────────────────────────────────────────────────────

enum Role {
  SUPER_ADMIN
  COMPANY_ADMIN
  END_USER
}

enum BookingStatus {
  PENDING
  CONFIRMED
  CANCELLED
}

enum PaymentStatus {
  PENDING
  PAID
  REFUNDED
  FAILED
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  role          Role      @default(END_USER)
  companyId     String?   // null para SUPER_ADMIN e END_USER sem empresa
  createdAt     DateTime  @default(now())

  company  Company?  @relation(fields: [companyId], references: [id])
  accounts Account[]
  sessions Session[]
  bookings Booking[]
}

model Company {
  id        String   @id @default(cuid())
  name      String
  slug      String   @unique  // usado na URL: /:slug
  logoUrl   String?
  active    Boolean  @default(true)
  createdAt DateTime @default(now())

  users        User[]
  courtTypes   CourtType[]
  courts       Court[]
}

model CourtType {
  id          String  @id @default(cuid())
  companyId   String
  name        String  // Ex: "Society", "Beach Soccer", "Areia"
  description String?
  icon        String? // nome de ícone ou emoji

  company Company @relation(fields: [companyId], references: [id])
  courts  Court[]
}

model Court {
  id          String   @id @default(cuid())
  companyId   String
  courtTypeId String
  name        String
  description String?
  photos      String[] // array de URLs
  active      Boolean  @default(true)
  createdAt   DateTime @default(now())

  company           Company            @relation(fields: [companyId], references: [id])
  courtType         CourtType          @relation(fields: [courtTypeId], references: [id])
  availabilityRules AvailabilityRule[]
  blockedSlots      BlockedSlot[]
  bookings          Booking[]
}

model AvailabilityRule {
  id          String @id @default(cuid())
  courtId     String
  dayOfWeek   Int    // 0=Dom, 1=Seg, ..., 6=Sáb
  startTime   String // "08:00"
  endTime     String // "22:00"
  slotMinutes Int    @default(60)
  price       Float

  court Court @relation(fields: [courtId], references: [id])
}

model BlockedSlot {
  id        String   @id @default(cuid())
  courtId   String
  date      DateTime @db.Date
  startTime String   // "14:00"
  endTime   String   // "16:00"
  reason    String?

  court Court @relation(fields: [courtId], references: [id])
}

model Booking {
  id         String        @id @default(cuid())
  courtId    String
  userId     String
  date       DateTime      @db.Date
  startTime  String        // "14:00"
  endTime    String        // "15:00"
  status     BookingStatus @default(PENDING)
  totalPrice Float
  createdAt  DateTime      @default(now())

  court   Court   @relation(fields: [courtId], references: [id])
  user    User    @relation(fields: [userId], references: [id])
  payment Payment?
}

model Payment {
  id          String        @id @default(cuid())
  bookingId   String        @unique
  method      String        // "pix" | "credit_card"
  status      PaymentStatus @default(PENDING)
  gatewayId   String?       // ID retornado pelo gateway
  amount      Float
  paidAt      DateTime?
  createdAt   DateTime      @default(now())

  booking Booking @relation(fields: [bookingId], references: [id])
}
```

### RLS Policies (Supabase)

Após rodar as migrations, aplicar no Supabase SQL Editor:

```sql
-- Habilitar RLS em todas as tabelas sensíveis
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Company" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Court" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Booking" ENABLE ROW LEVEL SECURITY;

-- SUPER_ADMIN: acesso irrestrito (usar service_role key no servidor)
-- As policies abaixo valem para o anon/authenticated role

-- Company Admin: vê apenas sua empresa
CREATE POLICY "company_admin_own" ON "Court"
  FOR ALL USING (
    "companyId" = (
      SELECT "companyId" FROM "User" WHERE id = auth.uid()
    )
  );

-- End User: vê apenas seus próprios bookings
CREATE POLICY "end_user_own_bookings" ON "Booking"
  FOR ALL USING (
    "userId" = auth.uid()
  );
```

> **Nota:** Todas as chamadas server-side de admin usam a `SERVICE_ROLE_KEY` do Supabase (bypassa RLS). Chamadas client-side usam a `ANON_KEY` com RLS ativo.

---

## 3. Autenticação

### Estratégia por perfil

| Perfil | Método | Rota de login |
|---|---|---|
| Super Admin | Email + senha | `/super-admin/login` |
| Admin Empresa | Email + senha | `/admin/login` |
| Usuário Final | Google OAuth + Magic Link | Modal em `/[slug]/agendar/confirmar` |

### Configuração Auth.js v5

```ts
// lib/auth.ts
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Resend from "next-auth/providers/resend"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    // Usuário final — Google OAuth
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // Usuário final — Magic Link (Resend)
    Resend({
      apiKey: process.env.RESEND_API_KEY!,
      from: "noreply@seudominio.com",
    }),

    // Admins — email + senha
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user || !user.passwordHash) return null
        if (user.role === "END_USER") return null // Bloqueia admins de usar o login de admin

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        )
        return valid ? user : null
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.companyId = user.companyId
      }
      return token
    },
    async session({ session, token }) {
      session.user.role = token.role as string
      session.user.companyId = token.companyId as string | null
      return session
    },
  },
  pages: {
    signIn: "/auth/signin",  // página customizada para Magic Link
    error: "/auth/error",
  },
})
```

> **Importante:** adicionar `passwordHash String?` no model `User` do schema Prisma para os admins.

### Fluxo lazy auth (usuário final)

```tsx
// app/(public)/[slug]/agendar/confirmar/page.tsx
import { auth } from "@/lib/auth"
import { AuthModal } from "@/components/auth/AuthModal"

export default async function ConfirmarPage() {
  const session = await auth()

  // Se não autenticado, renderiza o modal de login
  // O modal não bloqueia a página — aparece sobre o resumo da reserva
  return (
    <>
      <BookingSummary />
      {!session && <AuthModal />}
      {session && <PaymentSection />}
    </>
  )
}
```

---

## 4. Rotas e Middleware

```ts
// middleware.ts
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth

  // Rotas de admin — exige COMPANY_ADMIN
  if (pathname.startsWith("/admin")) {
    if (!session) return NextResponse.redirect(new URL("/admin/login", req.url))
    if (session.user.role !== "COMPANY_ADMIN") return NextResponse.redirect(new URL("/", req.url))
  }

  // Rotas de super admin — exige SUPER_ADMIN
  if (pathname.startsWith("/super-admin")) {
    if (!session) return NextResponse.redirect(new URL("/super-admin/login", req.url))
    if (session.user.role !== "SUPER_ADMIN") return NextResponse.redirect(new URL("/", req.url))
  }

  // Agendamentos do usuário — exige qualquer login
  if (pathname.startsWith("/meus-agendamentos")) {
    if (!session) return NextResponse.redirect(new URL("/", req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/admin/:path*", "/super-admin/:path*", "/meus-agendamentos/:path*"],
}
```

---

## 5. Variáveis de Ambiente

```bash
# .env.local

# Banco de dados (Supabase)
DATABASE_URL="postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres"

# Auth.js
NEXTAUTH_SECRET="gere com: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth
# Criar em: console.cloud.google.com → APIs → Credentials
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Resend (Magic Link)
# Criar em: resend.com → API Keys
RESEND_API_KEY=""

# Pagamento (preencher na fase 3)
# MERCADOPAGO_ACCESS_TOKEN=""
# STRIPE_SECRET_KEY=""
# STRIPE_WEBHOOK_SECRET=""
```

---

## 6. Setup Inicial

### 1. Criar o projeto

```bash
npx create-next-app@latest nome-do-projeto \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir=false \
  --import-alias="@/*"

cd nome-do-projeto
```

### 2. Instalar dependências

```bash
# UI
npx shadcn@latest init
npx shadcn@latest add button card input label dialog calendar

# Auth
npm install next-auth@beta @auth/prisma-adapter

# ORM
npm install prisma @prisma/client
npx prisma init

# Email
npm install resend react-email

# Utils
npm install bcryptjs
npm install -D @types/bcryptjs
```

### 3. Configurar Supabase

```bash
# Instalar Supabase CLI
npm install -D supabase

# Login e link com projeto
npx supabase login
npx supabase link --project-ref SEU_PROJECT_REF
```

### 4. Rodar migrations

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 5. Seed inicial (Super Admin)

```ts
// prisma/seed.ts
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const hash = await bcrypt.hash("senha-super-segura", 12)

  await prisma.user.upsert({
    where: { email: "voce@email.com" },
    update: {},
    create: {
      name: "Super Admin",
      email: "voce@email.com",
      passwordHash: hash,
      role: "SUPER_ADMIN",
    },
  })

  console.log("Seed concluído")
}

main().finally(() => prisma.$disconnect())
```

```bash
npx prisma db seed
```

### 6. Criar primeira empresa (via script ou UI)

```ts
await prisma.company.create({
  data: {
    name: "Toque de Bola",
    slug: "toque-de-bola",  // → acessível em /toque-de-bola
    active: true,
  },
})
```

---

## 7. Decisões de Arquitetura

### Multi-tenancy
- Isolamento por `companyId` em todas as tabelas
- RLS no Supabase como segunda camada de segurança
- Server Actions e API Routes sempre validam `session.user.companyId`

### Autenticação (usuário final)
- **Sem senha** — Google OAuth ou Magic Link
- Auth é solicitada **apenas** na confirmação da reserva (lazy auth)
- `passwordHash` existe no model `User` mas só é populado para admins
- Magic Link via Resend — gratuito até 3.000 emails/mês

### Disponibilidade de horários
- `AvailabilityRule` define regras recorrentes por dia da semana
- `BlockedSlot` sobrescreve regras para datas específicas
- Lógica de slots: gerar array de horários a partir das regras, subtrair bookings confirmados e bloqueios

```ts
// lib/availability.ts — lógica central
export async function getAvailableSlots(courtId: string, date: Date) {
  const dayOfWeek = date.getDay()

  const rule = await prisma.availabilityRule.findFirst({
    where: { courtId, dayOfWeek },
  })
  if (!rule) return []  // Quadra fechada neste dia

  const slots = generateSlots(rule.startTime, rule.endTime, rule.slotMinutes)

  const [bookings, blocks] = await Promise.all([
    prisma.booking.findMany({
      where: { courtId, date, status: { not: "CANCELLED" } },
    }),
    prisma.blockedSlot.findMany({
      where: { courtId, date },
    }),
  ])

  return slots.filter(slot =>
    !bookings.some(b => overlaps(slot, b)) &&
    !blocks.some(b => overlaps(slot, b))
  )
}
```

### Pagamento (fase 3)
- Gateway definido por variável de ambiente — trocar sem alterar a lógica de booking
- Webhook `/api/webhooks/payment` confirma booking após pagamento aprovado
- Recomendação: começar com **Mercado Pago** (Pix nativo, zero configuração extra para BR)

---

## 8. Roadmap

| Fase | Entrega | Critério de conclusão |
|---|---|---|
| **1 — Base** | Setup + /[slug] + agendamento sem pagamento | Usuário consegue reservar; admin vê no painel |
| **2 — Auth UX** | Google OAuth + Magic Link no fluxo de confirmação | Zero campos de senha para o usuário final |
| **3 — Pagamento** | Gateway + Pix + cartão + webhook | Reserva só confirmada após pagamento |
| **4 — Admin** | Dashboard, calendário, relatórios, bloqueios | Admin consegue operar sem suporte |
| **5 — Escala** | PWA, notificações, planos, onboarding auto | Onboarding de novo cliente sem intervenção manual |

---

*[Nome a Definir] — Technical Reference v1.1*
