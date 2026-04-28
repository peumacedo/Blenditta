import { SituacaoConta } from "@prisma/client";

import { isEmptyRow, normalizeHeader } from "./parsers.ts";
import { type GenericRow, type MapResult } from "./types.ts";

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
  {
    field: "descricao",
    aliases: [
      "cliente_ou_fornecedor",
      "observacoes",
      "observacao",
      "documento",
      "tipo_de_documento",
      "descricao",
      "descricao",
      "historico",
      "historico_lancamento"
    ]
  },
  { field: "valor", aliases: ["valor_r$", "valor_r", "valor", "vl"] },
  { field: "saldo", aliases: ["saldo_r$", "saldo_r", "saldo", "saldo_atual"] },
  { field: "categoria", aliases: ["categoria", "tipo", "grupo"] },
  { field: "situacao", aliases: ["situacao", "status"] },
  { field: "observacoes", aliases: ["observacoes", "observacao"] },
  { field: "documento", aliases: ["documento", "numero_do_documento"] },
  { field: "tipo_documento", aliases: ["tipo_de_documento"] }
];

const contasPagarSchema: ColumnSchema[] = [
  { field: "fornecedor", aliases: ["fornecedor_nome_fantasia", "fornecedor_razao_social", "fornecedor", "favorecido"] },
  { field: "vencimento", aliases: ["vencimento", "dt_vencimento", "data_vencimento"] },
  { field: "pagamento", aliases: ["ultimo_pagamento", "pagamento", "dt_pagamento", "data_pagamento", "previsao_de_pagamento"] },
  { field: "valor", aliases: ["valor_da_conta", "valor_a_pagar", "valor_liquido", "valor", "vl", "valor_r$", "valor_r"] },
  { field: "categoria", aliases: ["categoria", "tipo", "grupo"] },
  { field: "situacao", aliases: ["situacao", "status"] }
];

const contasReceberSchema: ColumnSchema[] = [
  { field: "cliente", aliases: ["cliente_nome_fantasia", "cliente_razao_social", "cliente", "sacado"] },
  { field: "vencimento", aliases: ["vencimento", "dt_vencimento", "data_vencimento"] },
  {
    field: "recebimento",
    aliases: ["ultimo_recebimento", "recebimento", "dt_recebimento", "data_recebimento", "previsao_de_recebimento"]
  },
  { field: "valor", aliases: ["valor_da_conta", "valor_a_receber", "valor_liquido", "valor", "vl", "valor_r$", "valor_r"] },
  { field: "categoria", aliases: ["categoria", "tipo", "grupo"] },
  { field: "situacao", aliases: ["situacao", "status"] }
];

const OPENING_BALANCE_PATTERNS = [/^saldo$/i, /saldo[_\s]*anterior/i, /saldo[_\s]*inicial/i, /abertura/i, /total/i];

export function parseDate(value: string): Date | null {
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

export function parseNumber(value: string): number | null {
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

function resolveColumns(headers: string[], schema: ColumnSchema[]): { headerMap: HeaderMap; unrecognizedColumns: string[] } {
  const normalizedLookup = new Map(headers.map((header) => [normalizeHeader(header), header]));
  const known = new Set<string>();

  const headerMap = schema.reduce<HeaderMap>((acc, column) => {
    for (const alias of column.aliases) {
      const source = normalizedLookup.get(normalizeHeader(alias));
      if (source) {
        acc[column.field] = source;
        known.add(source);
        break;
      }
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

function firstNonEmpty(row: GenericRow, ...headers: Array<string | undefined>) {
  for (const header of headers) {
    const value = getCellValue(row, header);
    if (value) return value;
  }
  return "";
}

function shouldIgnoreExtratoRow(row: GenericRow, headerMap: HeaderMap): boolean {
  const description = firstNonEmpty(row, headerMap.descricao, headerMap.observacoes, headerMap.documento, headerMap.tipo_documento);
  const normalized = normalizeHeader(description);

  return OPENING_BALANCE_PATTERNS.some((pattern) => pattern.test(normalized));
}

function parseContaPagarSituacao(raw: string, warnings: string[]): SituacaoConta {
  const normalized = normalizeHeader(raw);
  if (normalized === "pago") return SituacaoConta.PAGO;
  if (normalized === "atrasado" || normalized === "vencido") return SituacaoConta.VENCIDO;
  if (normalized === "cancelado") {
    warnings.push('Situação "Cancelado" em contas a pagar convertida para PENDENTE.');
    return SituacaoConta.PENDENTE;
  }

  if (normalized && normalized !== "pendente") {
    warnings.push(`Situação "${raw}" em contas a pagar convertida para PENDENTE.`);
  }

  return SituacaoConta.PENDENTE;
}

function parseContaReceberSituacao(raw: string, warnings: string[]): SituacaoConta {
  const normalized = normalizeHeader(raw);
  if (normalized === "recebido") return SituacaoConta.RECEBIDO;
  if (normalized === "atrasado" || normalized === "vencido") return SituacaoConta.VENCIDO;
  if (normalized === "cancelado") {
    warnings.push('Situação "Cancelado" em contas a receber convertida para PENDENTE.');
    return SituacaoConta.PENDENTE;
  }

  if (normalized && normalized !== "pendente") {
    warnings.push(`Situação "${raw}" em contas a receber convertida para PENDENTE.`);
  }

  return SituacaoConta.PENDENTE;
}

export function mapExtratoRows(rows: GenericRow[], headers: string[]): MapResult<ExtratoCreateInput> {
  const warnings: string[] = [];
  const { headerMap, unrecognizedColumns } = resolveColumns(headers, extratoSchema);

  if (!headerMap.data) warnings.push("Coluna essencial não encontrada no extrato: Data.");
  if (!headerMap.valor) warnings.push("Coluna essencial não encontrada no extrato: Valor (R$).");
  if (!headerMap.descricao) warnings.push("Coluna de descrição principal não encontrada no extrato; fallback será tentado.");
  if (!headerMap.saldo) warnings.push("Coluna de saldo não encontrada no extrato; saldo padrão 0 aplicado.");
  if (!headerMap.categoria) warnings.push("Coluna de categoria não encontrada no extrato; categoria padrão SEM_CATEGORIA aplicada.");

  let ignoredByOpeningBalance = 0;

  const data = rows.reduce<ExtratoCreateInput[]>((acc, row) => {
    if (isEmptyRow(row)) return acc;

    if (shouldIgnoreExtratoRow(row, headerMap)) {
      ignoredByOpeningBalance += 1;
      return acc;
    }

    const parsedDate = parseDate(getCellValue(row, headerMap.data));
    const parsedValue = parseNumber(getCellValue(row, headerMap.valor));
    const descricao = firstNonEmpty(row, headerMap.descricao, headerMap.observacoes, headerMap.documento, headerMap.tipo_documento);

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

  if (ignoredByOpeningBalance > 0) {
    warnings.push(`${ignoredByOpeningBalance} linha(s) de extrato ignorada(s) por saldo inicial/anterior/totalização.`);
  }

  const ignoredRows = rows.filter((row) => !isEmptyRow(row)).length - data.length;

  return { data, ignoredRows: Math.max(0, ignoredRows), warnings, unrecognizedColumns };
}

export function mapContasPagarRows(rows: GenericRow[], headers: string[]): MapResult<ContaPagarCreateInput> {
  const warnings: string[] = [];
  const { headerMap, unrecognizedColumns } = resolveColumns(headers, contasPagarSchema);

  if (!headerMap.vencimento) warnings.push("Coluna essencial não encontrada em contas a pagar: Vencimento.");
  if (!headerMap.valor) warnings.push("Coluna essencial não encontrada em contas a pagar: Valor.");
  if (!headerMap.fornecedor) warnings.push("Coluna de fornecedor não encontrada em contas a pagar; valor padrão NAO_INFORMADO aplicado.");
  if (!headerMap.categoria) warnings.push("Coluna de categoria não encontrada em contas a pagar; categoria padrão SEM_CATEGORIA aplicada.");

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
      situacao: parseContaPagarSituacao(getCellValue(row, headerMap.situacao) || "PENDENTE", warnings)
    });

    return acc;
  }, []);

  const ignoredRows = rows.filter((row) => !isEmptyRow(row)).length - data.length;

  return { data, ignoredRows: Math.max(0, ignoredRows), warnings: Array.from(new Set(warnings)), unrecognizedColumns };
}

export function mapContasReceberRows(rows: GenericRow[], headers: string[]): MapResult<ContaReceberCreateInput> {
  const warnings: string[] = [];
  const { headerMap, unrecognizedColumns } = resolveColumns(headers, contasReceberSchema);

  if (!headerMap.vencimento) warnings.push("Coluna essencial não encontrada em contas a receber: Vencimento.");
  if (!headerMap.valor) warnings.push("Coluna essencial não encontrada em contas a receber: Valor.");
  if (!headerMap.cliente) warnings.push("Coluna de cliente não encontrada em contas a receber; valor padrão NAO_INFORMADO aplicado.");
  if (!headerMap.categoria) warnings.push("Coluna de categoria não encontrada em contas a receber; categoria padrão SEM_CATEGORIA aplicada.");

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
      situacao: parseContaReceberSituacao(getCellValue(row, headerMap.situacao) || "PENDENTE", warnings)
    });

    return acc;
  }, []);

  const ignoredRows = rows.filter((row) => !isEmptyRow(row)).length - data.length;

  return { data, ignoredRows: Math.max(0, ignoredRows), warnings: Array.from(new Set(warnings)), unrecognizedColumns };
}
