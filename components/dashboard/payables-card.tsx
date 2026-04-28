import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatDate, situacaoContaLabel } from "@/lib/fechamentos";

export function PayablesCard({ rows, resumo }: { rows: Array<{ id: string; fornecedor: string; vencimento: Date; valor: number; status: "PENDENTE" | "PAGO" | "RECEBIDO" | "VENCIDO"; dias: number }>; resumo: { vencido: number; aVencer: number; emAberto: number; maior: number } }) {
  return (
    <Card>
      <CardHeader><CardTitle>Contas a Pagar</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground">Vencido {formatCurrency(resumo.vencido)} · A vencer {formatCurrency(resumo.aVencer)} · Em aberto {formatCurrency(resumo.emAberto)} · Maior item {formatCurrency(resumo.maior)}</p>
        <div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Fornecedor/Despesa</TableHead><TableHead>Vencimento</TableHead><TableHead className="text-right">Valor</TableHead><TableHead>Status</TableHead><TableHead>Dias</TableHead></TableRow></TableHeader><TableBody>{rows.map((item) => <TableRow key={item.id}><TableCell>{item.fornecedor}</TableCell><TableCell>{formatDate(item.vencimento)}</TableCell><TableCell className="text-right">{formatCurrency(item.valor)}</TableCell><TableCell>{situacaoContaLabel[item.status]}</TableCell><TableCell>{item.dias < 0 ? `${Math.abs(item.dias)} em atraso` : `${item.dias} para vencer`}</TableCell></TableRow>)}</TableBody></Table></div>
      </CardContent>
    </Card>
  );
}
