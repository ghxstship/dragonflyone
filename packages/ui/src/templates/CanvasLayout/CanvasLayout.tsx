"use client";

import { forwardRef, useState, useCallback } from "react";
import clsx from "clsx";
import { canvasLayoutVariants } from "./CanvasLayout.variants.js";
import type { CanvasLayoutProps } from "./CanvasLayout.types.js";
import { Stack } from "../../foundations/layout.js";
import { Spinner } from '../../atoms/Spinner/index.js';
import { H2, Body } from '../../atoms/Typography/index.js';
import { Button } from "../../atoms/Button/index.js";
import { Tooltip } from "../../atoms/Tooltip/index.js";
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

    const _bgClass = inverted ? "bg-surface-inverse text-text-primary" : "bg-surface-primary text-text-primary";
    const borderClass = inverted ? "border-border" : "border-border";
    const panelBgClass = inverted ? "bg-surface-elevated" : "bg-muted";

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
        <div ref={ref} className={clsx(canvasLayoutVariants({ inverted }), className)}>
          {header}
          <div className="flex-1 flex items-center justify-center">
            <Stack gap={4} className="items-center text-center">
              <Spinner size="lg" />
              <Body className={inverted ? "text-text-muted" : "text-text-muted"}>
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
        <div ref={ref} className={clsx(canvasLayoutVariants({ inverted }), className)}>
          {header}
          <div className="flex-1 flex items-center justify-center">
            <Stack gap={6} className="items-center text-center max-w-md">
              <AlertTriangle className="size-16 text-error animate-shake" />
              <Stack gap={2} className="items-center">
                <H2 className={inverted ? "text-text-primary" : "text-text-primary"}>
                  Error Loading Canvas
                </H2>
                <Body className={inverted ? "text-text-muted" : "text-text-muted"}>
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
              inverted ? "hover:bg-surface-inverse" : "hover:bg-muted"
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
            <Body className={clsx("font-semibold text-sm uppercase tracking-wider", inverted ? "text-text-muted" : "text-text-muted")}>
              {leftPanelTitle}
            </Body>
            {isCollapsible && (
              <button
                onClick={() => setLeftCollapsed(true)}
                className={clsx(
                  "p-1 rounded transition-colors",
                  inverted ? "hover:bg-surface-inverse" : "hover:bg-muted"
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
              inverted ? "hover:bg-surface-inverse" : "hover:bg-muted"
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
            <Body className={clsx("font-semibold text-sm uppercase tracking-wider", inverted ? "text-text-muted" : "text-text-muted")}>
              {rightPanelTitle}
            </Body>
            {isCollapsible && (
              <button
                onClick={() => setRightCollapsed(true)}
                className={clsx(
                  "p-1 rounded transition-colors",
                  inverted ? "hover:bg-surface-inverse" : "hover:bg-muted"
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
              inverted ? "hover:bg-surface-inverse" : "hover:bg-muted"
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
            <Body className={clsx("font-semibold text-sm uppercase tracking-wider", inverted ? "text-text-muted" : "text-text-muted")}>
              {bottomPanelTitle}
            </Body>
            {isCollapsible && (
              <button
                onClick={() => setBottomCollapsed(true)}
                className={clsx(
                  "p-1 rounded transition-colors",
                  inverted ? "hover:bg-surface-inverse" : "hover:bg-muted"
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
      <div ref={ref} className={clsx(canvasLayoutVariants({ inverted }), className)}>
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
                      <Tooltip content="Zoom Out">
                        <button
                          onClick={handleZoomOut}
                          disabled={zoom <= minZoom}
                          className={clsx(
                            "p-2 rounded transition-colors disabled:opacity-50",
                            inverted ? "hover:bg-surface-inverse" : "hover:bg-muted"
                          )}
                          aria-label="Zoom out"
                        >
                          <ZoomOut className="size-4" />
                        </button>
                      </Tooltip>
                      <Tooltip content="Reset Zoom">
                        <button
                          onClick={handleZoomReset}
                          className={clsx(
                            "px-2 py-1 rounded text-sm font-mono min-w-[60px] text-center transition-colors",
                            inverted ? "hover:bg-surface-inverse" : "hover:bg-muted"
                          )}
                          aria-label="Reset zoom"
                        >
                          {Math.round(zoom * 100)}%
                        </button>
                      </Tooltip>
                      <Tooltip content="Zoom In">
                        <button
                          onClick={handleZoomIn}
                          disabled={zoom >= maxZoom}
                          className={clsx(
                            "p-2 rounded transition-colors disabled:opacity-50",
                            inverted ? "hover:bg-surface-inverse" : "hover:bg-muted"
                          )}
                          aria-label="Zoom in"
                        >
                          <ZoomIn className="size-4" />
                        </button>
                      </Tooltip>
                      <Tooltip content="Fit to View">
                        <button
                          onClick={handleZoomFit}
                          className={clsx(
                            "p-2 rounded transition-colors",
                            inverted ? "hover:bg-surface-inverse" : "hover:bg-muted"
                          )}
                          aria-label="Fit to view"
                        >
                          <Maximize2 className="size-4" />
                        </button>
                      </Tooltip>
                    </>
                  )}
                  {(canvasControls === "pan" || canvasControls === "both") && (
                    <Tooltip content="Pan Mode">
                      <button
                        onClick={() => setIsPanning(!isPanning)}
                        className={clsx(
                          "p-2 rounded transition-colors",
                          isPanning
                            ? "bg-primary text-white"
                            : inverted ? "hover:bg-surface-inverse" : "hover:bg-muted"
                        )}
                        aria-label="Pan mode"
                      >
                        <Move className="size-4" />
                      </button>
                    </Tooltip>
                  )}
                  <Tooltip content="Toggle Grid">
                    <button
                      onClick={() => {}}
                      className={clsx(
                        "p-2 rounded transition-colors",
                        grid !== "none"
                          ? "bg-primary/20 text-primary"
                          : inverted ? "hover:bg-surface-inverse" : "hover:bg-muted"
                      )}
                      aria-label="Toggle grid"
                    >
                      <Grid className="size-4" />
                    </button>
                  </Tooltip>
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
                        inverted ? "border-border bg-surface-elevated" : "border-border bg-muted"
                      )}>
                        <Layers className={clsx(
                          "size-10",
                          inverted ? "text-text-disabled" : "text-text-muted"
                        )} />
                      </div>
                      <Body className={inverted ? "text-text-muted" : "text-text-muted"}>
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
                      <Body size="sm" className={inverted ? "text-text-disabled" : "text-text-muted"}>
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
                      inverted ? "hover:bg-surface-inverse" : "hover:bg-muted"
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
                      inverted ? "hover:bg-surface-inverse" : "hover:bg-muted"
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

CanvasLayout.displayName = "CanvasLayout";

export default CanvasLayout;
