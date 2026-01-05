import { forwardRef } from "react";
import {
  displayVariants,
  headingVariants,
  bodyVariants,
  labelVariants,
} from "./Typography.variants.js";
import type {
  DisplayProps,
  HeadingProps,
  BodyProps,
  LabelProps,
} from "./Typography.types.js";

/**
 * Display component - For hero headlines and major impact text
 * 
 * @example
 * ```tsx
 * <Display size="xl">Hero Headline</Display>
 * ```
 */
export const Display = forwardRef<HTMLHeadingElement, DisplayProps>(
  function Display({ size = "lg", className, children, ...props }, ref) {
    return (
      <h1
        ref={ref}
        className={displayVariants({ size, className })}
        {...props}
      >
        {children}
      </h1>
    );
  }
);

/**
 * H1 component - For page titles and primary headlines
 * 
 * @example
 * ```tsx
 * <H1 size="lg">Page Title</H1>
 * ```
 */
export const H1 = forwardRef<HTMLHeadingElement, HeadingProps>(
  function H1({ size = "md", className, children, ...props }, ref) {
    return (
      <h1
        ref={ref}
        className={headingVariants({ level: "h1", size, className })}
        {...props}
      >
        {children}
      </h1>
    );
  }
);

/**
 * H2 component - For section headers
 * 
 * @example
 * ```tsx
 * <H2 size="md">Section Header</H2>
 * ```
 */
export const H2 = forwardRef<HTMLHeadingElement, HeadingProps>(
  function H2({ size = "md", className, children, ...props }, ref) {
    return (
      <h2
        ref={ref}
        className={headingVariants({ level: "h2", size, className })}
        {...props}
      >
        {children}
      </h2>
    );
  }
);

/**
 * H3 component - For subsection headers
 * 
 * @example
 * ```tsx
 * <H3 size="md">Subsection Header</H3>
 * ```
 */
export const H3 = forwardRef<HTMLHeadingElement, HeadingProps>(
  function H3({ size = "md", className, children, ...props }, ref) {
    return (
      <h3
        ref={ref}
        className={headingVariants({ level: "h3", size, className })}
        {...props}
      >
        {children}
      </h3>
    );
  }
);

/**
 * H4 component - For minor section headers
 * 
 * @example
 * ```tsx
 * <H4 size="md">Minor Section Header</H4>
 * ```
 */
export const H4 = forwardRef<HTMLHeadingElement, HeadingProps>(
  function H4({ size = "md", className, children, ...props }, ref) {
    return (
      <h4
        ref={ref}
        className={headingVariants({ level: "h4", size, className })}
        {...props}
      >
        {children}
      </h4>
    );
  }
);

/**
 * H5 component - For small section headers
 * 
 * @example
 * ```tsx
 * <H5 size="md">Small Section Header</H5>
 * ```
 */
export const H5 = forwardRef<HTMLHeadingElement, HeadingProps>(
  function H5({ size = "md", className, children, ...props }, ref) {
    return (
      <h5
        ref={ref}
        className={headingVariants({ level: "h5", size, className })}
        {...props}
      >
        {children}
      </h5>
    );
  }
);

/**
 * H6 component - For the smallest section headers
 * 
 * @example
 * ```tsx
 * <H6 size="md">Smallest Section Header</H6>
 * ```
 */
export const H6 = forwardRef<HTMLHeadingElement, HeadingProps>(
  function H6({ size = "md", className, children, ...props }, ref) {
    return (
      <h6
        ref={ref}
        className={headingVariants({ level: "h6", size, className })}
        {...props}
      >
        {children}
      </h6>
    );
  }
);

/**
 * Body component - For paragraphs and descriptions
 * 
 * @example
 * ```tsx
 * <Body size="md" variant="muted">Description text</Body>
 * ```
 */
export const Body = forwardRef<HTMLParagraphElement, BodyProps>(
  function Body({ size = "md", variant = "default", className, children, ...props }, ref) {
    return (
      <p
        ref={ref}
        className={bodyVariants({ size, variant, className })}
        {...props}
      >
        {children}
      </p>
    );
  }
);

/**
 * Label component - For metadata, tags, and labels
 * 
 * @example
 * ```tsx
 * <Label size="sm" uppercase={true}>Metadata</Label>
 * ```
 */
export const Label = forwardRef<HTMLSpanElement, LabelProps>(
  function Label({ size = "md", uppercase = true, className, children, ...props }, ref) {
    return (
      <span
        ref={ref}
        className={labelVariants({ size, uppercase, className })}
        {...props}
      >
        {children}
      </span>
    );
  }
);
