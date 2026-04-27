export const importableFileTypes = ["extrato_bancario", "contas_pagar", "contas_receber"] as const;

export type ImportableFileType = (typeof importableFileTypes)[number];

export type GenericRow = Record<string, string>;

export type ParsedTable = {
  headers: string[];
  rows: GenericRow[];
};

export type ParsedFile = {
  table: ParsedTable;
  warnings: string[];
};

export type ImportTypeCounters = Record<ImportableFileType, number>;

export type ImportSummary = {
  processedFilesByType: ImportTypeCounters;
  importedRowsByType: ImportTypeCounters;
  ignoredRowsByType: ImportTypeCounters;
  unrecognizedColumnsByType: Record<ImportableFileType, string[]>;
  ignoredFileTypes: string[];
  warnings: string[];
  errors: string[];
};

export type MapResult<T> = {
  data: T[];
  ignoredRows: number;
  warnings: string[];
  unrecognizedColumns: string[];
};

