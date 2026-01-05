"use client";

import React from "react";
import { Check, Clock, AlertCircle } from "lucide-react";
import { 
  timelineVariants,
  timelineItemContainerVariants,
  timelineIndicatorVariants,
  timelineContentVariants,
  timelineTitleVariants,
  timelineDescriptionVariants,
  timelineTimestampVariants,
  timelineConnectorVariants 
} from "./Timeline.variants.js";
import type { 
  TimelineProps,
  TimelineItemStatus,
  TimelineOrientation 
} from "./Timeline.types.js";

/**
 * Timeline component - Bold Contemporary Pop Art Adventure
 * 
 * Features:
 * - Bold borders and shadows
 * - Clear visual hierarchy
 * - Timeline with items and connectors
 * - CVA-based variants for consistent theming
 * 
 * @example
 * ```tsx
 * <Timeline
 *   items={timelineItems}
 *   orientation="vertical"
 *   showConnectors={true}
 *   inverted={false}
 * />
 * ```
 */
export function Timeline({
  items,
  orientation = "vertical" as TimelineOrientation,
  showConnectors = true,
  compact = false,
  onItemClick,
  inverted = false,
  className,
}: TimelineProps) {
  // Get status icon
  const getStatusIcon = (status?: TimelineItemStatus) => {
    switch (status) {
      case "completed":
        return <Check className="w-4 h-4" />;
      case "current":
        return <Clock className="w-4 h-4" />;
      case "error":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: Date | string): string => {
    const date = typeof timestamp === "string" ? new Date(timestamp) : timestamp;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
    });
  };

  return (
    <div className={timelineVariants({ orientation, inverted, className })}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        
        return (
          <div key={item.id} className={timelineItemContainerVariants({ orientation, compact, inverted })}>
            {/* Indicator */}
            <div className={timelineIndicatorVariants({ status: item.status, inverted })}>
              {item.icon || getStatusIcon(item.status)}
            </div>

            {/* Content */}
            <div className={timelineContentVariants({ inverted })}>
              {/* Title */}
              <div 
                className={timelineTitleVariants({ inverted })}
                onClick={() => onItemClick?.(item)}
                style={{ cursor: onItemClick ? 'pointer' : 'default' }}
              >
                {item.title}
              </div>

              {/* Description */}
              {item.description && (
                <div className={timelineDescriptionVariants({ inverted })}>
                  {item.description}
                </div>
              )}

              {/* Timestamp */}
              <div className={timelineTimestampVariants({ inverted })}>
                {formatTimestamp(item.timestamp)}
              </div>

              {/* User */}
              {item.user && (
                <div className={timelineDescriptionVariants({ inverted })}>
                  by {item.user.name}
                </div>
              )}

              {/* Metadata */}
              {item.metadata && Object.entries(item.metadata).map(([key, value]) => (
                <div key={key} className={timelineDescriptionVariants({ inverted })}>
                  {key}: {value}
                </div>
              ))}
            </div>

            {/* Connector */}
            {showConnectors && !isLast && (
              <div className={timelineConnectorVariants({ 
                orientation, 
                status: item.status, 
                inverted 
              })} />
            )}
          </div>
        );
      })}
    </div>
  );
}
