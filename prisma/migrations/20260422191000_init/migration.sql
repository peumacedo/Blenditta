-- CreateTable
CREATE TABLE "fechamentos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "competencia" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "observacoes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "arquivos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fechamento_id" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "caminho" TEXT NOT NULL,
    "criado_em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "arquivos_fechamento_id_fkey" FOREIGN KEY ("fechamento_id") REFERENCES "fechamentos" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "extrato_bancario" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fechamento_id" INTEGER NOT NULL,
    "data" DATETIME NOT NULL,
    "descricao" TEXT NOT NULL,
    "valor" DECIMAL NOT NULL,
    "saldo" DECIMAL NOT NULL,
    "categoria" TEXT NOT NULL,
    "conciliado" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "extrato_bancario_fechamento_id_fkey" FOREIGN KEY ("fechamento_id") REFERENCES "fechamentos" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "contas_pagar" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fechamento_id" INTEGER NOT NULL,
    "fornecedor" TEXT NOT NULL,
    "vencimento" DATETIME NOT NULL,
    "pagamento" DATETIME,
    "valor" DECIMAL NOT NULL,
    "categoria" TEXT NOT NULL,
    "situacao" TEXT NOT NULL,
    CONSTRAINT "contas_pagar_fechamento_id_fkey" FOREIGN KEY ("fechamento_id") REFERENCES "fechamentos" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "contas_receber" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fechamento_id" INTEGER NOT NULL,
    "cliente" TEXT NOT NULL,
    "vencimento" DATETIME NOT NULL,
    "recebimento" DATETIME,
    "valor" DECIMAL NOT NULL,
    "categoria" TEXT NOT NULL,
    "situacao" TEXT NOT NULL,
    CONSTRAINT "contas_receber_fechamento_id_fkey" FOREIGN KEY ("fechamento_id") REFERENCES "fechamentos" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "inconsistencias" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fechamento_id" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "data" DATETIME NOT NULL,
    "descricao" TEXT NOT NULL,
    "valor" DECIMAL NOT NULL,
    "status" TEXT NOT NULL,
    "observacao" TEXT,
    CONSTRAINT "inconsistencias_fechamento_id_fkey" FOREIGN KEY ("fechamento_id") REFERENCES "fechamentos" ("id") ON DELETE CASCADE ON UPDATE CASCADE
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
