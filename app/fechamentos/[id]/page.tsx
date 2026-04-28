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
import { getAnaliseGerencial } from "@/lib/analise-gerencial";
import { prisma } from "@/lib/prisma";

export default async function FechamentoDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const fechamento = await prisma.fechamento.findUnique({
    where: { id },
    include: {
      extratos: true,
      contasPagar: true,
      contasReceber: true
    }
  });

  if (!fechamento) {
    notFound();
  }

  const analise = await getAnaliseGerencial(id);

  if (!analise) {
    notFound();
  }

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
              <CardDescription>Entradas realizadas</CardDescription>
              <CardTitle className="text-base">{formatCurrency(analise.resumoExecutivo.entradasRealizadas)}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-slate-50">
            <CardHeader className="p-4">
              <CardDescription>Saídas realizadas</CardDescription>
              <CardTitle className="text-base">{formatCurrency(analise.resumoExecutivo.saidasRealizadas)}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-slate-50">
            <CardHeader className="p-4">
              <CardDescription>Contas a pagar em aberto</CardDescription>
              <CardTitle className="text-base">{formatCurrency(analise.resumoExecutivo.contasAPagarAbertas)}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-slate-50">
            <CardHeader className="p-4">
              <CardDescription>Contas a receber em aberto</CardDescription>
              <CardTitle className="text-base">{formatCurrency(analise.resumoExecutivo.contasAReceberAbertas)}</CardTitle>
            </CardHeader>
          </Card>
        </CardContent>
      </Card>

      <StepShortcuts fechamentoId={fechamento.id} />
    </div>
  );
}
