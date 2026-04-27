"use client";

import { type Arquivo } from "@prisma/client";
import { useActionState, useEffect, useRef } from "react";

import {
  deleteArquivoAction,
  type DeleteActionState,
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

type UploadFilesPanelProps = {
  fechamentoId: string;
  arquivos: Arquivo[];
};

export function UploadFilesPanel({ fechamentoId, arquivos }: UploadFilesPanelProps) {
  return (
    <div className="space-y-6">
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
                      <Badge variant="secondary">{uploadTypeLabels[arquivo.tipo as (typeof uploadFileTypes)[number]] ?? arquivo.tipo}</Badge>
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
