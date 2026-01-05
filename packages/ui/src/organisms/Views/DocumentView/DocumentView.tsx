"use client";

import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
import clsx from "clsx";
import { Button, Badge, Icon } from "../../../index.js";
import { FileText, Download, Share2, Printer, Edit2, Search, Filter, Plus, Grid, List, Image, Eye, ZoomIn, ZoomOut, RotateCw } from "lucide-react";
import type { 
  DocumentViewProps, 
  DocumentViewMode,
  DocumentFormat,
  DocumentItem,
  DocumentToolbarAction,
  DocumentPreview,
  DocumentStats,
  DocumentSearchResult,
  DocumentViewState
} from "./DocumentView.types.js";
import type { BaseViewProps } from "../types.js";

/**
 * DOCUMENT VIEW
 * 
 * CHARACTERISTICS:
 * - Multiple view modes (grid, list, carousel, reader)
 * - Document preview and editing
 * - File format support
 * - Download and sharing
 * - Search and filtering
 * - Thumbnail generation
 * - Print functionality
 */
export function DocumentView<T extends { id: string }>({
  entityIds,
  entitySelector,
  filters = [],
  sort = [],
  groupBy,
  searchQuery = "",
  visibleFields = [],
  density = "default",
  showSubtasks = true,
  showCompleted = true,
  colorBy,
  selectionMode = "none",
  selectedIds = [],
  onSelectionChange,
  onEntityClick,
  onEntityDoubleClick,
  onContextMenu,
  onEntityUpdate,
  onEntityCreate,
  onEntityDelete,
  onEntityReorder,
  isLoading = false,
  error = null,
  emptyState,
  config = {},
  titleField,
  contentField,
  typeField,
  formatField,
  sizeField,
  urlField,
  thumbnailField,
  authorField,
  createdField,
  modifiedField,
  defaultView = "grid",
  enablePreview = true,
  enableEditing = true,
  enableDownload = true,
  enableSharing = true,
  enablePrinting = true,
  showThumbnails = true,
  showDetails = true,
  compact = false,
  documentRenderer,
  toolbarRenderer,
  onDocumentClick,
  onDocumentDoubleClick,
  onDocumentEdit,
  onDocumentDownload,
  onDocumentShare,
  onDocumentPrint,
  ...props
}: DocumentViewProps<T>) {
  const [viewMode, setViewMode] = useState<DocumentViewMode>(defaultView);
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set(selectedIds));
  const [currentDocument, setCurrentDocument] = useState<string | null>(null);
  const [searchQueryLocal, setSearchQueryLocal] = useState(searchQuery);
  const [searchResults, setSearchResults] = useState<DocumentSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [editingDocument, setEditingDocument] = useState<string | null>(null);
  const [previewScale, setPreviewScale] = useState(1);
  const [previewRotation, setPreviewRotation] = useState(0);
  const documentViewRef = useRef<HTMLDivElement>(null);

  // Document configuration
  const documentConfig = useMemo(() => ({
    previewWidth: 800,
    previewHeight: 600,
    thumbnailSize: compact ? 120 : 200,
    maxFileSize: 10 * 1024 * 1024, // 10MB
    supportedFormats: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'md', 'html', 'jpg', 'png', 'gif', 'svg'],
    toolbarActions: [
      { id: 'download', label: 'Download', icon: 'download', type: 'button', handler: () => {} },
      { id: 'share', label: 'Share', icon: 'share', type: 'button', handler: () => {} },
      { id: 'print', label: 'Print', icon: 'printer', type: 'button', handler: () => {} },
      { id: 'edit', label: 'Edit', icon: 'edit', type: 'button', handler: () => {} },
    ],
    ...config,
  }), [compact, config]);

  // Resolve entities from IDs
  const entities = useMemo(() => {
    if (!entitySelector) return [];
    return entityIds.map(id => entitySelector(id)).filter(Boolean) as T[];
  }, [entityIds, entitySelector]);

  // Filter entities
  const filteredEntities = useMemo(() => {
    let filtered = entities;

    // Apply search filter
    if (searchQueryLocal) {
      filtered = filtered.filter(entity =>
        Object.values(entity).some(value =>
          String(value).toLowerCase().includes(searchQueryLocal.toLowerCase())
        )
      );
    }

    // Apply filters
    filters.forEach(filter => {
      if (filter.isActive) {
        filtered = filtered.filter(entity => {
          const value = entity[filter.field as keyof T];
          switch (filter.operator) {
            case 'equals':
              return value === filter.value;
            case 'contains':
              return String(value).toLowerCase().includes(String(filter.value).toLowerCase());
            case 'greater_than':
              return Number(value) > Number(filter.value);
            case 'less_than':
              return Number(value) < Number(filter.value);
            default:
              return true;
          }
        });
      }
    });

    return filtered;
  }, [entities, searchQueryLocal, filters]);

  // Convert entities to document items
  const documentItems = useMemo((): DocumentItem<T>[] => {
    return filteredEntities.map(entity => {
      const title = String(entity[titleField]);
      const content = contentField ? String(entity[contentField]) : undefined;
      const type = typeField ? String(entity[typeField]) : 'document';
      const format = formatField ? String(entity[formatField]) as DocumentFormat : 'pdf';
      const size = sizeField ? Number(entity[sizeField]) : 0;
      const url = urlField ? String(entity[urlField]) : undefined;
      const thumbnail = thumbnailField ? String(entity[thumbnailField]) : undefined;
      const author = authorField ? String(entity[authorField]) : undefined;
      const created = createdField ? new Date(entity[createdField] as string) : new Date();
      const modified = modifiedField ? new Date(entity[modifiedField] as string) : new Date();

      return {
        data: entity,
        id: entity.id,
        title,
        content,
        type,
        format,
        size,
        url,
        thumbnail,
        author,
        created,
        modified,
        selected: selectedDocuments.has(entity.id),
        isEditing: editingDocument === entity.id,
        isLoading: false,
        preview: content,
        metadata: {},
        permissions: {
          canEdit: enableEditing,
          canDownload: enableDownload,
          canShare: enableSharing,
          canPrint: enablePrinting,
          canDelete: true,
        },
      };
    });
  }, [filteredEntities, titleField, contentField, typeField, formatField, sizeField, urlField, thumbnailField, authorField, createdField, modifiedField, selectedDocuments, editingDocument, enableEditing, enableDownload, enableSharing, enablePrinting]);

  // Calculate document statistics
  const documentStats = useMemo((): DocumentStats => {
    const totalDocuments = documentItems.length;
    const documentsByType: Record<string, number> = {};
    const documentsByFormat: Record<DocumentFormat, number> = {
      pdf: 0,
      doc: 0,
      docx: 0,
      xls: 0,
      xlsx: 0,
      ppt: 0,
      pptx: 0,
      txt: 0,
      md: 0,
      html: 0,
      jpg: 0,
      png: 0,
      gif: 0,
      svg: 0,
    };
    const totalStorage = documentItems.reduce((sum, doc) => sum + (doc.size || 0), 0);
    const averageSize = totalDocuments > 0 ? totalStorage / totalDocuments : 0;

    documentItems.forEach(doc => {
      documentsByType[doc.type || 'unknown'] = (documentsByType[doc.type || 'unknown'] || 0) + 1;
      documentsByFormat[doc.format || 'pdf'] = (documentsByFormat[doc.format || 'pdf'] || 0) + 1;
    });

    return {
      totalDocuments,
      documentsByType,
      documentsByFormat,
      totalStorage,
      averageSize,
      recentlyAccessed: documentItems.slice(0, 5),
      mostShared: documentItems.slice(0, 5),
    };
  }, [documentItems]);

  // Get document icon based on format
  const getDocumentIcon = useCallback((format: DocumentFormat) => {
    const iconMap: Record<DocumentFormat, string> = {
      'pdf': 'file-text',
      'doc': 'file-text',
      'docx': 'file-text',
      'xls': 'file-text',
      'xlsx': 'file-text',
      'ppt': 'file-text',
      'pptx': 'file-text',
      'txt': 'file-text',
      'md': 'file-text',
      'html': 'file-text',
      'jpg': 'image',
      'png': 'image',
      'gif': 'image',
      'svg': 'image',
    };
    return iconMap[format] || 'file-text';
  }, []);

  // Format file size
  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  // View mode change handler
  const handleViewModeChange = useCallback((newViewMode: DocumentViewMode) => {
    setViewMode(newViewMode);
  }, []);

  // Document click handler
  const handleDocumentClick = useCallback((documentId: string, event: React.MouseEvent) => {
    const document = documentItems.find(doc => doc.id === documentId);
    if (!document) return;
    
    if (event.metaKey || event.ctrlKey) {
      // Multi-select
      setSelectedDocuments(prev => {
        const next = new Set(prev);
        if (next.has(documentId)) {
          next.delete(documentId);
        } else {
          next.add(documentId);
        }
        return next;
      });
    } else {
      // Single select and open preview
      setSelectedDocuments(new Set([documentId]));
      setCurrentDocument(documentId);
    }
    
    onDocumentClick?.(document.data);
    onEntityClick?.(documentId);
  }, [documentItems, onDocumentClick, onEntityClick]);

  // Search handler
  const handleSearch = useCallback((query: string) => {
    setSearchQueryLocal(query);
    setIsSearching(true);
    
    // Simulate search
    setTimeout(() => {
      const results: DocumentSearchResult[] = documentItems
        .filter(doc => doc.title.toLowerCase().includes(query.toLowerCase()))
        .map(doc => ({
          id: doc.id,
          title: doc.title,
          snippet: doc.content?.substring(0, 100) || '',
          score: 1.0,
          highlights: [],
        }));
      setSearchResults(results);
      setIsSearching(false);
    }, 300);
  }, [documentItems]);

  // Zoom handlers
  const handleZoomIn = useCallback(() => {
    setPreviewScale(prev => Math.min(prev * 1.2, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setPreviewScale(prev => Math.max(prev / 1.2, 0.5));
  }, []);

  // Rotation handler
  const handleRotate = useCallback(() => {
    setPreviewRotation(prev => (prev + 90) % 360);
  }, []);

  // Render document item
  const renderDocumentItem = useCallback((document: DocumentItem<T>) => {
    if (documentRenderer) {
      return documentRenderer(document);
    }

    const isSelected = document.selected;
    const icon = getDocumentIcon(document.format || 'pdf');

    return (
      <div
        className={clsx(
          "bg-[var(--color-surface-primary)] border border-[var(--color-border-input)] rounded-lg overflow-hidden cursor-pointer transition-all",
          isSelected && "ring-2 ring-[var(--color-brand-primary)]",
          compact && "p-2",
          !compact && "p-4"
        )}
        onClick={(e) => handleDocumentClick(document.id, e)}
        onDoubleClick={() => onDocumentDoubleClick?.(document.data)}
      >
        {/* Thumbnail */}
        {showThumbnails && (
          <div className="flex-shrink-0 mb-2">
            {document.thumbnail ? (
              <img
                src={document.thumbnail}
                alt={document.title}
                className={clsx(
                  "w-full object-cover rounded",
                  compact ? "h-20" : "h-32"
                )}
              />
            ) : (
              <div
                className={clsx(
                  "w-full bg-[var(--color-surface-elevated)] flex items-center justify-center rounded",
                  compact ? "h-20" : "h-32"
                )}
              >
                <Icon name={icon} className="w-8 h-8 text-[var(--color-text-muted)]" />
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-[var(--color-text-primary)] truncate mb-1">
            {document.title}
          </h3>
          
          {showDetails && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
                <span>{document.format?.toUpperCase()}</span>
                {document.size && (
                  <span>{formatFileSize(document.size)}</span>
                )}
                {document.author && (
                  <span>by {document.author}</span>
                )}
              </div>
              
              {document.created && (
                <div className="text-xs text-[var(--color-text-muted)]">
                  Created {document.created.toLocaleDateString()}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex-shrink-0">
          <div className="flex gap-1">
            {document.permissions?.canEdit && (
              <Button variant="ghost" size="sm">
                <Edit2 className="w-4 h-4" />
              </Button>
            )}
            {document.permissions?.canDownload && (
              <Button variant="ghost" size="sm">
                <Download className="w-4 h-4" />
              </Button>
            )}
            {document.permissions?.canShare && (
              <Button variant="ghost" size="sm">
                <Share2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }, [documentRenderer, showThumbnails, showDetails, compact, handleDocumentClick, onDocumentDoubleClick, getDocumentIcon, formatFileSize]);

  // Empty state
  if (documentItems.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="text-[var(--color-text-muted)] mb-4">
          <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-[var(--color-text-primary)] mb-2">
            {emptyState?.title || "No documents found"}
          </h3>
          {emptyState?.description && (
            <p className="text-[var(--color-text-muted)] mb-4">
              {emptyState.description}
            </p>
          )}
          {emptyState?.action && (
            <Button onClick={emptyState.action.onClick}>
              {emptyState.action.label}
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-[var(--color-text-muted)]">Loading documents...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center py-16 text-center">
        <div className="text-[var(--color-error-border)] mb-4">
          <h3 className="text-lg font-medium mb-2">Error loading documents</h3>
          <p className="text-[var(--color-error-border)]">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-hidden" ref={documentViewRef}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--color-border-input)]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'solid' : 'outline'}
              size="sm"
              onClick={() => handleViewModeChange('grid')}
            >
              <Grid className="w-4 h-4 mr-2" />
              Grid
            </Button>
            <Button
              variant={viewMode === 'list' ? 'solid' : 'outline'}
              size="sm"
              onClick={() => handleViewModeChange('list')}
            >
              <List className="w-4 h-4 mr-2" />
              List
            </Button>
            <Button
              variant={viewMode === 'carousel' ? 'solid' : 'outline'}
              size="sm"
              onClick={() => handleViewModeChange('carousel')}
            >
              <Eye className="w-4 h-4 mr-2" />
              Carousel
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQueryLocal}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border border-[var(--color-border-input)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]"
            />
          </div>

          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>

          <Button variant="solid" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Upload
          </Button>
        </div>
      </div>

      {/* Document stats */}
      <div className="flex items-center gap-6 px-4 py-2 border-b border-[var(--color-border-input)] bg-[var(--color-surface-elevated)]">
        <div className="flex items-center gap-2">
          <span className="text-sm text-[var(--color-text-muted)]">Documents:</span>
          <Badge variant="secondary" size="sm">
            {documentStats.totalDocuments}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-[var(--color-text-muted)]">Storage:</span>
          <Badge variant="secondary" size="sm">
            {formatFileSize(documentStats.totalStorage)}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-[var(--color-text-muted)]">Types:</span>
          <Badge variant="secondary" size="sm">
            {Object.keys(documentStats.documentsByType).length}
          </Badge>
        </div>
      </div>

      {/* Documents */}
      <div className="overflow-auto" style={{ height: 'calc(100% - 140px)' }}>
        <div className="p-4">
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {documentItems.map(document => (
                <div key={document.id}>
                  {renderDocumentItem(document)}
                </div>
              ))}
            </div>
          )}

          {viewMode === 'list' && (
            <div className="space-y-2">
              {documentItems.map(document => (
                <div key={document.id}>
                  {renderDocumentItem(document)}
                </div>
              ))}
            </div>
          )}

          {viewMode === 'carousel' && (
            <div className="flex gap-4 overflow-x-auto pb-4">
              {documentItems.map(document => (
                <div key={document.id} className="flex-shrink-0 w-80">
                  {renderDocumentItem(document)}
                </div>
              ))}
            </div>
          )}

          {viewMode === 'reader' && currentDocument && (
            <div className="max-w-4xl mx-auto">
              {documentItems
                .filter(doc => doc.id === currentDocument)
                .map(document => (
                  <div key={document.id} className="bg-[var(--color-surface-primary)] border border-[var(--color-border-input)] rounded-lg overflow-hidden">
                    {/* Reader toolbar */}
                    <div className="flex items-center justify-between p-4 border-b border-[var(--color-border-input)]">
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={handleZoomOut}>
                          <ZoomOut className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleZoomIn}>
                          <ZoomIn className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleRotate}>
                          <RotateCw className="w-4 h-4" />
                        </Button>
                        <span className="text-sm text-[var(--color-text-muted)]">
                          {Math.round(previewScale * 100)}%
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {document.permissions?.canEdit && (
                          <Button variant="outline" size="sm">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        )}
                        {document.permissions?.canDownload && (
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        )}
                        {document.permissions?.canShare && (
                          <Button variant="outline" size="sm">
                            <Share2 className="w-4 h-4" />
                          </Button>
                        )}
                        {document.permissions?.canPrint && (
                          <Button variant="outline" size="sm">
                            <Printer className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Document content */}
                    <div className="p-8 overflow-auto" style={{ height: 'calc(100% - 73px)' }}>
                      <div
                        className="mx-auto transition-transform"
                        style={{
                          transform: `scale(${previewScale}) rotate(${previewRotation}deg)`,
                          maxWidth: `${documentConfig.previewWidth}px`,
                        }}
                      >
                        {document.format === 'pdf' ? (
                          <div className="text-center text-[var(--color-text-muted)]">
                            PDF preview would be rendered here
                          </div>
                        ) : (document.format === 'jpg' || document.format === 'png' || document.format === 'gif') ? (
                          <img
                            src={document.url}
                            alt={document.title}
                            className="max-w-full h-auto"
                          />
                        ) : (
                          <div className="prose max-w-none">
                            <h1>{document.title}</h1>
                            <div className="whitespace-pre-wrap">
                              {document.content}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
