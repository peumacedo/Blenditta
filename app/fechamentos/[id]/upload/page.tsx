import { StagePage } from "@/components/fechamentos/stage-page";

export default async function UploadPage({ params }: { params: { id: string } }) {
  const { id } = params;

  return <StagePage id={id} title="Upload de arquivos" description="Envio de documentos e extratos" />;
}
