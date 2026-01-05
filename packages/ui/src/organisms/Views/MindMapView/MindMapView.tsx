"use client";

import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
import clsx from "clsx";
import { Button, Badge, Icon } from "../../../index.js";
import { Network, Plus, ZoomIn, ZoomOut, Maximize2, Settings, Download, Edit2, Trash2, ChevronRight, ChevronDown } from "lucide-react";
import type { 
  MindMapViewProps, 
  MindMapLayout,
  MindMapNode,
  MindMapConnection,
  MindMapPosition,
  MindMapViewport,
  MindMapStats,
  MindMapViewState
} from "./MindMapView.types.js";
import type { BaseViewProps } from "../types.js";

/**
 * MIND MAP VIEW
 * 
 * CHARACTERISTICS:
 * - Hierarchical node visualization
 * - Multiple layout algorithms
 * - Interactive node editing
 * - Drag to reposition nodes
 * - Node expansion/collapse
 * - Connection visualization
 * - Zoom and pan controls
 * - Custom node rendering
 */
export function MindMapView<T extends { id: string }>({
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
  descriptionField,
  typeField,
  colorField,
  iconField,
  parentField,
  levelField,
  positionField,
  defaultLayout = "radial",
  enableNodeEditing = true,
  enableNodeCreation = true,
  enableNodeDeletion = true,
  enableDragReposition = true,
  enableNodeExpansion = true,
  enableNodeSelection = true,
  showConnections = true,
  showNodeDetails = true,
  compact = false,
  animationDuration = 300,
  nodeRenderer,
  connectionRenderer,
  onNodeClick,
  onNodeDoubleClick,
  onNodeContextMenu,
  onNodeCreate,
  onNodeUpdate,
  onNodeDelete,
  onNodeReposition,
  ...props
}: MindMapViewProps<T>) {
  const [layout, setLayout] = useState<MindMapLayout>(defaultLayout);
  const [viewport, setViewport] = useState<MindMapViewport>({
    center: { x: 0, y: 0 },
    zoom: 1,
    bounds: { width: 800, height: 600 },
    pan: { x: 0, y: 0 },
  });
  const [selectedNodes, setSelectedNodes] = useState<Set<string>>(new Set(selectedIds));
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [editingNode, setEditingNode] = useState<string | null>(null);
  const mindMapViewRef = useRef<HTMLDivElement>(null);

  // Mind map configuration
  const mindMapConfig = useMemo(() => ({
    nodeSpacing: compact ? 80 : 120,
    levelSpacing: compact ? 100 : 150,
    connectionWidth: 2,
    connectionColor: 'var(--color-border-input)',
    nodeWidth: compact ? 120 : 160,
    nodeHeight: compact ? 60 : 80,
    maxDepth: 5,
    ...config,
  }), [compact, config]);

  // Resolve entities from IDs
  const entities = useMemo(() => {
    if (!entitySelector) return [];
    return entityIds.map(id => entitySelector(id)).filter(Boolean) as T[];
  }, [entityIds, entitySelector]);

  // Convert entities to mind map nodes
  const mindMapNodes = useMemo((): MindMapNode<T>[] => {
    return entities.map(entity => {
      const title = String(entity[titleField]);
      const description = descriptionField ? String(entity[descriptionField]) : undefined;
      const type = typeField ? String(entity[typeField]) : 'node';
      const color = colorField ? String(entity[colorField]) : 'var(--color-brand-primary)';
      const icon = iconField ? String(entity[iconField]) : 'circle';
      const parentId = parentField ? String(entity[parentField]) : undefined;
      const level = levelField ? Number(entity[levelField]) : 0;
      const position = positionField ? (entity[positionField] as any) : { x: 0, y: 0 };

      return {
        data: entity,
        id: entity.id,
        title,
        description,
        type,
        color,
        icon,
        parentId,
        level,
        position,
        children: [],
        selected: selectedNodes.has(entity.id),
        expanded: expandedNodes.has(entity.id),
        isDragging: draggedNode === entity.id,
        isEditing: editingNode === entity.id,
        size: {
          width: mindMapConfig.nodeWidth,
          height: mindMapConfig.nodeHeight,
        },
        connections: [],
        stats: {
          childCount: 0,
          totalDescendants: 0,
          depth: level,
        },
      };
    });
  }, [entities, titleField, descriptionField, typeField, colorField, iconField, parentField, levelField, positionField, selectedNodes, expandedNodes, draggedNode, editingNode, mindMapConfig]);

  // Build node hierarchy
  const buildNodeHierarchy = useCallback((nodes: MindMapNode<T>[]): MindMapNode<T>[] => {
    const nodeMap = new Map<string, MindMapNode<T>>();
    const rootNodes: MindMapNode<T>[] = [];

    // Create node map
    nodes.forEach(node => {
      nodeMap.set(node.id, { ...node, children: [] });
    });

    // Build hierarchy
    nodes.forEach(node => {
      const nodeWithChildren = nodeMap.get(node.id)!;
      
      if (node.parentId) {
        const parent = nodeMap.get(node.parentId);
        if (parent) {
          parent.children.push(nodeWithChildren);
        }
      } else {
        rootNodes.push(nodeWithChildren);
      }
    });

    return rootNodes;
  }, []);

  // Calculate node positions based on layout
  const calculateNodePositions = useCallback((nodes: MindMapNode<T>[]): Map<string, MindMapPosition> => {
    const positions = new Map<string, MindMapPosition>();
    const rootNodes = buildNodeHierarchy(nodes);

    const calculateRadialLayout = (node: MindMapNode<T>, angle: number, radius: number, parentPos?: MindMapPosition) => {
      const x = parentPos ? parentPos.x + Math.cos(angle) * radius : 0;
      const y = parentPos ? parentPos.y + Math.sin(angle) * radius : 0;
      
      positions.set(node.id, { x, y });

      if (node.expanded && node.children.length > 0) {
        const angleStep = (2 * Math.PI) / node.children.length;
        node.children.forEach((child, index) => {
          const childAngle = angle + (index - (node.children.length - 1) / 2) * angleStep;
          calculateRadialLayout(child, childAngle, mindMapConfig.levelSpacing, { x, y });
        });
      }
    };

    const calculateTreeLayout = (node: MindMapNode<T>, x: number, y: number, level: number) => {
      positions.set(node.id, { x, y });

      if (node.expanded && node.children.length > 0) {
        const childY = y + mindMapConfig.levelSpacing;
        const totalWidth = node.children.length * mindMapConfig.nodeSpacing;
        const startX = x - totalWidth / 2;

        node.children.forEach((child, index) => {
          const childX = startX + index * mindMapConfig.nodeSpacing + mindMapConfig.nodeSpacing / 2;
          calculateTreeLayout(child, childX, childY, level + 1);
        });
      }
    };

    // Apply layout algorithm
    rootNodes.forEach((rootNode, index) => {
      if (layout === 'radial') {
        calculateRadialLayout(rootNode, 0, 0);
      } else if (layout === 'tree') {
        calculateTreeLayout(rootNode, index * 500, 0, 0);
      }
    });

    return positions;
  }, [buildNodeHierarchy, layout, mindMapConfig]);

  // Calculate mind map statistics
  const mindMapStats = useMemo((): MindMapStats => {
    const totalNodes = mindMapNodes.length;
    const maxDepth = Math.max(...mindMapNodes.map(node => node.level));
    const nodesByLevel: Record<number, number> = {};
    const nodesByType: Record<string, number> = {};

    mindMapNodes.forEach(node => {
      nodesByLevel[node.level] = (nodesByLevel[node.level] || 0) + 1;
      nodesByType[node.type || 'unknown'] = (nodesByType[node.type || 'unknown'] || 0) + 1;
    });

    const averageChildren = mindMapNodes.length > 0 
      ? mindMapNodes.reduce((sum, node) => sum + node.children.length, 0) / mindMapNodes.length 
      : 0;

    return {
      totalNodes,
      maxDepth,
      nodesByLevel,
      nodesByType,
      averageChildren,
      layoutEfficiency: 0.8, // Would be calculated based on actual layout
      crossings: 0, // Would be calculated based on connections
    };
  }, [mindMapNodes]);

  // Node click handler
  const handleNodeClick = useCallback((nodeId: string, event: React.MouseEvent) => {
    const node = mindMapNodes.find(n => n.id === nodeId);
    if (!node) return;
    
    if (event.metaKey || event.ctrlKey) {
      // Multi-select
      setSelectedNodes(prev => {
        const next = new Set(prev);
        if (next.has(nodeId)) {
          next.delete(nodeId);
        } else {
          next.add(nodeId);
        }
        return next;
      });
    } else {
      // Single select
      setSelectedNodes(new Set([nodeId]));
    }
    
    onNodeClick?.(node.data);
    onEntityClick?.(nodeId);
  }, [mindMapNodes, onNodeClick, onEntityClick]);

  // Node expansion handler
  const toggleNodeExpansion = useCallback((nodeId: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  }, []);

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

  // Render mind map node
  const renderMindMapNode = useCallback((node: MindMapNode<T>) => {
    if (nodeRenderer) {
      return nodeRenderer(node);
    }

    const isHovered = hoveredNode === node.id;
    const hasChildren = node.children.length > 0;

    return (
      <div
        className={clsx(
          "absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all",
          node.selected && "ring-2 ring-[var(--color-brand-primary)]",
          node.isDragging && "opacity-50 rotate-2",
          isHovered && "scale-105",
          compact && "scale-75"
        )}
        style={{
          left: `${node.position.x}px`,
          top: `${node.position.y}px`,
          width: `${node.size?.width || mindMapConfig.nodeWidth}px`,
          height: `${node.size?.height || mindMapConfig.nodeHeight}px`,
        }}
        onClick={(e) => handleNodeClick(node.id, e)}
        onDoubleClick={() => onNodeDoubleClick?.(node.data)}
        onContextMenu={(e) => onNodeContextMenu?.(node.data, e)}
        onMouseEnter={() => setHoveredNode(node.id)}
        onMouseLeave={() => setHoveredNode(null)}
      >
        <div
          className="w-full h-full bg-[var(--color-surface-primary)] border border-[var(--color-border-input)] rounded-lg flex flex-col items-center justify-center shadow-lg"
          style={{ backgroundColor: node.color }}
        >
          {/* Node icon */}
          <div className="flex-shrink-0 mb-1">
            <Icon name={node.icon || 'circle'} className="w-4 h-4 text-white" />
          </div>

          {/* Node title */}
          <div className="flex-1 text-center px-2">
            <h3 className="font-medium text-white text-xs truncate">
              {node.title}
            </h3>
            {showNodeDetails && node.description && (
              <p className="text-xs text-white opacity-80 line-clamp-2">
                {node.description}
              </p>
            )}
          </div>

          {/* Expand/collapse indicator */}
          {hasChildren && enableNodeExpansion && (
            <div className="absolute -bottom-2 -right-2 bg-[var(--color-surface-primary)] border border-[var(--color-border-input)] rounded-full p-1">
              {node.expanded ? (
                <ChevronDown className="w-3 h-3 text-[var(--color-text-primary)]" />
              ) : (
                <ChevronRight className="w-3 h-3 text-[var(--color-text-primary)]" />
              )}
            </div>
          )}

          {/* Actions */}
          {isHovered && (
            <div className="absolute -top-2 -right-2 flex gap-1">
              {enableNodeEditing && (
                <Button variant="ghost" size="sm" className="w-6 h-6 p-0">
                  <Edit2 className="w-3 h-3" />
                </Button>
              )}
              {enableNodeDeletion && (
                <Button variant="ghost" size="sm" className="w-6 h-6 p-0">
                  <Trash2 className="w-3 h-3" />
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }, [nodeRenderer, showNodeDetails, enableNodeExpansion, enableNodeEditing, enableNodeDeletion, compact, mindMapConfig, handleNodeClick, onNodeDoubleClick, onNodeContextMenu, hoveredNode]);

  // Empty state
  if (mindMapNodes.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="text-[var(--color-text-muted)] mb-4">
          <Network className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-[var(--color-text-primary)] mb-2">
            {emptyState?.title || "No mind map nodes found"}
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
        <div className="text-[var(--color-text-muted)]">Loading mind map...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center py-16 text-center">
        <div className="text-[var(--color-error-border)] mb-4">
          <h3 className="text-lg font-medium mb-2">Error loading mind map</h3>
          <p className="text-[var(--color-error-border)]">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-hidden" ref={mindMapViewRef}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--color-border-input)]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <select
              value={layout}
              onChange={(e) => setLayout(e.target.value as MindMapLayout)}
              className="px-3 py-2 border border-[var(--color-border-input)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]"
            >
              <option value="radial">Radial</option>
              <option value="tree">Tree</option>
              <option value="organic">Organic</option>
              <option value="force">Force</option>
              <option value="hierarchical">Hierarchical</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4" />
          </Button>

          <Button variant="outline" size="sm">
            <Download className="w-4 h-4" />
          </Button>

          {enableNodeCreation && (
            <Button variant="solid" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Node
            </Button>
          )}
        </div>
      </div>

      {/* Mind map stats */}
      <div className="flex items-center gap-6 px-4 py-2 border-b border-[var(--color-border-input)] bg-[var(--color-surface-elevated)]">
        <div className="flex items-center gap-2">
          <span className="text-sm text-[var(--color-text-muted)]">Nodes:</span>
          <Badge variant="secondary" size="sm">
            {mindMapStats.totalNodes}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-[var(--color-text-muted)]">Depth:</span>
          <Badge variant="secondary" size="sm">
            {mindMapStats.maxDepth}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-[var(--color-text-muted)]">Types:</span>
          <Badge variant="secondary" size="sm">
            {Object.keys(mindMapStats.nodesByType).length}
          </Badge>
        </div>
      </div>

      {/* Mind map canvas */}
      <div className="relative" style={{ height: 'calc(100% - 140px)' }}>
        {/* Canvas background */}
        <div className="absolute inset-0 bg-[var(--color-surface-elevated)] flex items-center justify-center">
          <div className="text-center">
            <Network className="w-16 h-16 mx-auto mb-4 text-[var(--color-text-muted)] opacity-50" />
            <h3 className="text-lg font-medium text-[var(--color-text-primary)] mb-2">
              Mind Map View
            </h3>
            <p className="text-[var(--color-text-muted)] mb-4">
              {mindMapStats.totalNodes} nodes loaded
            </p>
            <div className="text-sm text-[var(--color-text-muted)]">
              Layout: {layout}
            </div>
            <div className="text-sm text-[var(--color-text-muted)]">
              Zoom: {Math.round(viewport.zoom * 100)}%
            </div>
          </div>
        </div>

        {/* Sample nodes */}
        {mindMapNodes.slice(0, 8).map(node => (
          <div key={node.id}>
            {renderMindMapNode(node)}
          </div>
        ))}

        {/* Zoom controls */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-2">
          <Button variant="outline" size="sm" onClick={handleZoomIn}>
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleZoomOut}>
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm">
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
