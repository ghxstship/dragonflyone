import type { BaseViewProps } from '../types.js';

export interface DocumentViewProps<T extends { id: string }> extends BaseViewProps<T> {
  /** Field for document title */
  titleField: keyof T;
  
  /** Field for document content */
  contentField: keyof T;
  
  /** Field for document type */
  typeField?: keyof T;
  
  /** Field for document format */
  formatField?: keyof T;
  
  /** Field for document size */
  sizeField?: keyof T;
  
  /** Field for document URL */
  urlField?: keyof T;
  
  /** Field for document thumbnail */
  thumbnailField?: keyof T;
  
  /** Field for document author */
  authorField?: keyof T;
  
  /** Field for document created date */
  createdField?: keyof T;
  
  /** Field for document modified date */
  modifiedField?: keyof T;
  
  /** Default view mode */
  defaultView?: DocumentViewMode;
  
  /** Enable document preview */
  enablePreview?: boolean;
  
  /** Enable document editing */
  enableEditing?: boolean;
  
  /** Enable document download */
  enableDownload?: boolean;
  
  /** Enable document sharing */
  enableSharing?: boolean;
  
  /** Enable document printing */
  enablePrinting?: boolean;
  
  /** Show document thumbnails */
  showThumbnails?: boolean;
  
  /** Show document details */
  showDetails?: boolean;
  
  /** Compact mode */
  compact?: boolean;
  
  /** Custom document renderer */
  documentRenderer?: (document: DocumentItem<T>) => React.ReactNode;
  
  /** Custom toolbar renderer */
  toolbarRenderer?: (document: DocumentItem<T>) => React.ReactNode;
  
  /** Document click handler */
  onDocumentClick?: (document: T) => void;
  
  /** Document double-click handler */
  onDocumentDoubleClick?: (document: T) => void;
  
  /** Document edit handler */
  onDocumentEdit?: (document: T, content: string) => Promise<T>;
  
  /** Document download handler */
  onDocumentDownload?: (document: T) => Promise<void>;
  
  /** Document share handler */
  onDocumentShare?: (document: T) => Promise<string>;
  
  /** Document print handler */
  onDocumentPrint?: (document: T) => Promise<void>;
  
  /** Document configuration */
  config?: {
    previewWidth?: number;
    previewHeight?: number;
    thumbnailSize?: number;
    maxFileSize?: number;
    supportedFormats?: string[];
    toolbarActions?: DocumentToolbarAction[];
  };
}

export type DocumentViewMode = 
  | 'grid'
  | 'list'
  | 'carousel'
  | 'reader';

export type DocumentFormat = 
  | 'pdf'
  | 'doc'
  | 'docx'
  | 'xls'
  | 'xlsx'
  | 'ppt'
  | 'pptx'
  | 'txt'
  | 'md'
  | 'html'
  | 'jpg'
  | 'png'
  | 'gif'
  | 'svg';

export interface DocumentItem<T> {
  /** Document data */
  data: T;
  
  /** Document ID */
  id: string;
  
  /** Document title */
  title: string;
  
  /** Document content */
  content?: string;
  
  /** Document type */
  type?: string;
  
  /** Document format */
  format?: DocumentFormat;
  
  /** Document size */
  size?: number;
  
  /** Document URL */
  url?: string;
  
  /** Document thumbnail */
  thumbnail?: string;
  
  /** Document author */
  author?: string;
  
  /** Document created date */
  created?: Date;
  
  /** Document modified date */
  modified?: Date;
  
  /** Is selected */
  selected?: boolean;
  
  /** Is being edited */
  isEditing?: boolean;
  
  /** Is loading */
  isLoading?: boolean;
  
  /** Preview content */
  preview?: string;
  
  /** Document metadata */
  metadata?: Record<string, any>;
  
  /** Document permissions */
  permissions?: {
    canEdit: boolean;
    canDownload: boolean;
    canShare: boolean;
    canPrint: boolean;
    canDelete: boolean;
  };
}

export interface DocumentToolbarAction {
  /** Action ID */
  id: string;
  
  /** Action label */
  label: string;
  
  /** Action icon */
  icon: string;
  
  /** Action type */
  type: 'button' | 'dropdown' | 'separator';
  
  /** Action handler */
  handler: () => void;
  
  /** Is enabled */
  enabled?: boolean;
  
  /** Is visible */
  visible?: boolean;
  
  /** Dropdown items */
  items?: DocumentToolbarAction[];
}

export interface DocumentPreview {
  /** Document ID */
  documentId: string;
  
  /** Preview content */
  content: string;
  
  /** Preview type */
  type: 'text' | 'image' | 'pdf' | 'html';
  
  /** Preview dimensions */
  dimensions: {
    width: number;
    height: number;
  };
  
  /** Preview scale */
  scale: number;
  
  /** Preview rotation */
  rotation: number;
  
  /** Preview page number */
  pageNumber?: number;
  
  /** Total pages */
  totalPages?: number;
}

export interface DocumentStats {
  /** Total documents */
  totalDocuments: number;
  
  /** Documents by type */
  documentsByType: Record<string, number>;
  
  /** Documents by format */
  documentsByFormat: Record<DocumentFormat, number>;
  
  /** Total storage used */
  totalStorage: number;
  
  /** Average document size */
  averageSize: number;
  
  /** Recently accessed */
  recentlyAccessed: DocumentItem<any>[];
  
  /** Most shared */
  mostShared: DocumentItem<any>[];
}

export interface DocumentSearchResult {
  /** Result ID */
  id: string;
  
  /** Document title */
  title: string;
  
  /** Document content snippet */
  snippet: string;
  
  /** Relevance score */
  score: number;
  
  /** Highlight ranges */
  highlights: {
    start: number;
    end: number;
    text: string;
  }[];
}

export interface DocumentViewState {
  /** Current view mode */
  viewMode: DocumentViewMode;
  
  /** Selected documents */
  selectedDocuments: Set<string>;
  
  /** Current document */
  currentDocument?: string;
  
  /** Preview state */
  preview: {
    isOpen: boolean;
    documentId?: string;
    scale: number;
    rotation: number;
    pageNumber?: number;
  };
  
  /** Search state */
  search: {
    query: string;
    results: DocumentSearchResult[];
    isSearching: boolean;
  };
  
  /** Editing state */
  editing: {
    isEditing: boolean;
    documentId?: string;
    content?: string;
    originalContent?: string;
  };
  
  /** Toolbar state */
  toolbar: {
    visible: boolean;
    actions: DocumentToolbarAction[];
  };
  
  /** Loading state */
  isLoading: boolean;
  
  /** Error state */
  error?: string;
}
