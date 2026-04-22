import { StagePage } from "@/components/fechamentos/stage-page";

export default async function RelatorioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return <StagePage id={id} title="Relatório" description="Consolidação final para exportação" />;
}
