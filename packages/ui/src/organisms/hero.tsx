import { forwardRef } from "react";
import clsx from "clsx";
import type { HTMLAttributes, ReactNode } from "react";

export type HeroProps = HTMLAttributes<HTMLElement> & {
  title: string | ReactNode;
  subtitle?: string | ReactNode;
  cta?: ReactNode;
  background?: "white" | "black";
  pattern?: "halftone" | "grid" | "none";
  fullHeight?: boolean;
};

export const Hero = forwardRef<HTMLElement, HeroProps>(
  function Hero({ title, subtitle, cta, background = "black", pattern = "none", fullHeight = true, className, ...props }, ref) {
    const patternColor = background === "black" ? "#FFFFFF" : "#000000";
    
    return (
      <section
        ref={ref}
        className={clsx(
          "relative overflow-hidden",
          fullHeight ? "min-h-screen" : "min-h-[60vh]",
          background === "black" ? "bg-black text-white" : "bg-white text-black",
          className
        )}
        {...props}
      >
        {/* Pattern overlay */}
        {pattern === "halftone" && (
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `radial-gradient(circle, ${patternColor} 1px, transparent 1px)`,
              backgroundSize: "20px 20px",
            }}
          />
        )}
        {pattern === "grid" && (
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `
                linear-gradient(${patternColor} 1px, transparent 1px),
                linear-gradient(90deg, ${patternColor} 1px, transparent 1px)
              `,
              backgroundSize: "40px 40px",
            }}
          />
        )}

        <div className="container mx-auto px-4 h-full flex items-center justify-center relative z-10">
          <div className="text-center max-w-5xl">
            {typeof title === "string" ? (
              <h1 className="font-display text-display-md md:text-display-lg lg:text-display-xl uppercase leading-none tracking-tightest mb-6">
                {title}
              </h1>
            ) : (
              title
            )}
            
            {subtitle && (
              <div className="mb-8">
                {typeof subtitle === "string" ? (
                  <p className="font-heading text-h3-sm md:text-h1-md uppercase tracking-wider leading-normal">
                    {subtitle}
                  </p>
                ) : (
                  subtitle
                )}
              </div>
            )}

            {cta && <div className="flex justify-center gap-4">{cta}</div>}
          </div>
        </div>
      </section>
    );
  }
);
