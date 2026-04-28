import { SituacaoConta, type FechamentoStatus } from "@prisma/client";

import {
  getFechamentoById,
  listArquivosByFechamento,
  listContasPagarByFechamento,
  listContasReceberByFechamento,
  listExtratosByFechamento,
  type AppContaPagar,
  type AppContaReceber
} from "@/lib/data-source";

export type GrupoGerencial =
  | "RECEITA"
  | "CUSTO_VARIAVEL"
  | "DESPESA_FIXA"
  | "RESULTADO_FINANCEIRO"
  | "RETIRADA"
  | "INVESTIMENTO"
  | "IMPOSTOS_TAXAS"
  | "NAO_CLASSIFICADO";

export type AnaliseGerencial = {
  fechamento: {
    id: string;
    competencia: Date;
    status: FechamentoStatus;
  };
  resumoExecutivo: {
    saldoInicial: number;
    entradasRealizadas: number;
    saidasRealizadas: number;
    resultadoCaixa: number;
    saldoFinal: number;
    contasAReceberAbertas: number;
    contasAPagarAbertas: number;
    posicaoFuturaConhecida: number;
  };
  resultadoGerencial: {
    receitaBruta: number;
    impostosTaxas: number;
    receitaLiquida: number;
    custosVariaveis: number;
    margemBruta: number;
    margemBrutaPercentual: number | null;
    despesasFixas: number;
    resultadoOperacional: number;
    resultadoFinanceiro: number;
    retiradas: number;
    investimentos: number;
    resultadoGerencial: number;
  };
  receitasPorCategoria: Array<{ categoria: string; valor: number; participacao: number }>;
  saidasPorCategoria: Array<{ categoria: string; valor: number; participacao: number }>;
  fluxoCaixa: {
    saldoInicial: number;
    entradasOperacionais: number;
    saidasOperacionais: number;
    saidasFinanceiras: number;
    investimentos: number;
    retiradas: number;
    saldoFinal: number;
  };
  contasReceber: {
    totalRecebido: number;
    totalAberto: number;
    vencidas: number;
    aVencer: number;
    proximas: AppContaReceber[];
  };
  contasPagar: {
    totalPago: number;
    totalAberto: number;
    vencidas: number;
    aVencer: number;
    proximas: AppContaPagar[];
  };
  indicadores: Array<{ nome: string; valor: string; leitura: string }>;
  diagnostico: {
    pontosPositivos: string[];
    pontosAtencao: string[];
    riscos: string[];
    recomendacoes: string[];
  };
  qualidadeBase: {
    possuiExtrato: boolean;
    possuiContasPagar: boolean;
    possuiContasReceber: boolean;
    quantidadeArquivos: number;
    observacoes: string[];
  };
};


function asNumber(value: number | null | undefined) {
  return Number(value ?? 0);
}

function normalizeText(value: string | null | undefined) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function hasKeyword(haystack: string, words: string[]) {
  return words.some((word) => haystack.includes(word));
}

export function classificarGrupoGerencial({
  categoria,
  descricao,
  valor
}: {
  categoria: string;
  descricao: string;
  valor: number;
}): GrupoGerencial {
  const texto = `${normalizeText(categoria)} ${normalizeText(descricao)}`;

  if (hasKeyword(texto, ["imposto", "taxa", "tribut", "cartao", "tarifa fiscal"])) {
    return "IMPOSTOS_TAXAS";
  }

  if (hasKeyword(texto, ["juros", "tarifa bancaria", " banco", "emprestimo", "financiamento"])) {
    return "RESULTADO_FINANCEIRO";
  }

  if (hasKeyword(texto, ["retirada", "pro-labore", "prolabore", "familia", "socio"])) {
    return "RETIRADA";
  }

  if (hasKeyword(texto, ["investimento", "equipamento", "obra", "reforma", "maquina"])) {
    return "INVESTIMENTO";
  }

  if (hasKeyword(texto, ["insumo", "embalagem", "frete", "producao", "mercadoria", "materia-prima"])) {
    return "CUSTO_VARIAVEL";
  }

  if (hasKeyword(texto, ["aluguel", "salario", "energia", "internet", "sistema", "administrativo", "manutencao"])) {
    return "DESPESA_FIXA";
  }

  if (valor > 0) {
    return "RECEITA";
  }

  return "NAO_CLASSIFICADO";
}

function sumValores<T>(items: T[], pick: (item: T) => number) {
  return items.reduce((acc, item) => acc + pick(item), 0);
}

function safeDivide(numerator: number, denominator: number) {
  if (!denominator) return null;
  return numerator / denominator;
}

function percentual(value: number | null) {
  if (value === null || !Number.isFinite(value)) return "N/A";
  return `${(value * 100).toFixed(1)}%`;
}

export async function getAnaliseGerencial(fechamentoId: string): Promise<AnaliseGerencial | null> {
  const fechamento = await getFechamentoById(fechamentoId);

  if (!fechamento) {
    return null;
  }

  const [extratos, contasPagar, contasReceber, arquivos] = await Promise.all([
    listExtratosByFechamento(fechamentoId),
    listContasPagarByFechamento(fechamentoId),
    listContasReceberByFechamento(fechamentoId),
    listArquivosByFechamento(fechamentoId)
  ]);
  const quantidadeArquivos = arquivos.length;

  const hoje = new Date();
  const entradas = extratos.filter((item) => asNumber(item.valor) > 0);
  const saidas = extratos.filter((item) => asNumber(item.valor) < 0);

  const entradasRealizadas = sumValores(entradas, (item) => asNumber(item.valor));
  const saidasRealizadas = sumValores(saidas, (item) => Math.abs(asNumber(item.valor)));
  const resultadoCaixa = entradasRealizadas - saidasRealizadas;

  const ultimoExtrato = extratos.at(-1);
  const saldoFinal = ultimoExtrato ? asNumber(ultimoExtrato.saldo) : 0;
  const saldoInicial = saldoFinal - resultadoCaixa;

  const contasReceberAbertas = contasReceber.filter(
    (item) => item.situacao === SituacaoConta.PENDENTE || item.situacao === SituacaoConta.VENCIDO
  );
  const contasPagarAbertas = contasPagar.filter(
    (item) => item.situacao === SituacaoConta.PENDENTE || item.situacao === SituacaoConta.VENCIDO
  );

  const totalReceberAberto = sumValores(contasReceberAbertas, (item) => asNumber(item.valor));
  const totalPagarAberto = sumValores(contasPagarAbertas, (item) => asNumber(item.valor));

  const receitasPorCategoriaMap = new Map<string, number>();
  const saidasPorCategoriaMap = new Map<string, number>();

  const valoresPorGrupo: Record<GrupoGerencial, number> = {
    RECEITA: 0,
    CUSTO_VARIAVEL: 0,
    DESPESA_FIXA: 0,
    RESULTADO_FINANCEIRO: 0,
    RETIRADA: 0,
    INVESTIMENTO: 0,
    IMPOSTOS_TAXAS: 0,
    NAO_CLASSIFICADO: 0
  };

  for (const extrato of extratos) {
    const valor = asNumber(extrato.valor);
    const categoria = extrato.categoria || "SEM_CATEGORIA";

    if (valor > 0) {
      receitasPorCategoriaMap.set(categoria, (receitasPorCategoriaMap.get(categoria) ?? 0) + valor);
    }

    if (valor < 0) {
      saidasPorCategoriaMap.set(categoria, (saidasPorCategoriaMap.get(categoria) ?? 0) + Math.abs(valor));
    }

    const grupo = classificarGrupoGerencial({
      categoria: extrato.categoria,
      descricao: extrato.descricao,
      valor
    });

    if (valor > 0 && grupo === "RECEITA") {
      valoresPorGrupo.RECEITA += valor;
      continue;
    }

    if (valor < 0) {
      valoresPorGrupo[grupo] += Math.abs(valor);
    }
  }

  const receitasPorCategoria = [...receitasPorCategoriaMap.entries()]
    .map(([categoria, valor]) => ({
      categoria,
      valor,
      participacao: entradasRealizadas > 0 ? valor / entradasRealizadas : 0
    }))
    .sort((a, b) => b.valor - a.valor);

  const saidasPorCategoria = [...saidasPorCategoriaMap.entries()]
    .map(([categoria, valor]) => ({
      categoria,
      valor,
      participacao: saidasRealizadas > 0 ? valor / saidasRealizadas : 0
    }))
    .sort((a, b) => b.valor - a.valor);

  const receitaBruta = valoresPorGrupo.RECEITA;
  const impostosTaxas = valoresPorGrupo.IMPOSTOS_TAXAS;
  const receitaLiquida = receitaBruta - impostosTaxas;
  const custosVariaveis = valoresPorGrupo.CUSTO_VARIAVEL;
  const margemBruta = receitaLiquida - custosVariaveis;
  const margemBrutaPercentual = receitaLiquida > 0 ? margemBruta / receitaLiquida : null;
  const despesasFixas = valoresPorGrupo.DESPESA_FIXA;
  const resultadoOperacional = margemBruta - despesasFixas;
  const resultadoFinanceiro = -valoresPorGrupo.RESULTADO_FINANCEIRO;
  const retiradas = valoresPorGrupo.RETIRADA;
  const investimentos = valoresPorGrupo.INVESTIMENTO;
  const resultadoGerencial = resultadoOperacional + resultadoFinanceiro - retiradas - investimentos;

  const contasReceberPagas = contasReceber.filter((item) => item.situacao === SituacaoConta.RECEBIDO);
  const contasPagarPagas = contasPagar.filter((item) => item.situacao === SituacaoConta.PAGO);

  const contasReceberVencidas = contasReceberAbertas.filter((item) => item.vencimento < hoje);
  const contasPagarVencidas = contasPagarAbertas.filter((item) => item.vencimento < hoje);

  const indicadores = [
    {
      nome: "Margem Bruta",
      valor: percentual(margemBrutaPercentual),
      leitura:
        margemBrutaPercentual === null
          ? "Sem base de receita líquida para cálculo."
          : margemBrutaPercentual >= 0.3
            ? "Margem bruta saudável para o período."
            : "Margem bruta pressionada no período."
    },
    {
      nome: "Resultado Gerencial",
      valor: resultadoGerencial.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
      leitura: resultadoGerencial >= 0 ? "Resultado gerencial positivo." : "Resultado gerencial negativo."
    },
    {
      nome: "Resultado de Caixa",
      valor: resultadoCaixa.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
      leitura: resultadoCaixa >= 0 ? "Houve geração de caixa no mês." : "Houve consumo de caixa no mês."
    },
    {
      nome: "Despesas Fixas / Receita Líquida",
      valor: percentual(safeDivide(despesasFixas, receitaLiquida)),
      leitura:
        receitaLiquida > 0 && despesasFixas / receitaLiquida > 0.35
          ? "Peso elevado de despesas fixas sobre a receita líquida."
          : "Peso de despesas fixas dentro da faixa esperada."
    },
    {
      nome: "Retiradas / Receita Bruta",
      valor: percentual(safeDivide(retiradas, receitaBruta)),
      leitura:
        receitaBruta > 0 && retiradas / receitaBruta > 0.15
          ? "Retiradas relevantes para o nível de receita."
          : "Retiradas proporcionais ao nível de receita."
    },
    {
      nome: "A receber em aberto / Receita Bruta",
      valor: percentual(safeDivide(totalReceberAberto, receitaBruta)),
      leitura: "Mede o peso dos recebíveis em aberto frente à receita bruta."
    },
    {
      nome: "A pagar em aberto / Receita Bruta",
      valor: percentual(safeDivide(totalPagarAberto, receitaBruta)),
      leitura: "Mede o peso das obrigações em aberto frente à receita bruta."
    },
    {
      nome: "Cobertura de Caixa estimada",
      valor: safeDivide(saldoFinal, saidasRealizadas)
        ? `${(saldoFinal / saidasRealizadas).toFixed(2)} mês(es)`
        : "N/A",
      leitura:
        saidasRealizadas > 0
          ? "Estimativa simples de quantos meses de saída o saldo final cobre."
          : "Sem saídas no período para estimar cobertura."
    }
  ];

  const naoClassificado = valoresPorGrupo.NAO_CLASSIFICADO;
  const shareNaoClassificado = safeDivide(naoClassificado, saidasRealizadas) ?? 0;

  const diagnostico: AnaliseGerencial["diagnostico"] = {
    pontosPositivos: [],
    pontosAtencao: [],
    riscos: [],
    recomendacoes: []
  };

  if (resultadoCaixa > 0) {
    diagnostico.pontosPositivos.push("O caixa fechou positivo no período.");
  }
  if (resultadoCaixa < 0) {
    diagnostico.pontosAtencao.push("O caixa consumiu recursos no período.");
  }
  if (totalReceberAberto > totalPagarAberto) {
    diagnostico.pontosPositivos.push("A posição futura conhecida é positiva.");
  }
  if (totalPagarAberto > totalReceberAberto) {
    diagnostico.riscos.push("As obrigações em aberto superam os recebíveis conhecidos.");
  }
  if (receitaBruta > 0 && retiradas / receitaBruta > 0.15) {
    diagnostico.pontosAtencao.push("Retiradas representam parcela relevante da receita.");
  }
  if (receitaLiquida > 0 && despesasFixas / receitaLiquida > 0.35) {
    diagnostico.pontosAtencao.push("Despesas fixas têm peso elevado sobre a receita líquida.");
  }
  if (shareNaoClassificado >= 0.2) {
    diagnostico.recomendacoes.push(
      "Revisar plano de contas/categorias para melhorar leitura gerencial."
    );
  }

  const observacoes: string[] = [];
  if (!extratos.length) {
    observacoes.push("Extrato bancário não importado: resultado de caixa e saldo final podem ficar incompletos.");
  }
  if (!contasPagar.length) {
    observacoes.push("Sem contas a pagar importadas para análise de obrigações futuras.");
  }
  if (!contasReceber.length) {
    observacoes.push("Sem contas a receber importadas para análise de posição futura conhecida.");
  }
  if (shareNaoClassificado >= 0.2) {
    observacoes.push("Volume relevante de saídas sem classificação gerencial precisa.");
  }
  observacoes.push(
    "Leitura gerencial aproximada: depende da qualidade das categorias das bases exportadas do ERP e não substitui contabilidade formal."
  );

  return {
    fechamento,
    resumoExecutivo: {
      saldoInicial,
      entradasRealizadas,
      saidasRealizadas,
      resultadoCaixa,
      saldoFinal,
      contasAReceberAbertas: totalReceberAberto,
      contasAPagarAbertas: totalPagarAberto,
      posicaoFuturaConhecida: totalReceberAberto - totalPagarAberto
    },
    resultadoGerencial: {
      receitaBruta,
      impostosTaxas,
      receitaLiquida,
      custosVariaveis,
      margemBruta,
      margemBrutaPercentual,
      despesasFixas,
      resultadoOperacional,
      resultadoFinanceiro,
      retiradas,
      investimentos,
      resultadoGerencial
    },
    receitasPorCategoria,
    saidasPorCategoria,
    fluxoCaixa: {
      saldoInicial,
      entradasOperacionais: receitaBruta,
      saidasOperacionais: custosVariaveis + despesasFixas + impostosTaxas,
      saidasFinanceiras: valoresPorGrupo.RESULTADO_FINANCEIRO,
      investimentos,
      retiradas,
      saldoFinal
    },
    contasReceber: {
      totalRecebido: sumValores(contasReceberPagas, (item) => asNumber(item.valor)),
      totalAberto: totalReceberAberto,
      vencidas: sumValores(contasReceberVencidas, (item) => asNumber(item.valor)),
      aVencer: sumValores(
        contasReceberAbertas.filter((item) => item.vencimento >= hoje),
        (item) => asNumber(item.valor)
      ),
      proximas: contasReceberAbertas.slice(0, 10)
    },
    contasPagar: {
      totalPago: sumValores(contasPagarPagas, (item) => asNumber(item.valor)),
      totalAberto: totalPagarAberto,
      vencidas: sumValores(contasPagarVencidas, (item) => asNumber(item.valor)),
      aVencer: sumValores(
        contasPagarAbertas.filter((item) => item.vencimento >= hoje),
        (item) => asNumber(item.valor)
      ),
      proximas: contasPagarAbertas.slice(0, 10)
    },
    indicadores,
    diagnostico,
    qualidadeBase: {
      possuiExtrato: extratos.length > 0,
      possuiContasPagar: contasPagar.length > 0,
      possuiContasReceber: contasReceber.length > 0,
      quantidadeArquivos,
      observacoes
    }
  };
}
