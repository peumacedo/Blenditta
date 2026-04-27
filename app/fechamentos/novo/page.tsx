import { NovoFechamentoForm } from "@/components/fechamentos/novo-fechamento-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function NovoFechamentoPage() {
  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <CardTitle>Novo fechamento</CardTitle>
        <CardDescription>
          Cadastre a competência mensal para iniciar o fluxo financeiro.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <NovoFechamentoForm />
      </CardContent>
    </Card>
  );
}
