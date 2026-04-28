import Link from "next/link";
import { notFound } from "next/navigation";

import { PrintReportButton } from "@/components/fechamentos/print-report-button";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAnaliseGerencial } from "@/lib/analise-gerencial";
import { formatCategoryLabel, formatCompetencia, formatCurrency, formatDate } from "@/lib/fechamentos";

export default async function RelatorioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const analise = await getAnaliseGerencial(id);

  if (!analise) {
    notFound();
  }

  const resumo = analise.resumoExecutivo;

  return (
    <div className="space-y-6 report-print-root">
      <Card className="print:border print:shadow-none">
        <CardHeader>
          <CardTitle>Relatório Gerencial Financeiro</CardTitle>
          <CardDescription className="capitalize">
            {formatCompetencia(analise.fechamento.competencia)} · Entrega mensal gerada a partir das bases exportadas do ERP.
          </CardDescription>
          <div className="flex flex-wrap gap-2 no-print">
            <Link href={`/fechamentos/${id}`} className={buttonVariants({ variant: "outline" })}>
              Voltar ao fechamento
            </Link>
            <Link href={`/fechamentos/${id}/dashboard`} className={buttonVariants({ variant: "outline" })}>
              Ver dashboard
            </Link>
            <PrintReportButton />
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader><CardTitle>1. Visão Executiva do Mês</CardTitle></CardHeader>
        <CardContent className="text-sm text-slate-700">
          <p>
            O período registrou entradas de {formatCurrency(resumo.entradasRealizadas)} e saídas de {formatCurrency(resumo.saidasRealizadas)},
            com resultado de caixa de {formatCurrency(resumo.resultadoCaixa)} e saldo final de {formatCurrency(resumo.saldoFinal)}.
          </p>
          <p className="mt-2">
            A posição futura conhecida (recebíveis em aberto menos obrigações em aberto) foi de {formatCurrency(resumo.posicaoFuturaConhecida)}.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>2. Resultado Gerencial do Período</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto rounded-md border">
          <Table>
            <TableBody>
              {Object.entries({
                "Receita Bruta": analise.resultadoGerencial.receitaBruta,
                "(-) Impostos e Taxas": -analise.resultadoGerencial.impostosTaxas,
                "Receita Líquida": analise.resultadoGerencial.receitaLiquida,
                "(-) Custos Variáveis": -analise.resultadoGerencial.custosVariaveis,
                "Margem Bruta": analise.resultadoGerencial.margemBruta,
                "(-) Despesas Fixas": -analise.resultadoGerencial.despesasFixas,
                "Resultado Operacional": analise.resultadoGerencial.resultadoOperacional,
                "(+/-) Resultado Financeiro": analise.resultadoGerencial.resultadoFinanceiro,
                "(-) Retiradas": -analise.resultadoGerencial.retiradas,
                "(-) Investimentos": -analise.resultadoGerencial.investimentos,
                "Resultado Gerencial": analise.resultadoGerencial.resultadoGerencial
              }).map(([nome, valor]) => (
                <TableRow key={nome}>
                  <TableCell>{nome}</TableCell>
                  <TableCell className="text-right">{formatCurrency(valor)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>3. Análise das Receitas</CardTitle></CardHeader>
          <CardContent className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader><TableRow><TableHead>Categoria</TableHead><TableHead className="text-right">Valor</TableHead></TableRow></TableHeader>
              <TableBody>
                {analise.receitasPorCategoria.map((item) => (
                  <TableRow key={item.categoria}><TableCell>{formatCategoryLabel(item.categoria)}</TableCell><TableCell className="text-right">{formatCurrency(item.valor)}</TableCell></TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>4. Análise das Saídas</CardTitle></CardHeader>
          <CardContent className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader><TableRow><TableHead>Categoria</TableHead><TableHead className="text-right">Valor</TableHead></TableRow></TableHeader>
              <TableBody>
                {analise.saidasPorCategoria.map((item) => (
                  <TableRow key={item.categoria}><TableCell>{formatCategoryLabel(item.categoria)}</TableCell><TableCell className="text-right">{formatCurrency(item.valor)}</TableCell></TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>5. Fluxo de Caixa do Mês</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto rounded-md border">
          <Table>
            <TableBody>
              {Object.entries({
                "Saldo inicial": analise.fluxoCaixa.saldoInicial,
                "Entradas operacionais": analise.fluxoCaixa.entradasOperacionais,
                "Saídas operacionais": -analise.fluxoCaixa.saidasOperacionais,
                "Saídas financeiras": -analise.fluxoCaixa.saidasFinanceiras,
                Investimentos: -analise.fluxoCaixa.investimentos,
                Retiradas: -analise.fluxoCaixa.retiradas,
                "Saldo final": analise.fluxoCaixa.saldoFinal
              }).map(([nome, valor]) => (
                <TableRow key={nome}><TableCell>{nome}</TableCell><TableCell className="text-right">{formatCurrency(valor)}</TableCell></TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>6. Contas a Receber</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>Total recebido: {formatCurrency(analise.contasReceber.totalRecebido)}</p>
            <p>Total em aberto: {formatCurrency(analise.contasReceber.totalAberto)}</p>
            <p>Vencidas: {formatCurrency(analise.contasReceber.vencidas)} · A vencer: {formatCurrency(analise.contasReceber.aVencer)}</p>
            <ul className="list-disc pl-5">
              {analise.contasReceber.proximas.map((item) => (
                <li key={item.id}>{item.cliente} — {formatDate(item.vencimento)} — {formatCurrency(Number(item.valor))}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>7. Contas a Pagar</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>Total pago: {formatCurrency(analise.contasPagar.totalPago)}</p>
            <p>Total em aberto: {formatCurrency(analise.contasPagar.totalAberto)}</p>
            <p>Vencidas: {formatCurrency(analise.contasPagar.vencidas)} · A vencer: {formatCurrency(analise.contasPagar.aVencer)}</p>
            <ul className="list-disc pl-5">
              {analise.contasPagar.proximas.map((item) => (
                <li key={item.id}>{item.fornecedor} — {formatDate(item.vencimento)} — {formatCurrency(Number(item.valor))}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>8. Status das Bases Recebidas</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>Extrato importado: {analise.qualidadeBase.possuiExtrato ? "Sim" : "Não"}</p>
          <p>Contas a pagar importadas: {analise.qualidadeBase.possuiContasPagar ? "Sim" : "Não"}</p>
          <p>Contas a receber importadas: {analise.qualidadeBase.possuiContasReceber ? "Sim" : "Não"}</p>
          <p>Quantidade de arquivos: {analise.qualidadeBase.quantidadeArquivos}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>9. Indicadores do Mês</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader><TableRow><TableHead>Indicador</TableHead><TableHead>Resultado</TableHead><TableHead>Leitura</TableHead></TableRow></TableHeader>
            <TableBody>{analise.indicadores.map((i) => <TableRow key={i.nome}><TableCell>{i.nome}</TableCell><TableCell>{i.valor}</TableCell><TableCell>{i.leitura}</TableCell></TableRow>)}</TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>10. Diagnóstico Gerencial do Mês</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3 text-sm">
          <div><p className="font-semibold">Pontos positivos</p><ul className="list-disc pl-5">{analise.diagnostico.pontosPositivos.map((i) => <li key={i}>{i}</li>)}</ul></div>
          <div><p className="font-semibold">Pontos de atenção</p><ul className="list-disc pl-5">{analise.diagnostico.pontosAtencao.map((i) => <li key={i}>{i}</li>)}</ul></div>
          <div><p className="font-semibold">Riscos</p><ul className="list-disc pl-5">{analise.diagnostico.riscos.map((i) => <li key={i}>{i}</li>)}</ul></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>11. Recomendações para o Próximo Mês</CardTitle></CardHeader>
        <CardContent className="text-sm">
          <ul className="list-disc pl-5">
            {(analise.diagnostico.recomendacoes.length
              ? analise.diagnostico.recomendacoes
              : ["Manter a padronização de categorias e conferir a completude das bases exportadas."]
            ).map((i) => <li key={i}>{i}</li>)}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>12. Conclusão do Fechamento</CardTitle></CardHeader>
        <CardContent className="text-sm text-slate-700">
          <p>
            Esta leitura foi construída a partir de dados exportados do ERP. O sistema não realiza conciliação bancária automática e não substitui as validações contábeis formais.
          </p>
          <ul className="mt-2 list-disc pl-5">
            {analise.qualidadeBase.observacoes.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
