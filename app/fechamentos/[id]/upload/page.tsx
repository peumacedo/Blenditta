import { StagePage } from "@/components/fechamentos/stage-page";

export default async function UploadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return <StagePage id={id} title="Upload de arquivos" description="Envio de documentos e extratos" />;
}
