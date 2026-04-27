import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAnaliseGerencial } from "@/lib/analise-gerencial";
import { formatCompetencia, formatCurrency } from "@/lib/fechamentos";
import { prisma } from "@/lib/prisma";

export default async function ConciliacaoPage({ params }: { params: { id: string } }) {
  const analise = await getAnaliseGerencial(params.id);

  if (!analise) {
    notFound();
  }

  const registros = await prisma.fechamento.findUnique({
    where: { id: params.id },
    select: {
      _count: {
        select: {
          extratos: true,
          contasPagar: true,
          contasReceber: true,
          arquivos: true
        }
      }
    }
  });

  if (!registros) {
    notFound();
  }

  const avisos: string[] = [];

  if (!analise.qualidadeBase.possuiExtrato) avisos.push("Não há extrato importado para cálculo completo de caixa.");
  if (!analise.qualidadeBase.possuiContasPagar) avisos.push("Não há contas a pagar importadas.");
  if (!analise.qualidadeBase.possuiContasReceber) avisos.push("Não há contas a receber importadas.");

  const semCategoria = analise.saidasPorCategoria
    .filter((item) => ["SEM_CATEGORIA", "NAO_CLASSIFICADO", ""].includes(item.categoria))
    .reduce((acc, item) => acc + item.valor, 0);

  if (analise.resumoExecutivo.saidasRealizadas > 0 && semCategoria / analise.resumoExecutivo.saidasRealizadas > 0.2) {
    avisos.push("Há muitas saídas sem categoria gerencial clara (SEM_CATEGORIA/NAO_CLASSIFICADO).");
  }

  if (!registros._count.extratos) {
    avisos.push("Saldo final não pôde ser calculado por ausência de extrato.");
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>Validação das Bases</CardTitle>
            <CardDescription className="capitalize">
              {formatCompetencia(analise.fechamento.competencia)} · Conferência estrutural dos arquivos importados do ERP
            </CardDescription>
          </div>
          <Link href={`/fechamentos/${params.id}`} className={buttonVariants({ variant: "outline" })}>
            Voltar ao fechamento
          </Link>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-slate-700">
          <p>
            Esta etapa não realiza conciliação bancária automática. A premissa do produto é que as bases já foram exportadas do ERP após tratamento/conciliação. Aqui o sistema apenas valida completude, estrutura mínima e qualidade gerencial dos dados para análise.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-slate-50"><CardHeader className="p-4"><CardDescription>Arquivos enviados</CardDescription><CardTitle className="text-base">{registros._count.arquivos}</CardTitle></CardHeader></Card>
        <Card className="bg-slate-50"><CardHeader className="p-4"><CardDescription>Registros de extrato</CardDescription><CardTitle className="text-base">{registros._count.extratos}</CardTitle></CardHeader></Card>
        <Card className="bg-slate-50"><CardHeader className="p-4"><CardDescription>Registros de contas a pagar</CardDescription><CardTitle className="text-base">{registros._count.contasPagar}</CardTitle></CardHeader></Card>
        <Card className="bg-slate-50"><CardHeader className="p-4"><CardDescription>Registros de contas a receber</CardDescription><CardTitle className="text-base">{registros._count.contasReceber}</CardTitle></CardHeader></Card>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <Card><CardHeader className="p-4"><CardDescription>Entradas realizadas</CardDescription><CardTitle className="text-base">{formatCurrency(analise.resumoExecutivo.entradasRealizadas)}</CardTitle></CardHeader></Card>
        <Card><CardHeader className="p-4"><CardDescription>Saídas realizadas</CardDescription><CardTitle className="text-base">{formatCurrency(analise.resumoExecutivo.saidasRealizadas)}</CardTitle></CardHeader></Card>
        <Card><CardHeader className="p-4"><CardDescription>Contas a pagar em aberto</CardDescription><CardTitle className="text-base">{formatCurrency(analise.resumoExecutivo.contasAPagarAbertas)}</CardTitle></CardHeader></Card>
        <Card><CardHeader className="p-4"><CardDescription>Contas a receber em aberto</CardDescription><CardTitle className="text-base">{formatCurrency(analise.resumoExecutivo.contasAReceberAbertas)}</CardTitle></CardHeader></Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Avisos estruturais</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            {(avisos.length ? avisos : ["Nenhum aviso estrutural crítico identificado para esta competência."]).map((aviso) => (
              <Badge key={aviso} variant="outline" className="mr-2">
                {aviso}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
