import { forwardRef } from "react";
import clsx from "clsx";
import type { HTMLAttributes } from "react";

// Display - ANTON (for hero headlines, major impact)
export const Display = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement> & { size?: "xl" | "lg" | "md" }>(
  function Display({ size = "lg", className, children, ...props }, ref) {
    const sizeClasses = {
      xl: "text-display-xl",
      lg: "text-display-lg",
      md: "text-display-md",
    };
    
    return (
      <h1
        ref={ref}
        className={clsx(
          "font-display uppercase tracking-tightest text-black",
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {children}
      </h1>
    );
  }
);

// H1 - ANTON (page titles, primary headlines)
export const H1 = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement> & { size?: "lg" | "md" | "sm" }>(
  function H1({ size = "md", className, children, ...props }, ref) {
    const sizeClasses = {
      lg: "text-h1-lg",
      md: "text-h1-sm md:text-h1-md",
      sm: "text-h1-sm",
    };
    
    return (
      <h1
        ref={ref}
        className={clsx(
          "font-display uppercase tracking-tight leading-snug",
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {children}
      </h1>
    );
  }
);

// H2 - BEBAS NEUE (section headers)
export const H2 = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement> & { size?: "lg" | "md" | "sm" }>(
  function H2({ size = "md", className, children, ...props }, ref) {
    const sizeClasses = {
      lg: "text-h2-lg",
      md: "text-h2-sm md:text-h2-md",
      sm: "text-h2-sm",
    };
    
    return (
      <h2
        ref={ref}
        className={clsx(
          "font-heading uppercase tracking-wider leading-normal",
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {children}
      </h2>
    );
  }
);

// H3 - BEBAS NEUE
export const H3 = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement> & { size?: "lg" | "md" | "sm" }>(
  function H3({ size = "md", className, children, ...props }, ref) {
    const sizeClasses = {
      lg: "text-h3-lg",
      md: "text-h3-sm md:text-h3-md",
      sm: "text-h3-sm",
    };
    
    return (
      <h3
        ref={ref}
        className={clsx(
          "font-heading uppercase tracking-wider leading-normal",
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {children}
      </h3>
    );
  }
);

// H4 - BEBAS NEUE
export const H4 = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement> & { size?: "lg" | "md" | "sm" }>(
  function H4({ size = "md", className, children, ...props }, ref) {
    const sizeClasses = {
      lg: "text-h4-lg",
      md: "text-h4-sm md:text-h4-md",
      sm: "text-h4-sm",
    };
    
    return (
      <h4
        ref={ref}
        className={clsx(
          "font-heading uppercase tracking-wider leading-relaxed",
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {children}
      </h4>
    );
  }
);

// H5 - BEBAS NEUE
export const H5 = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement> & { size?: "lg" | "md" | "sm" }>(
  function H5({ size = "md", className, children, ...props }, ref) {
    const sizeClasses = {
      lg: "text-h5-lg",
      md: "text-h5-sm md:text-h5-md",
      sm: "text-h5-sm",
    };
    
    return (
      <h5
        ref={ref}
        className={clsx(
          "font-heading uppercase tracking-wider leading-relaxed",
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {children}
      </h5>
    );
  }
);

// H6 - BEBAS NEUE
export const H6 = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement> & { size?: "lg" | "md" | "sm" }>(
  function H6({ size = "md", className, children, ...props }, ref) {
    const sizeClasses = {
      lg: "text-h6-lg",
      md: "text-h6-sm md:text-h6-md",
      sm: "text-h6-sm",
    };
    
    return (
      <h6
        ref={ref}
        className={clsx(
          "font-heading uppercase tracking-wider leading-relaxed",
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {children}
      </h6>
    );
  }
);

// Body - SHARE TECH (paragraphs, descriptions)
export const Body = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement> & { 
  size?: "lg" | "md" | "sm" | "xs";
  variant?: "default" | "muted" | "subtle" | "inverted";
}>(
  function Body({ size = "md", variant = "default", className, children, ...props }, ref) {
    const sizeClasses = {
      lg: "text-body-lg",
      md: "text-body-sm md:text-body-md",
      sm: "text-body-sm",
      xs: "text-body-xs",
    };

    const variantClasses = {
      default: "text-grey-800",
      muted: "text-grey-600",
      subtle: "text-grey-500",
      inverted: "text-white",
    };
    
    return (
      <p
        ref={ref}
        className={clsx(
          "font-body leading-body max-w-[65ch]",
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        {...props}
      >
        {children}
      </p>
    );
  }
);

// Label/Mono - SHARE TECH MONO (metadata, tags, labels)
export const Label = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement> & { size?: "lg" | "md" | "sm" | "xs" | "xxs"; uppercase?: boolean }>(
  function Label({ size = "md", uppercase = true, className, children, ...props }, ref) {
    const sizeClasses = {
      lg: "text-mono-lg",
      md: "text-mono-md",
      sm: "text-mono-sm",
      xs: "text-mono-xs",
      xxs: "text-mono-xxs",
    };
    
    return (
      <span
        ref={ref}
        className={clsx(
          "font-code tracking-widest leading-loose",
          uppercase && "uppercase",
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);
