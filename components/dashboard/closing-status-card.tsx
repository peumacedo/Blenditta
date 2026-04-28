import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const statusColor = {
  "Concluído": "text-emerald-700",
  "Parcial": "text-amber-700",
  "Em andamento": "text-amber-700",
  "Pendente": "text-rose-700",
  "Não aplicável": "text-muted-foreground"
};

export function ClosingStatusCard({ items }: { items: Array<{ item: string; status: keyof typeof statusColor }> }) {
  return (
    <Card>
      <CardHeader><CardTitle>Status do Fechamento</CardTitle></CardHeader>
      <CardContent className="space-y-2 text-sm">{items.map((item) => <div key={item.item} className="flex justify-between border-b pb-1"><span>{item.item}</span><span className={statusColor[item.status]}>{item.status}</span></div>)}</CardContent>
    </Card>
  );
}
