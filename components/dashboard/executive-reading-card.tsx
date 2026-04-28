import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ExecutiveReadingCard({ frases }: { frases: string[] }) {
  return (
    <Card>
      <CardHeader><CardTitle>Leitura Executiva do Mês</CardTitle></CardHeader>
      <CardContent>
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          {frases.slice(0, 5).map((frase) => <li key={frase}>{frase}</li>)}
        </ul>
      </CardContent>
    </Card>
  );
}
