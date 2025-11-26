"use client";

import { forwardRef, HTMLAttributes } from "react";
import clsx from "clsx";
import { colors } from "../tokens.js";

export interface GeometricShapeProps extends HTMLAttributes<HTMLDivElement> {
  /** Shape type */
  shape?: "square" | "circle" | "triangle" | "diamond" | "hexagon" | "cross" | "arrow";
  /** Size in pixels or Tailwind size class */
  size?: number | "sm" | "md" | "lg" | "xl";
  /** Fill color */
  fill?: "black" | "white" | "transparent" | "grey";
  /** Border/stroke */
  stroke?: boolean;
  /** Stroke width */
  strokeWidth?: number;
  /** Rotation in degrees */
  rotate?: number;
  /** Animation */
  animate?: "spin" | "pulse" | "bounce" | "none";
}

const sizeMap = {
  sm: 16,
  md: 32,
  lg: 48,
  xl: 64,
};

const fillClasses = {
  black: "bg-black",
  white: "bg-white",
  transparent: "bg-transparent",
  grey: "bg-grey-500",
};

const strokeClasses = {
  black: "border-black",
  white: "border-white",
  transparent: "border-transparent",
  grey: "border-grey-500",
};

const animationClasses = {
  spin: "animate-spin",
  pulse: "animate-pulse",
  bounce: "animate-bounce",
  none: "",
};

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

    const shapeClasses = clsx(
      stroke ? strokeClasses[fill] : fillClasses[fill],
      animationClasses[animate],
      className
    );

    switch (shape) {
      case "circle":
        return (
          <div
            ref={ref}
            className={clsx("rounded-full", shapeClasses)}
            style={baseStyles}
            {...props}
          />
        );

      case "triangle":
        return (
          <div
            ref={ref}
            className={clsx("relative", animationClasses[animate], className)}
            style={{
              width: 0,
              height: 0,
              borderLeft: `${pixelSize / 2}px solid transparent`,
              borderRight: `${pixelSize / 2}px solid transparent`,
              borderBottom: `${pixelSize}px solid ${fill === "black" ? colors.black : fill === "white" ? colors.white : fill === "grey" ? colors.grey[500] : "transparent"}`,
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
            className={clsx("relative", animationClasses[animate], className)}
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
                fill={stroke ? "none" : fill === "black" ? colors.black : fill === "white" ? colors.white : fill === "grey" ? colors.grey[500] : "transparent"}
                stroke={stroke ? (fill === "black" ? colors.black : fill === "white" ? colors.white : fill === "grey" ? colors.grey[500] : "transparent") : "none"}
                strokeWidth={stroke ? strokeWidth * 2 : 0}
              />
            </svg>
          </div>
        );

      case "cross":
        return (
          <div
            ref={ref}
            className={clsx("relative", animationClasses[animate], className)}
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
                stroke ? strokeClasses[fill] : fillClasses[fill]
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
                stroke ? strokeClasses[fill] : fillClasses[fill]
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
            className={clsx("relative", animationClasses[animate], className)}
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
                stroke={fill === "black" ? colors.black : fill === "white" ? colors.white : fill === "grey" ? colors.grey[500] : "transparent"}
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

export interface GeometricPatternProps extends HTMLAttributes<HTMLDivElement> {
  /** Pattern type */
  pattern?: "dots" | "grid" | "diagonal" | "chevron" | "zigzag";
  /** Pattern size */
  size?: "sm" | "md" | "lg";
  /** Pattern color */
  color?: "black" | "white" | "grey";
  /** Pattern opacity */
  opacity?: number;
}

const patternSizes = {
  sm: 8,
  md: 16,
  lg: 24,
};

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
    const colorValue = color === "black" ? colors.black : color === "white" ? colors.white : colors.grey[500];

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
        className={clsx("relative", className)}
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
