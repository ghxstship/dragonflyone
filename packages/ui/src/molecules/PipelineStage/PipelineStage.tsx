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
      className={pipelineStageVariants({ isDropTarget, inverted, className })}
      data-stage-id={id}
    >
      {/* Header */}
      <div className={pipelineStageHeaderVariants({ inverted })}>
        <div className={pipelineStageTitleAreaVariants({ inverted })}>
          {/* Stage Name */}
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: color }}
            />
            <h3 className={pipelineStageTitleVariants({ inverted })}>
              {name}
            </h3>
          </div>

          {/* Actions */}
          <div className={pipelineStageActionsVariants({ inverted })}>
            {onAddDeal && (
              <button
                className={pipelineStageActionButtonVariants({ inverted })}
                onClick={onAddDeal}
                title={`Add deal to ${name}`}
                aria-label={`Add deal to ${name}`}
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
            
            {onSettings && (
              <button
                className={pipelineStageActionButtonVariants({ inverted })}
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
        <div className={`inline-flex items-center gap-1 ${pipelineStageProbabilityVariants({ inverted })}`}
             style={{ backgroundColor: color, color: 'white' }}>
          <TrendingUp className="w-3 h-3" />
          {probability}%
        </div>
      </div>

      {/* Metrics */}
      <div className={pipelineStageMetricsVariants({ inverted })}>
        <div className={pipelineStageMetricVariants({ inverted })}>
          <span className={pipelineStageMetricLabelVariants({ inverted })}>
            DEALS
          </span>
          <span className={pipelineStageMetricValueVariants({ inverted })}>
            {dealCount}
          </span>
        </div>

        <div className={pipelineStageMetricVariants({ inverted })}>
          <span className={pipelineStageMetricLabelVariants({ inverted })}>
            TOTAL
          </span>
          <span className={pipelineStageMetricValueVariants({ inverted })}>
            {formatCurrency(totalValue)}
          </span>
        </div>

        <div className={pipelineStageMetricVariants({ inverted })}>
          <span className={pipelineStageMetricLabelVariants({ inverted })}>
            WEIGHTED
          </span>
          <span className={pipelineStageMetricValueVariants({ inverted })}>
            {formatCurrency(weightedValue)}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className={pipelineStageContentVariants({ inverted })}>
        {children}
      </div>
    </div>
  );
}
