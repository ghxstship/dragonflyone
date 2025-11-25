import { forwardRef } from "react";
import clsx from "clsx";
import type { HTMLAttributes } from "react";

// Display - ANTON (for hero headlines, major impact)
export const Display = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement> & { size?: "xl" | "lg" | "md" }>(
  function Display({ size = "lg", className, children, ...props }, ref) {
    const sizeClasses = {
      xl: "text-[7.5rem] leading-[0.9]",      // 120px
      lg: "text-[5.625rem] leading-[0.95]",   // 90px
      md: "text-[4.5rem] leading-[1.0]",      // 72px
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
      lg: "text-[5rem] md:text-[5rem]",        // 80px
      md: "text-[2.25rem] md:text-[3.5rem]",   // 36-56px
      sm: "text-[2.25rem]",                    // 36px
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
      lg: "text-[3.5rem]",                     // 56px
      md: "text-[1.75rem] md:text-[2.5rem]",  // 28-40px
      sm: "text-[1.75rem]",                    // 28px
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
      lg: "text-[2.5rem]",                     // 40px
      md: "text-[1.5rem] md:text-[2rem]",     // 24-32px
      sm: "text-[1.5rem]",                     // 24px
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
      lg: "text-[2rem]",                       // 32px
      md: "text-[1.25rem] md:text-[1.5rem]",  // 20-24px
      sm: "text-[1.25rem]",                    // 20px
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
      lg: "text-[1.5rem]",                     // 24px
      md: "text-[1.125rem] md:text-[1.25rem]",// 18-20px
      sm: "text-[1.125rem]",                   // 18px
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
      lg: "text-[1.25rem]",                    // 20px
      md: "text-[1rem] md:text-[1.125rem]",   // 16-18px
      sm: "text-[1rem]",                       // 16px
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
      lg: "text-[1.25rem]",                    // 20px
      md: "text-[1rem] md:text-[1.125rem]",   // 16-18px
      sm: "text-[1rem]",                       // 16px
      xs: "text-[0.9375rem]",                  // 15px
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
      lg: "text-[1rem]",          // 16px
      md: "text-[0.875rem]",      // 14px
      sm: "text-[0.8125rem]",     // 13px
      xs: "text-[0.75rem]",       // 12px
      xxs: "text-[0.6875rem]",    // 11px
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
