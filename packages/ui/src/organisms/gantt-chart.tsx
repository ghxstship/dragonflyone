"use client";

import React, { useMemo, useState, useCallback, ReactNode } from "react";
import clsx from "clsx";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import { Tooltip } from "../atoms/tooltip.js";

// =============================================================================
// TYPES
// =============================================================================

export interface GanttTask<T = unknown> {
  id: string;
  title: string;
  start: Date;
  end: Date;
  progress?: number; // 0-100
  color?: string;
  dependencies?: string[];
  data?: T;
}

export interface GanttMilestone {
  id: string;
  title: string;
  date: Date;
  color?: string;
}

export type GanttViewMode = "day" | "week" | "month" | "quarter";

export interface GanttChartProps<T> {
  /** Tasks to display */
  tasks: GanttTask<T>[];
  /** Milestones to display */
  milestones?: GanttMilestone[];
  /** View mode */
  viewMode?: GanttViewMode;
  /** Start date for the chart */
  startDate?: Date;
  /** End date for the chart */
  endDate?: Date;
  /** Task click handler */
  onTaskClick?: (task: GanttTask<T>) => void;
  /** Task update handler (for drag resize) */
  onTaskUpdate?: (task: GanttTask<T>, newStart: Date, newEnd: Date) => void;
  /** Show today marker */
  showToday?: boolean;
  /** Inverted theme */
  inverted?: boolean;
  /** Row height */
  rowHeight?: number;
  /** Custom task render */
  renderTask?: (task: GanttTask<T>) => ReactNode;
  /** Additional className */
  className?: string;
  /** Loading state */
  loading?: boolean;
  /** Empty message */
  emptyMessage?: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const DEFAULT_COLORS = [
  "#6366f1", // Primary
  "#8b5cf6", // Secondary
  "#f59e0b", // Accent
  "#10b981", // Success
  "#3b82f6", // Blue
  "#ec4899", // Pink
];

const VIEW_MODE_DAYS: Record<GanttViewMode, number> = {
  day: 1,
  week: 7,
  month: 30,
  quarter: 90,
};

const COLUMN_WIDTHS: Record<GanttViewMode, number> = {
  day: 40,
  week: 100,
  month: 120,
  quarter: 150,
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function getDaysBetween(start: Date, end: Date): number {
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function formatDate(date: Date, mode: GanttViewMode): string {
  const options: Intl.DateTimeFormatOptions = {
    day: mode === "day" ? "numeric" : undefined,
    month: mode === "day" ? "short" : "short",
    year: mode === "quarter" ? "numeric" : undefined,
  };
  return date.toLocaleDateString("en-US", options);
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function GanttChart<T>({
  tasks,
  milestones = [],
  viewMode = "week",
  startDate: propStartDate,
  endDate: propEndDate,
  onTaskClick,
  onTaskUpdate: _onTaskUpdate,
  showToday = true,
  inverted = true,
  rowHeight = 40,
  renderTask,
  className,
  loading = false,
  emptyMessage = "No tasks to display",
}: GanttChartProps<T>) {
  // Calculate date range from tasks if not provided
  const { chartStart, chartEnd } = useMemo(() => {
    if (propStartDate && propEndDate) {
      return { chartStart: propStartDate, chartEnd: propEndDate };
    }

    if (tasks.length === 0) {
      const today = new Date();
      return {
        chartStart: addDays(today, -7),
        chartEnd: addDays(today, 30),
      };
    }

    let minDate = tasks[0].start;
    let maxDate = tasks[0].end;

    tasks.forEach((task) => {
      if (task.start < minDate) minDate = task.start;
      if (task.end > maxDate) maxDate = task.end;
    });

    // Add padding
    return {
      chartStart: addDays(minDate, -7),
      chartEnd: addDays(maxDate, 14),
    };
  }, [tasks, propStartDate, propEndDate]);

  // View state
  const [currentViewMode, setCurrentViewMode] = useState<GanttViewMode>(viewMode);
  const [scrollOffset, setScrollOffset] = useState(0);

  // Generate time columns
  const columns = useMemo(() => {
    const cols: Array<{ date: Date; label: string; isToday: boolean; isWeekend: boolean }> = [];
    const totalDays = getDaysBetween(chartStart, chartEnd);
    const step = VIEW_MODE_DAYS[currentViewMode];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < totalDays; i += step) {
      const date = addDays(chartStart, i);
      const isToday = date.toDateString() === today.toDateString();
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;

      let label = formatDate(date, currentViewMode);
      if (currentViewMode === "week") {
        label = `W${getWeekNumber(date)}`;
      }

      cols.push({ date, label, isToday, isWeekend });
    }

    return cols;
  }, [chartStart, chartEnd, currentViewMode]);

  const columnWidth = COLUMN_WIDTHS[currentViewMode];
  const totalWidth = columns.length * columnWidth;

  // Calculate task position
  const getTaskPosition = useCallback(
    (task: GanttTask<T>) => {
      const startOffset = getDaysBetween(chartStart, task.start);
      const duration = getDaysBetween(task.start, task.end);
      const pixelsPerDay = columnWidth / VIEW_MODE_DAYS[currentViewMode];

      return {
        left: startOffset * pixelsPerDay,
        width: Math.max(duration * pixelsPerDay, 20),
      };
    },
    [chartStart, columnWidth, currentViewMode]
  );

  // Get today position
  const todayPosition = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const offset = getDaysBetween(chartStart, today);
    const pixelsPerDay = columnWidth / VIEW_MODE_DAYS[currentViewMode];
    return offset * pixelsPerDay;
  }, [chartStart, columnWidth, currentViewMode]);

  // Navigation handlers
  const handlePrevious = () => {
    setScrollOffset((prev) => Math.max(prev - columnWidth * 4, 0));
  };

  const handleNext = () => {
    setScrollOffset((prev) => Math.min(prev + columnWidth * 4, totalWidth - 800));
  };

  const handleZoomIn = () => {
    const modes: GanttViewMode[] = ["quarter", "month", "week", "day"];
    const currentIndex = modes.indexOf(currentViewMode);
    if (currentIndex < modes.length - 1) {
      setCurrentViewMode(modes[currentIndex + 1]);
    }
  };

  const handleZoomOut = () => {
    const modes: GanttViewMode[] = ["quarter", "month", "week", "day"];
    const currentIndex = modes.indexOf(currentViewMode);
    if (currentIndex > 0) {
      setCurrentViewMode(modes[currentIndex - 1]);
    }
  };

  if (loading) {
    return (
      <div
        className={clsx(
          "flex items-center justify-center h-64 rounded-lg border-2",
          inverted ? "bg-surface-inverse border-border" : "bg-surface-primary border-border",
          className
        )}
      >
        <div
          className={clsx(
            "w-8 h-8 border-3 rounded-full animate-spin",
            inverted ? "border-border border-t-on-dark-primary" : "border-border border-t-on-light-primary"
          )}
        />
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div
        className={clsx(
          "flex items-center justify-center h-64 rounded-lg border-2 border-dashed",
          inverted ? "bg-surface-inverse border-border text-on-dark-disabled" : "bg-surface-primary border-border text-on-light-disabled",
          className
        )}
      >
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={clsx("rounded-lg border-2 overflow-hidden", inverted ? "bg-surface-inverse border-border" : "bg-surface-primary border-border", className)}>
      {/* Toolbar */}
      <div
        className={clsx(
          "flex items-center justify-between px-4 py-2 border-b-2",
          inverted ? "border-border" : "border-border"
        )}
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrevious}
            className={clsx(
              "p-1.5 rounded transition-colors",
              inverted ? "text-on-dark-muted hover:text-on-dark-primary hover:bg-surface-elevated" : "text-on-light-muted hover:text-on-light-primary hover:bg-muted"
            )}
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className={clsx(
              "p-1.5 rounded transition-colors",
              inverted ? "text-on-dark-muted hover:text-on-dark-primary hover:bg-surface-elevated" : "text-on-light-muted hover:text-on-light-primary hover:bg-muted"
            )}
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className={clsx("text-sm font-medium", inverted ? "text-on-dark-muted" : "text-on-light-muted")}>
            {currentViewMode.charAt(0).toUpperCase() + currentViewMode.slice(1)} View
          </span>
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={currentViewMode === "quarter"}
            className={clsx(
              "p-1.5 rounded transition-colors disabled:opacity-50",
              inverted ? "text-on-dark-muted hover:text-on-dark-primary hover:bg-surface-elevated" : "text-on-light-muted hover:text-on-light-primary hover:bg-muted"
            )}
          >
            <ZoomOut size={18} />
          </button>
          <button
            type="button"
            onClick={handleZoomIn}
            disabled={currentViewMode === "day"}
            className={clsx(
              "p-1.5 rounded transition-colors disabled:opacity-50",
              inverted ? "text-on-dark-muted hover:text-on-dark-primary hover:bg-surface-elevated" : "text-on-light-muted hover:text-on-light-primary hover:bg-muted"
            )}
          >
            <ZoomIn size={18} />
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="overflow-x-auto">
        <div style={{ width: totalWidth, minWidth: "100%" }}>
          {/* Header */}
          <div
            className={clsx(
              "flex border-b-2 sticky top-0 z-sticky-row",
              inverted ? "bg-surface-inverse border-border" : "bg-surface-primary border-border"
            )}
            style={{ transform: `translateX(-${scrollOffset}px)` }}
          >
            {/* Task name column */}
            <div
              className={clsx(
                "flex-shrink-0 w-48 px-3 py-2 border-r-2 font-semibold text-sm sticky left-0 z-sticky-header",
                inverted ? "bg-surface-inverse border-border text-on-dark-primary" : "bg-surface-primary border-border text-on-light-primary"
              )}
            >
              Task
            </div>

            {/* Time columns */}
            {columns.map((col, idx) => (
              <div
                key={idx}
                style={{ width: columnWidth }}
                className={clsx(
                  "flex-shrink-0 px-2 py-2 text-center text-xs font-medium border-r",
                  col.isToday && "bg-primary-500/10",
                  col.isWeekend && !col.isToday && (inverted ? "bg-surface-elevated/50" : "bg-muted"),
                  inverted ? "border-border text-on-dark-muted" : "border-border text-on-light-muted"
                )}
              >
                {col.label}
              </div>
            ))}
          </div>

          {/* Tasks */}
          <div style={{ transform: `translateX(-${scrollOffset}px)` }}>
            {tasks.map((task, taskIndex) => {
              const position = getTaskPosition(task);
              const color = task.color || DEFAULT_COLORS[taskIndex % DEFAULT_COLORS.length];

              return (
                <div
                  key={task.id}
                  className={clsx(
                    "flex border-b",
                    inverted ? "border-border" : "border-border"
                  )}
                  style={{ height: rowHeight }}
                >
                  {/* Task name */}
                  <div
                    className={clsx(
                      "flex-shrink-0 w-48 px-3 flex items-center border-r-2 sticky left-0 z-sticky-column",
                      inverted ? "bg-surface-inverse border-border" : "bg-surface-primary border-border"
                    )}
                  >
                    <span
                      className={clsx(
                        "text-sm truncate",
                        inverted ? "text-on-dark-primary" : "text-on-light-primary"
                      )}
                    >
                      {task.title}
                    </span>
                  </div>

                  {/* Task bar area */}
                  <div className="flex-1 relative">
                    {/* Grid lines */}
                    <div className="absolute inset-0 flex">
                      {columns.map((col, idx) => (
                        <div
                          key={idx}
                          style={{ width: columnWidth }}
                          className={clsx(
                            "flex-shrink-0 border-r",
                            col.isToday && "bg-primary-500/10",
                            col.isWeekend && !col.isToday && (inverted ? "bg-surface-elevated/30" : "bg-muted"),
                            inverted ? "border-border" : "border-border"
                          )}
                        />
                      ))}
                    </div>

                    {/* Task bar */}
                    <div
                      className="absolute top-1/2 -translate-y-1/2 h-6 rounded cursor-pointer transition-all hover:scale-y-110"
                      style={{
                        left: position.left,
                        width: position.width,
                        backgroundColor: color,
                      }}
                      onClick={() => onTaskClick?.(task)}
                    >
                      {/* Progress */}
                      {task.progress !== undefined && task.progress > 0 && (
                        <div
                          className="absolute inset-y-0 left-0 rounded-l bg-black/20"
                          style={{ width: `${task.progress}%` }}
                        />
                      )}

                      {/* Custom render or default */}
                      {renderTask ? (
                        renderTask(task)
                      ) : (
                        <div className="px-2 h-full flex items-center">
                          <span className="text-xs text-white font-medium truncate">
                            {task.title}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Today marker */}
          {showToday && todayPosition > 0 && todayPosition < totalWidth && (
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-error-500 z-sticky-header pointer-events-none"
              style={{ left: 192 + todayPosition - scrollOffset }}
            />
          )}

          {/* Milestones */}
          {milestones.map((milestone) => {
            const offset = getDaysBetween(chartStart, milestone.date);
            const pixelsPerDay = columnWidth / VIEW_MODE_DAYS[currentViewMode];
            const left = 192 + offset * pixelsPerDay - scrollOffset;

            return (
              <div
                key={milestone.id}
                className="absolute top-12 z-sticky-row"
                style={{ left }}
              >
                <Tooltip content={milestone.title} inverted={!inverted}>
                  <div
                    className="w-4 h-4 rotate-45 border-2"
                    style={{
                      backgroundColor: milestone.color || "#f59e0b",
                      borderColor: inverted ? "#1f2937" : "#ffffff",
                    }}
                    aria-label={milestone.title}
                  />
                </Tooltip>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default GanttChart;
