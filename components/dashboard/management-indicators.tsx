import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function ManagementIndicators({ indicadores }: { indicadores: Array<{ nome: string; valor: string; leitura: string }> }) {
  return (
    <Card>
      <CardHeader><CardTitle>Indicadores Gerenciais</CardTitle></CardHeader>
      <CardContent className="overflow-x-auto">
        <Table><TableHeader><TableRow><TableHead>Indicador</TableHead><TableHead>Resultado</TableHead><TableHead>Leitura</TableHead></TableRow></TableHeader><TableBody>{indicadores.map((item) => <TableRow key={item.nome}><TableCell>{item.nome}</TableCell><TableCell>{item.valor}</TableCell><TableCell>{item.leitura}</TableCell></TableRow>)}</TableBody></Table>
      </CardContent>
    </Card>
  );
}
