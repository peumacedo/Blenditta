"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";

import { createFechamentoAction, type CreateFechamentoFormState } from "@/app/fechamentos/novo/actions";
import { Button } from "@/components/ui/button";

const initialState: CreateFechamentoFormState = {};

export function NovoFechamentoForm() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(createFechamentoAction, initialState);

  useEffect(() => {
    if (state?.createdId) {
      router.push(`/fechamentos/${state.createdId}`);
    }
  }, [router, state?.createdId]);

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="competencia" className="text-sm font-medium text-slate-700">
          Competência
        </label>
        <input
          id="competencia"
          name="competencia"
          type="month"
          required
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-slate-400"
        />
        {state?.errors?.competencia?.map((error) => (
          <p key={error} className="text-sm text-red-600">
            {error}
          </p>
        ))}
      </div>

      <div className="space-y-2">
        <label htmlFor="observacoes" className="text-sm font-medium text-slate-700">
          Observações
        </label>
        <textarea
          id="observacoes"
          name="observacoes"
          rows={4}
          maxLength={500}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-slate-400"
          placeholder="Anotações iniciais para o fechamento (opcional)."
        />
        {state?.errors?.observacoes?.map((error) => (
          <p key={error} className="text-sm text-red-600">
            {error}
          </p>
        ))}
      </div>

      {state?.errors?.general?.map((error) => (
        <p key={error} className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ))}

      {state?.successMessage ? (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {state.successMessage}
        </p>
      ) : null}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Criando..." : "Criar fechamento"}
        </Button>
        <Link href="/fechamentos" className="text-sm text-slate-600 underline-offset-4 hover:underline">
          Cancelar
        </Link>
      </div>
    </form>
  );
}
