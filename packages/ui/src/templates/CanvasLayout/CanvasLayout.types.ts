import type { ReactNode } from "react";

export interface CanvasLayoutProps {
  children: ReactNode;
  /** Toolbar configuration */
  toolbar?: "none" | "top" | "floating";
  /** Toolbar content */
  toolbarContent?: ReactNode;
  /** Left panel configuration */
  leftPanel?: "none" | "fixed" | "collapsible" | "floating";
  /** Left panel content */
  leftPanelContent?: ReactNode;
  /** Left panel title */
  leftPanelTitle?: string;
  /** Left panel collapsed state */
  leftPanelCollapsed?: boolean;
  /** Left panel collapse handler */
  onLeftPanelCollapse?: (collapsed: boolean) => void;
  /** Right panel configuration */
  rightPanel?: "none" | "fixed" | "collapsible" | "floating";
  /** Right panel content */
  rightPanelContent?: ReactNode;
  /** Right panel title */
  rightPanelTitle?: string;
  /** Right panel collapsed state */
  rightPanelCollapsed?: boolean;
  /** Right panel collapse handler */
  onRightPanelCollapse?: (collapsed: boolean) => void;
  /** Bottom panel configuration */
  bottomPanel?: "none" | "fixed" | "collapsible";
  /** Bottom panel content */
  bottomPanelContent?: ReactNode;
  /** Bottom panel title */
  bottomPanelTitle?: string;
  /** Bottom panel collapsed state */
  bottomPanelCollapsed?: boolean;
  /** Bottom panel collapse handler */
  onBottomPanelCollapse?: (collapsed: boolean) => void;
  /** Panel width */
  panelWidth?: "narrow" | "medium" | "wide";
  /** Canvas type */
  canvas?: "constrained" | "infinite";
  /** Canvas width (for constrained) */
  canvasWidth?: number;
  /** Canvas height (for constrained) */
  canvasHeight?: number;
  /** Canvas controls */
  canvasControls?: "none" | "zoom" | "pan" | "both";
  /** Current zoom level (1 = 100%) */
  zoom?: number;
  /** Zoom change handler */
  onZoomChange?: (zoom: number) => void;
  /** Min zoom level */
  minZoom?: number;
  /** Max zoom level */
  maxZoom?: number;
  /** Grid type */
  grid?: "none" | "dots" | "lines";
  /** Grid size */
  gridSize?: number;
  /** Show minimap */
  minimap?: boolean;
  /** Minimap content */
  minimapContent?: ReactNode;
  /** Dark/light theme */
  inverted?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Loading message */
  loadingMessage?: string;
  /** Error state */
  error?: Error | null;
  /** Error retry handler */
  onRetry?: () => void;
  /** Empty state */
  empty?: boolean;
  /** Empty state message */
  emptyMessage?: string;
  /** Empty state action */
  emptyAction?: { label: string; onClick: () => void };
  /** Custom className */
  className?: string;
  /** Header content */
  header?: ReactNode;
}
