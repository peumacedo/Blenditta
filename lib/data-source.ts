import { FechamentoStatus, SituacaoConta } from "@prisma/client";

import { isDemoMode } from "@/lib/env";
import { prisma } from "@/lib/prisma";

export type AppFechamento = {
  id: string;
  competencia: Date;
  status: FechamentoStatus;
  observacoes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type AppArquivo = {
  id: string;
  fechamentoId: string;
  nome: string;
  tipo: string;
  caminho: string;
  criadoEm: Date;
};

export type AppExtrato = {
  id: string;
  fechamentoId: string;
  data: Date;
  descricao: string;
  valor: number;
  saldo: number;
  categoria: string;
  conciliado: boolean;
};

export type AppContaPagar = {
  id: string;
  fechamentoId: string;
  fornecedor: string;
  vencimento: Date;
  pagamento: Date | null;
  valor: number;
  categoria: string;
  situacao: SituacaoConta;
};

export type AppContaReceber = {
  id: string;
  fechamentoId: string;
  cliente: string;
  vencimento: Date;
  recebimento: Date | null;
  valor: number;
  categoria: string;
  situacao: SituacaoConta;
};

type DemoDataset = {
  fechamentos: AppFechamento[];
  arquivos: AppArquivo[];
  extratos: AppExtrato[];
  contasPagar: AppContaPagar[];
  contasReceber: AppContaReceber[];
};

function makeDate(value: string) {
  return new Date(`${value}T12:00:00Z`);
}

const demoDataset: DemoDataset = {
  fechamentos: [
    {
      id: "demo-2026-03",
      competencia: makeDate("2026-03-01"),
      status: FechamentoStatus.EM_REVISAO,
      observacoes: "Mês com sazonalidade de Páscoa e reforço de mídia.",
      createdAt: makeDate("2026-03-02"),
      updatedAt: makeDate("2026-03-30")
    },
    {
      id: "demo-2026-02",
      competencia: makeDate("2026-02-01"),
      status: FechamentoStatus.FECHADO,
      observacoes: "Fechamento validado com equipe financeira.",
      createdAt: makeDate("2026-02-02"),
      updatedAt: makeDate("2026-02-28")
    },
    {
      id: "demo-2026-01",
      competencia: makeDate("2026-01-01"),
      status: FechamentoStatus.PROCESSANDO,
      observacoes: "Bases de janeiro em reconciliação final.",
      createdAt: makeDate("2026-01-02"),
      updatedAt: makeDate("2026-01-27")
    }
  ],
  arquivos: [
    ["demo-2026-03", "extrato_marco.csv", "extrato_bancario"],
    ["demo-2026-03", "contas_pagar_marco.xlsx", "contas_pagar"],
    ["demo-2026-03", "contas_receber_marco.xlsx", "contas_receber"],
    ["demo-2026-02", "extrato_fevereiro.csv", "extrato_bancario"],
    ["demo-2026-02", "relatorio_omie_fev.pdf", "fluxo_caixa_omie"],
    ["demo-2026-01", "extrato_janeiro.csv", "extrato_bancario"]
  ].map((item, index) => ({
    id: `arq-${index + 1}`,
    fechamentoId: String(item[0]),
    nome: String(item[1]),
    tipo: String(item[2]),
    caminho: `demo/${String(item[0])}/${String(item[1])}`,
    criadoEm: makeDate(`2026-0${Math.min(index + 1, 3)}-${String((index % 9) + 2).padStart(2, "0")}`)
  })),
  extratos: [
    ["demo-2026-03", "2026-03-03", "Recebimento marketplace", 18320, 118320, "RECEITA_VENDAS"],
    ["demo-2026-03", "2026-03-05", "Pagamento fornecedores insumos", -6420, 111900, "INSUMOS"],
    ["demo-2026-03", "2026-03-08", "Campanha Meta Ads", -3100, 108800, "MARKETING"],
    ["demo-2026-03", "2026-03-10", "Taxas de cartão", -1220, 107580, "IMPOSTOS_TAXAS"],
    ["demo-2026-03", "2026-03-14", "Recebimento e-commerce", 9720, 117300, "RECEITA_VENDAS"],
    ["demo-2026-03", "2026-03-16", "Folha administrativa", -7800, 109500, "SALARIOS"],
    ["demo-2026-03", "2026-03-19", "Aluguel unidade", -4200, 105300, "ALUGUEL"],
    ["demo-2026-03", "2026-03-22", "Juros antecipação", -540, 104760, "RESULTADO_FINANCEIRO"],
    ["demo-2026-03", "2026-03-25", "Receita B2B", 11400, 116160, "RECEITA_SERVICOS"],
    ["demo-2026-03", "2026-03-27", "Compra impressora etiquetas", -1850, 114310, "INVESTIMENTO"],
    ["demo-2026-02", "2026-02-04", "Recebimento mensalidades", 15200, 102500, "RECEITA_VENDAS"],
    ["demo-2026-02", "2026-02-08", "Compra de embalagens", -2750, 99750, "EMBALAGEM"],
    ["demo-2026-02", "2026-02-11", "Energia elétrica", -1320, 98430, "ENERGIA"],
    ["demo-2026-02", "2026-02-15", "Receita assinatura", 8700, 107130, "RECEITA_RECORRENTE"],
    ["demo-2026-02", "2026-02-20", "Retirada sócios", -2800, 104330, "RETIRADA_SOCIOS"],
    ["demo-2026-02", "2026-02-24", "Frete transportadora", -1690, 102640, "FRETE"],
    ["demo-2026-01", "2026-01-03", "Recebimento vendas", 14100, 91500, "RECEITA_VENDAS"],
    ["demo-2026-01", "2026-01-09", "Fornecedor matéria-prima", -5920, 85580, "MATERIA_PRIMA"],
    ["demo-2026-01", "2026-01-13", "Sistema ERP", -690, 84890, "SISTEMA"],
    ["demo-2026-01", "2026-01-17", "Recebimento PIX", 6300, 91190, "RECEITA_VENDAS"],
    ["demo-2026-01", "2026-01-21", "Impostos federais", -2340, 88850, "IMPOSTOS_TAXAS"],
    ["demo-2026-01", "2026-01-26", "Manutenção equipamentos", -1180, 87670, "MANUTENCAO"]
  ].map((item, index) => ({
    id: `ext-${index + 1}`,
    fechamentoId: String(item[0]),
    data: makeDate(String(item[1])),
    descricao: String(item[2]),
    valor: Number(item[3]),
    saldo: Number(item[4]),
    categoria: String(item[5]),
    conciliado: true
  })),
  contasPagar: [
    ["demo-2026-03", "Fornecedor EmbalaMix", "2026-04-05", null, 3400, "EMBALAGEM", SituacaoConta.PENDENTE],
    ["demo-2026-03", "Agência Criativa Sul", "2026-03-28", "2026-03-28", 2100, "MARKETING", SituacaoConta.PAGO],
    ["demo-2026-03", "Distribuidora Prime", "2026-03-20", null, 4900, "INSUMOS", SituacaoConta.VENCIDO],
    ["demo-2026-02", "Condomínio Centro", "2026-02-10", "2026-02-10", 980, "ALUGUEL", SituacaoConta.PAGO],
    ["demo-2026-02", "Operadora Log", "2026-03-03", null, 1750, "FRETE", SituacaoConta.PENDENTE],
    ["demo-2026-01", "Fornecedor Norte", "2026-01-25", "2026-01-25", 2850, "MATERIA_PRIMA", SituacaoConta.PAGO],
    ["demo-2026-01", "Prestador TI", "2026-02-02", null, 920, "SISTEMA", SituacaoConta.PENDENTE]
  ].map((item, index) => ({
    id: `cp-${index + 1}`,
    fechamentoId: String(item[0]),
    fornecedor: String(item[1]),
    vencimento: makeDate(String(item[2])),
    pagamento: item[3] ? makeDate(String(item[3])) : null,
    valor: Number(item[4]),
    categoria: String(item[5]),
    situacao: item[6] as SituacaoConta
  })),
  contasReceber: [
    ["demo-2026-03", "Rede Aurora", "2026-04-07", null, 5100, "RECEITA_B2B", SituacaoConta.PENDENTE],
    ["demo-2026-03", "Loja Lume", "2026-03-15", "2026-03-15", 2700, "RECEITA_VENDAS", SituacaoConta.RECEBIDO],
    ["demo-2026-03", "Comercial Prado", "2026-03-18", null, 3200, "RECEITA_B2B", SituacaoConta.VENCIDO],
    ["demo-2026-02", "Marketplace Alfa", "2026-02-12", "2026-02-12", 4300, "RECEITA_VENDAS", SituacaoConta.RECEBIDO],
    ["demo-2026-02", "Canal Direct", "2026-03-06", null, 2650, "RECEITA_RECORRENTE", SituacaoConta.PENDENTE],
    ["demo-2026-01", "Cliente Boreal", "2026-01-20", "2026-01-19", 2950, "RECEITA_VENDAS", SituacaoConta.RECEBIDO],
    ["demo-2026-01", "Cliente Solaris", "2026-02-04", null, 1880, "RECEITA_VENDAS", SituacaoConta.PENDENTE]
  ].map((item, index) => ({
    id: `cr-${index + 1}`,
    fechamentoId: String(item[0]),
    cliente: String(item[1]),
    vencimento: makeDate(String(item[2])),
    recebimento: item[3] ? makeDate(String(item[3])) : null,
    valor: Number(item[4]),
    categoria: String(item[5]),
    situacao: item[6] as SituacaoConta
  }))
};

function cloneItem<T extends { [key: string]: unknown }>(item: T): T {
  return Object.fromEntries(
    Object.entries(item).map(([key, value]) => [key, value instanceof Date ? new Date(value) : value])
  ) as T;
}

export async function listFechamentos() {
  if (isDemoMode) {
    return demoDataset.fechamentos
      .map(cloneItem)
      .sort((a, b) => b.competencia.getTime() - a.competencia.getTime());
  }

  const rows = await prisma.fechamento.findMany({ orderBy: { competencia: "desc" } });
  return rows.map((row) => ({ ...row, competencia: new Date(row.competencia) }));
}

export async function getFechamentoById(id: string) {
  if (isDemoMode) {
    const row = demoDataset.fechamentos.find((item) => item.id === id);
    return row ? cloneItem(row) : null;
  }

  return prisma.fechamento.findUnique({ where: { id } });
}

export async function listArquivosByFechamento(fechamentoId: string) {
  if (isDemoMode) {
    return demoDataset.arquivos
      .filter((item) => item.fechamentoId === fechamentoId)
      .map(cloneItem)
      .sort((a, b) => b.criadoEm.getTime() - a.criadoEm.getTime());
  }

  const rows = await prisma.arquivo.findMany({
    where: { fechamentoId },
    orderBy: { criadoEm: "desc" }
  });

  return rows.map((row) => ({ ...row }));
}

export async function listExtratosByFechamento(fechamentoId: string) {
  if (isDemoMode) {
    return demoDataset.extratos.filter((item) => item.fechamentoId === fechamentoId).map(cloneItem);
  }

  const rows = await prisma.extratoBancario.findMany({
    where: { fechamentoId },
    orderBy: [{ data: "asc" }, { id: "asc" }]
  });

  return rows.map((row) => ({ ...row, valor: Number(row.valor), saldo: Number(row.saldo) }));
}

export async function listContasPagarByFechamento(fechamentoId: string) {
  if (isDemoMode) {
    return demoDataset.contasPagar.filter((item) => item.fechamentoId === fechamentoId).map(cloneItem);
  }

  const rows = await prisma.contaPagar.findMany({
    where: { fechamentoId },
    orderBy: [{ vencimento: "asc" }, { id: "asc" }]
  });

  return rows.map((row) => ({ ...row, valor: Number(row.valor) }));
}

export async function listContasReceberByFechamento(fechamentoId: string) {
  if (isDemoMode) {
    return demoDataset.contasReceber.filter((item) => item.fechamentoId === fechamentoId).map(cloneItem);
  }

  const rows = await prisma.contaReceber.findMany({
    where: { fechamentoId },
    orderBy: [{ vencimento: "asc" }, { id: "asc" }]
  });

  return rows.map((row) => ({ ...row, valor: Number(row.valor) }));
}

export async function getFechamentoBaseResumo(fechamentoId: string) {
  const [extratos, contasPagar, contasReceber, arquivos] = await Promise.all([
    listExtratosByFechamento(fechamentoId),
    listContasPagarByFechamento(fechamentoId),
    listContasReceberByFechamento(fechamentoId),
    listArquivosByFechamento(fechamentoId)
  ]);

  return {
    extratos: extratos.length,
    contasPagar: contasPagar.length,
    contasReceber: contasReceber.length,
    arquivos: arquivos.length
  };
}
