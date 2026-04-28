import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCompetencia, formatCurrency } from "@/lib/fechamentos";

export function CashEvolutionChart({ historico }: { historico: Array<{ competencia: Date; entradas: number; saidas: number; saldoFinal: number }> }) {
  const maxSaldo = Math.max(...historico.map((item) => item.saldoFinal), 1);
  const maxFluxo = Math.max(...historico.map((item) => Math.max(item.entradas, item.saidas)), 1);

  return (
    <Card>
      <CardHeader><CardTitle>Evolução de Caixa (Histórico)</CardTitle></CardHeader>
      <CardContent className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Saldo final por mês</p>
          {historico.map((item) => <div key={item.competencia.toISOString()}><div className="mb-1 flex justify-between text-xs"><span>{formatCompetencia(item.competencia)}</span><span>{formatCurrency(item.saldoFinal)}</span></div><div className="h-2 rounded bg-sand-200"><div className="h-2 rounded bg-coffee-700" style={{ width: `${(item.saldoFinal / maxSaldo) * 100}%` }} /></div></div>)}
        </div>
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Entradas x saídas por mês</p>
          {historico.map((item) => <div key={`f-${item.competencia.toISOString()}`} className="space-y-1"><p className="text-xs">{formatCompetencia(item.competencia)}</p><div className="h-2 rounded bg-sand-200"><div className="h-2 rounded bg-emerald-700" style={{ width: `${(item.entradas / maxFluxo) * 100}%` }} /></div><div className="h-2 rounded bg-sand-200"><div className="h-2 rounded bg-terracotta-500" style={{ width: `${(item.saidas / maxFluxo) * 100}%` }} /></div></div>)}
        </div>
      </CardContent>
    </Card>
  );
}
