# Blenditta · Fechamento Financeiro Mensal (MVP)

Aplicação web do MVP de fechamento financeiro mensal da Blenditta, construída com Next.js (App Router), TypeScript, Tailwind, shadcn/ui, Prisma e PostgreSQL.

## Modos de execução

A aplicação agora suporta dois modos:

- **Modo demonstração (sem banco):** usa dados simulados em memória para navegação completa.
- **Modo real (com banco):** usa Prisma + PostgreSQL para persistência real.

---

## Modo demonstração (sem banco)

Fluxo recomendado para validar visual, navegação e experiência sem infraestrutura:

1. Instale dependências:

   ```bash
   npm install
   ```

2. Crie o `.env` com a flag demo:

   ```bash
   cp .env.example .env
   ```

   E configure:

   ```bash
   DEMO_MODE=true
   ```

3. Rode a aplicação:

   ```bash
   npm run dev
   ```

> Neste modo, uploads/processamentos e criação de fechamento ficam sinalizados como demonstração e não persistem dados reais.

---

## Modo real (com banco)

### Requisitos

- Node.js 20+
- Docker + Docker Compose
- npm

### Setup local

1. Copie as variáveis de ambiente:

   ```bash
   cp .env.example .env
   ```

2. Ajuste no `.env`:

   ```bash
   DEMO_MODE=false
   ```

3. Suba o banco PostgreSQL:

   ```bash
   docker compose up -d
   ```

4. Instale as dependências:

   ```bash
   npm install
   ```

### Prisma e banco de dados

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

### Executar aplicação

Desenvolvimento:

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

## Premissa funcional do MVP

- O sistema **não substitui** a conciliação bancária do ERP do cliente.
- O sistema consome bases já exportadas/tratadas do ERP (extrato, contas a pagar e contas a receber).
- O foco do MVP é análise gerencial mensal, dashboard executivo e relatório gerencial estruturado.
