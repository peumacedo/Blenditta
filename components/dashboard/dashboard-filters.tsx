"use client";

import { useMemo, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Opt = { label: string; value: string };

export function DashboardFilters({
  competencias,
  categorias,
  tipos,
  status
}: {
  competencias: Opt[];
  categorias: Opt[];
  tipos: Opt[];
  status: Opt[];
}) {
  const [form, setForm] = useState({ competencia: "", categoria: "", tipo: "", status: "", mom: "on", yoy: "off" });

  const comparativo = useMemo(
    () => `${form.mom === "on" ? "MoM ativo" : "MoM inativo"} · ${form.yoy === "on" ? "YoY ativo" : "YoY inativo"}`,
    [form.mom, form.yoy]
  );

  const renderSelect = (name: keyof typeof form, label: string, opts: Opt[]) => (
    <label className="text-xs text-muted-foreground">
      {label}
      <select
        className="mt-1 w-full rounded border bg-white px-2 py-1 text-sm"
        value={form[name]}
        onChange={(e) => setForm((prev) => ({ ...prev, [name]: e.target.value }))}
      >
        <option value="">Todos</option>
        {opts.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </label>
  );

  return (
    <Card className="border-coffee-200">
      <CardHeader><CardTitle className="text-base">Filtros de análise (estrutura inicial)</CardTitle></CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        {renderSelect("competencia", "Competência", competencias)}
        {renderSelect("categoria", "Categoria", categorias)}
        {renderSelect("tipo", "Tipo de movimentação", tipos)}
        {renderSelect("status", "Status", status)}
        {renderSelect("mom", "Comparação mês anterior", [{ label: "Ativo", value: "on" }, { label: "Inativo", value: "off" }])}
        {renderSelect("yoy", "Comparação ano anterior", [{ label: "Ativo", value: "on" }, { label: "Inativo", value: "off" }])}
        <p className="text-xs text-muted-foreground md:col-span-3 xl:col-span-6">{comparativo}. Nesta etapa, os filtros preparam a estrutura visual sem impactar todos os blocos.</p>
      </CardContent>
    </Card>
  );
}
