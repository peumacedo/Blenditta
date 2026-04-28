import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

import { type GenericRow, type ParsedFile, type ParsedTable } from "./types.ts";

const execFileAsync = promisify(execFile);

function normalizeHeaderName(header: string) {
  return header
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_$]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

function splitDelimitedLine(line: string, delimiter: string): string[] {
  const cells: string[] = [];
  let current = "";
  let insideQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];

    if (char === '"') {
      if (insideQuotes && line[index + 1] === '"') {
        current += '"';
        index += 1;
        continue;
      }

      insideQuotes = !insideQuotes;
      continue;
    }

    if (char === delimiter && !insideQuotes) {
      cells.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  cells.push(current.trim());
  return cells;
}

function countDelimiterOutsideQuotes(line: string, delimiter: string): number {
  let count = 0;
  let insideQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];

    if (char === '"') {
      if (insideQuotes && line[index + 1] === '"') {
        index += 1;
        continue;
      }

      insideQuotes = !insideQuotes;
      continue;
    }

    if (char === delimiter && !insideQuotes) {
      count += 1;
    }
  }

  return count;
}

export function detectDelimiter(content: string): ";" | "," {
  const lines = content
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .slice(0, 10);

  if (lines.length === 0) {
    return ",";
  }

  const delimiterCandidates: Array<";" | ","> = [";", ","];

  const best = delimiterCandidates
    .map((delimiter) => {
      const score = lines.reduce((acc, line) => acc + countDelimiterOutsideQuotes(line, delimiter), 0);
      return { delimiter, score };
    })
    .sort((a, b) => b.score - a.score)[0];

  return best.score > 0 ? best.delimiter : ",";
}

function parseDelimitedText(content: string, delimiter: ";" | ","): ParsedTable {
  const lines = content
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0) {
    return { headers: [], rows: [] };
  }

  const rawHeaders = splitDelimitedLine(lines[0], delimiter);
  const headers = rawHeaders.map((header, index) => normalizeHeaderName(header || `coluna_${index + 1}`));

  const rows = lines.slice(1).map((line) => {
    const cells = splitDelimitedLine(line, delimiter);

    return headers.reduce<GenericRow>((acc, header, index) => {
      acc[header] = (cells[index] ?? "").trim();
      return acc;
    }, {});
  });

  return { headers, rows };
}

function parseSpreadsheetXml(xml: string): ParsedTable {
  const sharedStrings = Array.from(xml.matchAll(/<si>([\s\S]*?)<\/si>/g)).map((entry) => {
    const textPieces = Array.from(entry[1].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)).map((piece) => piece[1]);
    return textPieces.join("").trim();
  });

  const sheetMatch = xml.match(/<worksheet[\s\S]*?<sheetData>([\s\S]*?)<\/sheetData>[\s\S]*?<\/worksheet>/);
  if (!sheetMatch) {
    return { headers: [], rows: [] };
  }

  const rowsData: string[][] = [];
  const rowMatches = sheetMatch[1].matchAll(/<row[^>]*>([\s\S]*?)<\/row>/g);

  for (const rowMatch of rowMatches) {
    const cells: string[] = [];
    const cellMatches = rowMatch[1].matchAll(/<c([^>]*)>([\s\S]*?)<\/c>/g);

    for (const cellMatch of cellMatches) {
      const attrs = cellMatch[1];
      const valueMatch = cellMatch[2].match(/<v>([\s\S]*?)<\/v>/);
      const rawValue = valueMatch ? valueMatch[1] : "";

      if (attrs.includes(' t="s"')) {
        const ssIndex = Number(rawValue);
        cells.push(sharedStrings[ssIndex] ?? "");
      } else {
        cells.push(rawValue);
      }
    }

    rowsData.push(cells);
  }

  if (rowsData.length === 0) {
    return { headers: [], rows: [] };
  }

  const headers = (rowsData[0] ?? []).map((header, index) => normalizeHeaderName(header || `coluna_${index + 1}`));
  const rows = rowsData.slice(1).map((row) =>
    headers.reduce<GenericRow>((acc, header, index) => {
      acc[header] = String(row[index] ?? "").trim();
      return acc;
    }, {})
  );

  return { headers, rows };
}

async function parseXlsxFile(filePath: string): Promise<ParsedFile> {
  const warnings: string[] = [];

  const { stdout: workbookXml } = await execFileAsync("unzip", ["-p", filePath, "xl/workbook.xml"]);
  const sheetPathMatch = workbookXml.match(/<sheet[^>]*r:id="rId(\d+)"[^>]*>/);

  if (!sheetPathMatch) {
    warnings.push("Planilha XLSX sem abas legíveis.");
    return { table: { headers: [], rows: [] }, warnings };
  }

  const sheetRel = `xl/worksheets/sheet${sheetPathMatch[1]}.xml`;

  const [{ stdout: sheetXml }, sharedStringsResult] = await Promise.all([
    execFileAsync("unzip", ["-p", filePath, sheetRel]),
    execFileAsync("unzip", ["-p", filePath, "xl/sharedStrings.xml"]).catch(() => ({ stdout: "" }))
  ]);

  const table = parseSpreadsheetXml(`${sharedStringsResult.stdout}\n${sheetXml}`);

  return { table, warnings };
}

export function normalizeHeader(rawHeader: string) {
  return normalizeHeaderName(rawHeader);
}

export function isEmptyRow(row: GenericRow) {
  return Object.values(row).every((value) => value.trim().length === 0);
}

export async function parseFileToRows(caminhoRelativo: string): Promise<ParsedFile> {
  const absolutePath = path.resolve(process.cwd(), caminhoRelativo);
  const extension = path.extname(caminhoRelativo).toLowerCase();

  if (extension === ".csv") {
    const content = await readFile(absolutePath, "utf8");
    const delimiter = detectDelimiter(content);
    return { table: parseDelimitedText(content, delimiter), warnings: [] };
  }

  if (extension === ".xlsx") {
    return parseXlsxFile(absolutePath);
  }

  if (extension === ".xls") {
    const buffer = await readFile(absolutePath);
    const utf8 = buffer.toString("utf8");

    if (utf8.includes(",") || utf8.includes(";")) {
      const delimiter = detectDelimiter(utf8);
      return {
        table: parseDelimitedText(utf8, delimiter),
        warnings: ["Arquivo .xls textual processado como delimitado; valide os dados importados."]
      };
    }

    return {
      table: { headers: [], rows: [] },
      warnings: ["Arquivo .xls binário não pôde ser lido neste ambiente."]
    };
  }

  return {
    table: { headers: [], rows: [] },
    warnings: ["Formato não suportado para importação nesta etapa."]
  };
}
