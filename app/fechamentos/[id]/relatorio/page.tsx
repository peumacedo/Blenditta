import { StagePage } from "@/components/fechamentos/stage-page";

export default async function RelatorioPage({ params }: { params: { id: string } }) {
  const { id } = params;

  return <StagePage id={id} title="Relatório" description="Consolidação final para exportação" />;
}
