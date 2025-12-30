import { type ReactNode, type HTMLAttributes } from "react";
import clsx from "clsx";

type TextElement = "span" | "div" | "strong" | "em" | "small";

export interface TextProps extends HTMLAttributes<HTMLElement> {
  as?: TextElement;
  variant?: "default" | "muted" | "mono" | "accent";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  weight?: "normal" | "medium" | "semibold" | "bold";
  inverted?: boolean;
  children?: ReactNode;
}

export function Text({ as: Component = "span", variant = "default", size = "md", weight = "normal", inverted = false, className, children, ...props }: TextProps) {
  const getVariantClasses = () => {
    if (inverted) {
      switch (variant) {
        case "default": return "text-current";
        case "muted": return "text-on-dark-muted";
        case "mono": return "font-code";
        case "accent": return "text-black";
        default: return "";
      }
    } else {
      switch (variant) {
        case "default": return "text-current";
        case "muted": return "text-on-dark-disabled";
        case "mono": return "font-code";
        case "accent": return "text-white";
        default: return "";
      }
    }
  };

  const sizeClasses = {
    xs: "text-mono-xs",
    sm: "text-body-sm",
    md: "text-body-sm",
    lg: "text-body-md",
    xl: "text-body-lg",
  };

  // Note: Font weights have no effect on design system fonts (Anton, Bebas Neue, Share Tech)
  // These are kept for semantic purposes but will not visually change the text
  const weightClasses = {
    normal: "",
    medium: "",
    semibold: "",
    bold: "",
  };

  return (
    <Component
      className={clsx(
        getVariantClasses(),
        sizeClasses[size],
        weightClasses[weight],
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
