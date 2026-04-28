"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { processFechamentoFiles } from "@/lib/import/process-fechamento-files";
import { type ImportSummary } from "@/lib/import/types";
import { isDemoMode } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import {
  MAX_UPLOAD_SIZE_BYTES,
  isAllowedExtension,
  removeStoredFile,
  sanitizeOriginalFileName,
  saveUploadedFile
} from "@/lib/file-storage";

export const uploadFileTypes = [
  "extrato_bancario",
  "contas_pagar",
  "contas_receber",
  "fluxo_caixa_omie",
  "adicional"
] as const;

const uploadSchema = z.object({
  tipo: z.enum(uploadFileTypes),
  file: z.instanceof(File)
});

export type UploadActionState = {
  successMessage?: string;
  errorMessage?: string;
};

export async function uploadArquivoAction(
  fechamentoId: string,
  _prevState: UploadActionState,
  formData: FormData
): Promise<UploadActionState> {
  const parsed = uploadSchema.safeParse({
    tipo: formData.get("tipo"),
    file: formData.get("arquivo")
  });

  if (!parsed.success) {
    return { errorMessage: "Selecione um tipo de arquivo e envie um arquivo válido." };
  }

  const { file, tipo } = parsed.data;

  if (isDemoMode) {
    return { successMessage: "Modo demonstração: upload simulado. Nenhum arquivo foi salvo." };
  }


  if (file.size === 0) {
    return { errorMessage: "Não é possível enviar um arquivo vazio." };
  }

  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    return { errorMessage: "O arquivo excede o limite de 10 MB." };
  }

  if (!isAllowedExtension(file.name)) {
    return { errorMessage: "Extensão não permitida. Use CSV, XLSX, XLS, PDF, PNG, JPG ou JPEG." };
  }

  const fechamento = await prisma.fechamento.findUnique({
    where: { id: fechamentoId },
    select: { id: true }
  });

  if (!fechamento) {
    return { errorMessage: "Fechamento não encontrado." };
  }

  const sanitizedOriginalName = sanitizeOriginalFileName(file.name);

  try {
    const { relativePath } = await saveUploadedFile({
      fechamentoId,
      file,
      sanitizedOriginalName
    });

    await prisma.arquivo.create({
      data: {
        fechamentoId,
        nome: sanitizedOriginalName,
        tipo,
        caminho: relativePath
      }
    });

    revalidatePath(`/fechamentos/${fechamentoId}/upload`);

    return { successMessage: "Arquivo enviado com sucesso." };
  } catch {
    return { errorMessage: "Não foi possível salvar o arquivo. Tente novamente." };
  }
}

export type DeleteActionState = {
  successMessage?: string;
  errorMessage?: string;
};

export async function deleteArquivoAction(
  fechamentoId: string,
  arquivoId: string,
  prevState: DeleteActionState
): Promise<DeleteActionState> {
  void prevState;

  if (isDemoMode) {
    return { successMessage: "Modo demonstração: exclusão simulada." };
  }
  const arquivo = await prisma.arquivo.findFirst({
    where: {
      id: arquivoId,
      fechamentoId
    },
    select: {
      id: true,
      caminho: true
    }
  });

  if (!arquivo) {
    return { errorMessage: "Arquivo não encontrado para este fechamento." };
  }

  try {
    await prisma.arquivo.delete({
      where: {
        id: arquivo.id
      }
    });

    await removeStoredFile(arquivo.caminho);

    revalidatePath(`/fechamentos/${fechamentoId}/upload`);

    return { successMessage: "Arquivo excluído com sucesso." };
  } catch {
    return { errorMessage: "Não foi possível excluir o arquivo." };
  }
}

export type ProcessActionState = {
  successMessage?: string;
  errorMessage?: string;
  summary?: ImportSummary;
};

export async function processArquivosAction(
  fechamentoId: string,
  prevState: ProcessActionState
): Promise<ProcessActionState> {
  void prevState;

  if (isDemoMode) {
    return { successMessage: "Modo demonstração: processamento simulado." };
  }

  const fechamento = await prisma.fechamento.findUnique({
    where: { id: fechamentoId },
    select: { id: true }
  });

  if (!fechamento) {
    return { errorMessage: "Fechamento não encontrado." };
  }

  try {
    const { summary } = await processFechamentoFiles(fechamentoId);

    revalidatePath(`/fechamentos/${fechamentoId}/upload`);
    revalidatePath(`/fechamentos/${fechamentoId}`);

    return {
      successMessage: "Processamento concluído.",
      summary
    };
  } catch {
    return { errorMessage: "Falha ao processar os arquivos deste fechamento." };
  }
}
