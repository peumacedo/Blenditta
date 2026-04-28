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
  { pattern: /^\/fechamentos\/[^/]+\/conciliacao$/, title: "Validação das Bases" },
  { pattern: /^\/fechamentos\/[^/]+\/dashboard$/, title: "Dashboard" },
  { pattern: /^\/fechamentos\/[^/]+\/auditoria$/, title: "Auditoria" },
  { pattern: /^\/fechamentos\/[^/]+\/relatorio$/, title: "Relatório" }
];

function getPageTitle(pathname: string) {
  return routeTitles.find((item) => item.pattern.test(pathname))?.title ?? "Blenditta";
}

export function AppShell({ children, demoMode = false }: { children: ReactNode; demoMode?: boolean }) {
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);

  return (
    <div className="min-h-screen bg-sand-100 text-coffee-900">
      <div className="mx-auto flex min-h-screen max-w-7xl">
        <aside className="hidden w-64 border-r border-coffee-200 bg-card lg:block">
          <div className="border-b border-slate-200 px-5 py-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Blenditta</p>
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
                    active ? "bg-coffee-700 text-sand-100" : "text-coffee-900 hover:bg-sand-200"
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
          <header className="flex h-16 items-center justify-between border-b border-coffee-200 bg-card px-5">
            <div>
              <p className="text-sm text-muted-foreground">MVP Financeiro</p>
              <p className="text-base font-semibold">{pageTitle}</p>
            </div>
            <div className="flex items-center gap-2">
              {demoMode ? (
                <div className="rounded-md border border-amber-300 bg-amber-50 px-3 py-1.5 text-sm text-amber-700">
                  Modo demonstração
                </div>
              ) : null}
              <div className="rounded-md border border-coffee-200 bg-sand-100 px-3 py-1.5 text-sm text-coffee-900">
                Navegação pronta
              </div>
            </div>
          </header>

          <main className="flex-1 p-5">{children}</main>
        </div>
      </div>
    </div>
  );
}
