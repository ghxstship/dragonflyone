/**
 * Shared Export Utilities
 * 
 * Provides standardized export functionality for all ListPage users.
 * Supports CSV, JSON, and Excel formats with column selection.
 */

/** Export format type - matches ImportExportDialog */
export type ExportFormat = "csv" | "json" | "excel" | "pdf";

export interface ExportOptions {
  /** Filename prefix (e.g., "crew", "assets") */
  filename: string;
  /** Data to export */
  data: Record<string, unknown>[];
  /** Selected columns to include */
  selectedColumns: string[];
  /** Export format */
  format: ExportFormat;
}

/**
 * Generates a timestamped filename for exports
 */
export function generateExportFilename(prefix: string, format: ExportFormat): string {
  const date = new Date().toISOString().split("T")[0];
  const extension = format === "excel" ? "xlsx" : format;
  return `${prefix}-export-${date}.${extension}`;
}

/**
 * Converts data to CSV format
 */
export function toCSV(data: Record<string, unknown>[], columns: string[]): string {
  const headers = columns.join(",");
  const rows = data.map(row => 
    columns.map(col => {
      const value = row[col];
      // Escape quotes and wrap in quotes if contains comma, quote, or newline
      const str = String(value ?? "");
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    }).join(",")
  );
  return [headers, ...rows].join("\n");
}

/**
 * Converts data to JSON format
 */
export function toJSON(data: Record<string, unknown>[], columns: string[]): string {
  const filtered = data.map(row => {
    const obj: Record<string, unknown> = {};
    columns.forEach(col => {
      obj[col] = row[col];
    });
    return obj;
  });
  return JSON.stringify(filtered, null, 2);
}

/**
 * Downloads a file with the given content
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Main export function - handles all formats
 */
export async function exportData(options: ExportOptions): Promise<void> {
  const { filename, data, selectedColumns, format } = options;
  
  // Filter data to only include selected columns
  const filteredData = data.map(row => {
    const obj: Record<string, unknown> = {};
    selectedColumns.forEach(col => {
      obj[col] = row[col];
    });
    return obj;
  });

  const exportFilename = generateExportFilename(filename, format);

  switch (format) {
    case "csv": {
      const csv = toCSV(filteredData, selectedColumns);
      downloadFile(csv, exportFilename, "text/csv;charset=utf-8;");
      break;
    }
    case "json": {
      const json = toJSON(filteredData, selectedColumns);
      downloadFile(json, exportFilename, "application/json");
      break;
    }
    case "excel": {
      // For Excel, we'll use CSV as a fallback since xlsx requires additional dependencies
      // In production, you'd use a library like xlsx or exceljs
      const csv = toCSV(filteredData, selectedColumns);
      downloadFile(csv, exportFilename.replace(".xlsx", ".csv"), "text/csv;charset=utf-8;");
      break;
    }
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
}

/**
 * Creates an export handler for use with ListPage
 * 
 * @example
 * ```tsx
 * const handleExport = createExportHandler({
 *   filename: "crew",
 *   getData: () => crewData.map(c => ({
 *     id: c.id,
 *     name: c.name,
 *     role: c.role,
 *     department: c.department,
 *   })),
 * });
 * 
 * <ListPage onExport={handleExport} />
 * ```
 */
export function createExportHandler<T extends Record<string, unknown>>(config: {
  filename: string;
  getData: () => T[];
}): (format: ExportFormat, selectedColumns: string[]) => Promise<void> {
  return async (format: ExportFormat, selectedColumns: string[]) => {
    const data = config.getData();
    await exportData({
      filename: config.filename,
      data,
      selectedColumns,
      format,
    });
  };
}
