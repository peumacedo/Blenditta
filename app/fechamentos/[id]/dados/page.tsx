import { StagePage } from "@/components/fechamentos/stage-page";

export default async function DadosPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return <StagePage id={id} title="Dados do fechamento" description="Visão dos dados importados" />;
}
