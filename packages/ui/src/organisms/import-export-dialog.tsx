"use client";

import React, { useState, useCallback } from "react";
import { colors, typography, fontSizes, letterSpacing, transitions, borderWidths } from "../tokens.js";

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
    <div className={className} style={{ position: "fixed", inset: 0, zIndex: 1400, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }} role="dialog" aria-modal="true">
      <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0, 0, 0, 0.5)" }} onClick={processing ? undefined : onClose} />
      
      <div style={{ position: "relative", backgroundColor: colors.white, border: `${borderWidths.medium} solid ${colors.black}`, boxShadow: "8px 8px 0 0 #000000", width: "100%", maxWidth: "600px", maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.25rem 1.5rem", borderBottom: `${borderWidths.medium} solid ${colors.black}` }}>
          <h2 style={{ fontFamily: typography.heading, fontSize: fontSizes.h4MD, letterSpacing: letterSpacing.wider, textTransform: "uppercase", margin: 0 }}>
            {mode === "import" ? `Import ${label}` : `Export ${label}`}
          </h2>
          <button type="button" onClick={onClose} disabled={processing} style={{ padding: "0.5rem", backgroundColor: "transparent", border: "none", cursor: processing ? "not-allowed" : "pointer", fontSize: "20px" }}>✕</button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: "auto", padding: "1.5rem" }}>
          {error && (
            <div style={{ padding: "0.75rem 1rem", marginBottom: "1rem", backgroundColor: colors.grey100, border: `1px solid ${colors.grey300}`, fontFamily: typography.mono, fontSize: fontSizes.monoSM, color: colors.grey700 }}>
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
                  style={{
                    padding: "3rem 2rem",
                    border: `${borderWidths.medium} dashed ${dragActive ? colors.black : colors.grey400}`,
                    backgroundColor: dragActive ? colors.grey100 : colors.white,
                    textAlign: "center",
                    cursor: "pointer",
                    transition: transitions.base,
                  }}
                >
                  <input
                    id="file-input"
                    type="file"
                    accept={acceptedFormats}
                    onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                    style={{ display: "none" }}
                  />
                  <div style={{ fontSize: "32px", marginBottom: "1rem" }}>⬆️</div>
                  <div style={{ fontFamily: typography.mono, fontSize: fontSizes.monoMD, letterSpacing: letterSpacing.widest, marginBottom: "0.5rem" }}>
                    DROP FILE HERE OR CLICK TO UPLOAD
                  </div>
                  <div style={{ fontFamily: typography.body, fontSize: fontSizes.bodySM, color: colors.grey500 }}>
                    Supported formats: {acceptedFormats.replace(/\./g, "").toUpperCase()}
                  </div>
                </div>
              )}

              {importStep === "mapping" && selectedFile && (
                <div>
                  <div style={{ marginBottom: "1.5rem", padding: "1rem", backgroundColor: colors.grey100, border: `1px solid ${colors.grey200}` }}>
                    <div style={{ fontFamily: typography.mono, fontSize: fontSizes.monoSM, color: colors.grey600 }}>Selected file:</div>
                    <div style={{ fontFamily: typography.body, fontSize: fontSizes.bodyMD, fontWeight: 600 }}>{selectedFile.name}</div>
                  </div>

                  {importTemplates.length > 0 && (
                    <div style={{ marginBottom: "1.5rem" }}>
                      <label style={{ display: "block", marginBottom: "0.5rem", fontFamily: typography.heading, fontSize: fontSizes.bodySM, letterSpacing: letterSpacing.wider, textTransform: "uppercase" }}>
                        Use Template
                      </label>
                      <select
                        value={selectedTemplate}
                        onChange={(e) => {
                          setSelectedTemplate(e.target.value);
                          const template = importTemplates.find(t => t.id === e.target.value);
                          if (template) setFieldMapping(template.mapping);
                        }}
                        style={{ width: "100%", padding: "0.75rem 1rem", fontFamily: typography.body, fontSize: fontSizes.bodyMD, border: `${borderWidths.medium} solid ${colors.black}` }}
                      >
                        <option value="">Manual mapping</option>
                        {importTemplates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                    </div>
                  )}

                  {sampleFields.length > 0 && (
                    <div>
                      <div style={{ fontFamily: typography.heading, fontSize: fontSizes.bodySM, letterSpacing: letterSpacing.wider, textTransform: "uppercase", marginBottom: "0.75rem" }}>
                        Field Mapping
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        {sampleFields.map(field => (
                          <div key={field} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                            <span style={{ flex: 1, fontFamily: typography.mono, fontSize: fontSizes.monoSM }}>{field}</span>
                            <span style={{ color: colors.grey400 }}>→</span>
                            <input
                              type="text"
                              value={fieldMapping[field] || ""}
                              onChange={(e) => setFieldMapping(prev => ({ ...prev, [field]: e.target.value }))}
                              placeholder="Database field"
                              style={{ flex: 1, padding: "0.5rem", fontFamily: typography.mono, fontSize: fontSizes.monoSM, border: `1px solid ${colors.grey300}` }}
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
              <div style={{ marginBottom: "1.5rem" }}>
                <div style={{ fontFamily: typography.heading, fontSize: fontSizes.bodySM, letterSpacing: letterSpacing.wider, textTransform: "uppercase", marginBottom: "0.75rem" }}>
                  Export Format
                </div>
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  {exportFormats.map(format => (
                    <button
                      key={format}
                      type="button"
                      onClick={() => setSelectedFormat(format)}
                      style={{
                        padding: "0.5rem 1rem",
                        fontFamily: typography.mono,
                        fontSize: fontSizes.monoSM,
                        letterSpacing: letterSpacing.wide,
                        textTransform: "uppercase",
                        backgroundColor: selectedFormat === format ? colors.black : colors.white,
                        color: selectedFormat === format ? colors.white : colors.black,
                        border: `${borderWidths.medium} solid ${colors.black}`,
                        cursor: "pointer",
                      }}
                    >
                      {format}
                    </button>
                  ))}
                </div>
              </div>

              {/* Column Selection */}
              {columns.length > 0 && (
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                    <div style={{ fontFamily: typography.heading, fontSize: fontSizes.bodySM, letterSpacing: letterSpacing.wider, textTransform: "uppercase" }}>
                      Select Columns ({selectedColumns.size}/{columns.length})
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button type="button" onClick={selectAllColumns} style={{ fontFamily: typography.mono, fontSize: fontSizes.monoXS, color: colors.grey600, backgroundColor: "transparent", border: "none", cursor: "pointer", textDecoration: "underline" }}>All</button>
                      <button type="button" onClick={deselectAllColumns} style={{ fontFamily: typography.mono, fontSize: fontSizes.monoXS, color: colors.grey600, backgroundColor: "transparent", border: "none", cursor: "pointer", textDecoration: "underline" }}>None</button>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.5rem", maxHeight: "200px", overflow: "auto", padding: "0.5rem", border: `1px solid ${colors.grey200}` }}>
                    {columns.map(col => (
                      <label key={col.key} style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                        <input type="checkbox" checked={selectedColumns.has(col.key)} onChange={() => toggleColumn(col.key)} style={{ width: "16px", height: "16px" }} />
                        <span style={{ fontFamily: typography.body, fontSize: fontSizes.bodySM }}>{col.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {totalRecords !== undefined && (
                <div style={{ marginTop: "1rem", fontFamily: typography.mono, fontSize: fontSizes.monoSM, color: colors.grey600 }}>
                  {totalRecords.toLocaleString()} records will be exported
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "0.75rem", padding: "1rem 1.5rem", borderTop: `${borderWidths.medium} solid ${colors.grey200}` }}>
          <button type="button" onClick={onClose} disabled={processing} style={{ padding: "0.75rem 1.5rem", fontFamily: typography.heading, fontSize: fontSizes.bodyMD, letterSpacing: letterSpacing.wider, textTransform: "uppercase", backgroundColor: colors.white, color: colors.black, border: `${borderWidths.medium} solid ${colors.black}`, cursor: processing ? "not-allowed" : "pointer" }}>
            Cancel
          </button>
          <button
            type="button"
            onClick={mode === "import" ? handleImport : handleExport}
            disabled={processing || loading || (mode === "import" && !selectedFile) || (mode === "export" && selectedColumns.size === 0)}
            style={{
              padding: "0.75rem 1.5rem",
              fontFamily: typography.heading,
              fontSize: fontSizes.bodyMD,
              letterSpacing: letterSpacing.wider,
              textTransform: "uppercase",
              backgroundColor: colors.black,
              color: colors.white,
              border: `${borderWidths.medium} solid ${colors.black}`,
              cursor: processing ? "not-allowed" : "pointer",
              opacity: processing || (mode === "import" && !selectedFile) || (mode === "export" && selectedColumns.size === 0) ? 0.5 : 1,
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            {processing && <span style={{ display: "inline-block", width: "14px", height: "14px", border: `2px solid ${colors.grey500}`, borderTopColor: colors.white, borderRadius: "50%", animation: "spin 1s linear infinite" }} />}
            {mode === "import" ? "Import" : "Export"}
          </button>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default ImportExportDialog;
