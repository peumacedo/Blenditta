import { FechamentoStatus } from "@prisma/client";

export const fechamentoStatusLabel: Record<FechamentoStatus, string> = {
  EM_PREPARACAO: "Em preparação",
  PROCESSANDO: "Processando",
  EM_REVISAO: "Em revisão",
  FECHADO: "Fechado"
};

export const fechamentoStatusColor: Record<
  FechamentoStatus,
  "secondary" | "default" | "outline"
> = {
  EM_PREPARACAO: "secondary",
  PROCESSANDO: "outline",
  EM_REVISAO: "secondary",
  FECHADO: "default"
};

export function formatCompetencia(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric"
  }).format(date);
}

export function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(date);
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(value);
}
