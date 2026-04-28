import { notFound } from "next/navigation";

import { CashEvolutionChart } from "@/components/dashboard/cash-evolution-chart";
import { ClosingStatusCard } from "@/components/dashboard/closing-status-card";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardFilters } from "@/components/dashboard/dashboard-filters";
import { DiagnosticSection } from "@/components/dashboard/diagnostic-section";
import { DreTable } from "@/components/dashboard/dre-table";
import { DreCompositionChart } from "@/components/dashboard/dre-composition-chart";
import { EmptyState } from "@/components/dashboard/empty-state";
import { ExecutiveReadingCard } from "@/components/dashboard/executive-reading-card";
import { ExpensesSection } from "@/components/dashboard/expenses-section";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { ManagementIndicators } from "@/components/dashboard/management-indicators";
import { PayablesCard } from "@/components/dashboard/payables-card";
import { ReceivablesCard } from "@/components/dashboard/receivables-card";
import { RevenueSection } from "@/components/dashboard/revenue-section";
import { Card, CardContent } from "@/components/ui/card";
import { formatCompetencia } from "@/lib/fechamentos";
import { getDashboardViewModel } from "@/lib/dashboard-view-model";
import { isDemoMode } from "@/lib/env";

export default async function DashboardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const vm = await getDashboardViewModel(id);

  if (!vm) notFound();
  const analise = vm.analiseAtual!;

  const comparativoTexto = [
    vm.comparativos.mesAnterior
      ? `MoM disponível vs ${formatCompetencia(vm.comparativos.mesAnterior.competencia)}.`
      : "Dados históricos insuficientes para comparação.",
    vm.comparativos.media3Meses
      ? "Média dos últimos 3 meses calculada para métricas principais."
      : "Dados históricos insuficientes para média de 3 meses.",
    vm.comparativos.yoy
      ? `YoY disponível vs ${formatCompetencia(vm.comparativos.yoy.competencia)}.`
      : "Dados históricos insuficientes para comparação anual (YoY)."
  ];

  return (
    <div className="space-y-6">
      <DashboardHeader
        fechamentoId={id}
        competencia={analise.fechamento.competencia}
        empresa="Blenditta"
        status={analise.fechamento.status}
        geradoEm={new Date()}
        demoMode={isDemoMode}
      />

      <DashboardFilters
        competencias={vm.historico.map((item) => ({ label: formatCompetencia(item.competencia), value: item.competencia.toISOString() }))}
        categorias={[...new Set([...vm.receitasRanking.map((item) => item.categoria), ...vm.despesasRanking.map((item) => item.categoria)])].map((item) => ({ label: item, value: item }))}
        tipos={[
          { label: "Entrada", value: "entrada" },
          { label: "Saída", value: "saida" }
        ]}
        status={[
          { label: "Concluído", value: "Concluído" },
          { label: "Em andamento", value: "Em andamento" },
          { label: "Pendente", value: "Pendente" }
        ]}
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {vm.kpis.map((item) => <KpiCard key={item.key} item={item} />)}
      </div>

      <ExecutiveReadingCard frases={vm.leituraExecutiva} />

      <Card><CardContent className="p-4 text-sm text-muted-foreground">{comparativoTexto.map((t) => <p key={t}>{t}</p>)}</CardContent></Card>

      {vm.historico.length >= 2 ? <CashEvolutionChart historico={vm.historico} /> : <EmptyState title="Sem histórico suficiente" description="Dados históricos insuficientes para comparação." />}

      <DreTable rows={vm.dreLinhas} />
      <DreCompositionChart
        receitaBruta={analise.resultadoGerencial.receitaBruta}
        custosVariaveis={analise.resultadoGerencial.custosVariaveis}
        despesasFixas={analise.resultadoGerencial.despesasFixas}
        impostosTaxas={analise.resultadoGerencial.impostosTaxas}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {vm.receitasRanking.length ? <RevenueSection items={vm.receitasRanking} /> : <EmptyState title="Sem receitas" description="Não há receitas classificadas nesta competência." />}
        {vm.despesasRanking.length ? <ExpensesSection items={vm.despesasRanking} /> : <EmptyState title="Sem despesas" description="Não há saídas classificadas nesta competência." />}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {vm.receivablesRows.length ? (
          <ReceivablesCard
            rows={vm.receivablesRows}
            resumo={{
              vencido: analise.contasReceber.vencidas,
              aVencer: analise.contasReceber.aVencer,
              emAberto: analise.contasReceber.totalAberto,
              maior: Math.max(...vm.receivablesRows.map((item) => item.valor), 0)
            }}
          />
        ) : <EmptyState title="Sem contas a receber" description="Nenhuma conta a receber em aberto para o mês." />}

        {vm.payablesRows.length ? (
          <PayablesCard
            rows={vm.payablesRows}
            resumo={{
              vencido: analise.contasPagar.vencidas,
              aVencer: analise.contasPagar.aVencer,
              emAberto: analise.contasPagar.totalAberto,
              maior: Math.max(...vm.payablesRows.map((item) => item.valor), 0)
            }}
          />
        ) : <EmptyState title="Sem contas a pagar" description="Nenhuma conta a pagar em aberto para o mês." />}
      </div>

      <ManagementIndicators indicadores={analise.indicadores} />
      <DiagnosticSection diagnostico={analise.diagnostico} />
      <ClosingStatusCard items={vm.closingChecklist} />
    </div>
  );
}
