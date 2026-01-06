"use client";

import React, { useState, useRef, useCallback } from "react";
import { Image, Video, Music, FileText, BarChart3, FileEdit, Package, Paperclip, Upload, X } from "lucide-react";
import { 
  fileUploadVariants,
  fileUploadDragVariants,
  fileUploadContentVariants,
  fileUploadIconVariants,
  fileUploadTextVariants,
  fileUploadHelperVariants 
} from "./FileUpload.variants.js";
import type { FileUploadProps, FileUploadFileType } from "./FileUpload.types.js";

/**
 * FileUpload component - Bold Contemporary Pop Art Adventure
 * 
 * Features:
 * - Bold dashed borders for drag area
 * - Clear visual hierarchy
 * - Drag and drop support
 * - File type icons
 * - Progress tracking
 * - CVA-based variants for consistent theming
 * 
 * @example
 * ```tsx
 * <FileUpload
 *   accept="image/*,.pdf"
 *   multiple
 *   maxSize={10 * 1024 * 1024} // 10MB
 *   onFilesSelect={(files) => console.log('Files selected:', files)}
 *   onFileRemove={(fileId) => console.log('File removed:', fileId)}
 * />
 * ```
 */
export function FileUpload({
  accept,
  multiple = false,
  maxSize,
  maxFiles,
  files = [],
  onFilesSelect,
  onFileRemove,
  disabled = false,
  label = "Drop files here or click to browse",
  helperText,
  showFileList = true,
  compact = false,
  inverted = false,
  className,
}: FileUploadProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File type detection
  const getFileType = (type: string): FileUploadFileType => {
    if (type.startsWith('image/')) return 'image';
    if (type.startsWith('video/')) return 'video';
    if (type.startsWith('audio/')) return 'audio';
    if (type.includes('pdf') || type.includes('document')) return 'document';
    if (type.includes('spreadsheet') || type.includes('excel')) return 'spreadsheet';
    if (type.includes('presentation') || type.includes('powerpoint')) return 'presentation';
    if (type.includes('zip') || type.includes('rar') || type.includes('tar')) return 'archive';
    return 'other';
  };

  // Get icon for file type
  const getFileIcon = (type: FileUploadFileType) => {
    switch (type) {
      case 'image': return <Image className="w-5 h-5" />;
      case 'video': return <Video className="w-5 h-5" />;
      case 'audio': return <Music className="w-5 h-5" />;
      case 'document': return <FileText className="w-5 h-5" />;
      case 'spreadsheet': return <BarChart3 className="w-5 h-5" />;
      case 'presentation': return <FileEdit className="w-5 h-5" />;
      case 'archive': return <Package className="w-5 h-5" />;
      default: return <Paperclip className="w-5 h-5" />;
    }
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Handle file selection
  const handleFilesSelect = useCallback((selectedFiles: File[]) => {
    if (disabled) return;

    // Filter by max files
    if (maxFiles && files.length + selectedFiles.length > maxFiles) {
      selectedFiles = selectedFiles.slice(0, maxFiles - files.length);
    }

    // Filter by file size
    if (maxSize) {
      selectedFiles = selectedFiles.filter(file => file.size <= maxSize);
    }

    onFilesSelect?.(selectedFiles);
  }, [disabled, files.length, maxFiles, maxSize, onFilesSelect]);

  // Handle drag events
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragActive(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (disabled) return;

    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFilesSelect(droppedFiles);
  }, [disabled, handleFilesSelect]);

  // Handle click to browse
  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle file input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    handleFilesSelect(selectedFiles);
    
    // Reset input value
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={fileUploadVariants({ compact, disabled, className })}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
            e.preventDefault();
            handleClick();
          }
        }}
        aria-label={label}
      >
        {/* Drag Overlay */}
        <div className={fileUploadDragVariants({ isDragActive })}>
          <div className="text-center">
            <Upload className="w-8 h-8 text-brand-primary" />
            <p className="text-brand-primary font-bold">Drop files here</p>
          </div>
        </div>

        {/* Content */}
        <div className={fileUploadContentVariants({})}>
          <div className={fileUploadIconVariants({})}>
            <Upload />
          </div>
          
          <div className={fileUploadTextVariants({})}>
            <p className="font-medium">{label}</p>
            {helperText && (
              <p className={fileUploadHelperVariants({})}>
                {helperText}
              </p>
            )}
          </div>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled}
        />
      </div>

      {/* File List */}
      {showFileList && files.length > 0 && (
        <div className="space-y-2">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-3 border-2 rounded-[var(--radius-card)] bg-surface-elevated border-border"
            >
              <div className="flex items-center gap-3">
                <div className="text-text-secondary">
                  {getFileIcon(getFileType(file.type))}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-text-primary truncate">
                    {file.name}
                  </p>
                  <p className="text-sm text-text-muted">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Status */}
                {file.status === 'uploading' && (
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-border rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-primary transition-all duration-[var(--duration-fast)]"
                        style={{ width: `${file.progress || 0}%` }}
                      />
                    </div>
                    <span className="text-xs text-text-muted">
                      {file.progress || 0}%
                    </span>
                  </div>
                )}
                
                {file.status === 'complete' && (
                  <span className="text-xs text-success-600">✓ Complete</span>
                )}
                
                {file.status === 'error' && (
                  <span className="text-xs text-error-600">✗ Error</span>
                )}

                {/* Remove Button */}
                {onFileRemove && (
                  <button
                    onClick={() => onFileRemove(file.id)}
                    className="p-1 text-text-muted hover:text-error-600 transition-colors"
                    aria-label={`Remove ${file.name}`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
