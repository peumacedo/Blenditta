import { redirect } from "next/navigation";

export default function HomePage() {
  redirect("/fechamentos");
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
      <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
        Sistema
      </p>
      <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
        Blenditta · Fechamento Financeiro Mensal
      </h2>
      <p className="max-w-2xl text-sm leading-relaxed text-slate-600">
        Fundação inicial do MVP pronta para receber módulos de contas, conciliação,
        aprovações e relatórios de fechamento.
      </p>
      <div className="pt-2">
        <Button variant="outline">Começar implementação do fluxo</Button>
      </div>
    </section>
  );
}
