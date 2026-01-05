"use client";

import React, { useState, useRef } from "react";
import { ZoomIn, ZoomOut, RotateCcw, Grid3X3, Lock } from "lucide-react";
import clsx from "clsx";
import { floorPlanCanvasVariants } from "./FloorPlanCanvas.variants.js";
import type { FloorPlanCanvasProps, FloorPlanObject } from "./FloorPlanCanvas.types.js";
import { Tooltip } from "../../atoms/Tooltip/index.js";

export function FloorPlanCanvas({
  width,
  height,
  objects,
  selectedObjectId,
  onSelectObject,
  onMoveObject,
  gridSize = 20,
  showGrid = true,
  snapToGrid = true,
  backgroundColor = "#f5f5f5",
  className,
  readonly = false,
}: FloorPlanCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [draggedObject, setDraggedObject] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleZoomIn = () => setZoom((z) => Math.min(z * 1.2, 3));
  const handleZoomOut = () => setZoom((z) => Math.max(z / 1.2, 0.25));
  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const snapValue = (value: number) => {
    if (!snapToGrid) return value;
    return Math.round(value / gridSize) * gridSize;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      e.preventDefault();
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
    } else if (draggedObject && !readonly) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = snapValue((e.clientX - rect.left - pan.x) / zoom - dragOffset.x);
      const y = snapValue((e.clientY - rect.top - pan.y) / zoom - dragOffset.y);
      onMoveObject?.(draggedObject, Math.max(0, x), Math.max(0, y));
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggedObject(null);
  };

  const handleObjectMouseDown = (e: React.MouseEvent, obj: FloorPlanObject) => {
    if (readonly || obj.locked) return;
    e.stopPropagation();

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = (e.clientX - rect.left - pan.x) / zoom;
    const mouseY = (e.clientY - rect.top - pan.y) / zoom;

    setDraggedObject(obj.id);
    setDragOffset({ x: mouseX - obj.x, y: mouseY - obj.y });
    onSelectObject?.(obj.id);
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      onSelectObject?.(null);
    }
  };

  return (
    <div className={clsx(floorPlanCanvasVariants({ showGrid, readonly }), className)}>
      {/* Toolbar */}
      <div className="absolute top-2 left-2 z-10 flex items-center gap-1 bg-background border-2 border-border rounded-button p-1">
        <Tooltip content="Zoom In">
          <button
            onClick={handleZoomIn}
            className="p-1.5 hover:bg-muted rounded-button transition-colors"
            aria-label="Zoom in"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
        </Tooltip>
        <Tooltip content="Zoom Out">
          <button
            onClick={handleZoomOut}
            className="p-1.5 hover:bg-muted rounded-button transition-colors"
            aria-label="Zoom out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
        </Tooltip>
        <span className="text-body-xs text-muted-foreground px-2 min-w-[3rem] text-center">
          {Math.round(zoom * 100)}%
        </span>
        <Tooltip content="Reset View">
          <button
            onClick={handleResetZoom}
            className="p-1.5 hover:bg-muted rounded-button transition-colors"
            aria-label="Reset view"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </Tooltip>
        <div className="w-px h-5 bg-border mx-1" />
        <Tooltip content="Toggle Grid">
          <button
            className={clsx(
              "p-1.5 rounded-button transition-colors",
              showGrid ? "bg-primary/10 text-primary" : "hover:bg-muted"
            )}
            aria-label="Toggle grid"
          >
            <Grid3X3 className="h-4 w-4" />
          </button>
        </Tooltip>
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        style={{ minHeight: 400 }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleCanvasClick}
      >
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "0 0",
            width,
            height,
            backgroundColor,
            position: "relative",
          }}
        >
          {/* Grid */}
          {showGrid && (
            <svg
              className="absolute inset-0 pointer-events-none"
              width={width}
              height={height}
            >
              <defs>
                <pattern
                  id="grid"
                  width={gridSize}
                  height={gridSize}
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`}
                    fill="none"
                    stroke="#ddd"
                    strokeWidth="0.5"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          )}

          {/* Objects */}
          {objects.map((obj) => (
            <div
              key={obj.id}
              className={clsx(
                "absolute cursor-pointer transition-shadow",
                selectedObjectId === obj.id && "ring-2 ring-primary ring-offset-2",
                obj.locked && "opacity-75"
              )}
              style={{
                left: obj.x,
                top: obj.y,
                width: obj.width,
                height: obj.height,
                transform: `rotate(${obj.rotation}deg)`,
                backgroundColor: obj.color || "#3b82f6",
                borderRadius: 4,
              }}
              onMouseDown={(e) => handleObjectMouseDown(e, obj)}
            >
              {obj.label && (
                <span className="absolute inset-0 flex items-center justify-center text-body-xs text-white font-weight-medium truncate px-1">
                  {obj.label}
                </span>
              )}
              {obj.locked && (
                <Lock className="absolute top-1 right-1 h-3 w-3 text-white/70" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-2 left-2 text-body-xs text-muted-foreground bg-background/80 px-2 py-1 rounded-button">
        Alt+Drag to pan • Scroll to zoom • Click to select
      </div>
    </div>
  );
}

export default FloorPlanCanvas;
