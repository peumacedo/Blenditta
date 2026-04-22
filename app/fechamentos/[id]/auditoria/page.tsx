import { StagePage } from "@/components/fechamentos/stage-page";

export default async function AuditoriaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return <StagePage id={id} title="Auditoria" description="Rastreabilidade das alterações" />;
}
