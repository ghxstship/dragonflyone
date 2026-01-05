/**
 * Floor plan tool types
 */
export type FloorPlanTool = 
  | "select"
  | "pan"
  | "rectangle"
  | "circle"
  | "table"
  | "text";

/**
 * FloorPlanToolbar component props
 */
export interface FloorPlanToolbarProps {
  activeTool: FloorPlanTool;
  onToolChange: (tool: FloorPlanTool) => void;
  hasSelection?: boolean;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onRotate?: () => void;
  onToggleLock?: () => void;
  isLocked?: boolean;
  onSave?: () => void;
  onExport?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  inverted?: boolean;
  className?: string;
}
