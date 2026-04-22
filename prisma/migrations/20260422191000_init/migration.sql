-- CreateEnum
CREATE TYPE "FechamentoStatus" AS ENUM ('EM_PREPARACAO', 'PROCESSANDO', 'EM_REVISAO', 'FECHADO');

-- CreateEnum
CREATE TYPE "SituacaoConta" AS ENUM ('PENDENTE', 'PAGO', 'RECEBIDO', 'VENCIDO');

-- CreateEnum
CREATE TYPE "InconsistenciaStatus" AS ENUM ('ABERTA', 'EM_ANALISE', 'RESOLVIDA');

-- CreateTable
CREATE TABLE "fechamentos" (
    "id" TEXT NOT NULL,
    "competencia" TIMESTAMP(3) NOT NULL,
    "status" "FechamentoStatus" NOT NULL DEFAULT 'EM_PREPARACAO',
    "observacoes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fechamentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "arquivos" (
    "id" TEXT NOT NULL,
    "fechamento_id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "caminho" TEXT NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "arquivos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "extrato_bancario" (
    "id" TEXT NOT NULL,
    "fechamento_id" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "descricao" TEXT NOT NULL,
    "valor" DECIMAL(14,2) NOT NULL,
    "saldo" DECIMAL(14,2) NOT NULL,
    "categoria" TEXT NOT NULL,
    "conciliado" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "extrato_bancario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contas_pagar" (
    "id" TEXT NOT NULL,
    "fechamento_id" TEXT NOT NULL,
    "fornecedor" TEXT NOT NULL,
    "vencimento" TIMESTAMP(3) NOT NULL,
    "pagamento" TIMESTAMP(3),
    "valor" DECIMAL(14,2) NOT NULL,
    "categoria" TEXT NOT NULL,
    "situacao" "SituacaoConta" NOT NULL DEFAULT 'PENDENTE',

    CONSTRAINT "contas_pagar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contas_receber" (
    "id" TEXT NOT NULL,
    "fechamento_id" TEXT NOT NULL,
    "cliente" TEXT NOT NULL,
    "vencimento" TIMESTAMP(3) NOT NULL,
    "recebimento" TIMESTAMP(3),
    "valor" DECIMAL(14,2) NOT NULL,
    "categoria" TEXT NOT NULL,
    "situacao" "SituacaoConta" NOT NULL DEFAULT 'PENDENTE',

    CONSTRAINT "contas_receber_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inconsistencias" (
    "id" TEXT NOT NULL,
    "fechamento_id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "descricao" TEXT NOT NULL,
    "valor" DECIMAL(14,2) NOT NULL,
    "status" "InconsistenciaStatus" NOT NULL DEFAULT 'ABERTA',
    "observacao" TEXT,

    CONSTRAINT "inconsistencias_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "arquivos_fechamento_id_idx" ON "arquivos"("fechamento_id");

-- CreateIndex
CREATE INDEX "extrato_bancario_fechamento_id_data_idx" ON "extrato_bancario"("fechamento_id", "data");

-- CreateIndex
CREATE INDEX "contas_pagar_fechamento_id_vencimento_idx" ON "contas_pagar"("fechamento_id", "vencimento");

-- CreateIndex
CREATE INDEX "contas_receber_fechamento_id_vencimento_idx" ON "contas_receber"("fechamento_id", "vencimento");

-- CreateIndex
CREATE INDEX "inconsistencias_fechamento_id_status_idx" ON "inconsistencias"("fechamento_id", "status");

-- AddForeignKey
ALTER TABLE "arquivos" ADD CONSTRAINT "arquivos_fechamento_id_fkey" FOREIGN KEY ("fechamento_id") REFERENCES "fechamentos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "extrato_bancario" ADD CONSTRAINT "extrato_bancario_fechamento_id_fkey" FOREIGN KEY ("fechamento_id") REFERENCES "fechamentos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contas_pagar" ADD CONSTRAINT "contas_pagar_fechamento_id_fkey" FOREIGN KEY ("fechamento_id") REFERENCES "fechamentos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contas_receber" ADD CONSTRAINT "contas_receber_fechamento_id_fkey" FOREIGN KEY ("fechamento_id") REFERENCES "fechamentos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inconsistencias" ADD CONSTRAINT "inconsistencias_fechamento_id_fkey" FOREIGN KEY ("fechamento_id") REFERENCES "fechamentos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
