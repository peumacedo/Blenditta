import Link from "next/link";
import { FechamentoStatus } from "@prisma/client";

import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { fechamentoStatusLabel, formatCompetencia, formatDateTime } from "@/lib/fechamentos";

export function DashboardHeader({
  fechamentoId,
  competencia,
  empresa,
  status,
  geradoEm,
  demoMode
}: {
  fechamentoId: string;
  competencia: Date;
  empresa: string;
  status: FechamentoStatus;
  geradoEm: Date;
  demoMode: boolean;
}) {
  return (
    <Card className="border-coffee-200 bg-gradient-to-r from-sand-100 to-card">
      <CardHeader className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <CardTitle className="text-coffee-900">Dashboard Gerencial Financeiro</CardTitle>
          <CardDescription>
            {empresa} · {formatCompetencia(competencia)} · status {fechamentoStatusLabel[status]}.
          </CardDescription>
          <p className="mt-2 text-xs text-muted-foreground">Gerado em {formatDateTime(geradoEm)} · visão executiva para fechamento mensal.</p>
          {demoMode ? <Badge className="mt-2" variant="outline">Modo demonstração</Badge> : null}
        </div>
        <div className="flex gap-2">
          <Link href={`/fechamentos/${fechamentoId}`} className={buttonVariants({ variant: "outline" })}>Voltar</Link>
          <Link href={`/fechamentos/${fechamentoId}/relatorio`} className={buttonVariants({ variant: "outline" })}>Exportar relatório</Link>
          <Link href={`/fechamentos/${fechamentoId}/relatorio`} className={buttonVariants({ variant: "default" })}>Relatório</Link>
        </div>
      </CardHeader>
    </Card>
  );
}
