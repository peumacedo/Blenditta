import { FechamentoStatus, SituacaoConta } from "@prisma/client";

import { getAnaliseGerencial } from "@/lib/analise-gerencial";
import { listFechamentos } from "@/lib/data-source";

function pct(current: number, previous: number) {
  if (!previous) return null;
  return (current - previous) / Math.abs(previous);
}

function avg(values: number[]) {
  if (!values.length) return null;
  return values.reduce((acc, item) => acc + item, 0) / values.length;
}

function startOfMonth(value: Date) {
  return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), 1));
}

function daysFromToday(date: Date) {
  const now = new Date();
  const midnight = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const target = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  return Math.round((target - midnight) / (1000 * 60 * 60 * 24));
}


export type DashboardViewModel = {
  analiseAtual: Awaited<ReturnType<typeof getAnaliseGerencial>>;
  historico: Array<{ competencia: Date; entradas: number; saidas: number; saldoFinal: number; resultadoGerencial: number }>;
  comparativos: {
    mesAnterior: null | { competencia: Date; variacaoSaldoFinal: number | null; variacaoEntradas: number | null; variacaoSaidas: number | null; variacaoResultadoGerencial: number | null };
    media3Meses: null | { saldoFinal: number | null; entradas: number | null; saidas: number | null; resultadoGerencial: number | null };
    yoy: null | { competencia: Date; variacaoSaldoFinal: number | null; variacaoResultadoGerencial: number | null };
  };
  kpis: Array<{ key: string; titulo: string; valor: number; variacaoMoM: number | null; tone: "positive" | "negative" | "neutral"; microtexto: string; descricao: string }>;
  dreLinhas: Array<{ nome: string; valor: number; vertical: number | null; mom: number | null; observacao: string }>;
  leituraExecutiva: string[];
  receitasRanking: Array<{ categoria: string; valor: number; participacao: number; mom: number | null }>;
  despesasRanking: Array<{ categoria: string; valor: number; participacao: number; mom: number | null; criticidade: "normal" | "atencao" | "critico" }>;
  receivablesRows: Array<{ id: string; cliente: string; vencimento: Date; valor: number; status: SituacaoConta; dias: number }>;
  payablesRows: Array<{ id: string; fornecedor: string; vencimento: Date; valor: number; status: SituacaoConta; dias: number }>;
  closingChecklist: Array<{ item: string; status: "Concluído" | "Parcial" | "Em andamento" | "Pendente" | "Não aplicável" }>;
};

export async function getDashboardViewModel(fechamentoId: string): Promise<DashboardViewModel | null> {
  const analiseAtual = await getAnaliseGerencial(fechamentoId);
  if (!analiseAtual) return null;

  const fechamentos = await listFechamentos();
  const historicoRaw = (
    await Promise.all(
      fechamentos.map(async (f) => {
        const analise = await getAnaliseGerencial(f.id);
        if (!analise) return null;
        return {
          competencia: analise.fechamento.competencia,
          entradas: analise.resumoExecutivo.entradasRealizadas,
          saidas: analise.resumoExecutivo.saidasRealizadas,
          saldoFinal: analise.resumoExecutivo.saldoFinal,
          resultadoGerencial: analise.resultadoGerencial.resultadoGerencial,
          analise
        };
      })
    )
  ).filter((item): item is NonNullable<typeof item> => Boolean(item));

  const historico = historicoRaw
    .map((item) => ({
      competencia: item.competencia,
      entradas: item.entradas,
      saidas: item.saidas,
      saldoFinal: item.saldoFinal,
      resultadoGerencial: item.resultadoGerencial
    }))
    .sort((a, b) => a.competencia.getTime() - b.competencia.getTime());

  const atual = historicoRaw.find((item) => item.analise.fechamento.id === fechamentoId);
  if (!atual) return null;

  const anteriores = historicoRaw
    .filter((item) => item.competencia.getTime() < atual.competencia.getTime())
    .sort((a, b) => b.competencia.getTime() - a.competencia.getTime());
  const mesAnterior = anteriores[0] ?? null;

  const avgBase = anteriores.slice(0, 3);
  const media3Meses = avgBase.length >= 3
    ? {
        saldoFinal: avg(avgBase.map((item) => item.saldoFinal)),
        entradas: avg(avgBase.map((item) => item.entradas)),
        saidas: avg(avgBase.map((item) => item.saidas)),
        resultadoGerencial: avg(avgBase.map((item) => item.resultadoGerencial))
      }
    : null;

  const yoyTarget = startOfMonth(new Date(Date.UTC(atual.competencia.getUTCFullYear() - 1, atual.competencia.getUTCMonth(), 1))).getTime();
  const yoyBase = historicoRaw.find((item) => startOfMonth(item.competencia).getTime() === yoyTarget) ?? null;

  const receitasPrevMap = new Map<string, number>(
    (mesAnterior?.analise.receitasPorCategoria ?? []).map((item) => [item.categoria, item.valor])
  );
  const despesasPrevMap = new Map<string, number>(
    (mesAnterior?.analise.saidasPorCategoria ?? []).map((item) => [item.categoria, item.valor])
  );

  const comportamentoKpi: Record<string, "higher_is_better" | "higher_is_worse"> = {
    "saldo-inicial": "higher_is_better",
    entradas: "higher_is_better",
    saidas: "higher_is_worse",
    "resultado-caixa": "higher_is_better",
    "saldo-final": "higher_is_better",
    "receita-bruta": "higher_is_better",
    custos: "higher_is_worse",
    despesas: "higher_is_worse",
    "resultado-gerencial": "higher_is_better",
    cr: "higher_is_better",
    cp: "higher_is_worse",
    qualidade: "higher_is_worse"
  };

  const kpis = [
    ["saldo-inicial", "Saldo inicial", analiseAtual.resumoExecutivo.saldoInicial, "Base de caixa no início da competência."],
    ["entradas", "Entradas", analiseAtual.resumoExecutivo.entradasRealizadas, "Total de entradas realizadas no mês."],
    ["saidas", "Saídas", analiseAtual.resumoExecutivo.saidasRealizadas, "Total de saídas realizadas no mês."],
    ["resultado-caixa", "Resultado de caixa", analiseAtual.resumoExecutivo.resultadoCaixa, "Diferença entre entradas e saídas."],
    ["saldo-final", "Saldo final", analiseAtual.resumoExecutivo.saldoFinal, "Saldo final informado no extrato."],
    ["receita-bruta", "Receita bruta", analiseAtual.resultadoGerencial.receitaBruta, "Receitas classificadas como operacionais."],
    ["custos", "Custos variáveis", analiseAtual.resultadoGerencial.custosVariaveis, "Custos diretamente ligados às vendas."],
    ["despesas", "Despesas fixas", analiseAtual.resultadoGerencial.despesasFixas, "Estrutura fixa da operação."],
    ["resultado-gerencial", "Resultado gerencial", analiseAtual.resultadoGerencial.resultadoGerencial, "Resultado após retiradas e investimentos."],
    ["cr", "Contas a receber", analiseAtual.resumoExecutivo.contasAReceberAbertas, "Total de recebíveis pendentes e vencidos."],
    ["cp", "Contas a pagar", analiseAtual.resumoExecutivo.contasAPagarAbertas, "Total de obrigações pendentes e vencidas."],
    ["qualidade", "Pendências de base", analiseAtual.qualidadeBase.observacoes.length, "Quantidade de observações de qualidade da base."]
  ].map(([key, titulo, valor, descricao]) => {
    const previousValue =
      key === "saldo-final"
        ? mesAnterior?.saldoFinal
        : key === "entradas"
          ? mesAnterior?.entradas
          : key === "saidas"
            ? mesAnterior?.saidas
            : key === "resultado-gerencial"
              ? mesAnterior?.resultadoGerencial
              : null;

    const variacaoMoM = typeof previousValue === "number" ? pct(Number(valor), previousValue) : null;
    const comportamento = comportamentoKpi[String(key)] ?? "higher_is_better";
    const tone: "positive" | "negative" | "neutral" =
      variacaoMoM === null
        ? "neutral"
        : variacaoMoM === 0
          ? "neutral"
          : comportamento === "higher_is_better"
            ? variacaoMoM > 0
              ? "positive"
              : "negative"
            : variacaoMoM > 0
              ? "negative"
              : "positive";

    return {
      key: String(key),
      titulo: String(titulo),
      valor: Number(valor),
      variacaoMoM,
      tone,
      microtexto: variacaoMoM === null ? "Sem comparação mensal disponível." : `Variação de ${(variacaoMoM * 100).toFixed(1)}% vs mês anterior.`,
      descricao: String(descricao)
    };
  });

  const receitaBase = analiseAtual.resultadoGerencial.receitaBruta;
  const receitaLiquida = analiseAtual.resultadoGerencial.receitaLiquida;

  const dreAtual = {
    receitaBruta: analiseAtual.resultadoGerencial.receitaBruta,
    impostosTaxas: -analiseAtual.resultadoGerencial.impostosTaxas,
    receitaLiquida: analiseAtual.resultadoGerencial.receitaLiquida,
    custosVariaveis: -analiseAtual.resultadoGerencial.custosVariaveis,
    margemBruta: analiseAtual.resultadoGerencial.margemBruta,
    despesasFixas: -analiseAtual.resultadoGerencial.despesasFixas,
    resultadoOperacional: analiseAtual.resultadoGerencial.resultadoOperacional,
    resultadoFinanceiro: analiseAtual.resultadoGerencial.resultadoFinanceiro,
    retiradas: -analiseAtual.resultadoGerencial.retiradas,
    investimentos: -analiseAtual.resultadoGerencial.investimentos,
    resultadoGerencial: analiseAtual.resultadoGerencial.resultadoGerencial
  };
  const dreAnterior = mesAnterior
    ? {
        receitaBruta: mesAnterior.analise.resultadoGerencial.receitaBruta,
        impostosTaxas: -mesAnterior.analise.resultadoGerencial.impostosTaxas,
        receitaLiquida: mesAnterior.analise.resultadoGerencial.receitaLiquida,
        custosVariaveis: -mesAnterior.analise.resultadoGerencial.custosVariaveis,
        margemBruta: mesAnterior.analise.resultadoGerencial.margemBruta,
        despesasFixas: -mesAnterior.analise.resultadoGerencial.despesasFixas,
        resultadoOperacional: mesAnterior.analise.resultadoGerencial.resultadoOperacional,
        resultadoFinanceiro: mesAnterior.analise.resultadoGerencial.resultadoFinanceiro,
        retiradas: -mesAnterior.analise.resultadoGerencial.retiradas,
        investimentos: -mesAnterior.analise.resultadoGerencial.investimentos,
        resultadoGerencial: mesAnterior.analise.resultadoGerencial.resultadoGerencial
      }
    : null;

  const dreLinhas = [
    ["Receita Bruta", analiseAtual.resultadoGerencial.receitaBruta, receitaBase, "Base total de faturamento classificado."],
    ["(-) Impostos e taxas", -analiseAtual.resultadoGerencial.impostosTaxas, receitaBase, "Tributos e taxas sobre operação."],
    ["= Receita Líquida", analiseAtual.resultadoGerencial.receitaLiquida, receitaBase, "Receita após impostos e taxas."],
    ["(-) Custos Variáveis", -analiseAtual.resultadoGerencial.custosVariaveis, receitaLiquida, "Custos ligados ao volume de vendas."],
    ["= Margem Bruta", analiseAtual.resultadoGerencial.margemBruta, receitaLiquida, "Resultado após custos variáveis."],
    ["(-) Despesas Fixas", -analiseAtual.resultadoGerencial.despesasFixas, receitaLiquida, "Estrutura fixa mensal."],
    ["= Resultado Operacional", analiseAtual.resultadoGerencial.resultadoOperacional, receitaLiquida, "Resultado da operação principal."],
    ["(+/-) Resultado Financeiro", analiseAtual.resultadoGerencial.resultadoFinanceiro, receitaLiquida, "Juros e tarifas financeiras."],
    ["(-) Retiradas", -analiseAtual.resultadoGerencial.retiradas, receitaLiquida, "Retiradas não operacionais."],
    ["(-) Investimentos", -analiseAtual.resultadoGerencial.investimentos, receitaLiquida, "Aplicações pontuais de capital."],
    ["= Resultado Gerencial", analiseAtual.resultadoGerencial.resultadoGerencial, receitaLiquida, "Indicador final para gestão." ]
  ].map(([nome, valor, base, observacao]) => {
    const momMap: Record<string, number | null> = {
      "Receita Bruta": dreAnterior ? pct(dreAtual.receitaBruta, dreAnterior.receitaBruta) : null,
      "(-) Impostos e taxas": dreAnterior ? pct(dreAtual.impostosTaxas, dreAnterior.impostosTaxas) : null,
      "= Receita Líquida": dreAnterior ? pct(dreAtual.receitaLiquida, dreAnterior.receitaLiquida) : null,
      "(-) Custos Variáveis": dreAnterior ? pct(dreAtual.custosVariaveis, dreAnterior.custosVariaveis) : null,
      "= Margem Bruta": dreAnterior ? pct(dreAtual.margemBruta, dreAnterior.margemBruta) : null,
      "(-) Despesas Fixas": dreAnterior ? pct(dreAtual.despesasFixas, dreAnterior.despesasFixas) : null,
      "= Resultado Operacional": dreAnterior ? pct(dreAtual.resultadoOperacional, dreAnterior.resultadoOperacional) : null,
      "(+/-) Resultado Financeiro": dreAnterior ? pct(dreAtual.resultadoFinanceiro, dreAnterior.resultadoFinanceiro) : null,
      "(-) Retiradas": dreAnterior ? pct(dreAtual.retiradas, dreAnterior.retiradas) : null,
      "(-) Investimentos": dreAnterior ? pct(dreAtual.investimentos, dreAnterior.investimentos) : null,
      "= Resultado Gerencial": dreAnterior ? pct(dreAtual.resultadoGerencial, dreAnterior.resultadoGerencial) : null
    };

    return {
    nome: String(nome),
    valor: Number(valor),
    vertical: Number(base) > 0 ? Number(valor) / Number(base) : null,
    mom: momMap[String(nome)] ?? null,
    observacao: Number(base) > 0 ? String(observacao) : "N/A sem receita base no período."
    };
  });

  const topDespesa = analiseAtual.saidasPorCategoria[0];

  const leituraExecutiva = [
    analiseAtual.resumoExecutivo.resultadoCaixa >= 0
      ? "O caixa encerrou o mês com geração positiva, reforçando a liquidez da operação."
      : "O caixa encerrou o mês com consumo líquido, exigindo atenção na execução financeira.",
    analiseAtual.resultadoGerencial.margemBrutaPercentual !== null && analiseAtual.resultadoGerencial.margemBrutaPercentual >= 0.35
      ? "A margem bruta ficou em faixa saudável para o modelo de torrefação e distribuição."
      : "A margem bruta ficou pressionada e sugere revisar mix, preço e custos variáveis.",
    analiseAtual.contasPagar.vencidas > analiseAtual.resumoExecutivo.saidasRealizadas * 0.15
      ? "Há volume relevante de contas a pagar vencidas, com potencial risco de continuidade operacional."
      : "As contas a pagar vencidas estão sob controle em relação ao porte mensal.",
    analiseAtual.contasReceber.vencidas > analiseAtual.resumoExecutivo.entradasRealizadas * 0.1
      ? "Existe concentração de recebíveis vencidos e possível pressão sobre o caixa futuro."
      : "A inadimplência de contas a receber está em patamar administrável.",
    topDespesa && topDespesa.participacao > 0.3
      ? `A categoria ${topDespesa.categoria.replace(/_/g, " ")} concentrou alta parcela das saídas do mês.`
      : "A distribuição de despesas está mais diluída entre categorias, sem concentração extrema."
  ];

  const receivablesRows = analiseAtual.contasReceber.proximas.map((item) => ({
    id: item.id,
    cliente: item.cliente,
    vencimento: item.vencimento,
    valor: item.valor,
    status: item.situacao,
    dias: daysFromToday(item.vencimento)
  }));

  const payablesRows = analiseAtual.contasPagar.proximas.map((item) => ({
    id: item.id,
    fornecedor: item.fornecedor,
    vencimento: item.vencimento,
    valor: item.valor,
    status: item.situacao,
    dias: daysFromToday(item.vencimento)
  }));

  const pendenciasCriticas = analiseAtual.contasPagar.vencidas + analiseAtual.contasReceber.vencidas > 0;

  const closingChecklist: DashboardViewModel["closingChecklist"] = [
    { item: "Arquivos enviados", status: analiseAtual.qualidadeBase.quantidadeArquivos >= 3 ? "Concluído" : analiseAtual.qualidadeBase.quantidadeArquivos > 0 ? "Parcial" : "Pendente" },
    { item: "Extrato importado", status: analiseAtual.qualidadeBase.possuiExtrato ? "Concluído" : "Pendente" },
    { item: "Contas a pagar importadas", status: analiseAtual.qualidadeBase.possuiContasPagar ? "Concluído" : "Pendente" },
    { item: "Contas a receber importadas", status: analiseAtual.qualidadeBase.possuiContasReceber ? "Concluído" : "Pendente" },
    { item: "Categorias classificadas", status: analiseAtual.qualidadeBase.observacoes.some((obs) => obs.includes("classificação")) ? "Parcial" : "Concluído" },
    { item: "Pendências críticas", status: pendenciasCriticas ? "Em andamento" : "Concluído" },
    { item: "Fechamento mensal", status: analiseAtual.fechamento.status === FechamentoStatus.FECHADO ? "Concluído" : "Em andamento" }
  ];

  return {
    analiseAtual,
    historico,
    comparativos: {
      mesAnterior: mesAnterior
        ? {
            competencia: mesAnterior.competencia,
            variacaoSaldoFinal: pct(atual.saldoFinal, mesAnterior.saldoFinal),
            variacaoEntradas: pct(atual.entradas, mesAnterior.entradas),
            variacaoSaidas: pct(atual.saidas, mesAnterior.saidas),
            variacaoResultadoGerencial: pct(atual.resultadoGerencial, mesAnterior.resultadoGerencial)
          }
        : null,
      media3Meses,
      yoy: yoyBase
        ? {
            competencia: yoyBase.competencia,
            variacaoSaldoFinal: pct(atual.saldoFinal, yoyBase.saldoFinal),
            variacaoResultadoGerencial: pct(atual.resultadoGerencial, yoyBase.resultadoGerencial)
          }
        : null
    },
    kpis,
    dreLinhas,
    leituraExecutiva,
    receitasRanking: analiseAtual.receitasPorCategoria.map((item) => ({
      ...item,
      mom: receitasPrevMap.has(item.categoria) ? pct(item.valor, receitasPrevMap.get(item.categoria) ?? 0) : null
    })),
    despesasRanking: analiseAtual.saidasPorCategoria.map((item) => {
      const criticidade: "normal" | "atencao" | "critico" = item.participacao >= 0.35 ? "critico" : item.participacao >= 0.2 ? "atencao" : "normal";
      return {
        ...item,
        mom: despesasPrevMap.has(item.categoria) ? pct(item.valor, despesasPrevMap.get(item.categoria) ?? 0) : null,
        criticidade
      };
    }),
    receivablesRows,
    payablesRows,
    closingChecklist
  };
}
