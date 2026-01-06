"use client";

import React from "react";
import { Plus, TrendingUp, Settings } from "lucide-react";
import { 
  pipelineStageVariants,
  pipelineStageHeaderVariants,
  pipelineStageTitleAreaVariants,
  pipelineStageTitleVariants,
  pipelineStageActionsVariants,
  pipelineStageActionButtonVariants,
  pipelineStageMetricsVariants,
  pipelineStageMetricVariants,
  pipelineStageMetricLabelVariants,
  pipelineStageMetricValueVariants,
  pipelineStageContentVariants,
  pipelineStageProbabilityVariants 
} from "./PipelineStage.variants.js";
import type { PipelineStageProps } from "./PipelineStage.types.js";

/**
 * PipelineStage component - Bold Contemporary Pop Art Adventure
 * 
 * Features:
 * - Bold borders and shadows
 * - Clear visual hierarchy
 * - Pipeline stage with metrics and actions
 * - CVA-based variants for consistent theming
 * 
 * @example
 * ```tsx
 * <PipelineStage
 *   id="stage-1"
 *   name="Lead"
 *   color="#3b82f6"
 *   probability={25}
 *   dealCount={5}
 *   totalValue={50000}
 *   weightedValue={12500}
 *   inverted={false}
 * />
 * ```
 */
export function PipelineStage({
  id,
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
  inverted = false,
  className,
}: PipelineStageProps) {
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div 
      className={pipelineStageVariants({ isDropTarget, className })}
      data-stage-id={id}
    >
      {/* Header */}
      <div className={pipelineStageHeaderVariants({})}>
        <div className={pipelineStageTitleAreaVariants({})}>
          {/* Stage Name */}
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: color }}
            />
            <h3 className={pipelineStageTitleVariants({})}>
              {name}
            </h3>
          </div>

          {/* Actions */}
          <div className={pipelineStageActionsVariants({})}>
            {onAddDeal && (
              <button
                className={pipelineStageActionButtonVariants({})}
                onClick={onAddDeal}
                title={`Add deal to ${name}`}
                aria-label={`Add deal to ${name}`}
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
            
            {onSettings && (
              <button
                className={pipelineStageActionButtonVariants({})}
                onClick={onSettings}
                title={`Configure ${name} stage`}
                aria-label={`Configure ${name} stage`}
              >
                <Settings className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Probability Badge */}
        <div className={`inline-flex items-center gap-1 ${pipelineStageProbabilityVariants({})}`}
             style={{ backgroundColor: color, color: 'white' }}>
          <TrendingUp className="w-3 h-3" />
          {probability}%
        </div>
      </div>

      {/* Metrics */}
      <div className={pipelineStageMetricsVariants({})}>
        <div className={pipelineStageMetricVariants({})}>
          <span className={pipelineStageMetricLabelVariants({})}>
            DEALS
          </span>
          <span className={pipelineStageMetricValueVariants({})}>
            {dealCount}
          </span>
        </div>

        <div className={pipelineStageMetricVariants({})}>
          <span className={pipelineStageMetricLabelVariants({})}>
            TOTAL
          </span>
          <span className={pipelineStageMetricValueVariants({})}>
            {formatCurrency(totalValue)}
          </span>
        </div>

        <div className={pipelineStageMetricVariants({})}>
          <span className={pipelineStageMetricLabelVariants({})}>
            WEIGHTED
          </span>
          <span className={pipelineStageMetricValueVariants({})}>
            {formatCurrency(weightedValue)}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className={pipelineStageContentVariants({})}>
        {children}
      </div>
    </div>
  );
}
