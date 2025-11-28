import { forwardRef } from "react";
import clsx from "clsx";
import type { HTMLAttributes, ReactNode } from "react";
import { colors } from "../tokens.js";

export type HeroProps = HTMLAttributes<HTMLElement> & {
  title: string | ReactNode;
  subtitle?: string | ReactNode;
  cta?: ReactNode;
  background?: "white" | "black";
  pattern?: "halftone" | "grid" | "stripes" | "benday" | "none";
  fullHeight?: boolean;
};

/**
 * Hero component - Bold Contemporary Pop Art Adventure
 * 
 * Features:
 * - Full-height impact sections
 * - Pop art background patterns
 * - Bold typography hierarchy
 * - Staggered animations
 */
export const Hero = forwardRef<HTMLElement, HeroProps>(
  function Hero({ title, subtitle, cta, background = "black", pattern = "none", fullHeight = true, className, ...props }, ref) {
    const patternColor = background === "black" ? colors.white : colors.black;
    
    return (
      <section
        ref={ref}
        className={clsx(
          "relative overflow-hidden",
          fullHeight ? "min-h-screen" : "min-h-[600px]",
          background === "black" ? "bg-black text-white" : "bg-white text-black",
          className
        )}
        {...props}
      >
        {/* Pattern overlay - Pop Art Style */}
        {pattern === "halftone" && (
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(circle, ${patternColor} 1px, transparent 1px)`,
              backgroundSize: "12px 12px",
            }}
          />
        )}
        {pattern === "grid" && (
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: `
                linear-gradient(${patternColor} 1px, transparent 1px),
                linear-gradient(90deg, ${patternColor} 1px, transparent 1px)
              `,
              backgroundSize: "48px 48px",
            }}
          />
        )}
        {pattern === "stripes" && (
          <div
            className="absolute inset-0 opacity-5 pointer-events-none"
            style={{
              backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, ${patternColor} 10px, ${patternColor} 20px)`,
            }}
          />
        )}
        {pattern === "benday" && (
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(${patternColor} 20%, transparent 20%)`,
              backgroundSize: "16px 16px",
            }}
          />
        )}

        <div className="container mx-auto px-4 md:px-8 h-full flex items-center justify-center relative z-10">
          <div className="text-center max-w-5xl animate-fade-in">
            {typeof title === "string" ? (
              <h1 className="font-display text-5xl md:text-7xl lg:text-8xl uppercase leading-none tracking-tight mb-6 animate-slide-up-bounce">
                {title}
              </h1>
            ) : (
              title
            )}
            
            {subtitle && (
              <div className="mb-8 stagger-1">
                {typeof subtitle === "string" ? (
                  <p className="font-heading text-xl md:text-2xl lg:text-3xl uppercase tracking-wider leading-normal">
                    {subtitle}
                  </p>
                ) : (
                  subtitle
                )}
              </div>
            )}

            {cta && <div className="flex justify-center gap-4 stagger-2">{cta}</div>}
          </div>
        </div>
      </section>
    );
  }
);
