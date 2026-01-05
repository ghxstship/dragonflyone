import type { HTMLAttributes } from "react";

export type CardVariant = "default" | "outlined" | "elevated" | "primary" | "accent";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Visual style variant */
  variant?: CardVariant;
  /** Show hover/active states and cursor pointer */
  interactive?: boolean;
  /** When true and onClick is provided, makes the card keyboard accessible */
  asButton?: boolean;
}

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {}

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {}

export interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {}

export interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {}

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {}
