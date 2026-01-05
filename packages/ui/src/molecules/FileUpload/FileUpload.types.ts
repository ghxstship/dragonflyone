/**
 * Uploaded file interface
 */
export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  progress?: number;
  status: FileUploadStatus;
  error?: string;
  url?: string;
}

/**
 * File upload status types
 */
export type FileUploadStatus = 
  | "uploading"
  | "complete"
  | "error";

/**
 * FileUpload component props
 */
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
  
  /** Inverted theme */
  inverted?: boolean;
  
  /** Custom className */
  className?: string;
}

/**
 * File upload file type categories
 */
export type FileUploadFileType = 
  | "image"
  | "video"
  | "audio"
  | "document"
  | "spreadsheet"
  | "presentation"
  | "archive"
  | "other";
