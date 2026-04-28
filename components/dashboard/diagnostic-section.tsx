import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function DiagnosticSection({ diagnostico }: { diagnostico: { pontosPositivos: string[]; pontosAtencao: string[]; riscos: string[]; recomendacoes: string[] } }) {
  const sections = [
    ["Pontos positivos", diagnostico.pontosPositivos, "Sem destaques positivos automáticos para o período."],
    ["Pontos de atenção", diagnostico.pontosAtencao, "Sem alertas de atenção automática para o período."],
    ["Riscos", diagnostico.riscos, "Sem riscos críticos automáticos para o período."],
    ["Recomendações", diagnostico.recomendacoes, "Manter consistência das categorias e envio mensal completo."]
  ] as const;

  return (
    <Card>
      <CardHeader><CardTitle>Diagnóstico Gerencial</CardTitle></CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">{sections.map(([titulo, valores, fallback]) => <div key={titulo}><p className="mb-1 text-sm font-semibold">{titulo}</p><ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">{(valores.length ? valores : [fallback]).map((item) => <li key={item}>{item}</li>)}</ul></div>)}</CardContent>
    </Card>
  );
}
