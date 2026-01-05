"use client";

import { forwardRef } from "react";
import clsx from "clsx";
import { geometricShapeVariants, geometricPatternVariants } from "./GeometricShapes.variants.js";
import type { GeometricShapeProps, GeometricPatternProps } from "./GeometricShapes.types.js";

const sizeMap = {
  sm: 16,
  md: 32,
  lg: 48,
  xl: 64,
};

const patternSizes = {
  sm: 8,
  md: 16,
  lg: 24,
};

/**
 * GeometricShape component - Display various geometric shapes with customizable styling.
 * 
 * @example
 * ```tsx
 * <GeometricShape
 *   shape="circle"
 *   size="lg"
 *   fill="black"
 *   animate="spin"
 * />
 * ```
 */
export const GeometricShape = forwardRef<HTMLDivElement, GeometricShapeProps>(
  function GeometricShape(
    {
      shape = "square",
      size = "md",
      fill = "black",
      stroke = false,
      strokeWidth = 2,
      rotate = 0,
      animate = "none",
      className,
      style,
      ...props
    },
    ref
  ) {
    const pixelSize = typeof size === "number" ? size : sizeMap[size];

    const baseStyles = {
      width: pixelSize,
      height: pixelSize,
      transform: rotate ? `rotate(${rotate}deg)` : undefined,
      borderWidth: stroke ? strokeWidth : undefined,
      ...style,
    };

    const shapeClasses = geometricShapeVariants({
      shape,
      fill,
      stroke,
      animate,
      className,
    });

    switch (shape) {
      case "circle":
        return (
          <div
            ref={ref}
            className={shapeClasses}
            style={baseStyles}
            {...props}
          />
        );

      case "triangle":
        return (
          <div
            ref={ref}
            className={clsx("relative", className)}
            style={{
              width: 0,
              height: 0,
              borderLeft: `${pixelSize / 2}px solid transparent`,
              borderRight: `${pixelSize / 2}px solid transparent`,
              borderBottom: `${pixelSize}px solid ${fill === "black" ? "black" : fill === "white" ? "white" : fill === "grey" ? "rgb(156 163 175)" : "transparent"}`,
              transform: rotate ? `rotate(${rotate}deg)` : undefined,
              ...style,
            }}
            {...props}
          />
        );

      case "diamond":
        return (
          <div
            ref={ref}
            className={shapeClasses}
            style={{
              ...baseStyles,
              transform: `rotate(45deg) ${rotate ? `rotate(${rotate}deg)` : ""}`,
            }}
            {...props}
          />
        );

      case "hexagon":
        return (
          <div
            ref={ref}
            className={clsx("relative", className)}
            style={{
              width: pixelSize,
              height: pixelSize * 0.866,
              ...style,
            }}
            {...props}
          >
            <svg
              viewBox="0 0 100 87"
              className="w-full h-full"
              style={{ transform: rotate ? `rotate(${rotate}deg)` : undefined }}
            >
              <polygon
                points="50,0 100,25 100,75 50,100 0,75 0,25"
                fill={stroke ? "none" : fill === "black" ? "black" : fill === "white" ? "white" : fill === "grey" ? "rgb(156 163 175)" : "transparent"}
                stroke={stroke ? (fill === "black" ? "black" : fill === "white" ? "white" : fill === "grey" ? "rgb(156 163 175)" : "transparent") : "none"}
                strokeWidth={stroke ? strokeWidth * 2 : 0}
              />
            </svg>
          </div>
        );

      case "cross":
        return (
          <div
            ref={ref}
            className={clsx("relative", className)}
            style={{
              width: pixelSize,
              height: pixelSize,
              transform: rotate ? `rotate(${rotate}deg)` : undefined,
              ...style,
            }}
            {...props}
          >
            <div
              className={clsx(
                "absolute top-1/2 left-0 -translate-y-1/2",
                stroke ? (fill === "black" ? "border-black" : fill === "white" ? "border-white" : "border-border") : (fill === "black" ? "bg-black" : fill === "white" ? "bg-white" : "bg-muted")
              )}
              style={{
                width: pixelSize,
                height: pixelSize / 3,
                borderWidth: stroke ? strokeWidth : undefined,
              }}
            />
            <div
              className={clsx(
                "absolute top-0 left-1/2 -translate-x-1/2",
                stroke ? (fill === "black" ? "border-black" : fill === "white" ? "border-white" : "border-border") : (fill === "black" ? "bg-black" : fill === "white" ? "bg-white" : "bg-muted")
              )}
              style={{
                width: pixelSize / 3,
                height: pixelSize,
                borderWidth: stroke ? strokeWidth : undefined,
              }}
            />
          </div>
        );

      case "arrow":
        return (
          <div
            ref={ref}
            className={clsx("relative", className)}
            style={{
              width: pixelSize,
              height: pixelSize,
              transform: rotate ? `rotate(${rotate}deg)` : undefined,
              ...style,
            }}
            {...props}
          >
            <svg viewBox="0 0 24 24" className="w-full h-full">
              <path
                d="M5 12h14M12 5l7 7-7 7"
                fill="none"
                stroke={fill === "black" ? "black" : fill === "white" ? "white" : fill === "grey" ? "rgb(156 163 175)" : "transparent"}
                strokeWidth={strokeWidth}
                strokeLinecap="square"
              />
            </svg>
          </div>
        );

      default: // square
        return (
          <div
            ref={ref}
            className={shapeClasses}
            style={baseStyles}
            {...props}
          />
        );
    }
  }
);

/**
 * GeometricPattern component - Background patterns using geometric shapes.
 * 
 * @example
 * ```tsx
 * <GeometricPattern
 *   pattern="dots"
 *   size="md"
 *   color="black"
 *   opacity={0.1}
 * >
 *   <div>Content with pattern background</div>
 * </GeometricPattern>
 * ```
 */
export const GeometricPattern = forwardRef<HTMLDivElement, GeometricPatternProps>(
  function GeometricPattern(
    {
      pattern = "dots",
      size = "md",
      color = "black",
      opacity = 0.1,
      className,
      style,
      children,
      ...props
    },
    ref
  ) {
    const patternSize = patternSizes[size];
    const colorValue = color === "black" ? "black" : color === "white" ? "white" : "rgb(156 163 175)";

    const getPatternSvg = () => {
      switch (pattern) {
        case "dots":
          return `url("data:image/svg+xml,%3Csvg width='${patternSize}' height='${patternSize}' viewBox='0 0 ${patternSize} ${patternSize}' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='${patternSize / 2}' cy='${patternSize / 2}' r='1.5' fill='${encodeURIComponent(colorValue)}' fill-opacity='${opacity}'/%3E%3C/svg%3E")`;
        
        case "grid":
          return `url("data:image/svg+xml,%3Csvg width='${patternSize}' height='${patternSize}' viewBox='0 0 ${patternSize} ${patternSize}' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M ${patternSize} 0 L 0 0 0 ${patternSize}' fill='none' stroke='${encodeURIComponent(colorValue)}' stroke-width='0.5' stroke-opacity='${opacity}'/%3E%3C/svg%3E")`;
        
        case "diagonal":
          return `url("data:image/svg+xml,%3Csvg width='${patternSize}' height='${patternSize}' viewBox='0 0 ${patternSize} ${patternSize}' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M 0 ${patternSize} L ${patternSize} 0' fill='none' stroke='${encodeURIComponent(colorValue)}' stroke-width='0.5' stroke-opacity='${opacity}'/%3E%3C/svg%3E")`;
        
        case "chevron":
          return `url("data:image/svg+xml,%3Csvg width='${patternSize}' height='${patternSize}' viewBox='0 0 ${patternSize} ${patternSize}' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M 0 ${patternSize / 2} L ${patternSize / 2} 0 L ${patternSize} ${patternSize / 2}' fill='none' stroke='${encodeURIComponent(colorValue)}' stroke-width='0.5' stroke-opacity='${opacity}'/%3E%3C/svg%3E")`;
        
        case "zigzag":
          return `url("data:image/svg+xml,%3Csvg width='${patternSize}' height='${patternSize}' viewBox='0 0 ${patternSize} ${patternSize}' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M 0 ${patternSize} L ${patternSize / 2} 0 L ${patternSize} ${patternSize}' fill='none' stroke='${encodeURIComponent(colorValue)}' stroke-width='0.5' stroke-opacity='${opacity}'/%3E%3C/svg%3E")`;
        
        default:
          return "";
      }
    };

    return (
      <div
        ref={ref}
        className={geometricPatternVariants({
          pattern,
          color,
          size,
          className,
        })}
        style={{
          backgroundImage: getPatternSvg(),
          backgroundRepeat: "repeat",
          ...style,
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

export default GeometricShape;
