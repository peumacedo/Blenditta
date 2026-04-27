"use client";

import { type Arquivo } from "@prisma/client";
import { useActionState, useEffect, useRef } from "react";

import {
  deleteArquivoAction,
  type DeleteActionState,
  type ProcessActionState,
  processArquivosAction,
  type UploadActionState,
  uploadArquivoAction,
  uploadFileTypes
} from "@/app/fechamentos/[id]/upload/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDateTime } from "@/lib/fechamentos";

const uploadTypeLabels: Record<(typeof uploadFileTypes)[number], string> = {
  extrato_bancario: "Extrato bancário",
  contas_pagar: "Contas a pagar",
  contas_receber: "Contas a receber",
  fluxo_caixa_omie: "Fluxo de caixa Omie",
  adicional: "Arquivos adicionais"
};

const initialUploadState: UploadActionState = {};
const initialDeleteState: DeleteActionState = {};
const initialProcessState: ProcessActionState = {};

const fileAccept = ".csv,.xlsx,.xls,.pdf,.png,.jpg,.jpeg";

type UploadFilesPanelProps = {
  fechamentoId: string;
  arquivos: Arquivo[];
};

export function UploadFilesPanel({ fechamentoId, arquivos }: UploadFilesPanelProps) {
  const processAction = processArquivosAction.bind(null, fechamentoId);
  const [processState, processFormAction, isProcessing] = useActionState(processAction, initialProcessState);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Processar arquivos enviados</CardTitle>
          <CardDescription>
            Clique para importar CSV/Excel de extrato bancário, contas a pagar e contas a receber.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <form action={processFormAction}>
            <Button type="submit" disabled={isProcessing}>
              {isProcessing ? "Processando..." : "Processar arquivos"}
            </Button>
          </form>
          {processState.errorMessage ? <p className="text-sm text-red-600">{processState.errorMessage}</p> : null}
          {processState.successMessage ? <p className="text-sm text-emerald-700">{processState.successMessage}</p> : null}
          {processState.summary ? <ImportSummaryPanel summary={processState.summary} /> : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Enviar arquivo</CardTitle>
          <CardDescription>
            Tipos aceitos: CSV, XLSX, XLS, PDF, PNG, JPG e JPEG (máximo de 10 MB por arquivo).
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {uploadFileTypes.map((tipo) => (
            <UploadTypeForm key={tipo} fechamentoId={fechamentoId} tipo={tipo} label={uploadTypeLabels[tipo]} />
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de uploads</CardTitle>
          <CardDescription>Arquivos já enviados neste fechamento.</CardDescription>
        </CardHeader>
        <CardContent>
          {arquivos.length === 0 ? (
            <p className="rounded-md border border-dashed border-slate-300 px-4 py-6 text-sm text-slate-600">
              Nenhum arquivo enviado ainda.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead>Caminho</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {arquivos.map((arquivo) => (
                  <TableRow key={arquivo.id}>
                    <TableCell>{arquivo.nome}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {uploadTypeLabels[arquivo.tipo as (typeof uploadFileTypes)[number]] ?? arquivo.tipo}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDateTime(arquivo.criadoEm)}</TableCell>
                    <TableCell className="font-mono text-xs text-slate-600">{arquivo.caminho}</TableCell>
                    <TableCell className="text-right">
                      <DeleteArquivoForm fechamentoId={fechamentoId} arquivoId={arquivo.id} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ImportSummaryPanel({ summary }: { summary: NonNullable<ProcessActionState["summary"]> }) {
  return (
    <div className="space-y-3 rounded-md border border-slate-200 bg-slate-50 p-4 text-sm">
      <p className="font-medium text-slate-900">Resumo da importação</p>
      <ul className="space-y-1 text-slate-700">
        <li>Arquivos processados (extrato): {summary.processedFilesByType.extrato_bancario}</li>
        <li>Arquivos processados (contas a pagar): {summary.processedFilesByType.contas_pagar}</li>
        <li>Arquivos processados (contas a receber): {summary.processedFilesByType.contas_receber}</li>
        <li>Linhas importadas (extrato): {summary.importedRowsByType.extrato_bancario}</li>
        <li>Linhas importadas (contas a pagar): {summary.importedRowsByType.contas_pagar}</li>
        <li>Linhas importadas (contas a receber): {summary.importedRowsByType.contas_receber}</li>
        <li>Linhas ignoradas (extrato): {summary.ignoredRowsByType.extrato_bancario}</li>
        <li>Linhas ignoradas (contas a pagar): {summary.ignoredRowsByType.contas_pagar}</li>
        <li>Linhas ignoradas (contas a receber): {summary.ignoredRowsByType.contas_receber}</li>
      </ul>
      {summary.ignoredFileTypes.length > 0 ? (
        <p className="text-amber-700">
          Tipos ignorados: {Array.from(new Set(summary.ignoredFileTypes)).join(", ")}
        </p>
      ) : null}
      {["extrato_bancario", "contas_pagar", "contas_receber"].map((tipo) => {
        const cols = summary.unrecognizedColumnsByType[tipo as keyof typeof summary.unrecognizedColumnsByType];
        if (!cols.length) return null;

        return (
          <p key={tipo} className="text-slate-700">
            Colunas não reconhecidas ({tipo}): {cols.join(", ")}
          </p>
        );
      })}
      {summary.warnings.length > 0 ? (
        <div>
          <p className="font-medium text-amber-700">Avisos</p>
          <ul className="list-disc pl-5 text-amber-700">
            {summary.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {summary.errors.length > 0 ? (
        <div>
          <p className="font-medium text-red-700">Erros</p>
          <ul className="list-disc pl-5 text-red-700">
            {summary.errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function UploadTypeForm({
  fechamentoId,
  tipo,
  label
}: {
  fechamentoId: string;
  tipo: (typeof uploadFileTypes)[number];
  label: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const uploadAction = uploadArquivoAction.bind(null, fechamentoId);
  const [state, formAction, isPending] = useActionState(uploadAction, initialUploadState);

  useEffect(() => {
    if (state.successMessage) {
      formRef.current?.reset();
    }
  }, [state.successMessage]);

  return (
    <form ref={formRef} action={formAction} className="space-y-3 rounded-md border border-slate-200 p-4">
      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-800">{label}</p>
        <input type="hidden" name="tipo" value={tipo} />
        <input
          name="arquivo"
          type="file"
          accept={fileAccept}
          required
          className="block w-full text-sm text-slate-700 file:mr-4 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium hover:file:bg-slate-200"
        />
      </div>

      {state.errorMessage ? <p className="text-sm text-red-600">{state.errorMessage}</p> : null}
      {state.successMessage ? <p className="text-sm text-emerald-700">{state.successMessage}</p> : null}

      <Button type="submit" size="sm" disabled={isPending}>
        {isPending ? "Enviando..." : "Enviar"}
      </Button>
    </form>
  );
}

function DeleteArquivoForm({ fechamentoId, arquivoId }: { fechamentoId: string; arquivoId: string }) {
  const deleteAction = deleteArquivoAction.bind(null, fechamentoId, arquivoId);
  const [state, formAction, isPending] = useActionState(deleteAction, initialDeleteState);

  return (
    <form action={formAction} className="inline-flex flex-col items-end gap-1">
      <Button type="submit" size="sm" variant="outline" disabled={isPending}>
        {isPending ? "Excluindo..." : "Excluir"}
      </Button>
      {state.errorMessage ? <span className="text-xs text-red-600">{state.errorMessage}</span> : null}
      {state.successMessage ? <span className="text-xs text-emerald-700">{state.successMessage}</span> : null}
    </form>
  );
}
