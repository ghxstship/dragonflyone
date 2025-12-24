"use client";

import React from "react";
import { Plus, TrendingUp, Settings } from "lucide-react";
import clsx from "clsx";

export interface PipelineStageProps {
  id: string;
  name: string;
  color: string;
  probability: number;
  dealCount: number;
  totalValue: number;
  weightedValue: number;
  children?: React.ReactNode;
  onAddDeal?: () => void;
  onSettings?: () => void;
  isDropTarget?: boolean;
  className?: string;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export function PipelineStage({
  name,
  color,
  probability,
  dealCount,
  totalValue,
  weightedValue,
  children,
  onAddDeal,
  onSettings,
  isDropTarget = false,
  className,
}: PipelineStageProps) {
  return (
    <div
      className={clsx(
        "flex-shrink-0 w-72 bg-muted/30 rounded-card border-2 h-full flex flex-col transition-colors",
        isDropTarget ? "border-primary bg-primary/5" : "border-border",
        className
      )}
    >
      {/* Stage Header */}
      <div className="p-3 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: color }}
            />
            <span className="text-body-sm font-weight-semibold truncate">
              {name}
            </span>
            <span className="text-body-xs px-1.5 py-0.5 bg-muted rounded-badge flex-shrink-0">
              {dealCount}
            </span>
          </div>
          {onSettings && (
            <button
              onClick={onSettings}
              className="p-1 hover:bg-muted rounded-button transition-colors"
            >
              <Settings className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Stage Stats */}
        <div className="flex items-center gap-3 mt-2">
          <span className="text-body-xs text-muted-foreground">
            {formatCurrency(totalValue)}
          </span>
          <span className="text-body-xs text-muted-foreground flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            {formatCurrency(weightedValue)}
          </span>
          <span className="text-body-xs text-muted-foreground ml-auto">
            {probability}%
          </span>
        </div>
      </div>

      {/* Deals Container */}
      <div className="p-2 flex-1 overflow-y-auto">
        <div className="space-y-2">{children}</div>

        {/* Add Deal Button */}
        {onAddDeal && (
          <button
            onClick={onAddDeal}
            className="w-full mt-2 p-2 border-2 border-dashed border-border rounded-card text-muted-foreground hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="h-4 w-4" />
            <span className="text-body-xs">Add Deal</span>
          </button>
        )}
      </div>
    </div>
  );
}

export default PipelineStage;
