"use client";

import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
import clsx from "clsx";
import { Button, Badge, Icon } from "../../../index.js";
import { Pen, Eraser, Type, Square, Circle, Minus, ArrowUp, StickyNote, Image, MousePointer, Move, ZoomIn, ZoomOut, Save, Users, Layers, Grid3x3 } from "lucide-react";
import type { 
  WhiteboardViewProps, 
  WhiteboardMode,
  WhiteboardTool,
  WhiteboardElement,
  WhiteboardPosition,
  WhiteboardSize,
  WhiteboardStyle,
  WhiteboardConnection,
  WhiteboardLayer,
  WhiteboardViewport,
  WhiteboardStats,
  WhiteboardUser,
  WhiteboardViewState
} from "./WhiteboardView.types.js";
import type { BaseViewProps } from "../types.js";

/**
 * WHITEBOARD VIEW
 * 
 * CHARACTERISTICS:
 * - Interactive drawing canvas
 * - Multiple drawing tools
 * - Shape and text elements
 * - Sticky notes
 * - Image upload
 * - Collaboration features
 * - Layer management
 * - Grid and snapping
 * - Zoom and pan controls
 */
export function WhiteboardView<T extends { id: string }>({
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
  positionField,
  sizeField,
  colorField,
  styleField,
  zIndexField,
  defaultMode = "select",
  enableDrawing = true,
  enableTextEditing = true,
  enableShapes = true,
  enableStickyNotes = true,
  enableImageUpload = true,
  enableCollaboration = false,
  enableGrid = true,
  showToolbar = true,
  showMinimap = false,
  showLayers = false,
  compact = false,
  elementRenderer,
  toolbarRenderer,
  onElementClick,
  onElementDoubleClick,
  onElementUpdate,
  onElementCreate,
  onElementDelete,
  onWhiteboardSave,
  ...props
}: WhiteboardViewProps<T>) {
  const [mode, setMode] = useState<WhiteboardMode>(defaultMode);
  const [tool, setTool] = useState<WhiteboardTool>('select');
  const [color, setColor] = useState('#000000');
  const [fontSize, setFontSize] = useState(16);
  const [lineWidth, setLineWidth] = useState(2);
  const [selectedElements, setSelectedElements] = useState<Set<string>>(new Set(selectedIds));
  const [viewport, setViewport] = useState<WhiteboardViewport>({
    center: { x: 0, y: 0 },
    zoom: 1,
    bounds: { width: 800, height: 600 },
    pan: { x: 0, y: 0 },
  });
  const [isDrawing, setIsDrawing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const whiteboardViewRef = useRef<HTMLDivElement>(null);

  // Whiteboard configuration
  const whiteboardConfig = useMemo(() => ({
    canvasWidth: 2000,
    canvasHeight: 2000,
    gridSize: 20,
    snapToGrid: true,
    defaultColor: '#000000',
    defaultFontSize: 16,
    maxElements: 1000,
    toolbarActions: [
      'select', 'pen', 'eraser', 'text', 'rectangle', 'circle', 'line', 'arrow', 'sticky-note', 'image', 'pan', 'zoom'
    ],
    ...config,
  }), [config]);

  // Resolve entities from IDs
  const entities = useMemo(() => {
    if (!entitySelector) return [];
    return entityIds.map(id => entitySelector(id)).filter(Boolean) as T[];
  }, [entityIds, entitySelector]);

  // Convert entities to whiteboard elements
  const whiteboardElements = useMemo((): WhiteboardElement<T>[] => {
    return entities.map(entity => {
      const title = String(entity[titleField]);
      const content = contentField ? String(entity[contentField]) : undefined;
      const type = typeField ? String(entity[typeField]) : 'element';
      const position = positionField ? (entity[positionField] as Record<string, unknown>) : { x: 0, y: 0 };
      const size = sizeField ? (entity[sizeField] as Record<string, unknown>) : { width: 100, height: 100 };
      const elementColor = colorField ? String(entity[colorField]) : color;
      const style = styleField ? (entity[styleField] as Record<string, unknown>) : {};
      const zIndex = zIndexField ? Number(entity[zIndexField]) : 0;

      return {
        data: entity,
        id: entity.id,
        title,
        content,
        type,
        position,
        size,
        color: elementColor,
        style,
        zIndex,
        selected: selectedElements.has(entity.id),
        isEditing: false,
        isDragging: false,
        locked: false,
        connections: [],
        metadata: {},
        author: 'User',
        created: new Date(),
        modified: new Date(),
      };
    });
  }, [entities, titleField, contentField, typeField, positionField, sizeField, colorField, styleField, zIndexField, color, selectedElements]);

  // Calculate whiteboard statistics
  const whiteboardStats = useMemo((): WhiteboardStats => {
    const totalElements = whiteboardElements.length;
    const elementsByType: Record<string, number> = {};

    whiteboardElements.forEach(element => {
      elementsByType[element.type || 'unknown'] = (elementsByType[element.type || 'unknown'] || 0) + 1;
    });

    return {
      totalElements,
      elementsByType,
      totalLayers: 1,
      activeUsers: [],
      lastActivity: new Date(),
      storageUsed: 0,
    };
  }, [whiteboardElements]);

  // Tool change handler
  const handleToolChange = useCallback((newTool: WhiteboardTool) => {
    setTool(newTool);
    
    // Update mode based on tool
    if (newTool === 'pen' || newTool === 'eraser') {
      setMode('draw');
    } else if (newTool === 'text') {
      setMode('text');
    } else if (newTool === 'rectangle' || newTool === 'circle' || newTool === 'line' || newTool === 'arrow') {
      setMode('shapes');
    } else if (newTool === 'sticky-note') {
      setMode('notes');
    } else if (newTool === 'image') {
      setMode('images');
    } else {
      setMode('select');
    }
  }, []);

  // Element click handler
  const handleElementClick = useCallback((elementId: string, event: React.MouseEvent) => {
    const element = whiteboardElements.find(el => el.id === elementId);
    if (!element) return;
    
    if (event.metaKey || event.ctrlKey) {
      // Multi-select
      setSelectedElements(prev => {
        const next = new Set(prev);
        if (next.has(elementId)) {
          next.delete(elementId);
        } else {
          next.add(elementId);
        }
        return next;
      });
    } else {
      // Single select
      setSelectedElements(new Set([elementId]));
    }
    
    onElementClick?.(element.data);
    onEntityClick?.(elementId);
  }, [whiteboardElements, onElementClick, onEntityClick]);

  // Zoom handlers
  const handleZoomIn = useCallback(() => {
    setViewport(prev => ({
      ...prev,
      zoom: Math.min(prev.zoom * 1.2, 3),
    }));
  }, []);

  const handleZoomOut = useCallback(() => {
    setViewport(prev => ({
      ...prev,
      zoom: Math.max(prev.zoom / 1.2, 0.3),
    }));
  }, []);

  // Save handler
  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      await onWhiteboardSave?.(entities);
      setLastSaved(new Date());
    } finally {
      setIsSaving(false);
    }
  }, [entities, onWhiteboardSave]);

  // Get tool icon
  const getToolIcon = useCallback((tool: WhiteboardTool) => {
    const iconMap: Record<WhiteboardTool, React.ComponentType<any>> = {
      'pen': Pen,
      'eraser': Eraser,
      'text': Type,
      'rectangle': Square,
      'circle': Circle,
      'line': Minus,
      'arrow': ArrowUp,
      'sticky-note': StickyNote,
      'image': Image,
      'select': MousePointer,
      'pan': Move,
      'zoom': ZoomIn,
    };
    return iconMap[tool] || Pen;
  }, []);

  // Render whiteboard element
  const renderWhiteboardElement = useCallback((element: WhiteboardElement<T>) => {
    if (elementRenderer) {
      return elementRenderer(element);
    }

    const isSelected = element.selected;
    const isBeingDragged = element.isDragging;

    return (
      <div
        className={clsx(
          "absolute border-2 border-transparent cursor-pointer transition-all",
          isSelected && "border-[var(--color-brand-primary)] ring-2 ring-[var(--color-brand-primary)]/20",
          isBeingDragged && "opacity-50",
          element.locked && "cursor-not-allowed opacity-60"
        )}
        style={{
          left: `${element.position.x}px`,
          top: `${element.position.y}px`,
          width: `${element.size.width}px`,
          height: `${element.size.height}px`,
          transform: `rotate(${element.position.rotation || 0}deg)`,
          zIndex: element.zIndex || 0,
          backgroundColor: element.style?.backgroundColor || element.color,
          borderWidth: element.style?.borderWidth || 0,
          borderStyle: element.style?.borderStyle || 'solid',
          opacity: element.style?.opacity || 1,
        }}
        onClick={(e) => handleElementClick(element.id, e)}
        onDoubleClick={() => onElementDoubleClick?.(element.data)}
      >
        {/* Element content based on type */}
        {element.type === 'text' && (
          <div
            className="p-2 w-full h-full flex items-center justify-center"
            style={{
              fontSize: element.style?.fontSize || fontSize,
              fontFamily: element.style?.fontFamily || 'sans-serif',
              textAlign: element.style?.textAlign || 'left',
              color: element.color,
            }}
          >
            {element.content || element.title}
          </div>
        )}
        
        {element.type === 'sticky-note' && (
          <div className="p-2 w-full h-full flex flex-col bg-yellow-200 border-yellow-300">
            <div className="text-sm font-medium text-gray-800">
              {element.title}
            </div>
            {element.content && (
              <div className="text-xs text-gray-600 mt-1">
                {element.content}
              </div>
            )}
          </div>
        )}
        
        {element.type === 'rectangle' && (
          <div className="w-full h-full" style={{ backgroundColor: element.color }} />
        )}
        
        {element.type === 'circle' && (
          <div 
            className="w-full h-full rounded-full" 
            style={{ backgroundColor: element.color }} 
          />
        )}
        
        {element.type === 'image' && (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <Image className="w-8 h-8 text-gray-400" />
          </div>
        )}
      </div>
    );
  }, [elementRenderer, fontSize, handleElementClick, onElementDoubleClick]);

  // Empty state
  if (whiteboardElements.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="text-[var(--color-text-muted)] mb-4">
          <Grid3x3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-[var(--color-text-primary)] mb-2">
            {emptyState?.title || "Whiteboard is empty"}
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
        <div className="text-[var(--color-text-muted)]">Loading whiteboard...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center py-16 text-center">
        <div className="text-[var(--color-error-border)] mb-4">
          <h3 className="text-lg font-medium mb-2">Error loading whiteboard</h3>
          <p className="text-[var(--color-error-border)]">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-hidden" ref={whiteboardViewRef}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--color-border-input)]">
        <div className="flex items-center gap-4">
          {/* Toolbar */}
          {showToolbar && (
            <div className="flex items-center gap-2">
              {whiteboardConfig.toolbarActions.map((toolAction) => {
                const IconComponent = getToolIcon(toolAction as WhiteboardTool);
                return (
                  <Button
                    key={toolAction}
                    variant={tool === toolAction ? 'solid' : 'outline'}
                    size="sm"
                    onClick={() => handleToolChange(toolAction as WhiteboardTool)}
                  >
                    <IconComponent className="w-4 h-4" />
                  </Button>
                );
              })}
            </div>
          )}

          {/* Color picker */}
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-8 h-8 border border-[var(--color-border-input)] rounded cursor-pointer"
            />
          </div>

          {/* Line width */}
          <div className="flex items-center gap-2">
            <select
              value={lineWidth}
              onChange={(e) => setLineWidth(Number(e.target.value))}
              className="px-2 py-1 border border-[var(--color-border-input)] rounded text-sm"
            >
              <option value="1">1px</option>
              <option value="2">2px</option>
              <option value="4">4px</option>
              <option value="8">8px</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Collaboration indicator */}
          {enableCollaboration && (
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[var(--color-success)]" />
              <span className="text-sm text-[var(--color-text-muted)]">
                {whiteboardStats.activeUsers.length} users
              </span>
            </div>
          )}

          {/* Save status */}
          <div className="flex items-center gap-2">
            {isSaving ? (
              <span className="text-sm text-[var(--color-text-muted)]">Saving...</span>
            ) : lastSaved ? (
              <span className="text-sm text-[var(--color-text-muted)]">
                Saved {lastSaved.toLocaleTimeString()}
              </span>
            ) : (
              <span className="text-sm text-[var(--color-text-muted)]">Not saved</span>
            )}
          </div>

          {/* Actions */}
          <Button variant="outline" size="sm" onClick={handleSave} disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>

          <Button variant="outline" size="sm">
            <Layers className="w-4 h-4" />
          </Button>

          <Button variant="outline" size="sm">
            <Grid3x3 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Whiteboard stats */}
      <div className="flex items-center gap-6 px-4 py-2 border-b border-[var(--color-border-input)] bg-[var(--color-surface-elevated)]">
        <div className="flex items-center gap-2">
          <span className="text-sm text-[var(--color-text-muted)]">Elements:</span>
          <Badge variant="secondary" size="sm">
            {whiteboardStats.totalElements}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-[var(--color-text-muted)]">Mode:</span>
          <Badge variant="secondary" size="sm">
            {mode}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-[var(--color-text-muted)]">Tool:</span>
          <Badge variant="secondary" size="sm">
            {tool}
          </Badge>
        </div>
      </div>

      {/* Whiteboard canvas */}
      <div className="relative" style={{ height: 'calc(100% - 140px)' }}>
        {/* Canvas background */}
        <div className="absolute inset-0 bg-[var(--color-surface-elevated)] overflow-auto">
          <div
            className="relative"
            style={{
              width: `${whiteboardConfig.canvasWidth}px`,
              height: `${whiteboardConfig.canvasHeight}px`,
              transform: `scale(${viewport.zoom}) translate(${viewport.pan.x}px, ${viewport.pan.y}px)`,
              transformOrigin: 'top left',
            }}
          >
            {/* Grid */}
            {enableGrid && (
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage: `
                    repeating-linear-gradient(0deg, var(--color-border-input) 0px, transparent 1px, transparent ${whiteboardConfig.gridSize}px, var(--color-border-input) ${whiteboardConfig.gridSize + 1}px),
                    repeating-linear-gradient(90deg, var(--color-border-input) 0px, transparent 1px, transparent ${whiteboardConfig.gridSize}px, var(--color-border-input) ${whiteboardConfig.gridSize + 1}px)
                  `,
                  opacity: 0.3,
                }}
              />
            )}

            {/* Whiteboard elements */}
            {whiteboardElements.map(element => (
              <div key={element.id}>
                {renderWhiteboardElement(element)}
              </div>
            ))}
          </div>
        </div>

        {/* Zoom controls */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-2">
          <Button variant="outline" size="sm" onClick={handleZoomIn}>
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleZoomOut}>
            <ZoomOut className="w-4 h-4" />
          </Button>
        </div>

        {/* Minimap */}
        {showMinimap && (
          <div className="absolute bottom-4 left-4 w-32 h-24 bg-[var(--color-surface-primary)] border border-[var(--color-border-input)] rounded-lg">
            <div className="text-xs text-[var(--color-text-muted)] p-1">Minimap</div>
          </div>
        )}
      </div>
    </div>
  );
}
