import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";

import "./globals.css";


export const metadata: Metadata = {
  title: "Blenditta | Fechamento Mensal",
  description: "MVP para fechamento financeiro mensal da Blenditta"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
