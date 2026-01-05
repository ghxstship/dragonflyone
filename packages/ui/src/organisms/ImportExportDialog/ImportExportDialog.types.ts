export type ExportFormat = "csv" | "json" | "excel" | "pdf";

export interface ColumnConfig {
  key: string;
  label: string;
  selected?: boolean;
}

export interface ImportTemplate {
  id: string;
  name: string;
  mapping: Record<string, string>;
}

export interface ImportExportDialogProps {
  open: boolean;
  onClose: () => void;
  mode: "import" | "export";
  entityType: string;
  entityLabel?: string;
  // Import props
  onImport?: (file: File, mapping: Record<string, string>) => Promise<void>;
  importTemplates?: ImportTemplate[];
  acceptedFormats?: string;
  maxFileSize?: number;
  sampleFields?: string[];
  /** URL to download a pre-formatted template file */
  templateDownloadUrl?: string;
  // Export props
  exportFormats?: ExportFormat[];
  columns?: ColumnConfig[];
  onExport?: (format: ExportFormat, selectedColumns: string[]) => Promise<void>;
  totalRecords?: number;
  // Common
  loading?: boolean;
  className?: string;
}
