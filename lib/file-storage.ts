import { randomUUID } from "crypto";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";

export const ALLOWED_EXTENSIONS = [".csv", ".xlsx", ".xls", ".pdf", ".png", ".jpg", ".jpeg"] as const;
export const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024;

const uploadsRoot = path.join(process.cwd(), "uploads");

function normalizeOriginalName(fileName: string) {
  return path.basename(fileName).normalize("NFKC");
}

function sanitizeName(name: string) {
  return name
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-.]+|[-.]+$/g, "")
    .slice(0, 120);
}

export function getExtension(fileName: string) {
  return path.extname(fileName).toLowerCase();
}

export function isAllowedExtension(fileName: string) {
  return ALLOWED_EXTENSIONS.includes(getExtension(fileName) as (typeof ALLOWED_EXTENSIONS)[number]);
}

export function sanitizeOriginalFileName(fileName: string) {
  const normalized = normalizeOriginalName(fileName);
  return sanitizeName(normalized) || `arquivo${getExtension(normalized)}`;
}

export async function saveUploadedFile({
  fechamentoId,
  file,
  sanitizedOriginalName
}: {
  fechamentoId: string;
  file: File;
  sanitizedOriginalName: string;
}) {
  const extension = getExtension(sanitizedOriginalName);
  const relativeDir = path.posix.join("uploads", "fechamentos", fechamentoId);
  const absoluteDir = path.join(uploadsRoot, "fechamentos", fechamentoId);
  await mkdir(absoluteDir, { recursive: true });

  const baseName = sanitizeName(path.basename(sanitizedOriginalName, extension)) || "arquivo";
  const safeFileName = `${Date.now()}-${baseName}-${randomUUID()}${extension}`;

  const relativePath = path.posix.join(relativeDir, safeFileName);
  const absolutePath = path.join(process.cwd(), relativePath);
  const content = Buffer.from(await file.arrayBuffer());

  await writeFile(absolutePath, content);

  return {
    relativePath,
    savedName: safeFileName
  };
}

export async function removeStoredFile(relativePath: string) {
  const normalized = path.normalize(relativePath);
  const absolutePath = path.resolve(process.cwd(), normalized);
  const allowedRoot = path.resolve(uploadsRoot);

  if (!absolutePath.startsWith(allowedRoot)) {
    return;
  }

  try {
    await unlink(absolutePath);
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException;

    if (nodeError.code !== "ENOENT") {
      throw error;
    }
  }
}
