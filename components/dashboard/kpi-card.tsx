import { formatCurrency } from "@/lib/fechamentos";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function formatPct(value: number | null) {
  if (value === null) return "MoM indisponível";
  return `${value >= 0 ? "+" : ""}${(value * 100).toFixed(1)}% MoM`;
}

export function KpiCard({ item }: { item: { titulo: string; valor: number; variacaoMoM: number | null; tone: "positive" | "negative" | "neutral"; microtexto: string; descricao: string } }) {
  const toneClass = item.tone === "positive" ? "text-emerald-700" : item.tone === "negative" ? "text-rose-700" : "text-muted-foreground";

  return (
    <Card title={item.descricao} className="bg-card/95">
      <CardHeader className="p-4 pb-2">
        <CardDescription>{item.titulo}</CardDescription>
        <CardTitle className="text-lg">{formatCurrency(item.valor)}</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-0 text-xs">
        <p className={toneClass}>{formatPct(item.variacaoMoM)}</p>
        <p className="text-muted-foreground">{item.microtexto}</p>
      </CardContent>
    </Card>
  );
}
