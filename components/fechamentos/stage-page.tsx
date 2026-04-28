import Link from "next/link";
import { notFound } from "next/navigation";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCompetencia } from "@/lib/fechamentos";
import { getFechamentoById } from "@/lib/data-source";

export async function StagePage({
  id,
  title,
  description
}: {
  id: string;
  title: string;
  description: string;
}) {
  const fechamento = await getFechamentoById(id);

  if (!fechamento) {
    notFound();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription className="capitalize">
          {formatCompetencia(fechamento.competencia)} · {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-slate-600">
          Esta etapa está preparada na navegação do MVP, mas a implementação detalhada será feita na próxima fase.
        </p>
        <Link
          href={`/fechamentos/${fechamento.id}`}
          className={buttonVariants({ variant: "outline" })}
        >
          Voltar para visão geral do fechamento
        </Link>
      </CardContent>
    </Card>
  );
}
