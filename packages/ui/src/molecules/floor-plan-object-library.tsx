"use client";

import React from "react";
import {
  Square,
  Circle,
  RectangleHorizontal,
  Sofa,
  Armchair,
  DoorOpen,
  Music,
  Mic2,
  Projector,
  Monitor,
  Lamp,
  TreeDeciduous,
  Flower2,
} from "lucide-react";
import clsx from "clsx";

export interface FloorPlanObjectTemplate {
  id: string;
  name: string;
  category: string;
  icon: React.ElementType;
  width: number;
  height: number;
  color: string;
}

export interface FloorPlanObjectLibraryProps {
  onAddObject: (template: FloorPlanObjectTemplate) => void;
  className?: string;
}

const objectTemplates: FloorPlanObjectTemplate[] = [
  // Tables
  { id: "round-table-8", name: "Round Table (8)", category: "Tables", icon: Circle, width: 60, height: 60, color: "#8b5cf6" },
  { id: "round-table-10", name: "Round Table (10)", category: "Tables", icon: Circle, width: 72, height: 72, color: "#8b5cf6" },
  { id: "rect-table-6", name: "Rectangular (6)", category: "Tables", icon: RectangleHorizontal, width: 72, height: 36, color: "#8b5cf6" },
  { id: "rect-table-8", name: "Rectangular (8)", category: "Tables", icon: RectangleHorizontal, width: 96, height: 36, color: "#8b5cf6" },
  { id: "cocktail-table", name: "Cocktail Table", category: "Tables", icon: Circle, width: 30, height: 30, color: "#8b5cf6" },
  { id: "sweetheart-table", name: "Sweetheart Table", category: "Tables", icon: RectangleHorizontal, width: 60, height: 30, color: "#ec4899" },
  
  // Seating
  { id: "chair", name: "Chair", category: "Seating", icon: Square, width: 18, height: 18, color: "#6366f1" },
  { id: "lounge-sofa", name: "Lounge Sofa", category: "Seating", icon: Sofa, width: 72, height: 30, color: "#6366f1" },
  { id: "armchair", name: "Armchair", category: "Seating", icon: Armchair, width: 30, height: 30, color: "#6366f1" },
  { id: "bench", name: "Bench", category: "Seating", icon: RectangleHorizontal, width: 48, height: 18, color: "#6366f1" },
  
  // Equipment
  { id: "stage", name: "Stage", category: "Equipment", icon: Square, width: 120, height: 48, color: "#f59e0b" },
  { id: "dance-floor", name: "Dance Floor", category: "Equipment", icon: Square, width: 144, height: 144, color: "#10b981" },
  { id: "dj-booth", name: "DJ Booth", category: "Equipment", icon: Music, width: 48, height: 24, color: "#f59e0b" },
  { id: "podium", name: "Podium", category: "Equipment", icon: Mic2, width: 24, height: 18, color: "#f59e0b" },
  { id: "projector-screen", name: "Projector Screen", category: "Equipment", icon: Projector, width: 96, height: 6, color: "#374151" },
  { id: "tv-monitor", name: "TV/Monitor", category: "Equipment", icon: Monitor, width: 48, height: 6, color: "#374151" },
  
  // Decor
  { id: "bar", name: "Bar", category: "Decor", icon: RectangleHorizontal, width: 96, height: 36, color: "#78350f" },
  { id: "buffet-table", name: "Buffet Table", category: "Decor", icon: RectangleHorizontal, width: 96, height: 30, color: "#78350f" },
  { id: "gift-table", name: "Gift Table", category: "Decor", icon: Square, width: 60, height: 30, color: "#ec4899" },
  { id: "photo-booth", name: "Photo Booth", category: "Decor", icon: Square, width: 72, height: 72, color: "#0ea5e9" },
  { id: "lighting", name: "Lighting", category: "Decor", icon: Lamp, width: 12, height: 12, color: "#fbbf24" },
  
  // Structural
  { id: "door", name: "Door", category: "Structural", icon: DoorOpen, width: 36, height: 6, color: "#737373" },
  { id: "column", name: "Column", category: "Structural", icon: Circle, width: 24, height: 24, color: "#737373" },
  { id: "wall", name: "Wall Section", category: "Structural", icon: RectangleHorizontal, width: 120, height: 6, color: "#737373" },
  { id: "planter", name: "Planter", category: "Structural", icon: TreeDeciduous, width: 30, height: 30, color: "#22c55e" },
  { id: "centerpiece", name: "Centerpiece", category: "Structural", icon: Flower2, width: 12, height: 12, color: "#f472b6" },
];

const categories = Array.from(new Set(objectTemplates.map((t) => t.category)));

export function FloorPlanObjectLibrary({
  onAddObject,
  className,
}: FloorPlanObjectLibraryProps) {
  return (
    <div
      className={clsx(
        "bg-background border-2 border-border rounded-card overflow-hidden",
        className
      )}
    >
      <div className="p-3 border-b border-border">
        <h3 className="text-body-sm font-weight-semibold">Object Library</h3>
        <p className="text-body-xs text-muted-foreground mt-0.5">
          Click to add to canvas
        </p>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {categories.map((category) => (
          <div key={category} className="border-b border-border last:border-0">
            <div className="px-3 py-2 bg-muted/30">
              <span className="text-body-xs font-weight-medium text-muted-foreground">
                {category}
              </span>
            </div>
            <div className="p-2 grid grid-cols-2 gap-1">
              {objectTemplates
                .filter((t) => t.category === category)
                .map((template) => (
                  <button
                    key={template.id}
                    onClick={() => onAddObject(template)}
                    className="flex items-center gap-2 p-2 rounded-button hover:bg-muted transition-colors text-left"
                  >
                    <div
                      className="w-6 h-6 rounded flex items-center justify-center"
                      style={{ backgroundColor: template.color }}
                    >
                      <template.icon className="h-3.5 w-3.5 text-text-primary" />
                    </div>
                    <span className="text-body-xs truncate flex-1">
                      {template.name}
                    </span>
                  </button>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FloorPlanObjectLibrary;
