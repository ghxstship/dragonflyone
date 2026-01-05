"use client";

import React, { useState, useCallback } from "react";
import clsx from "clsx";
import { Upload, AlertTriangle, ArrowRight, Download } from "lucide-react";
import { Modal } from "../Modal/index.js";
import { dropZoneVariants, formatButtonVariants } from "./ImportExportDialog.variants.js";
import type { 
  ImportExportDialogProps,
  ExportFormat
} from "./ImportExportDialog.types.js";

/**
 * ImportExportDialog component - Bold Contemporary Pop Art Adventure
 * 
 * Features:
 * - Dual-mode dialog for import and export operations
 * - Drag-and-drop file upload with visual feedback
 * - Field mapping interface for data imports
 * - Column selection for data exports
 * - Multiple export formats (CSV, JSON, Excel, PDF)
 * - Template-based import workflows
 * - Error handling and loading states
 */
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
  templateDownloadUrl,
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

  const _label = entityLabel || entityType;

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

  const footerContent = (
    <div className="flex items-center justify-end gap-3">
      <button
        type="button"
        onClick={onClose}
        disabled={processing}
        className={clsx(
          "px-6 py-3 font-heading text-base tracking-wider uppercase leading-none bg-surface-primary text-text-primary border-2 border-border",
          processing ? "cursor-not-allowed" : "cursor-pointer hover:bg-muted"
        )}
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={mode === "import" ? handleImport : handleExport}
        disabled={processing || loading || (mode === "import" && !selectedFile) || (mode === "export" && selectedColumns.size === 0)}
        className={clsx(
          "px-6 py-3 font-heading text-base tracking-wider uppercase leading-none bg-surface-inverse text-text-primary border-2 border-border flex items-center gap-2",
          processing || (mode === "import" && !selectedFile) || (mode === "export" && selectedColumns.size === 0)
            ? "cursor-not-allowed opacity-50"
            : "cursor-pointer hover:bg-surface-elevated"
        )}
      >
        {processing && <span className="inline-block w-3 h-3 border-2 border-border border-t-on-dark-primary rounded-full animate-spin" />}
        {mode === "import" ? "Import" : "Export"}
      </button>
    </div>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      showClose={!processing}
      className={className}
    >
      {/* Error */}
      {error && (
        <div className="px-4 py-3 mb-4 bg-error/10 border-2 border-error/20 rounded-card font-mono text-sm text-error flex items-center gap-2">
          <AlertTriangle className="size-4 flex-shrink-0" />
          {error}
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
              className={dropZoneVariants({ dragActive })}
            >
              <input
                id="file-input"
                type="file"
                accept={acceptedFormats}
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                className="hidden"
              />
              <div className="text-4xl mb-4"><Upload className="size-10 mx-auto text-text-muted" /></div>
              <div className="font-mono text-base tracking-widest mb-2">
                DROP FILE HERE OR CLICK TO UPLOAD
              </div>
              <div className="font-body text-sm text-text-muted">
                Supported formats: {acceptedFormats.replace(/\./g, "").toUpperCase()}
              </div>
              {templateDownloadUrl && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(templateDownloadUrl, "_blank");
                  }}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 font-body text-sm border-2 border-border bg-surface-primary hover:bg-muted transition-colors cursor-pointer"
                >
                  <Download className="size-4" />
                  Download Template
                </button>
              )}
            </div>
          )}

          {importStep === "mapping" && selectedFile && (
            <div>
              <div className="mb-6 p-4 bg-muted border-2 border-border rounded-card">
                <div className="font-mono text-sm text-text-muted">Selected file:</div>
                <div className="font-body text-base font-semibold">{selectedFile.name}</div>
              </div>

              {importTemplates.length > 0 && (
                <div className="mb-6">
                  <label className="block mb-2 font-heading text-sm tracking-wider uppercase">
                    Use Template
                  </label>
                  <select
                    value={selectedTemplate}
                    onChange={(e) => {
                      setSelectedTemplate(e.target.value);
                      const template = importTemplates.find(t => t.id === e.target.value);
                      if (template) setFieldMapping(template.mapping);
                    }}
                    className="w-full px-4 py-3 font-body text-base border-2 border-border"
                  >
                    <option value="">Manual mapping</option>
                    {importTemplates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
              )}

              {sampleFields.length > 0 && (
                <div>
                  <div className="font-heading text-sm tracking-wider uppercase mb-3">
                    Field Mapping
                  </div>
                  <div className="flex flex-col gap-2">
                    {sampleFields.map(field => (
                      <div key={field} className="flex items-center gap-3">
                        <span className="flex-1 font-mono text-sm">{field}</span>
                        <ArrowRight className="size-4 text-text-muted" />
                        <input
                          type="text"
                          value={fieldMapping[field] || ""}
                          onChange={(e) => setFieldMapping(prev => ({ ...prev, [field]: e.target.value }))}
                          placeholder="Database field"
                          className="flex-1 p-2 font-mono text-sm border-2 border-border"
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
            <div className="font-heading text-sm tracking-wider uppercase mb-3">
              Export Format
            </div>
            <div className="flex gap-2 flex-wrap">
              {exportFormats.map(format => (
                <button
                  key={format}
                  type="button"
                  onClick={() => setSelectedFormat(format)}
                  className={formatButtonVariants({ selected: selectedFormat === format })}
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
                <div className="font-heading text-sm tracking-wider uppercase">
                  Select Columns ({selectedColumns.size}/{columns.length})
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={selectAllColumns} className="font-mono text-xs text-text-muted bg-transparent border-none cursor-pointer underline">All</button>
                  <button type="button" onClick={deselectAllColumns} className="font-mono text-xs text-text-muted bg-transparent border-none cursor-pointer underline">None</button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 max-h-64 overflow-auto p-2 border-2 border-border rounded-card">
                {columns.map(col => (
                  <label key={col.key} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={selectedColumns.has(col.key)} onChange={() => toggleColumn(col.key)} className="w-4 h-4" />
                    <span className="font-body text-sm">{col.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {totalRecords !== undefined && (
            <div className="mt-4 font-mono text-sm text-text-muted">
              {totalRecords.toLocaleString()} records will be exported
            </div>
          )}
        </>
      )}
      
      {/* Footer */}
      <div className="p-6 border-t-2 border-border bg-surface-elevated">
        {footerContent}
      </div>
    </Modal>
  );
}

export default ImportExportDialog;
