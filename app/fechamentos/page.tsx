export const dynamic = "force-dynamic";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  fechamentoStatusColor,
  fechamentoStatusLabel,
  formatCompetencia,
  formatDateTime
} from "@/lib/fechamentos";
import { listFechamentos } from "@/lib/data-source";

export default async function FechamentosPage() {
  const fechamentos = await listFechamentos();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Fechamentos mensais</CardTitle>
          <CardDescription>Controle de competências e acesso ao fluxo financeiro.</CardDescription>
        </div>
        <Link href="/fechamentos/novo" className={buttonVariants()}>
          Novo fechamento
        </Link>
      </CardHeader>

      <CardContent>
        <div className="overflow-hidden rounded-lg border border-slate-200">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Competência</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fechamentos.map((fechamento) => (
                <TableRow key={fechamento.id}>
                  <TableCell className="font-medium capitalize">
                    {formatCompetencia(fechamento.competencia)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={fechamentoStatusColor[fechamento.status]}>
                      {fechamentoStatusLabel[fechamento.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDateTime(fechamento.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/fechamentos/${fechamento.id}`}
                      className={buttonVariants({ size: "sm", variant: "outline" })}
                    >
                      Abrir
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
