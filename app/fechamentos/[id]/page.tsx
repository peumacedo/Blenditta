import Link from "next/link";
import { notFound } from "next/navigation";

import { StepShortcuts } from "@/components/fechamentos/step-shortcuts";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  fechamentoStatusColor,
  fechamentoStatusLabel,
  formatCompetencia,
  formatCurrency,
  formatDateTime
} from "@/lib/fechamentos";
import { prisma } from "@/lib/prisma";

export default async function FechamentoDetailPage({
  params
}: {
  params: { id: string };
}) {
  const { id } = params;

  const fechamento = await prisma.fechamento.findUnique({
    where: { id },
    include: {
      extratos: true,
      contasPagar: true,
      contasReceber: true,
      inconsistencias: true
    }
  });

  if (!fechamento) {
    notFound();
  }

  const totalExtrato = fechamento.extratos.reduce((acc, item) => acc + Number(item.valor), 0);
  const totalPagar = fechamento.contasPagar.reduce((acc, item) => acc + Number(item.valor), 0);
  const totalReceber = fechamento.contasReceber.reduce((acc, item) => acc + Number(item.valor), 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="capitalize">{formatCompetencia(fechamento.competencia)}</CardTitle>
            <CardDescription>
              Criado em {formatDateTime(fechamento.createdAt)} · Última atualização {formatDateTime(fechamento.updatedAt)}
            </CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={fechamentoStatusColor[fechamento.status]}>
              {fechamentoStatusLabel[fechamento.status]}
            </Badge>
            <Link href="/fechamentos" className={buttonVariants({ variant: "outline" })}>
              Voltar à lista
            </Link>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-4">
          <Card className="bg-slate-50">
            <CardHeader className="p-4">
              <CardDescription>Movimentação em extrato</CardDescription>
              <CardTitle className="text-base">{formatCurrency(totalExtrato)}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-slate-50">
            <CardHeader className="p-4">
              <CardDescription>Contas a pagar</CardDescription>
              <CardTitle className="text-base">{formatCurrency(totalPagar)}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-slate-50">
            <CardHeader className="p-4">
              <CardDescription>Contas a receber</CardDescription>
              <CardTitle className="text-base">{formatCurrency(totalReceber)}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-slate-50">
            <CardHeader className="p-4">
              <CardDescription>Inconsistências</CardDescription>
              <CardTitle className="text-base">{fechamento.inconsistencias.length}</CardTitle>
            </CardHeader>
          </Card>
        </CardContent>
      </Card>

      <StepShortcuts fechamentoId={fechamento.id} />
    </div>
  );
}
