"use client";

import React, { useState, useRef, useCallback } from "react";
import { colors, typography, fontSizes, letterSpacing, transitions, borderWidths } from "../tokens.js";

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  progress?: number;
  status: "uploading" | "complete" | "error";
  error?: string;
  url?: string;
}

export interface FileUploadProps {
  /** Accepted file types (e.g., "image/*,.pdf") */
  accept?: string;
  /** Allow multiple files */
  multiple?: boolean;
  /** Maximum file size in bytes */
  maxSize?: number;
  /** Maximum number of files */
  maxFiles?: number;
  /** Current uploaded files */
  files?: UploadedFile[];
  /** File selection handler */
  onFilesSelect?: (files: File[]) => void;
  /** File removal handler */
  onFileRemove?: (fileId: string) => void;
  /** Disabled state */
  disabled?: boolean;
  /** Custom upload label */
  label?: string;
  /** Helper text */
  helperText?: string;
  /** Show file list */
  showFileList?: boolean;
  /** Compact mode */
  compact?: boolean;
  /** Custom className */
  className?: string;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function getFileIcon(type: string): string {
  if (type.startsWith("image/")) return "🖼️";
  if (type.startsWith("video/")) return "🎬";
  if (type.startsWith("audio/")) return "🎵";
  if (type.includes("pdf")) return "📄";
  if (type.includes("spreadsheet") || type.includes("excel")) return "📊";
  if (type.includes("document") || type.includes("word")) return "📝";
  if (type.includes("zip") || type.includes("archive")) return "📦";
  return "📎";
}

export function FileUpload({
  accept,
  multiple = false,
  maxSize,
  maxFiles,
  files = [],
  onFilesSelect,
  onFileRemove,
  disabled = false,
  label = "DROP FILES HERE OR CLICK TO UPLOAD",
  helperText,
  showFileList = true,
  compact = false,
  className = "",
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFiles = useCallback(
    (fileList: FileList | File[]): { valid: File[]; errors: string[] } => {
      const valid: File[] = [];
      const errors: string[] = [];
      const filesArray = Array.from(fileList);

      // Check max files
      if (maxFiles && files.length + filesArray.length > maxFiles) {
        errors.push(`Maximum ${maxFiles} files allowed`);
        return { valid, errors };
      }

      filesArray.forEach((file) => {
        // Check file size
        if (maxSize && file.size > maxSize) {
          errors.push(`${file.name} exceeds maximum size of ${formatFileSize(maxSize)}`);
          return;
        }

        // Check file type
        if (accept) {
          const acceptedTypes = accept.split(",").map((t) => t.trim());
          const isAccepted = acceptedTypes.some((type) => {
            if (type.startsWith(".")) {
              return file.name.toLowerCase().endsWith(type.toLowerCase());
            }
            if (type.endsWith("/*")) {
              return file.type.startsWith(type.replace("/*", "/"));
            }
            return file.type === type;
          });

          if (!isAccepted) {
            errors.push(`${file.name} is not an accepted file type`);
            return;
          }
        }

        valid.push(file);
      });

      return { valid, errors };
    },
    [accept, maxSize, maxFiles, files.length]
  );

  const handleFiles = useCallback(
    (fileList: FileList | File[]) => {
      const { valid, errors } = validateFiles(fileList);

      if (errors.length > 0) {
        // Could emit errors via callback if needed
        console.warn("File validation errors:", errors);
      }

      if (valid.length > 0) {
        onFilesSelect?.(valid);
      }
    },
    [validateFiles, onFilesSelect]
  );

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const { files: droppedFiles } = e.dataTransfer;
    if (droppedFiles.length > 0) {
      handleFiles(droppedFiles);
    }
  };

  const handleClick = () => {
    if (!disabled) {
      inputRef.current?.click();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files: selectedFiles } = e.target;
    if (selectedFiles && selectedFiles.length > 0) {
      handleFiles(selectedFiles);
    }
    // Reset input value to allow selecting same file again
    e.target.value = "";
  };

  const dropzonePadding = compact ? "1.5rem" : "2.5rem";

  return (
    <div className={className} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {/* Dropzone */}
      <div
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        style={{
          padding: dropzonePadding,
          border: `${borderWidths.medium} dashed ${
            isDragging ? colors.black : disabled ? colors.grey300 : colors.grey500
          }`,
          backgroundColor: isDragging ? colors.grey100 : colors.white,
          cursor: disabled ? "not-allowed" : "pointer",
          transition: transitions.base,
          textAlign: "center",
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          disabled={disabled}
          style={{ display: "none" }}
        />

        {/* Upload icon */}
        <div
          style={{
            fontSize: compact ? "24px" : "32px",
            marginBottom: compact ? "0.5rem" : "1rem",
          }}
        >
          ⬆️
        </div>

        {/* Label */}
        <div
          style={{
            fontFamily: typography.mono,
            fontSize: compact ? fontSizes.monoSM : fontSizes.monoMD,
            color: colors.black,
            letterSpacing: letterSpacing.widest,
            marginBottom: "0.5rem",
          }}
        >
          {label}
        </div>

        {/* Helper text */}
        {helperText && (
          <div
            style={{
              fontFamily: typography.body,
              fontSize: fontSizes.bodySM,
              color: colors.grey600,
            }}
          >
            {helperText}
          </div>
        )}

        {/* Constraints info */}
        <div
          style={{
            fontFamily: typography.mono,
            fontSize: fontSizes.monoXS,
            color: colors.grey500,
            marginTop: "0.75rem",
            display: "flex",
            justifyContent: "center",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          {accept && <span>FORMATS: {accept.replace(/,/g, ", ")}</span>}
          {maxSize && <span>MAX: {formatFileSize(maxSize)}</span>}
          {maxFiles && <span>LIMIT: {maxFiles} FILES</span>}
        </div>
      </div>

      {/* File list */}
      {showFileList && files.length > 0 && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
          }}
        >
          {files.map((file) => (
            <div
              key={file.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.75rem 1rem",
                backgroundColor: file.status === "error" ? colors.grey100 : colors.white,
                border: `1px solid ${file.status === "error" ? colors.grey400 : colors.grey200}`,
              }}
            >
              {/* File icon */}
              <span style={{ fontSize: "20px" }}>{getFileIcon(file.type)}</span>

              {/* File info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: typography.body,
                    fontSize: fontSizes.bodySM,
                    color: colors.black,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {file.name}
                </div>
                <div
                  style={{
                    fontFamily: typography.mono,
                    fontSize: fontSizes.monoXS,
                    color: file.status === "error" ? colors.grey600 : colors.grey500,
                  }}
                >
                  {file.status === "error"
                    ? file.error || "Upload failed"
                    : formatFileSize(file.size)}
                </div>

                {/* Progress bar */}
                {file.status === "uploading" && file.progress !== undefined && (
                  <div
                    style={{
                      height: "4px",
                      backgroundColor: colors.grey200,
                      marginTop: "0.375rem",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${file.progress}%`,
                        backgroundColor: colors.black,
                        transition: transitions.fast,
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Status / Remove button */}
              {file.status === "uploading" ? (
                <span
                  style={{
                    fontFamily: typography.mono,
                    fontSize: fontSizes.monoXS,
                    color: colors.grey600,
                  }}
                >
                  {file.progress}%
                </span>
              ) : (
                <button
                  onClick={() => onFileRemove?.(file.id)}
                  style={{
                    width: "24px",
                    height: "24px",
                    backgroundColor: "transparent",
                    border: "none",
                    cursor: "pointer",
                    color: colors.grey500,
                    fontSize: "14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: transitions.fast,
                  }}
                  aria-label={`Remove ${file.name}`}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FileUpload;
