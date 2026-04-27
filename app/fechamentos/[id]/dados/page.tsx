import { StagePage } from "@/components/fechamentos/stage-page";

export default async function DadosPage({ params }: { params: { id: string } }) {
  const { id } = params;

  return <StagePage id={id} title="Dados do fechamento" description="Visão dos dados importados" />;
}
