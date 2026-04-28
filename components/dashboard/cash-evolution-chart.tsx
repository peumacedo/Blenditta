import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCompetencia, formatCurrency } from "@/lib/fechamentos";

export function CashEvolutionChart({ historico }: { historico: Array<{ competencia: Date; entradas: number; saidas: number; saldoFinal: number }> }) {
  const width = 640;
  const height = 220;
  const padding = 24;
  const maxSaldo = Math.max(...historico.map((item) => item.saldoFinal), 1);
  const maxFluxo = Math.max(...historico.map((item) => Math.max(item.entradas, item.saidas)), 1);
  const stepX = historico.length > 1 ? (width - padding * 2) / (historico.length - 1) : 0;
  const saldoPoints = historico
    .map((item, index) => {
      const x = padding + stepX * index;
      const y = height - padding - (item.saldoFinal / maxSaldo) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <Card>
      <CardHeader><CardTitle>Evolução de Caixa (Histórico)</CardTitle></CardHeader>
      <CardContent className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Saldo final por mês</p>
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full rounded-md border bg-white p-2">
            <polyline fill="none" stroke="#6F4E37" strokeWidth="3" points={saldoPoints} />
            {historico.map((item, index) => {
              const x = padding + stepX * index;
              const y = height - padding - (item.saldoFinal / maxSaldo) * (height - padding * 2);
              return <circle key={item.competencia.toISOString()} cx={x} cy={y} r="4" fill="#6F4E37" />;
            })}
          </svg>
          {historico.map((item) => <div key={item.competencia.toISOString()} className="flex justify-between text-xs"><span>{formatCompetencia(item.competencia)}</span><span>{formatCurrency(item.saldoFinal)}</span></div>)}
        </div>
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Entradas x saídas por mês</p>
          <div className="space-y-2">
            {historico.map((item) => (
              <div key={`f-${item.competencia.toISOString()}`} className="space-y-1">
                <p className="text-xs">{formatCompetencia(item.competencia)}</p>
                <div className="relative h-4 rounded bg-sand-200">
                  <div className="absolute inset-y-0 left-0 rounded bg-emerald-700" style={{ width: `${(item.entradas / maxFluxo) * 100}%` }} />
                  <div className="absolute inset-y-0 left-0 rounded bg-terracotta-500/70" style={{ width: `${(item.saidas / maxFluxo) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
