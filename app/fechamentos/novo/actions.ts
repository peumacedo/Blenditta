"use server";

import { FechamentoStatus } from "@prisma/client";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

type CreateFechamentoFormState = {
  errors?: {
    competencia?: string[];
    observacoes?: string[];
    general?: string[];
  };
  successMessage?: string;
  createdId?: string;
};

const createFechamentoSchema = z.object({
  competencia: z
    .string({ required_error: "Informe a competência." })
    .regex(/^\d{4}-\d{2}$/, "Informe uma competência válida no formato AAAA-MM."),
  observacoes: z
    .string()
    .trim()
    .max(500, "As observações devem ter no máximo 500 caracteres.")
    .optional()
});

function getMonthRange(competencia: string) {
  const [year, month] = competencia.split("-").map(Number);
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 1));

  return { start, end };
}

export async function createFechamentoAction(
  _prevState: CreateFechamentoFormState,
  formData: FormData
): Promise<CreateFechamentoFormState> {
  const parsed = createFechamentoSchema.safeParse({
    competencia: formData.get("competencia"),
    observacoes: formData.get("observacoes")
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const { competencia, observacoes } = parsed.data;
  const { start, end } = getMonthRange(competencia);

  const existing = await prisma.fechamento.findFirst({
    where: {
      competencia: {
        gte: start,
        lt: end
      }
    },
    select: {
      id: true
    }
  });

  if (existing) {
    return {
      errors: {
        competencia: ["Já existe um fechamento para essa competência."]
      }
    };
  }

  try {
    const fechamento = await prisma.fechamento.create({
      data: {
        competencia: start,
        observacoes: observacoes || null,
        status: FechamentoStatus.EM_PREPARACAO
      },
      select: {
        id: true
      }
    });

    return {
      successMessage: "Fechamento criado com sucesso. Redirecionando...",
      createdId: fechamento.id
    };
  } catch {
    return {
      errors: {
        general: ["Não foi possível criar o fechamento. Tente novamente."]
      }
    };
  }
}
