# Blenditta · Fechamento Financeiro Mensal (MVP)

Base inicial do MVP web para fechamento financeiro mensal com Next.js, TypeScript, Tailwind, shadcn/ui, Prisma e PostgreSQL.

## Requisitos

- Node.js 20+
- Docker + Docker Compose

## Primeiros passos

1. Copie as variáveis de ambiente:
   ```bash
   cp .env.example .env
   ```
2. Suba o PostgreSQL local:
   ```bash
   docker compose up -d
   ```
3. Instale dependências:
   ```bash
   npm install
   ```
4. Gere o cliente Prisma:
   ```bash
   npm run prisma:generate
   ```
5. Aplique as migrations:
   ```bash
   npm run prisma:migrate:deploy
   ```
6. Popule o banco com dados mock:
   ```bash
   npm run prisma:seed
   ```
7. Rode o projeto:
   ```bash
   npm run dev
   ```

## Scripts

- `npm run dev`: ambiente de desenvolvimento
- `npm run build`: build de produção
- `npm run start`: servir build
- `npm run lint`: lint com Next.js
- `npm run prisma:generate`: gerar Prisma Client
- `npm run prisma:migrate:dev`: criar/aplicar migrations em desenvolvimento
- `npm run prisma:migrate:deploy`: aplicar migrations existentes
- `npm run prisma:seed`: popular banco com dados mock
- `npm run prisma:studio`: abrir Prisma Studio

## Modelagem do MVP (Prisma)

- `fechamentos`
- `arquivos`
- `extrato_bancario`
- `contas_pagar`
- `contas_receber`
- `inconsistencias`

As relações são centralizadas em `fechamentos`, permitindo evolução futura do dashboard e da conciliação financeira.
