import { StagePage } from "@/components/fechamentos/stage-page";

export default async function DashboardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return <StagePage id={id} title="Dashboard" description="Resumo executivo do fechamento" />;
}
