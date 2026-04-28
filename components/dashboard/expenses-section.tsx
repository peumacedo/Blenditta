import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCategoryLabel, formatCurrency } from "@/lib/fechamentos";

const criticalColors = { normal: "bg-stone-500", atencao: "bg-amber-700", critico: "bg-red-700" };

export function ExpensesSection({ items }: { items: Array<{ categoria: string; valor: number; participacao: number; mom: number | null; criticidade: "normal" | "atencao" | "critico" }> }) {
  const maxValor = Math.max(...items.map((item) => item.valor), 1);
  const visible = items.slice(0, 6);
  const width = 520;
  const barHeight = 26;
  const height = visible.length * barHeight + 30;

  return (
    <Card>
      <CardHeader><CardTitle>Despesas e Saídas por Categoria</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full rounded-md border bg-white p-2">
          {visible.map((item, index) => {
            const y = 10 + index * barHeight;
            const barWidth = ((item.valor / maxValor) * (width - 190));
            const fill = item.criticidade === "critico" ? "#b91c1c" : item.criticidade === "atencao" ? "#b45309" : "#78716c";
            return (
              <g key={`chart-${item.categoria}`}>
                <text x="8" y={y + 15} fontSize="11" fill="#44403c">{formatCategoryLabel(item.categoria).slice(0, 24)}</text>
                <rect x="170" y={y + 4} width={barWidth} height="12" rx="4" fill={fill} />
              </g>
            );
          })}
        </svg>
        {visible.map((item) => <div key={item.categoria}><div className="mb-1 flex items-center justify-between text-sm"><span>{formatCategoryLabel(item.categoria)} · {item.criticidade}</span><span>{formatCurrency(item.valor)} · {(item.participacao * 100).toFixed(1)}%</span></div><div className="h-2 rounded bg-sand-200"><div className={`h-2 rounded ${criticalColors[item.criticidade]}`} style={{ width: `${(item.valor / maxValor) * 100}%` }} /></div></div>)}
      </CardContent>
    </Card>
  );
}
