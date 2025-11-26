"use client";

import React, { useState, useRef, useCallback } from "react";
import clsx from "clsx";

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

  return (
    <div className={clsx("flex flex-col gap-4", className)}>
      {/* Dropzone */}
      <div
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={clsx(
          "border-2 border-dashed text-center transition-colors duration-base",
          compact ? "p-6" : "p-10",
          isDragging ? "border-black bg-grey-100" : disabled ? "border-grey-300" : "border-grey-500 bg-white hover:border-black hover:bg-grey-50",
          disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          disabled={disabled}
          className="hidden"
        />

        {/* Upload icon */}
        <div className={compact ? "text-2xl mb-2" : "text-[32px] mb-4"}>
          ⬆️
        </div>

        {/* Label */}
        <div
          className={clsx(
            "font-code text-black tracking-widest mb-2",
            compact ? "text-mono-sm" : "text-mono-md"
          )}
        >
          {label}
        </div>

        {/* Helper text */}
        {helperText && (
          <div className="font-body text-body-sm text-grey-600">
            {helperText}
          </div>
        )}

        {/* Constraints info */}
        <div className="font-code text-mono-xs text-grey-500 mt-3 flex justify-center gap-4 flex-wrap">
          {accept && <span>FORMATS: {accept.replace(/,/g, ", ")}</span>}
          {maxSize && <span>MAX: {formatFileSize(maxSize)}</span>}
          {maxFiles && <span>LIMIT: {maxFiles} FILES</span>}
        </div>
      </div>

      {/* File list */}
      {showFileList && files.length > 0 && (
        <div className="flex flex-col gap-2">
          {files.map((file) => (
            <div
              key={file.id}
              className={clsx(
                "flex items-center gap-3 px-4 py-3 border",
                file.status === "error" ? "bg-grey-100 border-grey-400" : "bg-white border-grey-200"
              )}
            >
              {/* File icon */}
              <span className="text-xl">{getFileIcon(file.type)}</span>

              {/* File info */}
              <div className="flex-1 min-w-0">
                <div className="font-body text-body-sm text-black overflow-hidden text-ellipsis whitespace-nowrap">
                  {file.name}
                </div>
                <div
                  className={clsx(
                    "font-code text-mono-xs",
                    file.status === "error" ? "text-grey-600" : "text-grey-500"
                  )}
                >
                  {file.status === "error"
                    ? file.error || "Upload failed"
                    : formatFileSize(file.size)}
                </div>

                {/* Progress bar */}
                {file.status === "uploading" && file.progress !== undefined && (
                  <div className="h-1 bg-grey-200 mt-1.5">
                    <div
                      className="h-full bg-black transition-all duration-fast"
                      style={{ width: `${file.progress}%` }}
                    />
                  </div>
                )}
              </div>

              {/* Status / Remove button */}
              {file.status === "uploading" ? (
                <span className="font-code text-mono-xs text-grey-600">
                  {file.progress}%
                </span>
              ) : (
                <button
                  onClick={() => onFileRemove?.(file.id)}
                  className="w-6 h-6 bg-transparent border-none cursor-pointer text-grey-500 text-sm flex items-center justify-center transition-colors duration-fast hover:text-black"
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
