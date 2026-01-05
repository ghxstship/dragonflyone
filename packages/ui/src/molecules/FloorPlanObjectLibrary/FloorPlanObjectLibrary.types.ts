import type { ReactElement } from "react";

/**
 * Floor plan object template
 */
export interface FloorPlanObjectTemplate {
  id: string;
  name: string;
  category: string;
  icon: ReactElement;
  width: number;
  height: number;
  color: string;
}

/**
 * FloorPlanObjectLibrary component props
 */
export interface FloorPlanObjectLibraryProps {
  onAddObject: (template: FloorPlanObjectTemplate) => void;
  inverted?: boolean;
  className?: string;
}
