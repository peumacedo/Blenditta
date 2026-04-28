import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function DreCompositionChart({
  receitaBruta,
  custosVariaveis,
  despesasFixas,
  impostosTaxas
}: {
  receitaBruta: number;
  custosVariaveis: number;
  despesasFixas: number;
  impostosTaxas: number;
}) {
  const base = receitaBruta > 0 ? receitaBruta : 1;
  const items = [
    { nome: "Impostos/Taxas", valor: impostosTaxas, cor: "#92400e" },
    { nome: "Custos Variáveis", valor: custosVariaveis, cor: "#b45309" },
    { nome: "Despesas Fixas", valor: despesasFixas, cor: "#78716c" }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Composição da DRE</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => (
          <div key={item.nome}>
            <div className="mb-1 flex justify-between text-xs">
              <span>{item.nome}</span>
              <span>{((item.valor / base) * 100).toFixed(1)}%</span>
            </div>
            <div className="h-3 rounded bg-sand-200">
              <div className="h-3 rounded" style={{ width: `${Math.min(100, (item.valor / base) * 100)}%`, backgroundColor: item.cor }} />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
