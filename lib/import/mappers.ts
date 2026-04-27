import { SituacaoConta } from "@prisma/client";

import { isEmptyRow, normalizeHeader } from "@/lib/import/parsers";
import { type GenericRow, type MapResult } from "@/lib/import/types";

type HeaderMap = Record<string, string | undefined>;

type ColumnSchema = {
  field: string;
  aliases: string[];
};

type ExtratoCreateInput = {
  data: Date;
  descricao: string;
  valor: number;
  saldo: number;
  categoria: string;
};

type ContaPagarCreateInput = {
  fornecedor: string;
  vencimento: Date;
  pagamento: Date | null;
  valor: number;
  categoria: string;
  situacao: SituacaoConta;
};

type ContaReceberCreateInput = {
  cliente: string;
  vencimento: Date;
  recebimento: Date | null;
  valor: number;
  categoria: string;
  situacao: SituacaoConta;
};

const extratoSchema: ColumnSchema[] = [
  { field: "data", aliases: ["data", "dt"] },
  { field: "descricao", aliases: ["descricao", "descrição", "historico", "histórico", "historico_lancamento"] },
  { field: "valor", aliases: ["valor", "vl", "valor_r$", "valor_r"] },
  { field: "saldo", aliases: ["saldo", "saldo_atual"] },
  { field: "categoria", aliases: ["categoria", "tipo", "grupo"] }
];

const contasPagarSchema: ColumnSchema[] = [
  { field: "fornecedor", aliases: ["fornecedor", "favorecido"] },
  { field: "vencimento", aliases: ["vencimento", "dt_vencimento", "data_vencimento"] },
  { field: "pagamento", aliases: ["pagamento", "dt_pagamento", "data_pagamento"] },
  { field: "valor", aliases: ["valor", "vl", "valor_r$", "valor_r"] },
  { field: "categoria", aliases: ["categoria", "tipo", "grupo"] },
  { field: "situacao", aliases: ["situacao", "situação", "status"] }
];

const contasReceberSchema: ColumnSchema[] = [
  { field: "cliente", aliases: ["cliente", "sacado"] },
  { field: "vencimento", aliases: ["vencimento", "dt_vencimento", "data_vencimento"] },
  { field: "recebimento", aliases: ["recebimento", "dt_recebimento", "data_recebimento"] },
  { field: "valor", aliases: ["valor", "vl", "valor_r$", "valor_r"] },
  { field: "categoria", aliases: ["categoria", "tipo", "grupo"] },
  { field: "situacao", aliases: ["situacao", "situação", "status"] }
];

function parseDate(value: string): Date | null {
  const normalized = value.trim();
  if (!normalized) return null;

  if (/^\d{4}-\d{2}-\d{2}/.test(normalized)) {
    const [year, month, day] = normalized.slice(0, 10).split("-").map(Number);
    return new Date(Date.UTC(year, month - 1, day));
  }

  const br = normalized.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})$/);
  if (br) {
    const day = Number(br[1]);
    const month = Number(br[2]);
    const year = Number(br[3].length === 2 ? `20${br[3]}` : br[3]);
    return new Date(Date.UTC(year, month - 1, day));
  }

  const numericDate = Number(normalized);
  if (!Number.isNaN(numericDate) && numericDate > 59 && numericDate < 80000) {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    excelEpoch.setUTCDate(excelEpoch.getUTCDate() + numericDate);
    return excelEpoch;
  }

  const native = new Date(normalized);
  return Number.isNaN(native.getTime()) ? null : native;
}

function parseNumber(value: string): number | null {
  const normalized = value
    .replace(/R\$/gi, "")
    .replace(/\s+/g, "")
    .replace(/[^\d,().-]/g, "")
    .trim();

  if (!normalized) return null;

  const negative = normalized.startsWith("(") && normalized.endsWith(")");
  let numeric = normalized.replace(/[()]/g, "");

  if (numeric.includes(",") && numeric.includes(".")) {
    numeric = numeric.replace(/\./g, "").replace(/,/g, ".");
  } else if (numeric.includes(",")) {
    numeric = numeric.replace(/,/g, ".");
  }

  const parsed = Number(numeric);
  if (Number.isNaN(parsed)) return null;

  return negative ? -parsed : parsed;
}

function parseSituacao(raw: string): SituacaoConta {
  const normalized = normalizeHeader(raw);

  if (normalized.includes("receb")) return SituacaoConta.RECEBIDO;
  if (normalized.includes("pag")) return SituacaoConta.PAGO;
  if (normalized.includes("venc")) return SituacaoConta.VENCIDO;

  return SituacaoConta.PENDENTE;
}

function resolveColumns(headers: string[], schema: ColumnSchema[]): { headerMap: HeaderMap; unrecognizedColumns: string[] } {
  const normalizedHeaders = headers.map((header) => normalizeHeader(header));
  const known = new Set<string>();

  const headerMap = schema.reduce<HeaderMap>((acc, column) => {
    const index = normalizedHeaders.findIndex((header) => column.aliases.map(normalizeHeader).includes(header));
    if (index >= 0) {
      const source = headers[index];
      acc[column.field] = source;
      known.add(source);
    }
    return acc;
  }, {});

  const unrecognizedColumns = headers.filter((header) => !known.has(header));
  return { headerMap, unrecognizedColumns };
}

function getCellValue(row: GenericRow, header?: string) {
  if (!header) return "";
  return String(row[header] ?? "").trim();
}

export function mapExtratoRows(rows: GenericRow[], headers: string[]): MapResult<ExtratoCreateInput> {
  const warnings: string[] = [];
  const { headerMap, unrecognizedColumns } = resolveColumns(headers, extratoSchema);

  if (!headerMap.saldo) {
    warnings.push("Coluna de saldo não encontrada no extrato; saldo padrão 0 aplicado.");
  }

  if (!headerMap.categoria) {
    warnings.push("Coluna de categoria não encontrada no extrato; categoria padrão SEM_CATEGORIA aplicada.");
  }

  const data = rows.reduce<ExtratoCreateInput[]>((acc, row) => {
    if (isEmptyRow(row)) return acc;

    const parsedDate = parseDate(getCellValue(row, headerMap.data));
    const parsedValue = parseNumber(getCellValue(row, headerMap.valor));
    const descricao = getCellValue(row, headerMap.descricao);

    if (!parsedDate || parsedValue === null || !descricao) {
      return acc;
    }

    acc.push({
      data: parsedDate,
      descricao,
      valor: parsedValue,
      saldo: parseNumber(getCellValue(row, headerMap.saldo)) ?? 0,
      categoria: getCellValue(row, headerMap.categoria) || "SEM_CATEGORIA"
    });

    return acc;
  }, []);

  const ignoredRows = rows.filter((row) => !isEmptyRow(row)).length - data.length;

  return { data, ignoredRows: Math.max(0, ignoredRows), warnings, unrecognizedColumns };
}

export function mapContasPagarRows(rows: GenericRow[], headers: string[]): MapResult<ContaPagarCreateInput> {
  const warnings: string[] = [];
  const { headerMap, unrecognizedColumns } = resolveColumns(headers, contasPagarSchema);

  if (!headerMap.fornecedor) {
    warnings.push("Coluna de fornecedor não encontrada em contas a pagar; valor padrão NAO_INFORMADO aplicado.");
  }

  if (!headerMap.categoria) {
    warnings.push("Coluna de categoria não encontrada em contas a pagar; categoria padrão SEM_CATEGORIA aplicada.");
  }

  const data = rows.reduce<ContaPagarCreateInput[]>((acc, row) => {
    if (isEmptyRow(row)) return acc;

    const vencimento = parseDate(getCellValue(row, headerMap.vencimento));
    const valor = parseNumber(getCellValue(row, headerMap.valor));

    if (!vencimento || valor === null) {
      return acc;
    }

    acc.push({
      fornecedor: getCellValue(row, headerMap.fornecedor) || "NAO_INFORMADO",
      vencimento,
      pagamento: parseDate(getCellValue(row, headerMap.pagamento)),
      valor,
      categoria: getCellValue(row, headerMap.categoria) || "SEM_CATEGORIA",
      situacao: parseSituacao(getCellValue(row, headerMap.situacao) || "PENDENTE")
    });

    return acc;
  }, []);

  const ignoredRows = rows.filter((row) => !isEmptyRow(row)).length - data.length;

  return { data, ignoredRows: Math.max(0, ignoredRows), warnings, unrecognizedColumns };
}

export function mapContasReceberRows(rows: GenericRow[], headers: string[]): MapResult<ContaReceberCreateInput> {
  const warnings: string[] = [];
  const { headerMap, unrecognizedColumns } = resolveColumns(headers, contasReceberSchema);

  if (!headerMap.cliente) {
    warnings.push("Coluna de cliente não encontrada em contas a receber; valor padrão NAO_INFORMADO aplicado.");
  }

  if (!headerMap.categoria) {
    warnings.push("Coluna de categoria não encontrada em contas a receber; categoria padrão SEM_CATEGORIA aplicada.");
  }

  const data = rows.reduce<ContaReceberCreateInput[]>((acc, row) => {
    if (isEmptyRow(row)) return acc;

    const vencimento = parseDate(getCellValue(row, headerMap.vencimento));
    const valor = parseNumber(getCellValue(row, headerMap.valor));

    if (!vencimento || valor === null) {
      return acc;
    }

    acc.push({
      cliente: getCellValue(row, headerMap.cliente) || "NAO_INFORMADO",
      vencimento,
      recebimento: parseDate(getCellValue(row, headerMap.recebimento)),
      valor,
      categoria: getCellValue(row, headerMap.categoria) || "SEM_CATEGORIA",
      situacao: parseSituacao(getCellValue(row, headerMap.situacao) || "PENDENTE")
    });

    return acc;
  }, []);

  const ignoredRows = rows.filter((row) => !isEmptyRow(row)).length - data.length;

  return { data, ignoredRows: Math.max(0, ignoredRows), warnings, unrecognizedColumns };
}
