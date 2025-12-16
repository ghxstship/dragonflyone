"use client";

import { forwardRef, useMemo } from "react";
import clsx from "clsx";
import type { HTMLAttributes } from "react";

export interface SparklineProps extends HTMLAttributes<SVGSVGElement> {
  /** Array of numeric data points */
  data: number[];
  /** Width of the sparkline */
  width?: number;
  /** Height of the sparkline */
  height?: number;
  /** Stroke width of the line */
  strokeWidth?: number;
  /** Color variant */
  variant?: "default" | "success" | "error" | "warning" | "info";
  /** Show area fill under the line */
  showArea?: boolean;
  /** Show dots at data points */
  showDots?: boolean;
  /** Animate on mount */
  animate?: boolean;
  /** Inverted colors for dark backgrounds */
  inverted?: boolean;
}

const variantColors = {
  default: { stroke: "currentColor", fill: "currentColor" },
  success: { stroke: "#22c55e", fill: "#22c55e" },
  error: { stroke: "#ef4444", fill: "#ef4444" },
  warning: { stroke: "#f59e0b", fill: "#f59e0b" },
  info: { stroke: "#3b82f6", fill: "#3b82f6" },
};

/**
 * Sparkline - Mini inline chart for trends
 * 
 * Features:
 * - SVG-based for crisp rendering
 * - Automatic scaling to data range
 * - Optional area fill and dots
 * - Animation support
 * - Multiple color variants
 */
export const Sparkline = forwardRef<SVGSVGElement, SparklineProps>(
  function Sparkline(
    {
      data,
      width = 100,
      height = 24,
      strokeWidth = 2,
      variant = "default",
      showArea = false,
      showDots = false,
      animate = true,
      inverted = false,
      className,
      ...props
    },
    ref
  ) {
    // Calculate path from data
    const { path, areaPath, points, min, max } = useMemo(() => {
      if (data.length < 2) {
        return { path: "", areaPath: "", points: [], min: 0, max: 0 };
      }

      const minVal = Math.min(...data);
      const maxVal = Math.max(...data);
      const range = maxVal - minVal || 1;

      // Padding to prevent line from being cut off
      const padding = strokeWidth;
      const effectiveHeight = height - padding * 2;
      const effectiveWidth = width - padding * 2;

      // Calculate points
      const pts = data.map((value, index) => {
        const x = padding + (index / (data.length - 1)) * effectiveWidth;
        const y = padding + effectiveHeight - ((value - minVal) / range) * effectiveHeight;
        return { x, y };
      });

      // Create SVG path
      const pathD = pts.reduce((acc, point, index) => {
        if (index === 0) return `M ${point.x} ${point.y}`;
        return `${acc} L ${point.x} ${point.y}`;
      }, "");

      // Create area path (closed shape for fill)
      const areaPathD = `M ${pts[0].x} ${pts[0].y} ` + 
        pts.slice(1).map(p => `L ${p.x} ${p.y}`).join(" ") +
        ` L ${pts[pts.length - 1].x} ${height - padding}` +
        ` L ${pts[0].x} ${height - padding} Z`;

      return { path: pathD, areaPath: areaPathD, points: pts, min: minVal, max: maxVal };
    }, [data, width, height, strokeWidth]);

    const colors = variantColors[variant];
    const strokeColor = variant === "default" 
      ? (inverted ? "#a3a3a3" : "#525252") 
      : colors.stroke;
    const fillColor = variant === "default"
      ? (inverted ? "rgba(163,163,163,0.2)" : "rgba(82,82,82,0.2)")
      : `${colors.fill}33`; // 20% opacity

    if (data.length < 2) {
      return (
        <svg
          ref={ref}
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className={clsx("inline-block", className)}
          aria-label="Sparkline chart (insufficient data)"
          role="img"
          {...props}
        >
          <line
            x1={strokeWidth}
            y1={height / 2}
            x2={width - strokeWidth}
            y2={height / 2}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray="4 2"
            opacity={0.5}
          />
        </svg>
      );
    }

    // Calculate trend for accessibility
    const trend = data[data.length - 1] > data[0] ? "increasing" : 
                  data[data.length - 1] < data[0] ? "decreasing" : "stable";

    return (
      <svg
        ref={ref}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className={clsx("inline-block", className)}
        aria-label={`Sparkline chart showing ${trend} trend from ${min} to ${max}`}
        role="img"
        {...props}
      >
        {/* Area fill */}
        {showArea && (
          <path
            d={areaPath}
            fill={fillColor}
            className={animate ? "animate-[fade-in_0.5s_ease-out]" : ""}
          />
        )}

        {/* Line */}
        <path
          d={path}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={animate ? "animate-[draw-line_0.8s_ease-out]" : ""}
          style={animate ? {
            strokeDasharray: width * 2,
            strokeDashoffset: 0,
            animation: "draw-line 0.8s ease-out forwards",
          } : undefined}
        />

        {/* Dots */}
        {showDots && points.map((point, index) => (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r={strokeWidth}
            fill={strokeColor}
            className={animate ? "animate-[scale-in_0.3s_ease-out]" : ""}
            style={animate ? { animationDelay: `${index * 50}ms` } : undefined}
          />
        ))}
      </svg>
    );
  }
);

export default Sparkline;
