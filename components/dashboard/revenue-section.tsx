import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCategoryLabel, formatCurrency } from "@/lib/fechamentos";

const fpct = (v: number | null) => (v === null ? "MoM indisponível" : `${v >= 0 ? "+" : ""}${(v * 100).toFixed(1)}%`);

export function RevenueSection({ items }: { items: Array<{ categoria: string; valor: number; participacao: number; mom: number | null }> }) {
  const top = items[0];
  const maxValor = Math.max(...items.map((item) => item.valor), 1);

  return (
    <Card>
      <CardHeader><CardTitle>Receitas por Categoria</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        {top ? <p className="text-sm text-muted-foreground">Maior fonte: <strong>{formatCategoryLabel(top.categoria)}</strong> ({(top.participacao * 100).toFixed(1)}%).</p> : null}
        <div className="space-y-2 text-sm">
          {items.slice(0, 6).map((item) => <div key={item.categoria}><div className="mb-1 flex items-center justify-between"><span>{formatCategoryLabel(item.categoria)}</span><span>{formatCurrency(item.valor)} · {(item.participacao * 100).toFixed(1)}% · {fpct(item.mom)}</span></div><div className="h-2 rounded bg-sand-200"><div className="h-2 rounded bg-coffee-700" style={{ width: `${(item.valor / maxValor) * 100}%` }} /></div></div>)}
        </div>
      </CardContent>
    </Card>
  );
}
