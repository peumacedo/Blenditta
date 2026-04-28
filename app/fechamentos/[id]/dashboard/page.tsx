import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAnaliseGerencial } from "@/lib/analise-gerencial";
import { formatCategoryLabel, formatCompetencia, formatCurrency, formatDate } from "@/lib/fechamentos";

const percent = (value: number) => `${(value * 100).toFixed(1)}%`;

export default async function DashboardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const analise = await getAnaliseGerencial(id);

  if (!analise) {
    notFound();
  }

  const resumo = analise.resumoExecutivo;
  const resultado = analise.resultadoGerencial;

  const leituraExecutiva = `O mês apresentou ${resumo.resultadoCaixa >= 0 ? "geração positiva" : "geração negativa"} de caixa, com entradas de ${formatCurrency(resumo.entradasRealizadas)} e saídas de ${formatCurrency(resumo.saidasRealizadas)}. A posição futura conhecida está ${resumo.posicaoFuturaConhecida >= 0 ? "positiva" : "negativa"} em ${formatCurrency(resumo.posicaoFuturaConhecida)}.`;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>Dashboard Gerencial</CardTitle>
            <CardDescription className="capitalize">
              {formatCompetencia(analise.fechamento.competencia)} · Análise mensal gerada a partir das bases exportadas do ERP.
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Link href={`/fechamentos/${id}`} className={buttonVariants({ variant: "outline" })}>
              Voltar ao fechamento
            </Link>
            <Link href={`/fechamentos/${id}/relatorio`} className={buttonVariants({ variant: "default" })}>
              Ver relatório
            </Link>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        {[
          ["Saldo inicial", resumo.saldoInicial],
          ["Entradas realizadas", resumo.entradasRealizadas],
          ["Saídas realizadas", resumo.saidasRealizadas],
          ["Resultado de caixa", resumo.resultadoCaixa],
          ["Saldo final", resumo.saldoFinal],
          ["A receber em aberto", resumo.contasAReceberAbertas],
          ["A pagar em aberto", resumo.contasAPagarAbertas],
          ["Posição futura conhecida", resumo.posicaoFuturaConhecida]
        ].map(([label, value]) => (
          <Card key={label} className="bg-slate-50">
            <CardHeader className="p-4">
              <CardDescription>{label}</CardDescription>
              <CardTitle className="text-base">{formatCurrency(Number(value))}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Leitura executiva do mês</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-700">{leituraExecutiva}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resultado gerencial simplificado</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto rounded-md border">
          <Table>
            <TableBody>
              {[
                ["Receita Bruta", resultado.receitaBruta],
                ["(-) Impostos e taxas", -resultado.impostosTaxas],
                ["Receita Líquida", resultado.receitaLiquida],
                ["(-) Custos Variáveis", -resultado.custosVariaveis],
                ["Margem Bruta", resultado.margemBruta],
                ["(-) Despesas Fixas", -resultado.despesasFixas],
                ["Resultado Operacional", resultado.resultadoOperacional],
                ["(+/-) Resultado Financeiro", resultado.resultadoFinanceiro],
                ["(-) Retiradas", -resultado.retiradas],
                ["(-) Investimentos", -resultado.investimentos],
                ["Resultado Gerencial", resultado.resultadoGerencial]
              ].map(([nome, valor]) => (
                <TableRow key={nome as string}>
                  <TableCell>{nome}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(Number(valor))}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Receitas por categoria</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Categoria</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="text-right">Participação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analise.receitasPorCategoria.map((item) => (
                  <TableRow key={item.categoria}>
                    <TableCell>{formatCategoryLabel(item.categoria)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.valor)}</TableCell>
                    <TableCell className="text-right">{percent(item.participacao)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Saídas por categoria</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Categoria</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="text-right">Participação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analise.saidasPorCategoria.map((item) => (
                  <TableRow key={item.categoria}>
                    <TableCell>{formatCategoryLabel(item.categoria)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.valor)}</TableCell>
                    <TableCell className="text-right">{percent(item.participacao)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fluxo de caixa do mês</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto rounded-md border">
          <Table>
            <TableBody>
              {[
                ["Saldo inicial", analise.fluxoCaixa.saldoInicial],
                ["Entradas operacionais", analise.fluxoCaixa.entradasOperacionais],
                ["Saídas operacionais", -analise.fluxoCaixa.saidasOperacionais],
                ["Saídas financeiras", -analise.fluxoCaixa.saidasFinanceiras],
                ["Investimentos", -analise.fluxoCaixa.investimentos],
                ["Retiradas", -analise.fluxoCaixa.retiradas],
                ["Saldo final", analise.fluxoCaixa.saldoFinal]
              ].map(([nome, valor]) => (
                <TableRow key={nome as string}>
                  <TableCell>{nome}</TableCell>
                  <TableCell className="text-right">{formatCurrency(Number(valor))}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Contas a receber</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2 sm:grid-cols-2">
              <Badge variant="secondary">Total recebido: {formatCurrency(analise.contasReceber.totalRecebido)}</Badge>
              <Badge variant="secondary">Total em aberto: {formatCurrency(analise.contasReceber.totalAberto)}</Badge>
              <Badge variant="outline">Vencidas: {formatCurrency(analise.contasReceber.vencidas)}</Badge>
              <Badge variant="outline">A vencer: {formatCurrency(analise.contasReceber.aVencer)}</Badge>
            </div>
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analise.contasReceber.proximas.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.cliente}</TableCell>
                      <TableCell>{formatDate(item.vencimento)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(Number(item.valor))}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contas a pagar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2 sm:grid-cols-2">
              <Badge variant="secondary">Total pago: {formatCurrency(analise.contasPagar.totalPago)}</Badge>
              <Badge variant="secondary">Total em aberto: {formatCurrency(analise.contasPagar.totalAberto)}</Badge>
              <Badge variant="outline">Vencidas: {formatCurrency(analise.contasPagar.vencidas)}</Badge>
              <Badge variant="outline">A vencer: {formatCurrency(analise.contasPagar.aVencer)}</Badge>
            </div>
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fornecedor</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analise.contasPagar.proximas.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.fornecedor}</TableCell>
                      <TableCell>{formatDate(item.vencimento)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(Number(item.valor))}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Indicadores do mês</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Indicador</TableHead>
                <TableHead>Resultado</TableHead>
                <TableHead>Leitura</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analise.indicadores.map((item) => (
                <TableRow key={item.nome}>
                  <TableCell>{item.nome}</TableCell>
                  <TableCell>{item.valor}</TableCell>
                  <TableCell>{item.leitura}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Diagnóstico gerencial</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-700">
            <div>
              <p className="font-semibold">Pontos positivos</p>
              <ul className="list-disc pl-5">
                {(analise.diagnostico.pontosPositivos.length
                  ? analise.diagnostico.pontosPositivos
                  : ["Sem destaques positivos automáticos para o período."]
                ).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-semibold">Pontos de atenção</p>
              <ul className="list-disc pl-5">
                {(analise.diagnostico.pontosAtencao.length
                  ? analise.diagnostico.pontosAtencao
                  : ["Sem alertas de atenção automática para o período."]
                ).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-semibold">Riscos</p>
              <ul className="list-disc pl-5">
                {(analise.diagnostico.riscos.length
                  ? analise.diagnostico.riscos
                  : ["Sem riscos críticos automáticos para o período."]
                ).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-semibold">Recomendações</p>
              <ul className="list-disc pl-5">
                {(analise.diagnostico.recomendacoes.length
                  ? analise.diagnostico.recomendacoes
                  : ["Manter padronização de categorias nas próximas exportações."]
                ).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Qualidade da base</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Badge variant={analise.qualidadeBase.possuiExtrato ? "default" : "outline"}>
              Extrato importado: {analise.qualidadeBase.possuiExtrato ? "sim" : "não"}
            </Badge>
            <Badge variant={analise.qualidadeBase.possuiContasPagar ? "default" : "outline"}>
              Contas a pagar importadas: {analise.qualidadeBase.possuiContasPagar ? "sim" : "não"}
            </Badge>
            <Badge variant={analise.qualidadeBase.possuiContasReceber ? "default" : "outline"}>
              Contas a receber importadas: {analise.qualidadeBase.possuiContasReceber ? "sim" : "não"}
            </Badge>
            <p>Quantidade de arquivos enviados: {analise.qualidadeBase.quantidadeArquivos}</p>
            <ul className="list-disc space-y-1 pl-5 text-slate-600">
              {analise.qualidadeBase.observacoes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
