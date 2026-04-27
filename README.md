# Blenditta · Fechamento Financeiro Mensal (MVP)

Aplicação web do MVP de fechamento financeiro mensal da Blenditta, construída com Next.js (App Router), TypeScript, Tailwind, shadcn/ui, Prisma e PostgreSQL.

## Requisitos

- Node.js 20+
- Docker + Docker Compose
- npm

## Setup local

1. Copie as variáveis de ambiente:

   ```bash
   cp .env.example .env
   ```

2. Suba o banco PostgreSQL:

   ```bash
   docker compose up -d
   ```

3. Instale as dependências:

   ```bash
   npm install
   ```

## Prisma e banco de dados

1. Gere o Prisma Client:

   ```bash
   npm run prisma:generate
   ```

2. Aplique as migrations existentes:

   ```bash
   npm run prisma:migrate:deploy
   ```

3. Popule o banco com seed:

   ```bash
   npm run prisma:seed
   ```

4. (Opcional) Abra o Prisma Studio:

   ```bash
   npm run prisma:studio
   ```

## Executar aplicação

Ambiente de desenvolvimento:

```bash
npm run dev
```

Build de produção:

```bash
npm run build
npm run start
```

## Scripts disponíveis

- `npm run dev`: inicia o servidor de desenvolvimento
- `npm run build`: gera o build de produção
- `npm run start`: inicia a aplicação em modo produção
- `npm run lint`: executa o lint do projeto
- `npm run prisma:generate`: gera Prisma Client
- `npm run prisma:migrate:dev`: cria/aplica migration em desenvolvimento
- `npm run prisma:migrate:deploy`: aplica migrations existentes
- `npm run prisma:seed`: executa seed do banco
- `npm run prisma:studio`: abre Prisma Studio

## Escopo entregue no MVP atual

- Fundação do projeto
- Prisma + seed
- Navegação principal
- Listagem de fechamentos
- Detalhe do fechamento
- Criação de novo fechamento
- Rotas placeholder das etapas:
  - `/fechamentos/[id]/upload`
  - `/fechamentos/[id]/dados`
  - `/fechamentos/[id]/conciliacao`
  - `/fechamentos/[id]/dashboard`
  - `/fechamentos/[id]/auditoria`
  - `/fechamentos/[id]/relatorio`
