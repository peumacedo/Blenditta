import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/fechamentos";

const pp = (v: number | null) => (v === null ? "N/A" : `${(v * 100).toFixed(1)}%`);

export function DreTable({ rows }: { rows: Array<{ nome: string; valor: number; vertical: number | null; mom: number | null; observacao: string }> }) {
  return (
    <Card>
      <CardHeader><CardTitle>DRE Gerencial Simplificada</CardTitle></CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader><TableRow><TableHead>Linha</TableHead><TableHead className="text-right">Valor</TableHead><TableHead className="text-right">% Vertical</TableHead><TableHead className="text-right">MoM</TableHead><TableHead>Observação</TableHead></TableRow></TableHeader>
          <TableBody>
            {rows.map((row) => <TableRow key={row.nome}><TableCell>{row.nome}</TableCell><TableCell className="text-right">{formatCurrency(row.valor)}</TableCell><TableCell className="text-right">{pp(row.vertical)}</TableCell><TableCell className="text-right">{pp(row.mom)}</TableCell><TableCell className="text-xs text-muted-foreground">{row.observacao}</TableCell></TableRow>)}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
