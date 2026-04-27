import Link from "next/link";
import { notFound } from "next/navigation";

import { UploadFilesPanel } from "@/components/fechamentos/upload-files-panel";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { fechamentoStatusColor, fechamentoStatusLabel, formatCompetencia } from "@/lib/fechamentos";
import { prisma } from "@/lib/prisma";

export default async function UploadPage({ params }: { params: { id: string } }) {
  const { id } = params;

  const fechamento = await prisma.fechamento.findUnique({
    where: { id },
    include: {
      arquivos: {
        orderBy: {
          criadoEm: "desc"
        }
      }
    }
  });

  if (!fechamento) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>Upload de arquivos</CardTitle>
            <CardDescription className="capitalize">{formatCompetencia(fechamento.competencia)}</CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={fechamentoStatusColor[fechamento.status]}>{fechamentoStatusLabel[fechamento.status]}</Badge>
            <Link href={`/fechamentos/${fechamento.id}`} className={buttonVariants({ variant: "outline" })}>
              Voltar ao detalhe
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600">
            Envie os arquivos do fechamento mensal e execute o processamento para importar CSV/Excel para o banco.
          </p>
        </CardContent>
      </Card>

      <UploadFilesPanel fechamentoId={fechamento.id} arquivos={fechamento.arquivos} />
    </div>
  );
}
