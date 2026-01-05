"use client";

import React from "react";
import { staggerChildrenVariants } from "./StaggerChildren.variants.js";
import type { StaggerChildrenProps } from "./StaggerChildren.types.js";

/**
 * StaggerChildren component - Bold Contemporary Pop Art Adventure
 * 
 * A component that staggers the animation of its children
 */
export function StaggerChildren({
  children,
  staggerDelay = 100,
  className,
}: StaggerChildrenProps) {
  return (
    <div 
      className={staggerChildrenVariants({ className })}
      style={
        {
          '--stagger-delay': `${staggerDelay}ms`,
        } as React.CSSProperties
      }
    >
      {React.Children.map(children, (child, index) => (
        <div
          key={React.isValidElement(child) ? child.key : index}
          className="stagger-child"
          style={{
            animationDelay: `${index * staggerDelay}ms`,
          } as React.CSSProperties}
        >
          {child}
        </div>
      ))}
    </div>
  );
}
