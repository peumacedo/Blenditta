import Link from "next/link";
import { SituacaoConta } from "@prisma/client";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  PAGE_SIZE,
  buildContaPagarWhere,
  buildContaReceberWhere,
  buildExtratoWhere,
  getContaFilters,
  getExtratoFilters,
  normalizePage,
  parsePage,
  readParam,
  type SearchParams
} from "@/lib/fechamento-dados";
import {
  fechamentoStatusColor,
  fechamentoStatusLabel,
  formatCategoryLabel,
  formatCompetencia,
  formatCurrency,
  formatDate,
  situacaoContaLabel
} from "@/lib/fechamentos";
import { prisma } from "@/lib/prisma";

function toQueryString(searchParams: SearchParams, updates: Record<string, string | number | undefined>) {
  const params = new URLSearchParams();

  Object.entries(searchParams).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((entry) => {
        if (entry) {
          params.append(key, entry);
        }
      });
      return;
    }

    if (value) {
      params.set(key, value);
    }
  });

  Object.entries(updates).forEach(([key, value]) => {
    if (value === undefined || value === "") {
      params.delete(key);
      return;
    }

    params.set(key, String(value));
  });

  return params.toString();
}

function hiddenParams(
  searchParams: SearchParams,
  blockPrefix: "ex" | "cp" | "cr",
  pageKey: "ex_page" | "cp_page" | "cr_page"
) {
  return Object.entries(searchParams).flatMap(([key, value]) => {
    if (key === pageKey || key.startsWith(`${blockPrefix}_`)) {
      return [];
    }

    if (Array.isArray(value)) {
      return value
        .filter(Boolean)
        .map((entry) => <input key={`${key}-${entry}`} type="hidden" name={key} value={entry} />);
    }

    if (!value) {
      return [];
    }

    return <input key={key} type="hidden" name={key} value={value} />;
  });
}

export default async function DadosPage({
  params,
  searchParams
}: {
  params: { id: string };
  searchParams?: SearchParams;
}) {
  const { id } = params;
  const query = searchParams ?? {};

  const fechamento = await prisma.fechamento.findUnique({
    where: { id },
    select: {
      id: true,
      competencia: true,
      status: true,
      _count: {
        select: {
          extratos: true,
          contasPagar: true,
          contasReceber: true
        }
      }
    }
  });

  if (!fechamento) {
    notFound();
  }

  const importedTotal =
    fechamento._count.extratos + fechamento._count.contasPagar + fechamento._count.contasReceber;

  const extratoFilters = getExtratoFilters(query);
  const pagarFilters = getContaFilters(query, "cp");
  const receberFilters = getContaFilters(query, "cr");

  const extratoWhere = buildExtratoWhere(fechamento.id, extratoFilters);
  const pagarWhere = buildContaPagarWhere(fechamento.id, pagarFilters);
  const receberWhere = buildContaReceberWhere(fechamento.id, receberFilters);

  const requestedExtratoPage = parsePage(query, "ex_page");
  const requestedPagarPage = parsePage(query, "cp_page");
  const requestedReceberPage = parsePage(query, "cr_page");

  const [extratoTotal, pagarTotal, receberTotal, extratoSum, pagarSum, receberSum] = await Promise.all([
    prisma.extratoBancario.count({ where: extratoWhere }),
    prisma.contaPagar.count({ where: pagarWhere }),
    prisma.contaReceber.count({ where: receberWhere }),
    prisma.extratoBancario.aggregate({ where: extratoWhere, _sum: { valor: true } }),
    prisma.contaPagar.aggregate({ where: pagarWhere, _sum: { valor: true } }),
    prisma.contaReceber.aggregate({ where: receberWhere, _sum: { valor: true } })
  ]);

  const extratoPage = normalizePage(requestedExtratoPage, extratoTotal);
  const pagarPage = normalizePage(requestedPagarPage, pagarTotal);
  const receberPage = normalizePage(requestedReceberPage, receberTotal);

  const [extratos, contasPagar, contasReceber] = await Promise.all([
    prisma.extratoBancario.findMany({
      where: extratoWhere,
      orderBy: [{ data: "desc" }, { id: "desc" }],
      skip: (extratoPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE
    }),
    prisma.contaPagar.findMany({
      where: pagarWhere,
      orderBy: [{ vencimento: "desc" }, { id: "desc" }],
      skip: (pagarPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE
    }),
    prisma.contaReceber.findMany({
      where: receberWhere,
      orderBy: [{ vencimento: "desc" }, { id: "desc" }],
      skip: (receberPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE
    })
  ]);

  const extratoPages = Math.max(1, Math.ceil(extratoTotal / PAGE_SIZE));
  const pagarPages = Math.max(1, Math.ceil(pagarTotal / PAGE_SIZE));
  const receberPages = Math.max(1, Math.ceil(receberTotal / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>Dados importados do fechamento</CardTitle>
            <CardDescription className="capitalize">{formatCompetencia(fechamento.competencia)}</CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={fechamentoStatusColor[fechamento.status]}>{fechamentoStatusLabel[fechamento.status]}</Badge>
            <Link href={`/fechamentos/${fechamento.id}`} className={buttonVariants({ variant: "outline" })}>
              Voltar ao detalhe
            </Link>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <Card className="bg-slate-50">
            <CardHeader className="p-4">
              <CardDescription>Extrato bancário</CardDescription>
              <CardTitle className="text-base">{fechamento._count.extratos} registros</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-slate-50">
            <CardHeader className="p-4">
              <CardDescription>Contas a pagar</CardDescription>
              <CardTitle className="text-base">{fechamento._count.contasPagar} registros</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-slate-50">
            <CardHeader className="p-4">
              <CardDescription>Contas a receber</CardDescription>
              <CardTitle className="text-base">{fechamento._count.contasReceber} registros</CardTitle>
            </CardHeader>
          </Card>
        </CardContent>
      </Card>

      {importedTotal === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Nenhum dado importado neste fechamento</CardTitle>
            <CardDescription>
              Envie e processe os arquivos de extrato, contas a pagar e contas a receber antes de revisar os dados.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={`/fechamentos/${fechamento.id}/upload`} className={buttonVariants({ variant: "default" })}>
              Ir para upload de arquivos
            </Link>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Extrato bancário</CardTitle>
          <CardDescription>
            {extratoTotal} registros filtrados · Total financeiro {formatCurrency(Number(extratoSum._sum.valor ?? 0))}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form method="get" className="grid gap-3 rounded-md border p-4 md:grid-cols-3 lg:grid-cols-6">
            {hiddenParams(query, "ex", "ex_page")}
            <input name="ex_descricao" defaultValue={readParam(query, "ex_descricao")} placeholder="Descrição" className="h-9 rounded-md border px-3 text-sm" />
            <input name="ex_categoria" defaultValue={readParam(query, "ex_categoria")} placeholder="Categoria" className="h-9 rounded-md border px-3 text-sm" />
            <input type="date" name="ex_data_ini" defaultValue={readParam(query, "ex_data_ini")} className="h-9 rounded-md border px-3 text-sm" />
            <input type="date" name="ex_data_fim" defaultValue={readParam(query, "ex_data_fim")} className="h-9 rounded-md border px-3 text-sm" />
            <input name="ex_valor_min" defaultValue={readParam(query, "ex_valor_min")} placeholder="Valor mínimo" className="h-9 rounded-md border px-3 text-sm" />
            <input name="ex_valor_max" defaultValue={readParam(query, "ex_valor_max")} placeholder="Valor máximo" className="h-9 rounded-md border px-3 text-sm" />
            <div className="md:col-span-3 lg:col-span-6 flex gap-2">
              <button type="submit" className={buttonVariants({ variant: "default" })}>
                Aplicar filtros
              </button>
              <Link href={`/fechamentos/${fechamento.id}/dados`} className={buttonVariants({ variant: "outline" })}>
                Limpar filtros
              </Link>
            </div>
          </form>

          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="text-right">Saldo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {extratos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-slate-500">
                      Nenhum registro encontrado para os filtros aplicados.
                    </TableCell>
                  </TableRow>
                ) : (
                  extratos.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{formatDate(item.data)}</TableCell>
                      <TableCell>{item.descricao}</TableCell>
                      <TableCell>{formatCategoryLabel(item.categoria)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(Number(item.valor))}</TableCell>
                      <TableCell className="text-right">{formatCurrency(Number(item.saldo))}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between text-sm text-slate-600">
            <span>
              Página {extratoPage} de {extratoPages}
            </span>
            <div className="flex gap-2">
              <Link
                href={`?${toQueryString(query, { ex_page: Math.max(1, extratoPage - 1) })}`}
                className={buttonVariants({ variant: "outline" }) + (extratoPage <= 1 ? " pointer-events-none opacity-50" : "")}
              >
                Anterior
              </Link>
              <Link
                href={`?${toQueryString(query, { ex_page: Math.min(extratoPages, extratoPage + 1) })}`}
                className={buttonVariants({ variant: "outline" }) + (extratoPage >= extratoPages ? " pointer-events-none opacity-50" : "")}
              >
                Próxima
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contas a pagar</CardTitle>
          <CardDescription>
            {pagarTotal} registros filtrados · Total financeiro {formatCurrency(Number(pagarSum._sum.valor ?? 0))}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form method="get" className="grid gap-3 rounded-md border p-4 md:grid-cols-3 lg:grid-cols-7">
            {hiddenParams(query, "cp", "cp_page")}
            <input name="cp_nome" defaultValue={readParam(query, "cp_nome")} placeholder="Fornecedor" className="h-9 rounded-md border px-3 text-sm" />
            <input name="cp_categoria" defaultValue={readParam(query, "cp_categoria")} placeholder="Categoria" className="h-9 rounded-md border px-3 text-sm" />
            <select name="cp_situacao" defaultValue={readParam(query, "cp_situacao")} className="h-9 rounded-md border px-3 text-sm">
              <option value="">Todas situações</option>
              {Object.values(SituacaoConta).map((situacao) => (
                <option key={situacao} value={situacao}>
                  {situacaoContaLabel[situacao]}
                </option>
              ))}
            </select>
            <input type="date" name="cp_venc_ini" defaultValue={readParam(query, "cp_venc_ini")} className="h-9 rounded-md border px-3 text-sm" />
            <input type="date" name="cp_venc_fim" defaultValue={readParam(query, "cp_venc_fim")} className="h-9 rounded-md border px-3 text-sm" />
            <input name="cp_valor_min" defaultValue={readParam(query, "cp_valor_min")} placeholder="Valor mínimo" className="h-9 rounded-md border px-3 text-sm" />
            <input name="cp_valor_max" defaultValue={readParam(query, "cp_valor_max")} placeholder="Valor máximo" className="h-9 rounded-md border px-3 text-sm" />
            <div className="md:col-span-3 lg:col-span-7 flex gap-2">
              <button type="submit" className={buttonVariants({ variant: "default" })}>
                Aplicar filtros
              </button>
              <Link href={`/fechamentos/${fechamento.id}/dados`} className={buttonVariants({ variant: "outline" })}>
                Limpar filtros
              </Link>
            </div>
          </form>

          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fornecedor</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Pagamento</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Situação</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contasPagar.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-slate-500">
                      Nenhum registro encontrado para os filtros aplicados.
                    </TableCell>
                  </TableRow>
                ) : (
                  contasPagar.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.fornecedor}</TableCell>
                      <TableCell>{formatDate(item.vencimento)}</TableCell>
                      <TableCell>{item.pagamento ? formatDate(item.pagamento) : "-"}</TableCell>
                      <TableCell>{formatCategoryLabel(item.categoria)}</TableCell>
                      <TableCell>{situacaoContaLabel[item.situacao]}</TableCell>
                      <TableCell className="text-right">{formatCurrency(Number(item.valor))}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between text-sm text-slate-600">
            <span>
              Página {pagarPage} de {pagarPages}
            </span>
            <div className="flex gap-2">
              <Link
                href={`?${toQueryString(query, { cp_page: Math.max(1, pagarPage - 1) })}`}
                className={buttonVariants({ variant: "outline" }) + (pagarPage <= 1 ? " pointer-events-none opacity-50" : "")}
              >
                Anterior
              </Link>
              <Link
                href={`?${toQueryString(query, { cp_page: Math.min(pagarPages, pagarPage + 1) })}`}
                className={buttonVariants({ variant: "outline" }) + (pagarPage >= pagarPages ? " pointer-events-none opacity-50" : "")}
              >
                Próxima
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contas a receber</CardTitle>
          <CardDescription>
            {receberTotal} registros filtrados · Total financeiro {formatCurrency(Number(receberSum._sum.valor ?? 0))}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form method="get" className="grid gap-3 rounded-md border p-4 md:grid-cols-3 lg:grid-cols-7">
            {hiddenParams(query, "cr", "cr_page")}
            <input name="cr_nome" defaultValue={readParam(query, "cr_nome")} placeholder="Cliente" className="h-9 rounded-md border px-3 text-sm" />
            <input name="cr_categoria" defaultValue={readParam(query, "cr_categoria")} placeholder="Categoria" className="h-9 rounded-md border px-3 text-sm" />
            <select name="cr_situacao" defaultValue={readParam(query, "cr_situacao")} className="h-9 rounded-md border px-3 text-sm">
              <option value="">Todas situações</option>
              {Object.values(SituacaoConta).map((situacao) => (
                <option key={situacao} value={situacao}>
                  {situacaoContaLabel[situacao]}
                </option>
              ))}
            </select>
            <input type="date" name="cr_venc_ini" defaultValue={readParam(query, "cr_venc_ini")} className="h-9 rounded-md border px-3 text-sm" />
            <input type="date" name="cr_venc_fim" defaultValue={readParam(query, "cr_venc_fim")} className="h-9 rounded-md border px-3 text-sm" />
            <input name="cr_valor_min" defaultValue={readParam(query, "cr_valor_min")} placeholder="Valor mínimo" className="h-9 rounded-md border px-3 text-sm" />
            <input name="cr_valor_max" defaultValue={readParam(query, "cr_valor_max")} placeholder="Valor máximo" className="h-9 rounded-md border px-3 text-sm" />
            <div className="md:col-span-3 lg:col-span-7 flex gap-2">
              <button type="submit" className={buttonVariants({ variant: "default" })}>
                Aplicar filtros
              </button>
              <Link href={`/fechamentos/${fechamento.id}/dados`} className={buttonVariants({ variant: "outline" })}>
                Limpar filtros
              </Link>
            </div>
          </form>

          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Recebimento</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Situação</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contasReceber.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-slate-500">
                      Nenhum registro encontrado para os filtros aplicados.
                    </TableCell>
                  </TableRow>
                ) : (
                  contasReceber.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.cliente}</TableCell>
                      <TableCell>{formatDate(item.vencimento)}</TableCell>
                      <TableCell>{item.recebimento ? formatDate(item.recebimento) : "-"}</TableCell>
                      <TableCell>{formatCategoryLabel(item.categoria)}</TableCell>
                      <TableCell>{situacaoContaLabel[item.situacao]}</TableCell>
                      <TableCell className="text-right">{formatCurrency(Number(item.valor))}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between text-sm text-slate-600">
            <span>
              Página {receberPage} de {receberPages}
            </span>
            <div className="flex gap-2">
              <Link
                href={`?${toQueryString(query, { cr_page: Math.max(1, receberPage - 1) })}`}
                className={buttonVariants({ variant: "outline" }) + (receberPage <= 1 ? " pointer-events-none opacity-50" : "")}
              >
                Anterior
              </Link>
              <Link
                href={`?${toQueryString(query, { cr_page: Math.min(receberPages, receberPage + 1) })}`}
                className={buttonVariants({ variant: "outline" }) + (receberPage >= receberPages ? " pointer-events-none opacity-50" : "")}
              >
                Próxima
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
