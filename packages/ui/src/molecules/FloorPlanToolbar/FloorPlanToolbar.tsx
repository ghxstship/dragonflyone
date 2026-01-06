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
import { 
  floorPlanToolbarVariants,
  floorPlanToolbarToolGroupVariants,
  floorPlanToolbarSeparatorVariants,
  floorPlanToolbarToolButtonVariants,
  floorPlanToolbarActionButtonVariants 
} from "./FloorPlanToolbar.variants.js";
import type { 
  FloorPlanToolbarProps, 
  FloorPlanTool 
} from "./FloorPlanToolbar.types.js";

/**
 * FloorPlanToolbar component - Bold Contemporary Pop Art Adventure
 * 
 * Features:
 * - Bold borders and shadows
 * - Clear visual hierarchy
 * - Tool selection and actions
 * - CVA-based variants for consistent theming
 * 
 * @example
 * ```tsx
 * <FloorPlanToolbar
 *   activeTool="select"
 *   onToolChange={(tool) => console.log('Tool:', tool)}
 *   hasSelection={true}
 *   onDelete={() => console.log('Delete')}
 *   inverted={false}
 * />
 * ```
 */
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
  inverted = false,
  className,
}: FloorPlanToolbarProps) {
  // Tool definitions
  const tools = [
    { id: "select" as FloorPlanTool, icon: <MousePointer className="w-4 h-4" />, label: "Select" },
    { id: "pan" as FloorPlanTool, icon: <Hand className="w-4 h-4" />, label: "Pan" },
    { id: "rectangle" as FloorPlanTool, icon: <Square className="w-4 h-4" />, label: "Rectangle" },
    { id: "circle" as FloorPlanTool, icon: <Circle className="w-4 h-4" />, label: "Circle" },
    { id: "table" as FloorPlanTool, icon: <RectangleHorizontal className="w-4 h-4" />, label: "Table" },
    { id: "text" as FloorPlanTool, icon: <Type className="w-4 h-4" />, label: "Text" },
  ];

  // Handle tool click
  const handleToolClick = (tool: FloorPlanTool) => {
    onToolChange(tool);
  };

  return (
    <div className={floorPlanToolbarVariants({ className })}>
      {/* Drawing Tools */}
      <div className={floorPlanToolbarToolGroupVariants({})}>
        {tools.map((tool) => (
          <button
            key={tool.id}
            className={floorPlanToolbarToolButtonVariants({ 
              active: activeTool === tool.id, 
              disabled: false, 
              inverted 
            })}
            onClick={() => handleToolClick(tool.id)}
            title={tool.label}
            aria-label={`Select ${tool.label} tool`}
            aria-pressed={activeTool === tool.id}
          >
            {tool.icon}
          </button>
        ))}
      </div>

      {/* Separator */}
      <div className={floorPlanToolbarSeparatorVariants({})} />

      {/* Selection Actions */}
      <div className={floorPlanToolbarToolGroupVariants({})}>
        <button
          className={floorPlanToolbarActionButtonVariants({ 
            disabled: !hasSelection, 
            inverted 
          })}
          onClick={onDelete}
          title="Delete selection"
          disabled={!hasSelection}
          aria-label="Delete selection"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        <button
          className={floorPlanToolbarActionButtonVariants({ 
            disabled: !hasSelection, 
            inverted 
          })}
          onClick={onDuplicate}
          title="Duplicate selection"
          disabled={!hasSelection}
          aria-label="Duplicate selection"
        >
          <Copy className="w-4 h-4" />
        </button>

        <button
          className={floorPlanToolbarActionButtonVariants({ 
            disabled: !hasSelection, 
            inverted 
          })}
          onClick={onRotate}
          title="Rotate selection"
          disabled={!hasSelection}
          aria-label="Rotate selection"
        >
          <RotateCw className="w-4 h-4" />
        </button>

        <button
          className={floorPlanToolbarActionButtonVariants({ 
            disabled: !hasSelection, 
            inverted 
          })}
          onClick={onToggleLock}
          title={isLocked ? "Unlock selection" : "Lock selection"}
          disabled={!hasSelection}
          aria-label={isLocked ? "Unlock selection" : "Lock selection"}
        >
          {isLocked ? (
            <Unlock className="w-4 h-4" />
          ) : (
            <Lock className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Separator */}
      <div className={floorPlanToolbarSeparatorVariants({})} />

      {/* Global Actions */}
      <div className={floorPlanToolbarToolGroupVariants({})}>
        <button
          className={floorPlanToolbarActionButtonVariants({ 
            disabled: !canUndo, 
            inverted 
          })}
          onClick={onUndo}
          title="Undo"
          disabled={!canUndo}
          aria-label="Undo"
        >
          <Undo className="w-4 h-4" />
        </button>

        <button
          className={floorPlanToolbarActionButtonVariants({ 
            disabled: !canRedo, 
            inverted 
          })}
          onClick={onRedo}
          title="Redo"
          disabled={!canRedo}
          aria-label="Redo"
        >
          <Redo className="w-4 h-4" />
        </button>

        <button
          className={floorPlanToolbarActionButtonVariants({ 
            disabled: false, 
            inverted 
          })}
          onClick={onSave}
          title="Save floor plan"
          aria-label="Save floor plan"
        >
          <Save className="w-4 h-4" />
        </button>

        <button
          className={floorPlanToolbarActionButtonVariants({ 
            disabled: false, 
            inverted 
          })}
          onClick={onExport}
          title="Export floor plan"
          aria-label="Export floor plan"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
