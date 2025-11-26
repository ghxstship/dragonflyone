"use client";

import React, { useState, useCallback } from "react";
import clsx from "clsx";

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
  // Export props
  exportFormats?: ExportFormat[];
  columns?: ColumnConfig[];
  onExport?: (format: ExportFormat, selectedColumns: string[]) => Promise<void>;
  totalRecords?: number;
  // Common
  loading?: boolean;
  className?: string;
}

export function ImportExportDialog({
  open,
  onClose,
  mode,
  entityType,
  entityLabel,
  onImport,
  importTemplates = [],
  acceptedFormats = ".csv,.xlsx,.json",
  maxFileSize = 10 * 1024 * 1024,
  sampleFields = [],
  exportFormats = ["csv", "json", "excel"],
  columns = [],
  onExport,
  totalRecords,
  loading = false,
  className = "",
}: ImportExportDialogProps) {
  // Import state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [fieldMapping, setFieldMapping] = useState<Record<string, string>>({});
  const [importStep, setImportStep] = useState<"upload" | "mapping" | "preview">("upload");
  const [dragActive, setDragActive] = useState(false);

  // Export state
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("csv");
  const [selectedColumns, setSelectedColumns] = useState<Set<string>>(
    new Set(columns.filter(c => c.selected !== false).map(c => c.key))
  );

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const label = entityLabel || entityType;

  const handleFileSelect = useCallback((file: File) => {
    if (file.size > maxFileSize) {
      setError(`File size exceeds ${Math.round(maxFileSize / 1024 / 1024)}MB limit`);
      return;
    }
    setSelectedFile(file);
    setError(null);
    setImportStep("mapping");
  }, [maxFileSize]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const handleImport = async () => {
    if (!selectedFile || !onImport) return;
    setProcessing(true);
    setError(null);
    try {
      await onImport(selectedFile, fieldMapping);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setProcessing(false);
    }
  };

  const handleExport = async () => {
    if (!onExport) return;
    setProcessing(true);
    setError(null);
    try {
      await onExport(selectedFormat, Array.from(selectedColumns));
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Export failed");
    } finally {
      setProcessing(false);
    }
  };

  const toggleColumn = (key: string) => {
    setSelectedColumns(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const selectAllColumns = () => setSelectedColumns(new Set(columns.map(c => c.key)));
  const deselectAllColumns = () => setSelectedColumns(new Set());

  if (!open) return null;

  return (
    <div
      className={clsx("fixed inset-0 z-modal flex items-center justify-center p-4", className)}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-black/50"
        onClick={processing ? undefined : onClose}
      />
      
      <div className="relative bg-white border-2 border-black shadow-hard-lg w-full max-w-[600px] max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b-2 border-black">
          <h2 className="font-heading text-h4-md tracking-wider uppercase">
            {mode === "import" ? `Import ${label}` : `Export ${label}`}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={processing}
            className={clsx("p-2 bg-transparent border-none text-xl", processing ? "cursor-not-allowed" : "cursor-pointer")}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {error && (
            <div className="px-4 py-3 mb-4 bg-grey-100 border border-grey-300 font-code text-mono-sm text-grey-700">
              ⚠️ {error}
            </div>
          )}

          {mode === "import" ? (
            <>
              {importStep === "upload" && (
                <div
                  onDragEnter={() => setDragActive(true)}
                  onDragLeave={() => setDragActive(false)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById("file-input")?.click()}
                  className={clsx(
                    "px-8 py-12 border-2 border-dashed text-center cursor-pointer transition-colors duration-base",
                    dragActive ? "border-black bg-grey-100" : "border-grey-400 bg-white hover:border-black"
                  )}
                >
                  <input
                    id="file-input"
                    type="file"
                    accept={acceptedFormats}
                    onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                    className="hidden"
                  />
                  <div className="text-[32px] mb-4">⬆️</div>
                  <div className="font-code text-mono-md tracking-widest mb-2">
                    DROP FILE HERE OR CLICK TO UPLOAD
                  </div>
                  <div className="font-body text-body-sm text-grey-500">
                    Supported formats: {acceptedFormats.replace(/\./g, "").toUpperCase()}
                  </div>
                </div>
              )}

              {importStep === "mapping" && selectedFile && (
                <div>
                  <div className="mb-6 p-4 bg-grey-100 border border-grey-200">
                    <div className="font-code text-mono-sm text-grey-600">Selected file:</div>
                    <div className="font-body text-body-md font-semibold">{selectedFile.name}</div>
                  </div>

                  {importTemplates.length > 0 && (
                    <div className="mb-6">
                      <label className="block mb-2 font-heading text-body-sm tracking-wider uppercase">
                        Use Template
                      </label>
                      <select
                        value={selectedTemplate}
                        onChange={(e) => {
                          setSelectedTemplate(e.target.value);
                          const template = importTemplates.find(t => t.id === e.target.value);
                          if (template) setFieldMapping(template.mapping);
                        }}
                        className="w-full px-4 py-3 font-body text-body-md border-2 border-black"
                      >
                        <option value="">Manual mapping</option>
                        {importTemplates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                    </div>
                  )}

                  {sampleFields.length > 0 && (
                    <div>
                      <div className="font-heading text-body-sm tracking-wider uppercase mb-3">
                        Field Mapping
                      </div>
                      <div className="flex flex-col gap-2">
                        {sampleFields.map(field => (
                          <div key={field} className="flex items-center gap-3">
                            <span className="flex-1 font-code text-mono-sm">{field}</span>
                            <span className="text-grey-400">→</span>
                            <input
                              type="text"
                              value={fieldMapping[field] || ""}
                              onChange={(e) => setFieldMapping(prev => ({ ...prev, [field]: e.target.value }))}
                              placeholder="Database field"
                              className="flex-1 p-2 font-code text-mono-sm border border-grey-300"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <>
              {/* Export Format */}
              <div className="mb-6">
                <div className="font-heading text-body-sm tracking-wider uppercase mb-3">
                  Export Format
                </div>
                <div className="flex gap-2 flex-wrap">
                  {exportFormats.map(format => (
                    <button
                      key={format}
                      type="button"
                      onClick={() => setSelectedFormat(format)}
                      className={clsx(
                        "px-4 py-2 font-code text-mono-sm tracking-wide uppercase border-2 border-black cursor-pointer",
                        selectedFormat === format ? "bg-black text-white" : "bg-white text-black hover:bg-grey-100"
                      )}
                    >
                      {format}
                    </button>
                  ))}
                </div>
              </div>

              {/* Column Selection */}
              {columns.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-heading text-body-sm tracking-wider uppercase">
                      Select Columns ({selectedColumns.size}/{columns.length})
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={selectAllColumns} className="font-code text-mono-xs text-grey-600 bg-transparent border-none cursor-pointer underline">All</button>
                      <button type="button" onClick={deselectAllColumns} className="font-code text-mono-xs text-grey-600 bg-transparent border-none cursor-pointer underline">None</button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-auto p-2 border border-grey-200">
                    {columns.map(col => (
                      <label key={col.key} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={selectedColumns.has(col.key)} onChange={() => toggleColumn(col.key)} className="w-4 h-4" />
                        <span className="font-body text-body-sm">{col.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {totalRecords !== undefined && (
                <div className="mt-4 font-code text-mono-sm text-grey-600">
                  {totalRecords.toLocaleString()} records will be exported
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t-2 border-grey-200">
          <button
            type="button"
            onClick={onClose}
            disabled={processing}
            className={clsx(
              "px-6 py-3 font-heading text-body-md tracking-wider uppercase bg-white text-black border-2 border-black",
              processing ? "cursor-not-allowed" : "cursor-pointer hover:bg-grey-100"
            )}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={mode === "import" ? handleImport : handleExport}
            disabled={processing || loading || (mode === "import" && !selectedFile) || (mode === "export" && selectedColumns.size === 0)}
            className={clsx(
              "px-6 py-3 font-heading text-body-md tracking-wider uppercase bg-black text-white border-2 border-black flex items-center gap-2",
              processing || (mode === "import" && !selectedFile) || (mode === "export" && selectedColumns.size === 0)
                ? "cursor-not-allowed opacity-50"
                : "cursor-pointer hover:bg-grey-900"
            )}
          >
            {processing && <span className="inline-block w-3.5 h-3.5 border-2 border-grey-500 border-t-white rounded-full animate-spin" />}
            {mode === "import" ? "Import" : "Export"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ImportExportDialog;
