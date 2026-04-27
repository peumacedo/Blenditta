import { StagePage } from "@/components/fechamentos/stage-page";

export default async function DashboardPage({ params }: { params: { id: string } }) {
  const { id } = params;

  return <StagePage id={id} title="Dashboard" description="Resumo executivo do fechamento" />;
}
