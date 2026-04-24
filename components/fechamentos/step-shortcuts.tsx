import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const steps = [
  { slug: "upload", title: "Upload", description: "Envio dos arquivos da competência" },
  { slug: "dados", title: "Dados", description: "Conferência de extratos e lançamentos" },
  { slug: "conciliacao", title: "Conciliação", description: "Aproximação entre banco e contas" },
  { slug: "dashboard", title: "Dashboard", description: "Visão executiva do fechamento" },
  { slug: "auditoria", title: "Auditoria", description: "Rastreabilidade e histórico" },
  { slug: "relatorio", title: "Relatório", description: "Consolidação final para exportação" }
];

export function StepShortcuts({ fechamentoId }: { fechamentoId: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Etapas do processo</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {steps.map((step) => (
          <Link
            key={step.slug}
            href={`/fechamentos/${fechamentoId}/${step.slug}`}
            className="rounded-lg border border-slate-200 bg-white p-4 transition-colors hover:bg-slate-50"
          >
            <p className="text-sm font-semibold">{step.title}</p>
            <p className="mt-1 text-sm text-slate-500">{step.description}</p>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
