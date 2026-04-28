import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCompetencia } from "@/lib/fechamentos";

export function DashboardHeader({ fechamentoId, competencia }: { fechamentoId: string; competencia: Date }) {
  return (
    <Card className="border-coffee-200 bg-gradient-to-r from-sand-100 to-card">
      <CardHeader className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <CardTitle className="text-coffee-900">Dashboard Gerencial Financeiro</CardTitle>
          <CardDescription>
            {formatCompetencia(competencia)} · visão executiva para fechamento mensal com dados importados manualmente.
          </CardDescription>
        </div>
        <div className="flex gap-2">
          <Link href={`/fechamentos/${fechamentoId}`} className={buttonVariants({ variant: "outline" })}>Voltar</Link>
          <Link href={`/fechamentos/${fechamentoId}/relatorio`} className={buttonVariants({ variant: "default" })}>Relatório</Link>
        </div>
      </CardHeader>
    </Card>
  );
}
