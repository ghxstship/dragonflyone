export interface FloorPlanObject {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  label?: string;
  color?: string;
  locked?: boolean;
}

export interface FloorPlanCanvasProps {
  width: number;
  height: number;
  objects: FloorPlanObject[];
  selectedObjectId?: string | null;
  onSelectObject?: (id: string | null) => void;
  onMoveObject?: (id: string, x: number, y: number) => void;
  onResizeObject?: (id: string, width: number, height: number) => void;
  onRotateObject?: (id: string, rotation: number) => void;
  onDeleteObject?: (id: string) => void;
  gridSize?: number;
  showGrid?: boolean;
  snapToGrid?: boolean;
  backgroundColor?: string;
  className?: string;
  readonly?: boolean;
}
