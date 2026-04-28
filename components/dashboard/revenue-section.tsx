import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCategoryLabel, formatCurrency } from "@/lib/fechamentos";

const fpct = (v: number | null) => (v === null ? "MoM indisponível" : `${v >= 0 ? "+" : ""}${(v * 100).toFixed(1)}%`);

export function RevenueSection({ items }: { items: Array<{ categoria: string; valor: number; participacao: number; mom: number | null }> }) {
  const top = items[0];
  const width = 520;
  const barHeight = 26;
  const maxValor = Math.max(...items.map((item) => item.valor), 1);
  const visible = items.slice(0, 6);
  const height = visible.length * barHeight + 30;

  return (
    <Card>
      <CardHeader><CardTitle>Receitas por Categoria</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        {top ? <p className="text-sm text-muted-foreground">Maior fonte: <strong>{formatCategoryLabel(top.categoria)}</strong> ({(top.participacao * 100).toFixed(1)}%).</p> : null}
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full rounded-md border bg-white p-2">
          {visible.map((item, index) => {
            const y = 10 + index * barHeight;
            const barWidth = ((item.valor / maxValor) * (width - 190));
            return (
              <g key={`chart-${item.categoria}`}>
                <text x="8" y={y + 15} fontSize="11" fill="#6F4E37">{formatCategoryLabel(item.categoria).slice(0, 24)}</text>
                <rect x="170" y={y + 4} width={barWidth} height="12" rx="4" fill="#6F4E37" />
              </g>
            );
          })}
        </svg>
        <div className="space-y-2 text-sm">
          {visible.map((item) => <div key={item.categoria}><div className="mb-1 flex items-center justify-between"><span>{formatCategoryLabel(item.categoria)}</span><span>{formatCurrency(item.valor)} · {(item.participacao * 100).toFixed(1)}% · {fpct(item.mom)}</span></div></div>)}
        </div>
      </CardContent>
    </Card>
  );
}
