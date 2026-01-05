import type { BaseViewProps } from '../types.js';

export interface WhiteboardViewProps<T extends { id: string }> extends BaseViewProps<T> {
  /** Field for element title */
  titleField: keyof T;
  
  /** Field for element content */
  contentField?: keyof T;
  
  /** Field for element type */
  typeField?: keyof T;
  
  /** Field for element position */
  positionField?: keyof T;
  
  /** Field for element size */
  sizeField?: keyof T;
  
  /** Field for element color */
  colorField?: keyof T;
  
  /** Field for element style */
  styleField?: keyof T;
  
  /** Field for element z-index */
  zIndexField?: keyof T;
  
  /** Default whiteboard mode */
  defaultMode?: WhiteboardMode;
  
  /** Enable drawing tools */
  enableDrawing?: boolean;
  
  /** Enable text editing */
  enableTextEditing?: boolean;
  
  /** Enable shape tools */
  enableShapes?: boolean;
  
  /** Enable sticky notes */
  enableStickyNotes?: boolean;
  
  /** Enable image upload */
  enableImageUpload?: boolean;
  
  /** Enable collaboration */
  enableCollaboration?: boolean;
  
  /** Enable grid */
  enableGrid?: boolean;
  
  /** Show toolbar */
  showToolbar?: boolean;
  
  /** Show minimap */
  showMinimap?: boolean;
  
  /** Show layers panel */
  showLayers?: boolean;
  
  /** Compact mode */
  compact?: boolean;
  
  /** Custom element renderer */
  elementRenderer?: (element: WhiteboardElement<T>) => React.ReactNode;
  
  /** Custom toolbar renderer */
  toolbarRenderer?: (tools: WhiteboardTool[]) => React.ReactNode;
  
  /** Element click handler */
  onElementClick?: (element: T) => void;
  
  /** Element double-click handler */
  onElementDoubleClick?: (element: T) => void;
  
  /** Element update handler */
  onElementUpdate?: (element: T, updates: Partial<T>) => Promise<T>;
  
  /** Element create handler */
  onElementCreate?: (element: Partial<T>) => Promise<T>;
  
  /** Element delete handler */
  onElementDelete?: (element: T) => Promise<void>;
  
  /** Whiteboard save handler */
  onWhiteboardSave?: (elements: T[]) => Promise<void>;
  
  /** Configuration */
  config?: {
    canvasWidth?: number;
    canvasHeight?: number;
    gridSize?: number;
    snapToGrid?: boolean;
    defaultColor?: string;
    defaultFontSize?: number;
    maxElements?: number;
    toolbarActions?: WhiteboardTool[];
  };
}

export type WhiteboardMode = 
  | 'draw'
  | 'select'
  | 'text'
  | 'shapes'
  | 'notes'
  | 'images';

export type WhiteboardTool = 
  | 'pen'
  | 'eraser'
  | 'text'
  | 'rectangle'
  | 'circle'
  | 'line'
  | 'arrow'
  | 'sticky-note'
  | 'image'
  | 'select'
  | 'pan'
  | 'zoom';

export interface WhiteboardElement<T> {
  /** Element data */
  data: T;
  
  /** Element ID */
  id: string;
  
  /** Element title */
  title: string;
  
  /** Element content */
  content?: string;
  
  /** Element type */
  type?: string;
  
  /** Element position */
  position: WhiteboardPosition;
  
  /** Element size */
  size: WhiteboardSize;
  
  /** Element color */
  color?: string;
  
  /** Element style */
  style?: WhiteboardStyle;
  
  /** Element z-index */
  zIndex?: number;
  
  /** Is selected */
  selected?: boolean;
  
  /** Is being edited */
  isEditing?: boolean;
  
  /** Is being dragged */
  isDragging?: boolean;
  
  /** Is locked */
  locked?: boolean;
  
  /** Element connections */
  connections: WhiteboardConnection[];
  
  /** Element metadata */
  metadata?: Record<string, any>;
  
  /** Element author */
  author?: string;
  
  /** Element created date */
  created?: Date;
  
  /** Element modified date */
  modified?: Date;
}

export interface WhiteboardPosition {
  /** X coordinate */
  x: number;
  
  /** Y coordinate */
  y: number;
  
  /** Rotation angle */
  rotation?: number;
}

export interface WhiteboardSize {
  /** Width */
  width: number;
  
  /** Height */
  height: number;
}

export interface WhiteboardStyle {
  /** Border width */
  borderWidth?: number;
  
  /** Border style */
  borderStyle?: 'solid' | 'dashed' | 'dotted';
  
  /** Background color */
  backgroundColor?: string;
  
  /** Text alignment */
  textAlign?: 'left' | 'center' | 'right';
  
  /** Font size */
  fontSize?: number;
  
  /** Font family */
  fontFamily?: string;
  
  /** Opacity */
  opacity?: number;
  
  /** Shadow */
  shadow?: {
    x: number;
    y: number;
    blur: number;
    color: string;
  };
}

export interface WhiteboardConnection {
  /** Connection ID */
  id: string;
  
  /** From element ID */
  from: string;
  
  /** To element ID */
  to: string;
  
  /** Connection type */
  type?: 'line' | 'arrow' | 'curve';
  
  /** Connection style */
  style?: WhiteboardStyle;
  
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

export interface WhiteboardLayer {
  /** Layer ID */
  id: string;
  
  /** Layer name */
  name: string;
  
  /** Layer elements */
  elements: WhiteboardElement<any>[];
  
  /** Layer visibility */
  visible: boolean;
  
  /** Layer opacity */
  opacity: number;
  
  /** Layer locked */
  locked: boolean;
  
  /** Layer color */
  color?: string;
  
  /** Layer created */
  created: Date;
}

export interface WhiteboardViewport {
  /** Viewport center */
  center: WhiteboardPosition;
  
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

export interface WhiteboardStats {
  /** Total elements */
  totalElements: number;
  
  /** Elements by type */
  elementsByType: Record<string, number>;
  
  /** Total layers */
  totalLayers: number;
  
  /** Active users */
  activeUsers: WhiteboardUser[];
  
  /** Last activity */
  lastActivity: Date;
  
  /** Storage used */
  storageUsed: number;
}

export interface WhiteboardUser {
  /** User ID */
  id: string;
  
  /** User name */
  name: string;
  
  /** User avatar */
  avatar?: string;
  
  /** User color */
  color: string;
  
  /** User cursor position */
  cursor: WhiteboardPosition;
  
  /** Is online */
  online: boolean;
  
  /** Last seen */
  lastSeen: Date;
}

export interface WhiteboardViewState {
  /** Current mode */
  mode: WhiteboardMode;
  
  /** Current tool */
  tool: WhiteboardTool;
  
  /** Current color */
  color: string;
  
  /** Current font size */
  fontSize: number;
  
  /** Current line width */
  lineWidth: number;
  
  /** Selected elements */
  selectedElements: Set<string>;
  
  /** Active layer */
  activeLayer: string;
  
  /** Layers */
  layers: WhiteboardLayer[];
  
  /** Viewport */
  viewport: WhiteboardViewport;
  
  /** Toolbar state */
  toolbar: {
    visible: boolean;
    tools: WhiteboardTool[];
  };
  
  /** Grid state */
  grid: {
    visible: boolean;
    size: number;
    snapToGrid: boolean;
  };
  
  /** Collaboration state */
  collaboration: {
    enabled: boolean;
    users: WhiteboardUser[];
    cursors: Record<string, WhiteboardPosition>;
  };
  
  /** Is saving */
  isSaving: boolean;
  
  /** Last saved */
  lastSaved?: Date;
  
  /** Error state */
  error?: string;
}
