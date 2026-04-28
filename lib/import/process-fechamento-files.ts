import { type Arquivo, FechamentoStatus } from "@prisma/client";

import { mapContasPagarRows, mapContasReceberRows, mapExtratoRows } from "@/lib/import/mappers";
import { parseFileToRows } from "@/lib/import/parsers";
import { prisma } from "@/lib/prisma";
import { type ImportSummary, type ImportableFileType, importableFileTypes } from "@/lib/import/types";

function buildEmptyCounters(): Record<ImportableFileType, number> {
  return {
    extrato_bancario: 0,
    contas_pagar: 0,
    contas_receber: 0
  };
}

function buildSummary(): ImportSummary {
  return {
    processedFilesByType: buildEmptyCounters(),
    importedRowsByType: buildEmptyCounters(),
    ignoredRowsByType: buildEmptyCounters(),
    unrecognizedColumnsByType: {
      extrato_bancario: [],
      contas_pagar: [],
      contas_receber: []
    },
    ignoredFileTypes: [],
    warnings: [],
    errors: []
  };
}

function isImportableType(tipo: string): tipo is ImportableFileType {
  return importableFileTypes.includes(tipo as ImportableFileType);
}

async function processSingleFile(summary: ImportSummary, fechamentoId: string, arquivo: Arquivo) {
  const parsed = await parseFileToRows(arquivo.caminho);

  parsed.warnings.forEach((warning) => {
    summary.warnings.push(`${arquivo.nome}: ${warning}`);
  });

  if (arquivo.tipo === "extrato_bancario") {
    const mapped = mapExtratoRows(parsed.table.rows, parsed.table.headers);

    if (mapped.data.length > 0) {
      await prisma.extratoBancario.createMany({
        data: mapped.data.map((item) => ({
          fechamentoId,
          ...item
        }))
      });
    }

    summary.importedRowsByType.extrato_bancario += mapped.data.length;
    summary.ignoredRowsByType.extrato_bancario += mapped.ignoredRows;
    summary.unrecognizedColumnsByType.extrato_bancario = Array.from(
      new Set([...summary.unrecognizedColumnsByType.extrato_bancario, ...mapped.unrecognizedColumns])
    );
    mapped.warnings.forEach((warning) => summary.warnings.push(`${arquivo.nome}: ${warning}`));
    if (mapped.data.length === 0 && parsed.table.rows.length > 0) {
      summary.warnings.push(`${arquivo.nome}: arquivo lido sem linhas válidas para extrato bancário.`);
    }
    return;
  }

  if (arquivo.tipo === "contas_pagar") {
    const mapped = mapContasPagarRows(parsed.table.rows, parsed.table.headers);

    if (mapped.data.length > 0) {
      await prisma.contaPagar.createMany({
        data: mapped.data.map((item) => ({
          fechamentoId,
          ...item
        }))
      });
    }

    summary.importedRowsByType.contas_pagar += mapped.data.length;
    summary.ignoredRowsByType.contas_pagar += mapped.ignoredRows;
    summary.unrecognizedColumnsByType.contas_pagar = Array.from(
      new Set([...summary.unrecognizedColumnsByType.contas_pagar, ...mapped.unrecognizedColumns])
    );
    mapped.warnings.forEach((warning) => summary.warnings.push(`${arquivo.nome}: ${warning}`));
    if (mapped.data.length === 0 && parsed.table.rows.length > 0) {
      summary.warnings.push(`${arquivo.nome}: arquivo lido sem linhas válidas para contas a pagar.`);
    }
    return;
  }

  const mapped = mapContasReceberRows(parsed.table.rows, parsed.table.headers);

  if (mapped.data.length > 0) {
    await prisma.contaReceber.createMany({
      data: mapped.data.map((item) => ({
        fechamentoId,
        ...item
      }))
    });
  }

  summary.importedRowsByType.contas_receber += mapped.data.length;
  summary.ignoredRowsByType.contas_receber += mapped.ignoredRows;
  summary.unrecognizedColumnsByType.contas_receber = Array.from(
    new Set([...summary.unrecognizedColumnsByType.contas_receber, ...mapped.unrecognizedColumns])
  );
  mapped.warnings.forEach((warning) => summary.warnings.push(`${arquivo.nome}: ${warning}`));
  if (mapped.data.length === 0 && parsed.table.rows.length > 0) {
    summary.warnings.push(`${arquivo.nome}: arquivo lido sem linhas válidas para contas a receber.`);
  }
}

export async function processFechamentoFiles(fechamentoId: string): Promise<{ summary: ImportSummary }> {
  const summary = buildSummary();

  const fechamento = await prisma.fechamento.findUnique({
    where: { id: fechamentoId },
    include: {
      arquivos: {
        orderBy: {
          criadoEm: "asc"
        }
      }
    }
  });

  if (!fechamento) {
    throw new Error("Fechamento não encontrado.");
  }

  await prisma.fechamento.update({
    where: { id: fechamentoId },
    data: { status: FechamentoStatus.PROCESSANDO }
  });

  await prisma.$transaction([
    prisma.extratoBancario.deleteMany({ where: { fechamentoId } }),
    prisma.contaPagar.deleteMany({ where: { fechamentoId } }),
    prisma.contaReceber.deleteMany({ where: { fechamentoId } })
  ]);

  const importableFiles = fechamento.arquivos.filter((arquivo) => isImportableType(arquivo.tipo));
  const ignoredFiles = fechamento.arquivos.filter((arquivo) => !isImportableType(arquivo.tipo));

  ignoredFiles.forEach((arquivo) => {
    summary.ignoredFileTypes.push(arquivo.tipo);
    summary.warnings.push(`${arquivo.nome}: tipo ${arquivo.tipo} ignorado nesta etapa.`);
  });

  for (const arquivo of importableFiles) {
    if (!isImportableType(arquivo.tipo)) {
      continue;
    }

    summary.processedFilesByType[arquivo.tipo] += 1;

    try {
      await processSingleFile(summary, fechamentoId, arquivo);
    } catch {
      summary.errors.push(`${arquivo.nome}: falha ao processar arquivo.`);
    }
  }

  const importedTotal = Object.values(summary.importedRowsByType).reduce((acc, value) => acc + value, 0);

  await prisma.fechamento.update({
    where: { id: fechamentoId },
    data: {
      status: importedTotal > 0 ? FechamentoStatus.EM_REVISAO : FechamentoStatus.EM_PREPARACAO
    }
  });

  if (importedTotal === 0) {
    summary.warnings.push("Nenhuma linha importável foi encontrada. O fechamento retornou para EM_PREPARACAO.");
  }

  return { summary };
}
