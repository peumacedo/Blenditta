"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarClock } from "lucide-react";

import { cn } from "@/lib/utils";

const navItems = [{ label: "Fechamentos", href: "/fechamentos", icon: CalendarClock }];

const routeTitles: Array<{ pattern: RegExp; title: string }> = [
  { pattern: /^\/fechamentos$/, title: "Fechamentos mensais" },
  { pattern: /^\/fechamentos\/novo$/, title: "Novo fechamento" },
  { pattern: /^\/fechamentos\/[^/]+$/, title: "Detalhe do fechamento" },
  { pattern: /^\/fechamentos\/[^/]+\/upload$/, title: "Upload de arquivos" },
  { pattern: /^\/fechamentos\/[^/]+\/dados$/, title: "Dados do fechamento" },
  { pattern: /^\/fechamentos\/[^/]+\/conciliacao$/, title: "Conciliação" },
  { pattern: /^\/fechamentos\/[^/]+\/dashboard$/, title: "Dashboard" },
  { pattern: /^\/fechamentos\/[^/]+\/auditoria$/, title: "Auditoria" },
  { pattern: /^\/fechamentos\/[^/]+\/relatorio$/, title: "Relatório" }
];

function getPageTitle(pathname: string) {
  return routeTitles.find((item) => item.pattern.test(pathname))?.title ?? "Blenditta";
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-7xl">
        <aside className="hidden w-64 border-r border-slate-200 bg-white lg:block">
          <div className="border-b border-slate-200 px-5 py-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Blenditta</p>
            <h1 className="mt-1 text-lg font-semibold">Fechamento Mensal</h1>
          </div>

          <nav className="space-y-1 p-3">
            {navItems.map(({ label, href, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(`${href}/`);

              return (
                <Link
                  key={label}
                  href={href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                    active ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="flex flex-1 flex-col">
          <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-5">
            <div>
              <p className="text-sm text-slate-500">MVP Financeiro</p>
              <p className="text-base font-semibold">{pageTitle}</p>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-600">
              Navegação pronta
            </div>
          </header>

          <main className="flex-1 p-5">{children}</main>
        </div>
      </div>
    </div>
  );
}
