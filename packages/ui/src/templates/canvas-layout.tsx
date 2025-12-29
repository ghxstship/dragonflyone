"use client";

import { forwardRef, ReactNode, useState, useCallback } from "react";
import clsx from "clsx";
import { Stack } from "../foundations/layout.js";
import { Spinner } from "../atoms/spinner.js";
import { Body, H2 } from "../atoms/typography.js";
import { Button } from "../atoms/button.js";
import { 
  AlertTriangle, 
  ZoomIn, 
  ZoomOut, 
  Maximize2,
  Move,
  Grid,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelRightClose,
  Layers
} from "lucide-react";

// =============================================================================
// CANVAS LAYOUT
// Free-form workspace/builder layout.
// Bold Contemporary Pop Art Adventure Design System
// =============================================================================

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

const panelWidthClasses = {
  narrow: "w-56",
  medium: "w-72",
  wide: "w-96",
};

/**
 * CanvasLayout - Free-form workspace/builder layout
 * 
 * Use cases:
 * - Workflow builders
 * - Diagram editors
 * - Visual editors
 * - Floor plan designers
 * - Whiteboard
 * - Node-based interfaces
 * - Drag-and-drop builders
 * 
 * Features:
 * - Configurable panels (left, right, bottom)
 * - Zoom and pan controls
 * - Grid background options
 * - Minimap support
 * - Constrained or infinite canvas
 * - Loading, error, empty state variants
 * - Accessibility compliant
 */
export const CanvasLayout = forwardRef<HTMLDivElement, CanvasLayoutProps>(
  function CanvasLayout(
    {
      children,
      toolbar = "none",
      toolbarContent,
      leftPanel = "none",
      leftPanelContent,
      leftPanelTitle = "Tools",
      leftPanelCollapsed: leftPanelCollapsedProp,
      onLeftPanelCollapse,
      rightPanel = "none",
      rightPanelContent,
      rightPanelTitle = "Properties",
      rightPanelCollapsed: rightPanelCollapsedProp,
      onRightPanelCollapse,
      bottomPanel = "none",
      bottomPanelContent,
      bottomPanelTitle = "Timeline",
      bottomPanelCollapsed: bottomPanelCollapsedProp,
      onBottomPanelCollapse,
      panelWidth = "medium",
      canvas = "infinite",
      canvasWidth = 1920,
      canvasHeight = 1080,
      canvasControls = "both",
      zoom: zoomProp = 1,
      onZoomChange,
      minZoom = 0.1,
      maxZoom = 4,
      grid = "dots",
      gridSize = 20,
      minimap = false,
      minimapContent,
      inverted = true,
      loading = false,
      loadingMessage = "Loading...",
      error = null,
      onRetry,
      empty = false,
      emptyMessage = "Start building",
      emptyAction,
      className,
      header,
    },
    ref
  ) {
    // Internal state for uncontrolled panels
    const [internalLeftCollapsed, setInternalLeftCollapsed] = useState(false);
    const [internalRightCollapsed, setInternalRightCollapsed] = useState(false);
    const [internalBottomCollapsed, setInternalBottomCollapsed] = useState(false);
    const [internalZoom, setInternalZoom] = useState(1);
    const [isPanning, setIsPanning] = useState(false);

    // Use controlled or uncontrolled state
    const leftCollapsed = leftPanelCollapsedProp ?? internalLeftCollapsed;
    const rightCollapsed = rightPanelCollapsedProp ?? internalRightCollapsed;
    const bottomCollapsed = bottomPanelCollapsedProp ?? internalBottomCollapsed;
    const zoom = zoomProp ?? internalZoom;

    const setLeftCollapsed = onLeftPanelCollapse ?? setInternalLeftCollapsed;
    const setRightCollapsed = onRightPanelCollapse ?? setInternalRightCollapsed;
    const setBottomCollapsed = onBottomPanelCollapse ?? setInternalBottomCollapsed;
    const setZoom = onZoomChange ?? setInternalZoom;

    const bgClass = inverted ? "bg-ink-950 text-white" : "bg-white text-ink-900";
    const borderClass = inverted ? "border-grey-800" : "border-grey-200";
    const panelBgClass = inverted ? "bg-ink-900" : "bg-grey-50";

    const handleZoomIn = useCallback(() => {
      setZoom(Math.min(zoom + 0.1, maxZoom));
    }, [zoom, maxZoom, setZoom]);

    const handleZoomOut = useCallback(() => {
      setZoom(Math.max(zoom - 0.1, minZoom));
    }, [zoom, minZoom, setZoom]);

    const handleZoomReset = useCallback(() => {
      setZoom(1);
    }, [setZoom]);

    const handleZoomFit = useCallback(() => {
      // This would need canvas dimensions to calculate proper fit
      setZoom(1);
    }, [setZoom]);

    // Grid pattern styles
    const getGridStyle = (): React.CSSProperties | undefined => {
      if (grid === "none") return undefined;

      const scaledSize = gridSize * zoom;
      const color = inverted ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";

      if (grid === "dots") {
        return {
          backgroundImage: `radial-gradient(circle, ${color} 1px, transparent 1px)`,
          backgroundSize: `${scaledSize}px ${scaledSize}px`,
        };
      }

      if (grid === "lines") {
        return {
          backgroundImage: `linear-gradient(${color} 1px, transparent 1px), linear-gradient(90deg, ${color} 1px, transparent 1px)`,
          backgroundSize: `${scaledSize}px ${scaledSize}px`,
        };
      }

      return undefined;
    };

    // Loading state
    if (loading) {
      return (
        <div ref={ref} className={clsx("h-screen flex flex-col", bgClass, className)}>
          {header}
          <div className="flex-1 flex items-center justify-center">
            <Stack gap={4} className="items-center text-center">
              <Spinner size="lg" />
              <Body className={inverted ? "text-grey-400" : "text-grey-600"}>
                {loadingMessage}
              </Body>
            </Stack>
          </div>
        </div>
      );
    }

    // Error state
    if (error) {
      return (
        <div ref={ref} className={clsx("h-screen flex flex-col", bgClass, className)}>
          {header}
          <div className="flex-1 flex items-center justify-center">
            <Stack gap={6} className="items-center text-center max-w-md">
              <AlertTriangle className="size-16 text-error animate-shake" />
              <Stack gap={2} className="items-center">
                <H2 className={inverted ? "text-white" : "text-ink-900"}>
                  Error Loading Canvas
                </H2>
                <Body className={inverted ? "text-grey-400" : "text-grey-600"}>
                  {error.message || "An unexpected error occurred"}
                </Body>
              </Stack>
              {onRetry && (
                <Button variant="solid" onClick={onRetry}>
                  Try Again
                </Button>
              )}
            </Stack>
          </div>
        </div>
      );
    }

    // Panel components
    const renderLeftPanel = () => {
      if (leftPanel === "none") return null;

      const isFloating = leftPanel === "floating";
      const isCollapsible = leftPanel === "collapsible";

      if (isCollapsible && leftCollapsed) {
        return (
          <button
            onClick={() => setLeftCollapsed(false)}
            className={clsx(
              "absolute left-0 top-1/2 -translate-y-1/2 z-panel p-2 border-2 rounded-r-card transition-colors",
              borderClass,
              panelBgClass,
              inverted ? "hover:bg-ink-800" : "hover:bg-grey-100"
            )}
          >
            <ChevronRight className="size-5" />
          </button>
        );
      }

      return (
        <aside
          className={clsx(
            "shrink-0 border-r-2 flex flex-col",
            panelWidthClasses[panelWidth],
            borderClass,
            panelBgClass,
            isFloating && "absolute left-4 top-4 bottom-4 z-panel rounded-card shadow-lg"
          )}
        >
          <div className={clsx(
            "flex items-center justify-between px-4 py-3 border-b-2",
            borderClass
          )}>
            <Body className={clsx("font-semibold text-sm uppercase tracking-wider", inverted ? "text-grey-400" : "text-grey-500")}>
              {leftPanelTitle}
            </Body>
            {isCollapsible && (
              <button
                onClick={() => setLeftCollapsed(true)}
                className={clsx(
                  "p-1 rounded transition-colors",
                  inverted ? "hover:bg-ink-800" : "hover:bg-grey-200"
                )}
              >
                <PanelLeftClose className="size-4" />
              </button>
            )}
          </div>
          <div className="flex-1 overflow-auto p-4">
            {leftPanelContent}
          </div>
        </aside>
      );
    };

    const renderRightPanel = () => {
      if (rightPanel === "none") return null;

      const isFloating = rightPanel === "floating";
      const isCollapsible = rightPanel === "collapsible";

      if (isCollapsible && rightCollapsed) {
        return (
          <button
            onClick={() => setRightCollapsed(false)}
            className={clsx(
              "absolute right-0 top-1/2 -translate-y-1/2 z-panel p-2 border-2 rounded-l-card transition-colors",
              borderClass,
              panelBgClass,
              inverted ? "hover:bg-ink-800" : "hover:bg-grey-100"
            )}
          >
            <ChevronLeft className="size-5" />
          </button>
        );
      }

      return (
        <aside
          className={clsx(
            "shrink-0 border-l-2 flex flex-col",
            panelWidthClasses[panelWidth],
            borderClass,
            panelBgClass,
            isFloating && "absolute right-4 top-4 bottom-4 z-panel rounded-card shadow-lg"
          )}
        >
          <div className={clsx(
            "flex items-center justify-between px-4 py-3 border-b-2",
            borderClass
          )}>
            <Body className={clsx("font-semibold text-sm uppercase tracking-wider", inverted ? "text-grey-400" : "text-grey-500")}>
              {rightPanelTitle}
            </Body>
            {isCollapsible && (
              <button
                onClick={() => setRightCollapsed(true)}
                className={clsx(
                  "p-1 rounded transition-colors",
                  inverted ? "hover:bg-ink-800" : "hover:bg-grey-200"
                )}
              >
                <PanelRightClose className="size-4" />
              </button>
            )}
          </div>
          <div className="flex-1 overflow-auto p-4">
            {rightPanelContent}
          </div>
        </aside>
      );
    };

    const renderBottomPanel = () => {
      if (bottomPanel === "none") return null;

      const isCollapsible = bottomPanel === "collapsible";

      if (isCollapsible && bottomCollapsed) {
        return (
          <button
            onClick={() => setBottomCollapsed(false)}
            className={clsx(
              "absolute bottom-0 left-1/2 -translate-x-1/2 z-panel px-4 py-2 border-2 border-b-0 rounded-t-card transition-colors",
              borderClass,
              panelBgClass,
              inverted ? "hover:bg-ink-800" : "hover:bg-grey-100"
            )}
          >
            <Stack direction="horizontal" gap={2} className="items-center">
              <Layers className="size-4" />
              <span className="text-sm">{bottomPanelTitle}</span>
            </Stack>
          </button>
        );
      }

      return (
        <div
          className={clsx(
            "shrink-0 h-48 border-t-2 flex flex-col",
            borderClass,
            panelBgClass
          )}
        >
          <div className={clsx(
            "flex items-center justify-between px-4 py-2 border-b-2",
            borderClass
          )}>
            <Body className={clsx("font-semibold text-sm uppercase tracking-wider", inverted ? "text-grey-400" : "text-grey-500")}>
              {bottomPanelTitle}
            </Body>
            {isCollapsible && (
              <button
                onClick={() => setBottomCollapsed(true)}
                className={clsx(
                  "p-1 rounded transition-colors",
                  inverted ? "hover:bg-ink-800" : "hover:bg-grey-200"
                )}
              >
                <ChevronLeft className="size-4 rotate-90" />
              </button>
            )}
          </div>
          <div className="flex-1 overflow-auto p-4">
            {bottomPanelContent}
          </div>
        </div>
      );
    };

    return (
      <div ref={ref} className={clsx("h-screen flex flex-col overflow-hidden", bgClass, className)}>
        {header}

        {/* Top Toolbar */}
        {toolbar === "top" && (
          <div className={clsx("shrink-0 border-b-2 px-4 py-2", borderClass)}>
            <Stack direction="horizontal" className="items-center justify-between">
              {toolbarContent}
              
              {/* Zoom controls */}
              {canvasControls !== "none" && (
                <Stack direction="horizontal" gap={1} className="items-center">
                  {(canvasControls === "zoom" || canvasControls === "both") && (
                    <>
                      <button
                        onClick={handleZoomOut}
                        disabled={zoom <= minZoom}
                        className={clsx(
                          "p-2 rounded transition-colors disabled:opacity-50",
                          inverted ? "hover:bg-ink-800" : "hover:bg-grey-100"
                        )}
                        title="Zoom Out"
                      >
                        <ZoomOut className="size-4" />
                      </button>
                      <button
                        onClick={handleZoomReset}
                        className={clsx(
                          "px-2 py-1 rounded text-sm font-mono min-w-[60px] text-center transition-colors",
                          inverted ? "hover:bg-ink-800" : "hover:bg-grey-100"
                        )}
                        title="Reset Zoom"
                      >
                        {Math.round(zoom * 100)}%
                      </button>
                      <button
                        onClick={handleZoomIn}
                        disabled={zoom >= maxZoom}
                        className={clsx(
                          "p-2 rounded transition-colors disabled:opacity-50",
                          inverted ? "hover:bg-ink-800" : "hover:bg-grey-100"
                        )}
                        title="Zoom In"
                      >
                        <ZoomIn className="size-4" />
                      </button>
                      <button
                        onClick={handleZoomFit}
                        className={clsx(
                          "p-2 rounded transition-colors",
                          inverted ? "hover:bg-ink-800" : "hover:bg-grey-100"
                        )}
                        title="Fit to View"
                      >
                        <Maximize2 className="size-4" />
                      </button>
                    </>
                  )}
                  {(canvasControls === "pan" || canvasControls === "both") && (
                    <button
                      onClick={() => setIsPanning(!isPanning)}
                      className={clsx(
                        "p-2 rounded transition-colors",
                        isPanning
                          ? "bg-primary text-white"
                          : inverted ? "hover:bg-ink-800" : "hover:bg-grey-100"
                      )}
                      title="Pan Mode"
                    >
                      <Move className="size-4" />
                    </button>
                  )}
                  <button
                    onClick={() => {}}
                    className={clsx(
                      "p-2 rounded transition-colors",
                      grid !== "none"
                        ? "bg-primary/20 text-primary"
                        : inverted ? "hover:bg-ink-800" : "hover:bg-grey-100"
                    )}
                    title="Toggle Grid"
                  >
                    <Grid className="size-4" />
                  </button>
                </Stack>
              )}
            </Stack>
          </div>
        )}

        {/* Main content area */}
        <div className="flex-1 flex overflow-hidden relative">
          {renderLeftPanel()}

          {/* Canvas area */}
          <div className="flex-1 flex flex-col overflow-hidden relative">
            <div
              className={clsx(
                "flex-1 overflow-auto relative",
                isPanning && "cursor-grab active:cursor-grabbing"
              )}
              style={getGridStyle()}
            >
              {/* Canvas content */}
              <div
                className={clsx(
                  "relative",
                  canvas === "constrained" && "mx-auto"
                )}
                style={canvas === "constrained" ? {
                  width: canvasWidth * zoom,
                  height: canvasHeight * zoom,
                  transform: `scale(${zoom})`,
                  transformOrigin: "top left",
                } : {
                  transform: `scale(${zoom})`,
                  transformOrigin: "top left",
                }}
              >
                {empty ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Stack gap={6} className="items-center text-center max-w-md">
                      <div className={clsx(
                        "size-20 rounded-full flex items-center justify-center border-2",
                        inverted ? "border-grey-700 bg-grey-800" : "border-grey-200 bg-grey-100"
                      )}>
                        <Layers className={clsx(
                          "size-10",
                          inverted ? "text-grey-600" : "text-grey-400"
                        )} />
                      </div>
                      <Body className={inverted ? "text-grey-400" : "text-grey-600"}>
                        {emptyMessage}
                      </Body>
                      {emptyAction && (
                        <Button variant="solid" onClick={emptyAction.onClick}>
                          {emptyAction.label}
                        </Button>
                      )}
                    </Stack>
                  </div>
                ) : (
                  children
                )}
              </div>

              {/* Floating toolbar */}
              {toolbar === "floating" && toolbarContent && (
                <div className={clsx(
                  "absolute top-4 left-1/2 -translate-x-1/2 z-panel px-4 py-2 border-2 rounded-card shadow-lg",
                  borderClass,
                  panelBgClass
                )}>
                  {toolbarContent}
                </div>
              )}

              {/* Minimap */}
              {minimap && (
                <div className={clsx(
                  "absolute bottom-4 right-4 z-panel w-48 h-32 border-2 rounded-card overflow-hidden",
                  borderClass,
                  panelBgClass
                )}>
                  {minimapContent || (
                    <div className="w-full h-full flex items-center justify-center">
                      <Body size="sm" className={inverted ? "text-grey-500" : "text-grey-400"}>
                        Minimap
                      </Body>
                    </div>
                  )}
                </div>
              )}

              {/* Floating zoom controls */}
              {toolbar !== "top" && canvasControls !== "none" && (
                <div className={clsx(
                  "absolute bottom-4 left-4 z-panel flex items-center gap-1 px-2 py-1 border-2 rounded-card",
                  borderClass,
                  panelBgClass
                )}>
                  <button
                    onClick={handleZoomOut}
                    disabled={zoom <= minZoom}
                    className={clsx(
                      "p-1.5 rounded transition-colors disabled:opacity-50",
                      inverted ? "hover:bg-ink-800" : "hover:bg-grey-200"
                    )}
                  >
                    <ZoomOut className="size-4" />
                  </button>
                  <span className="px-2 text-sm font-mono min-w-[50px] text-center">
                    {Math.round(zoom * 100)}%
                  </span>
                  <button
                    onClick={handleZoomIn}
                    disabled={zoom >= maxZoom}
                    className={clsx(
                      "p-1.5 rounded transition-colors disabled:opacity-50",
                      inverted ? "hover:bg-ink-800" : "hover:bg-grey-200"
                    )}
                  >
                    <ZoomIn className="size-4" />
                  </button>
                </div>
              )}
            </div>

            {renderBottomPanel()}
          </div>

          {renderRightPanel()}
        </div>
      </div>
    );
  }
);

export default CanvasLayout;
