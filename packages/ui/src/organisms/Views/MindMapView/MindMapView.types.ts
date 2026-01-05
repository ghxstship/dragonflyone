import type { BaseViewProps } from '../types.js';

export interface MindMapViewProps<T extends { id: string }> extends BaseViewProps<T> {
  /** Field for node title */
  titleField: keyof T;
  
  /** Field for node description */
  descriptionField?: keyof T;
  
  /** Field for node type */
  typeField?: keyof T;
  
  /** Field for node color */
  colorField?: keyof T;
  
  /** Field for node icon */
  iconField?: keyof T;
  
  /** Field for parent node ID */
  parentField?: keyof T;
  
  /** Field for node level/depth */
  levelField?: keyof T;
  
  /** Field for node position */
  positionField?: keyof T;
  
  /** Default layout algorithm */
  defaultLayout?: MindMapLayout;
  
  /** Enable node editing */
  enableNodeEditing?: boolean;
  
  /** Enable node creation */
  enableNodeCreation?: boolean;
  
  /** Enable node deletion */
  enableNodeDeletion?: boolean;
  
  /** Enable drag to reposition */
  enableDragReposition?: boolean;
  
  /** Enable node expansion */
  enableNodeExpansion?: boolean;
  
  /** Enable node selection */
  enableNodeSelection?: boolean;
  
  /** Show node connections */
  showConnections?: boolean;
  
  /** Show node details */
  showNodeDetails?: boolean;
  
  /** Compact mode */
  compact?: boolean;
  
  /** Animation duration */
  animationDuration?: number;
  
  /** Custom node renderer */
  nodeRenderer?: (node: MindMapNode<T>) => React.ReactNode;
  
  /** Custom connection renderer */
  connectionRenderer?: (connection: MindMapConnection<T>) => React.ReactNode;
  
  /** Node click handler */
  onNodeClick?: (node: T) => void;
  
  /** Node double-click handler */
  onNodeDoubleClick?: (node: T) => void;
  
  /** Node context menu handler */
  onNodeContextMenu?: (node: T, event: React.MouseEvent) => void;
  
  /** Node create handler */
  onNodeCreate?: (parentNode: T, title: string) => Promise<T>;
  
  /** Node update handler */
  onNodeUpdate?: (node: T, updates: Partial<T>) => Promise<T>;
  
  /** Node delete handler */
  onNodeDelete?: (node: T) => Promise<void>;
  
  /** Node reposition handler */
  onNodeReposition?: (node: T, position: MindMapPosition) => Promise<void>;
  
  /** Layout configuration */
  config?: {
    nodeSpacing?: number;
    levelSpacing?: number;
    connectionWidth?: number;
    connectionColor?: string;
    nodeWidth?: number;
    nodeHeight?: number;
    maxDepth?: number;
  };
}

export type MindMapLayout = 
  | 'radial'
  | 'tree'
  | 'organic'
  | 'force'
  | 'hierarchical';

export interface MindMapNode<T> {
  /** Node data */
  data: T;
  
  /** Node ID */
  id: string;
  
  /** Node title */
  title: string;
  
  /** Node description */
  description?: string;
  
  /** Node type */
  type?: string;
  
  /** Node color */
  color?: string;
  
  /** Node icon */
  icon?: string;
  
  /** Parent node ID */
  parentId?: string;
  
  /** Node level/depth */
  level: number;
  
  /** Node position */
  position: MindMapPosition;
  
  /** Node children */
  children: MindMapNode<T>[];
  
  /** Is selected */
  selected?: boolean;
  
  /** Is expanded */
  expanded?: boolean;
  
  /** Is being dragged */
  isDragging?: boolean;
  
  /** Is being edited */
  isEditing?: boolean;
  
  /** Node size */
  size?: {
    width: number;
    height: number;
  };
  
  /** Node connections */
  connections: MindMapConnection<T>[];
  
  /** Node statistics */
  stats?: {
    childCount: number;
    totalDescendants: number;
    depth: number;
  };
}

export interface MindMapConnection<T> {
  /** Connection ID */
  id: string;
  
  /** From node ID */
  from: string;
  
  /** To node ID */
  to: string;
  
  /** Connection type */
  type?: 'parent' | 'sibling' | 'reference';
  
  /** Connection style */
  style?: 'solid' | 'dashed' | 'dotted';
  
  /** Connection color */
  color?: string;
  
  /** Connection width */
  width?: number;
  
  /** Connection path */
  path?: {
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    controlPoints?: { x: number; y: number }[];
  };
  
  /** Is bidirectional */
  bidirectional?: boolean;
}

export interface MindMapPosition {
  /** X coordinate */
  x: number;
  
  /** Y coordinate */
  y: number;
  
  /** Rotation angle */
  rotation?: number;
  
  /** Scale factor */
  scale?: number;
}

export interface MindMapLayoutData {
  /** Layout type */
  type: MindMapLayout;
  
  /** Node positions */
  positions: Map<string, MindMapPosition>;
  
  /** Connection paths */
  connections: MindMapConnection<any>[];
  
  /** Layout bounds */
  bounds: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  };
  
  /** Layout center */
  center: MindMapPosition;
  
  /** Layout scale */
  scale: number;
}

export interface MindMapViewport {
  /** Center position */
  center: MindMapPosition;
  
  /** Zoom level */
  zoom: number;
  
  /** Viewport bounds */
  bounds: {
    width: number;
    height: number;
  };
  
  /** Pan offset */
  pan: {
    x: number;
    y: number;
  };
}

export interface MindMapStats {
  /** Total nodes */
  totalNodes: number;
  
  /** Max depth */
  maxDepth: number;
  
  /** Nodes by level */
  nodesByLevel: Record<number, number>;
  
  /** Nodes by type */
  nodesByType: Record<string, number>;
  
  /** Average children per node */
  averageChildren: number;
  
  /** Layout efficiency */
  layoutEfficiency: number;
  
  /** Crossings count */
  crossings: number;
}

export interface MindMapViewState {
  /** Current layout */
  layout: MindMapLayout;
  
  /** Current viewport */
  viewport: MindMapViewport;
  
  /** Selected nodes */
  selectedNodes: Set<string>;
  
  /** Expanded nodes */
  expandedNodes: Set<string>;
  
  /** Root node ID */
  rootNodeId: string;
  
  /** Is editing */
  isEditing: boolean;
  
  /** Editing node ID */
  editingNodeId?: string;
  
  /** Drag state */
  dragState: {
    isDragging: boolean;
    draggedNodeId?: string;
    dragOffset?: MindMapPosition;
  };
  
  /** Hover state */
  hoverState: {
    hoveredNodeId?: string;
    hoveredConnectionId?: string;
  };
}
