import type { ReactNode } from "react";
import Link from "next/link";
import { BarChart3, CalendarClock, Home, Settings } from "lucide-react";

const navItems = [
  { label: "Visão geral", href: "/", icon: Home },
  { label: "Fechamentos", href: "#", icon: CalendarClock },
  { label: "Relatórios", href: "#", icon: BarChart3 },
  { label: "Configurações", href: "#", icon: Settings }
];

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-7xl">
        <aside className="hidden w-64 border-r border-slate-200 bg-white lg:block">
          <div className="border-b border-slate-200 px-5 py-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Blenditta
            </p>
            <h1 className="mt-1 text-lg font-semibold">Fechamento Mensal</h1>
          </div>
          <nav className="space-y-1 p-3">
            {navItems.map(({ label, href, icon: Icon }) => (
              <Link
                key={label}
                href={href}
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-100"
              >
                <Icon className="h-4 w-4 text-slate-500" />
                <span>{label}</span>
              </Link>
            ))}
          </nav>
        </aside>

        <div className="flex flex-1 flex-col">
          <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-5">
            <div>
              <p className="text-sm text-slate-500">MVP Financeiro</p>
              <p className="text-base font-semibold">Painel inicial</p>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-600">
              Ambiente local
            </div>
          </header>

          <main className="flex-1 p-5">{children}</main>
        </div>
      </div>
    </div>
  );
}
