import { type Prisma, SituacaoConta } from "@prisma/client";

export const PAGE_SIZE = 20;

export type SearchParams = Record<string, string | string[] | undefined>;

export type ExtratoFilters = {
  descricao: string;
  categoria: string;
  dataInicial?: Date;
  dataFinal?: Date;
  valorMin?: number;
  valorMax?: number;
};

export type ContaFilters = {
  nome: string;
  categoria: string;
  situacao?: SituacaoConta;
  vencimentoInicial?: Date;
  vencimentoFinal?: Date;
  valorMin?: number;
  valorMax?: number;
};

export function readParam(searchParams: SearchParams, key: string) {
  const value = searchParams[key];
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }
  return value ?? "";
}

export function parsePage(searchParams: SearchParams, key: string) {
  const raw = Number.parseInt(readParam(searchParams, key), 10);
  if (!Number.isFinite(raw) || raw < 1) {
    return 1;
  }
  return raw;
}

function parseNumber(searchParams: SearchParams, key: string) {
  const raw = readParam(searchParams, key).replace(",", ".").trim();
  if (!raw) {
    return undefined;
  }

  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) {
    return undefined;
  }
  return parsed;
}

function parseDate(searchParams: SearchParams, key: string, endOfDay = false) {
  const raw = readParam(searchParams, key);
  if (!raw) {
    return undefined;
  }

  const date = new Date(`${raw}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  if (endOfDay) {
    date.setHours(23, 59, 59, 999);
  }

  return date;
}

export function getExtratoFilters(searchParams: SearchParams): ExtratoFilters {
  return {
    descricao: readParam(searchParams, "ex_descricao").trim(),
    categoria: readParam(searchParams, "ex_categoria").trim(),
    dataInicial: parseDate(searchParams, "ex_data_ini"),
    dataFinal: parseDate(searchParams, "ex_data_fim", true),
    valorMin: parseNumber(searchParams, "ex_valor_min"),
    valorMax: parseNumber(searchParams, "ex_valor_max")
  };
}

export function getContaFilters(searchParams: SearchParams, prefix: "cp" | "cr"): ContaFilters {
  const situacaoRaw = readParam(searchParams, `${prefix}_situacao`);

  return {
    nome: readParam(searchParams, `${prefix}_nome`).trim(),
    categoria: readParam(searchParams, `${prefix}_categoria`).trim(),
    situacao: Object.values(SituacaoConta).includes(situacaoRaw as SituacaoConta)
      ? (situacaoRaw as SituacaoConta)
      : undefined,
    vencimentoInicial: parseDate(searchParams, `${prefix}_venc_ini`),
    vencimentoFinal: parseDate(searchParams, `${prefix}_venc_fim`, true),
    valorMin: parseNumber(searchParams, `${prefix}_valor_min`),
    valorMax: parseNumber(searchParams, `${prefix}_valor_max`)
  };
}

export function buildExtratoWhere(fechamentoId: string, filters: ExtratoFilters): Prisma.ExtratoBancarioWhereInput {
  return {
    fechamentoId,
    ...(filters.descricao
      ? {
          descricao: {
            contains: filters.descricao,
            mode: "insensitive"
          }
        }
      : {}),
    ...(filters.categoria
      ? {
          categoria: {
            contains: filters.categoria,
            mode: "insensitive"
          }
        }
      : {}),
    ...(filters.dataInicial || filters.dataFinal
      ? {
          data: {
            ...(filters.dataInicial ? { gte: filters.dataInicial } : {}),
            ...(filters.dataFinal ? { lte: filters.dataFinal } : {})
          }
        }
      : {}),
    ...(filters.valorMin !== undefined || filters.valorMax !== undefined
      ? {
          valor: {
            ...(filters.valorMin !== undefined ? { gte: filters.valorMin } : {}),
            ...(filters.valorMax !== undefined ? { lte: filters.valorMax } : {})
          }
        }
      : {})
  };
}

export function buildContaPagarWhere(fechamentoId: string, filters: ContaFilters): Prisma.ContaPagarWhereInput {
  return {
    fechamentoId,
    ...(filters.nome
      ? {
          fornecedor: {
            contains: filters.nome,
            mode: "insensitive"
          }
        }
      : {}),
    ...(filters.categoria
      ? {
          categoria: {
            contains: filters.categoria,
            mode: "insensitive"
          }
        }
      : {}),
    ...(filters.situacao ? { situacao: filters.situacao } : {}),
    ...(filters.vencimentoInicial || filters.vencimentoFinal
      ? {
          vencimento: {
            ...(filters.vencimentoInicial ? { gte: filters.vencimentoInicial } : {}),
            ...(filters.vencimentoFinal ? { lte: filters.vencimentoFinal } : {})
          }
        }
      : {}),
    ...(filters.valorMin !== undefined || filters.valorMax !== undefined
      ? {
          valor: {
            ...(filters.valorMin !== undefined ? { gte: filters.valorMin } : {}),
            ...(filters.valorMax !== undefined ? { lte: filters.valorMax } : {})
          }
        }
      : {})
  };
}

export function buildContaReceberWhere(fechamentoId: string, filters: ContaFilters): Prisma.ContaReceberWhereInput {
  return {
    fechamentoId,
    ...(filters.nome
      ? {
          cliente: {
            contains: filters.nome,
            mode: "insensitive"
          }
        }
      : {}),
    ...(filters.categoria
      ? {
          categoria: {
            contains: filters.categoria,
            mode: "insensitive"
          }
        }
      : {}),
    ...(filters.situacao ? { situacao: filters.situacao } : {}),
    ...(filters.vencimentoInicial || filters.vencimentoFinal
      ? {
          vencimento: {
            ...(filters.vencimentoInicial ? { gte: filters.vencimentoInicial } : {}),
            ...(filters.vencimentoFinal ? { lte: filters.vencimentoFinal } : {})
          }
        }
      : {}),
    ...(filters.valorMin !== undefined || filters.valorMax !== undefined
      ? {
          valor: {
            ...(filters.valorMin !== undefined ? { gte: filters.valorMin } : {}),
            ...(filters.valorMax !== undefined ? { lte: filters.valorMax } : {})
          }
        }
      : {})
  };
}

export function getTotalPages(total: number) {
  return Math.max(1, Math.ceil(total / PAGE_SIZE));
}

export function normalizePage(page: number, total: number) {
  const totalPages = getTotalPages(total);
  return Math.min(page, totalPages);
}
