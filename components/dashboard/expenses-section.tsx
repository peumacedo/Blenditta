import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCategoryLabel, formatCurrency } from "@/lib/fechamentos";

const criticalColors = { normal: "bg-stone-500", atencao: "bg-amber-700", critico: "bg-red-700" };

export function ExpensesSection({ items }: { items: Array<{ categoria: string; valor: number; participacao: number; mom: number | null; criticidade: "normal" | "atencao" | "critico" }> }) {
  const maxValor = Math.max(...items.map((item) => item.valor), 1);

  return (
    <Card>
      <CardHeader><CardTitle>Despesas e Saídas por Categoria</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        {items.slice(0, 6).map((item) => <div key={item.categoria}><div className="mb-1 flex items-center justify-between text-sm"><span>{formatCategoryLabel(item.categoria)} · {item.criticidade}</span><span>{formatCurrency(item.valor)} · {(item.participacao * 100).toFixed(1)}%</span></div><div className="h-2 rounded bg-sand-200"><div className={`h-2 rounded ${criticalColors[item.criticidade]}`} style={{ width: `${(item.valor / maxValor) * 100}%` }} /></div></div>)}
      </CardContent>
    </Card>
  );
}
