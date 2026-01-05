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
import { 
  floorPlanObjectLibraryVariants,
  floorPlanObjectLibraryHeaderVariants,
  floorPlanObjectLibraryTitleVariants,
  floorPlanObjectLibraryContentVariants,
  floorPlanObjectLibraryCategoryVariants,
  floorPlanObjectLibraryCategoryTitleVariants,
  floorPlanObjectLibraryGridVariants,
  floorPlanObjectLibraryItemVariants,
  floorPlanObjectLibraryIconVariants,
  floorPlanObjectLibraryNameVariants 
} from "./FloorPlanObjectLibrary.variants.js";
import type { 
  FloorPlanObjectLibraryProps, 
  FloorPlanObjectTemplate 
} from "./FloorPlanObjectLibrary.types.js";

/**
 * FloorPlanObjectLibrary component - Bold Contemporary Pop Art Adventure
 * 
 * Features:
 * - Bold borders and shadows
 * - Clear visual hierarchy
 * - Object library with categories
 * - Drag and drop functionality
 * - CVA-based variants for consistent theming
 * 
 * @example
 * ```tsx
 * <FloorPlanObjectLibrary
 *   onAddObject={(template) => console.log('Add:', template)}
 *   inverted={false}
 * />
 * ```
 */
export function FloorPlanObjectLibrary({
  onAddObject,
  inverted = false,
  className,
}: FloorPlanObjectLibraryProps) {
  // Object templates
  const objectTemplates: FloorPlanObjectTemplate[] = [
    // Tables
    { id: "round-table-8", name: "Round Table (8)", category: "Tables", icon: <Circle className="w-4 h-4" />, width: 60, height: 60, color: "#8b5cf6" },
    { id: "round-table-10", name: "Round Table (10)", category: "Tables", icon: <Circle className="w-4 h-4" />, width: 72, height: 72, color: "#8b5cf6" },
    { id: "rect-table-6", name: "Rectangular (6)", category: "Tables", icon: <RectangleHorizontal className="w-4 h-4" />, width: 72, height: 36, color: "#8b5cf6" },
    { id: "rect-table-8", name: "Rectangular (8)", category: "Tables", icon: <RectangleHorizontal className="w-4 h-4" />, width: 96, height: 36, color: "#8b5cf6" },
    { id: "cocktail-table", name: "Cocktail Table", category: "Tables", icon: <Circle className="w-4 h-4" />, width: 30, height: 30, color: "#8b5cf6" },
    { id: "sweetheart-table", name: "Sweetheart Table", category: "Tables", icon: <RectangleHorizontal className="w-4 h-4" />, width: 60, height: 30, color: "#ec4899" },
    
    // Seating
    { id: "chair", name: "Chair", category: "Seating", icon: <Square className="w-4 h-4" />, width: 18, height: 18, color: "#6366f1" },
    { id: "lounge-sofa", name: "Lounge Sofa", category: "Seating", icon: <Sofa className="w-4 h-4" />, width: 72, height: 30, color: "#6366f1" },
    { id: "armchair", name: "Armchair", category: "Seating", icon: <Armchair className="w-4 h-4" />, width: 30, height: 30, color: "#6366f1" },
    { id: "bench", name: "Bench", category: "Seating", icon: <RectangleHorizontal className="w-4 h-4" />, width: 48, height: 18, color: "#6366f1" },
    
    // AV Equipment
    { id: "projector", name: "Projector", category: "AV Equipment", icon: <Projector className="w-4 h-4" />, width: 24, height: 12, color: "#10b981" },
    { id: "monitor", name: "Monitor", category: "AV Equipment", icon: <Monitor className="w-4 h-4" />, width: 36, height: 24, color: "#10b981" },
    { id: "speaker", name: "Speaker", category: "AV Equipment", icon: <Music className="w-4 h-4" />, width: 12, height: 12, color: "#10b981" },
    { id: "microphone", name: "Microphone", category: "AV Equipment", icon: <Mic2 className="w-4 h-4" />, width: 8, height: 8, color: "#10b981" },
    
    // Decorative
    { id: "floor-lamp", name: "Floor Lamp", category: "Decorative", icon: <Lamp className="w-4 h-4" />, width: 12, height: 12, color: "#f59e0b" },
    { id: "plant", name: "Plant", category: "Decorative", icon: <TreeDeciduous className="w-4 h-4" />, width: 18, height: 18, color: "#10b981" },
    { id: "flower", name: "Flower", category: "Decorative", icon: <Flower2 className="w-4 h-4" />, width: 12, height: 12, color: "#ec4899" },
    
    // Doors & Entrances
    { id: "door", name: "Door", category: "Doors & Entrances", icon: <DoorOpen className="w-4 h-4" />, width: 36, height: 6, color: "#6b7280" },
  ];

  // Group objects by category
  const groupedObjects = objectTemplates.reduce((acc, obj) => {
    if (!acc[obj.category]) {
      acc[obj.category] = [];
    }
    acc[obj.category].push(obj);
    return acc;
  }, {} as Record<string, FloorPlanObjectTemplate[]>);

  // Handle object click
  const handleObjectClick = (template: FloorPlanObjectTemplate) => {
    onAddObject(template);
  };

  return (
    <div className={floorPlanObjectLibraryVariants({ inverted, className })}>
      {/* Header */}
      <div className={floorPlanObjectLibraryHeaderVariants({ inverted })}>
        <h3 className={floorPlanObjectLibraryTitleVariants({ inverted })}>
          OBJECT LIBRARY
        </h3>
      </div>

      {/* Content */}
      <div className={floorPlanObjectLibraryContentVariants({ inverted })}>
        {Object.entries(groupedObjects).map(([category, objects]) => (
          <div key={category} className={floorPlanObjectLibraryCategoryVariants({ inverted })}>
            <h4 className={floorPlanObjectLibraryCategoryTitleVariants({ inverted })}>
              {category}
            </h4>
            
            <div className={floorPlanObjectLibraryGridVariants({ inverted })}>
              {objects.map((template) => (
                <div
                  key={template.id}
                  className={floorPlanObjectLibraryItemVariants({ inverted })}
                  onClick={() => handleObjectClick(template)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleObjectClick(template);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`Add ${template.name} to floor plan`}
                >
                  {/* Icon */}
                  <div 
                    className={floorPlanObjectLibraryIconVariants({ inverted })}
                    style={{ backgroundColor: template.color }}
                  >
                    <div className="text-white">
                      {template.icon}
                    </div>
                  </div>
                  
                  {/* Name */}
                  <div className={floorPlanObjectLibraryNameVariants({ inverted })}>
                    {template.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
