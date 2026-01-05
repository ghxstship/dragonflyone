import type { HTMLAttributes } from "react";

// Display component
export interface DisplayProps extends HTMLAttributes<HTMLHeadingElement> {
  size?: "xl" | "lg" | "md" | "sm" | "xs";
}

// Heading components (H1-H6)
export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  size?: "lg" | "md" | "sm";
}

// Body text component
export interface BodyProps extends HTMLAttributes<HTMLParagraphElement> {
  size?: "lg" | "md" | "sm" | "xs";
  variant?: "default" | "muted" | "subtle" | "inverted";
}

// Label/Mono component
export interface LabelProps extends HTMLAttributes<HTMLSpanElement> {
  size?: "lg" | "md" | "sm" | "xs" | "xxs";
  uppercase?: boolean;
}
