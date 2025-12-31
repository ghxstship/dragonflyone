"use client";

import React from "react";
import {
  MousePointer,
  Hand,
  Square,
  Circle,
  RectangleHorizontal,
  Type,
  Trash2,
  Copy,
  RotateCw,
  Lock,
  Unlock,
  Save,
  Download,
  Undo,
  Redo,
} from "lucide-react";
import clsx from "clsx";
import { Tooltip } from "../atoms/tooltip.js";

export type FloorPlanTool = "select" | "pan" | "rectangle" | "circle" | "table" | "text";

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
  className?: string;
}

const tools: { id: FloorPlanTool; icon: React.ElementType; label: string }[] = [
  { id: "select", icon: MousePointer, label: "Select" },
  { id: "pan", icon: Hand, label: "Pan" },
  { id: "rectangle", icon: Square, label: "Rectangle" },
  { id: "circle", icon: Circle, label: "Circle" },
  { id: "table", icon: RectangleHorizontal, label: "Table" },
  { id: "text", icon: Type, label: "Text" },
];

export function FloorPlanToolbar({
  activeTool,
  onToolChange,
  hasSelection = false,
  onDelete,
  onDuplicate,
  onRotate,
  onToggleLock,
  isLocked = false,
  onSave,
  onExport,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
  className,
}: FloorPlanToolbarProps) {
  return (
    <div
      className={clsx(
        "flex items-center gap-1 p-1 bg-background border-2 border-border rounded-card",
        className
      )}
    >
      {/* Drawing Tools */}
      <div className="flex items-center gap-0.5">
        {tools.map((tool) => (
          <Tooltip key={tool.id} content={tool.label}>
            <button
              onClick={() => onToolChange(tool.id)}
              className={clsx(
                "p-2 rounded-button transition-colors",
                activeTool === tool.id
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
              )}
              aria-label={tool.label}
            >
              <tool.icon className="h-4 w-4" />
            </button>
          </Tooltip>
        ))}
      </div>

      <div className="w-px h-6 bg-border mx-1" />

      {/* Selection Actions */}
      <div className="flex items-center gap-0.5">
        <Tooltip content="Duplicate">
          <button
            onClick={onDuplicate}
            disabled={!hasSelection}
            className={clsx(
              "p-2 rounded-button transition-colors",
              hasSelection
                ? "hover:bg-muted text-muted-foreground hover:text-foreground"
                : "text-muted-foreground/50 cursor-not-allowed"
            )}
            aria-label="Duplicate"
          >
            <Copy className="h-4 w-4" />
          </button>
        </Tooltip>
        <Tooltip content="Rotate 45°">
          <button
            onClick={onRotate}
            disabled={!hasSelection}
            className={clsx(
              "p-2 rounded-button transition-colors",
              hasSelection
                ? "hover:bg-muted text-muted-foreground hover:text-foreground"
                : "text-muted-foreground/50 cursor-not-allowed"
            )}
            aria-label="Rotate 45 degrees"
          >
            <RotateCw className="h-4 w-4" />
          </button>
        </Tooltip>
        <Tooltip content={isLocked ? "Unlock" : "Lock"}>
          <button
            onClick={onToggleLock}
            disabled={!hasSelection}
            className={clsx(
              "p-2 rounded-button transition-colors",
              hasSelection
                ? "hover:bg-muted text-muted-foreground hover:text-foreground"
                : "text-muted-foreground/50 cursor-not-allowed"
            )}
            aria-label={isLocked ? "Unlock" : "Lock"}
          >
            {isLocked ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
          </button>
        </Tooltip>
        <Tooltip content="Delete">
          <button
            onClick={onDelete}
            disabled={!hasSelection}
            className={clsx(
              "p-2 rounded-button transition-colors",
              hasSelection
                ? "hover:bg-destructive/10 text-destructive"
                : "text-muted-foreground/50 cursor-not-allowed"
            )}
            aria-label="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </Tooltip>
      </div>

      <div className="w-px h-6 bg-border mx-1" />

      {/* Undo/Redo */}
      <div className="flex items-center gap-0.5">
        <Tooltip content={<span>Undo <kbd className="ml-1 px-1 py-0.5 bg-black/20 rounded text-xs">Ctrl+Z</kbd></span>}>
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={clsx(
              "p-2 rounded-button transition-colors",
              canUndo
                ? "hover:bg-muted text-muted-foreground hover:text-foreground"
                : "text-muted-foreground/50 cursor-not-allowed"
            )}
            aria-label="Undo"
          >
            <Undo className="h-4 w-4" />
          </button>
        </Tooltip>
        <Tooltip content={<span>Redo <kbd className="ml-1 px-1 py-0.5 bg-black/20 rounded text-xs">Ctrl+Y</kbd></span>}>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={clsx(
              "p-2 rounded-button transition-colors",
              canRedo
                ? "hover:bg-muted text-muted-foreground hover:text-foreground"
                : "text-muted-foreground/50 cursor-not-allowed"
            )}
            aria-label="Redo"
          >
            <Redo className="h-4 w-4" />
          </button>
        </Tooltip>
      </div>

      <div className="flex-1" />

      {/* Save/Export */}
      <div className="flex items-center gap-0.5">
        <Tooltip content={<span>Save <kbd className="ml-1 px-1 py-0.5 bg-black/20 rounded text-xs">Ctrl+S</kbd></span>}>
          <button
            onClick={onSave}
            className="p-2 rounded-button hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Save"
          >
            <Save className="h-4 w-4" />
          </button>
        </Tooltip>
        <Tooltip content="Export">
          <button
            onClick={onExport}
            className="p-2 rounded-button hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Export"
          >
            <Download className="h-4 w-4" />
          </button>
        </Tooltip>
      </div>
    </div>
  );
}

export default FloorPlanToolbar;
