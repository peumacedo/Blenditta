import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function NovoFechamentoPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Novo fechamento</CardTitle>
        <CardDescription>Fluxo de criação será implementado na próxima etapa do MVP.</CardDescription>
      </CardHeader>
      <CardContent>
        <Link href="/fechamentos" className={buttonVariants({ variant: "outline" })}>
          Voltar para lista
        </Link>
      </CardContent>
    </Card>
  );
}
