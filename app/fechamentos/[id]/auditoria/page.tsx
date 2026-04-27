import { StagePage } from "@/components/fechamentos/stage-page";

export default async function AuditoriaPage({ params }: { params: { id: string } }) {
  const { id } = params;

  return <StagePage id={id} title="Auditoria" description="Rastreabilidade das alterações" />;
}
