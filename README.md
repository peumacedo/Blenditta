# Blenditta - MVP de Fechamento Mensal (Prisma)

## Pré-requisitos
- Node.js 18+
- npm

## Como executar localmente
1. Instale dependências:
   ```bash
   npm install
   ```
2. Execute a migration inicial:
   ```bash
   npm run migrate
   ```
3. Popule o banco com dados mock:
   ```bash
   npm run seed
   ```
4. Valide schema (lint):
   ```bash
   npm run lint
   ```
5. Gere o Prisma Client (build):
   ```bash
   npm run build
   ```

## Competências mock carregadas
- 2026-01 (FECHADO)
- 2026-02 (EM_REVISAO)
- 2026-03 (PROCESSANDO)

Os dados incluem:
- arquivos de suporte
- extrato bancário com itens conciliados e pendentes
- contas a pagar e a receber
- inconsistências para fluxo de revisão/conciliação
