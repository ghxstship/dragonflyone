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
          <button
            key={tool.id}
            onClick={() => onToolChange(tool.id)}
            className={clsx(
              "p-2 rounded-button transition-colors",
              activeTool === tool.id
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted text-muted-foreground hover:text-foreground"
            )}
            title={tool.label}
          >
            <tool.icon className="h-4 w-4" />
          </button>
        ))}
      </div>

      <div className="w-px h-6 bg-border mx-1" />

      {/* Selection Actions */}
      <div className="flex items-center gap-0.5">
        <button
          onClick={onDuplicate}
          disabled={!hasSelection}
          className={clsx(
            "p-2 rounded-button transition-colors",
            hasSelection
              ? "hover:bg-muted text-muted-foreground hover:text-foreground"
              : "text-muted-foreground/50 cursor-not-allowed"
          )}
          title="Duplicate"
        >
          <Copy className="h-4 w-4" />
        </button>
        <button
          onClick={onRotate}
          disabled={!hasSelection}
          className={clsx(
            "p-2 rounded-button transition-colors",
            hasSelection
              ? "hover:bg-muted text-muted-foreground hover:text-foreground"
              : "text-muted-foreground/50 cursor-not-allowed"
          )}
          title="Rotate 45°"
        >
          <RotateCw className="h-4 w-4" />
        </button>
        <button
          onClick={onToggleLock}
          disabled={!hasSelection}
          className={clsx(
            "p-2 rounded-button transition-colors",
            hasSelection
              ? "hover:bg-muted text-muted-foreground hover:text-foreground"
              : "text-muted-foreground/50 cursor-not-allowed"
          )}
          title={isLocked ? "Unlock" : "Lock"}
        >
          {isLocked ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
        </button>
        <button
          onClick={onDelete}
          disabled={!hasSelection}
          className={clsx(
            "p-2 rounded-button transition-colors",
            hasSelection
              ? "hover:bg-destructive/10 text-destructive"
              : "text-muted-foreground/50 cursor-not-allowed"
          )}
          title="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="w-px h-6 bg-border mx-1" />

      {/* Undo/Redo */}
      <div className="flex items-center gap-0.5">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className={clsx(
            "p-2 rounded-button transition-colors",
            canUndo
              ? "hover:bg-muted text-muted-foreground hover:text-foreground"
              : "text-muted-foreground/50 cursor-not-allowed"
          )}
          title="Undo"
        >
          <Undo className="h-4 w-4" />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className={clsx(
            "p-2 rounded-button transition-colors",
            canRedo
              ? "hover:bg-muted text-muted-foreground hover:text-foreground"
              : "text-muted-foreground/50 cursor-not-allowed"
          )}
          title="Redo"
        >
          <Redo className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1" />

      {/* Save/Export */}
      <div className="flex items-center gap-0.5">
        <button
          onClick={onSave}
          className="p-2 rounded-button hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          title="Save"
        >
          <Save className="h-4 w-4" />
        </button>
        <button
          onClick={onExport}
          className="p-2 rounded-button hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          title="Export"
        >
          <Download className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default FloorPlanToolbar;
