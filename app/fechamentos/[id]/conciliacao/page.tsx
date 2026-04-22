import { StagePage } from "@/components/fechamentos/stage-page";

export default async function ConciliacaoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return <StagePage id={id} title="Conciliação" description="Conferência entre extratos e contas" />;
}
