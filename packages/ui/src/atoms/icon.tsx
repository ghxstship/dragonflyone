import { forwardRef } from "react";
import clsx from "clsx";
import type { SVGAttributes } from "react";

export type IconProps = SVGAttributes<SVGElement> & {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  strokeWidth?: "thin" | "regular" | "bold";
};

export const Icon = forwardRef<SVGSVGElement, IconProps>(
  function Icon({ size = "md", strokeWidth = "regular", className, children, ...props }, ref) {
    const sizeClasses = {
      xs: "w-spacing-3 h-spacing-3",
      sm: "w-spacing-4 h-spacing-4",
      md: "w-spacing-5 h-spacing-5",
      lg: "w-spacing-6 h-spacing-6",
      xl: "w-spacing-8 h-spacing-8",
    };

    const strokeClasses = {
      thin: "stroke-1",
      regular: "stroke-2",
      bold: "stroke-[3px]",
    };

    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeLinecap="square"
        strokeLinejoin="miter"
        className={clsx(
          "inline-block",
          sizeClasses[size],
          strokeClasses[strokeWidth],
          className
        )}
        {...props}
      >
        {children}
      </svg>
    );
  }
);

// Geometric Icon Components
export const ArrowRight = forwardRef<SVGSVGElement, Omit<IconProps, "children">>(
  function ArrowRight(props, ref) {
    return (
      <Icon ref={ref} {...props}>
        <path d="M5 12h14M12 5l7 7-7 7" />
      </Icon>
    );
  }
);

export const ArrowLeft = forwardRef<SVGSVGElement, Omit<IconProps, "children">>(
  function ArrowLeft(props, ref) {
    return (
      <Icon ref={ref} {...props}>
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </Icon>
    );
  }
);

export const ArrowUp = forwardRef<SVGSVGElement, Omit<IconProps, "children">>(
  function ArrowUp(props, ref) {
    return (
      <Icon ref={ref} {...props}>
        <path d="M12 19V5M5 12l7-7 7 7" />
      </Icon>
    );
  }
);

export const ArrowDown = forwardRef<SVGSVGElement, Omit<IconProps, "children">>(
  function ArrowDown(props, ref) {
    return (
      <Icon ref={ref} {...props}>
        <path d="M12 5v14M19 12l-7 7-7-7" />
      </Icon>
    );
  }
);

export const X = forwardRef<SVGSVGElement, Omit<IconProps, "children">>(
  function X(props, ref) {
    return (
      <Icon ref={ref} {...props}>
        <path d="M18 6L6 18M6 6l12 12" />
      </Icon>
    );
  }
);

export const Check = forwardRef<SVGSVGElement, Omit<IconProps, "children">>(
  function Check(props, ref) {
    return (
      <Icon ref={ref} {...props}>
        <path d="M20 6L9 17l-5-5" />
      </Icon>
    );
  }
);

export const Menu = forwardRef<SVGSVGElement, Omit<IconProps, "children">>(
  function Menu(props, ref) {
    return (
      <Icon ref={ref} {...props}>
        <path d="M4 6h16M4 12h16M4 18h16" />
      </Icon>
    );
  }
);

export const Plus = forwardRef<SVGSVGElement, Omit<IconProps, "children">>(
  function Plus(props, ref) {
    return (
      <Icon ref={ref} {...props}>
        <path d="M12 5v14M5 12h14" />
      </Icon>
    );
  }
);

export const Minus = forwardRef<SVGSVGElement, Omit<IconProps, "children">>(
  function Minus(props, ref) {
    return (
      <Icon ref={ref} {...props}>
        <path d="M5 12h14" />
      </Icon>
    );
  }
);

export const Search = forwardRef<SVGSVGElement, Omit<IconProps, "children">>(
  function Search(props, ref) {
    return (
      <Icon ref={ref} {...props}>
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </Icon>
    );
  }
);

export const ChevronRight = forwardRef<SVGSVGElement, Omit<IconProps, "children">>(
  function ChevronRight(props, ref) {
    return (
      <Icon ref={ref} {...props}>
        <path d="m9 18 6-6-6-6" />
      </Icon>
    );
  }
);

export const ChevronLeft = forwardRef<SVGSVGElement, Omit<IconProps, "children">>(
  function ChevronLeft(props, ref) {
    return (
      <Icon ref={ref} {...props}>
        <path d="m15 18-6-6 6-6" />
      </Icon>
    );
  }
);

export const ChevronUp = forwardRef<SVGSVGElement, Omit<IconProps, "children">>(
  function ChevronUp(props, ref) {
    return (
      <Icon ref={ref} {...props}>
        <path d="m18 15-6-6-6 6" />
      </Icon>
    );
  }
);

export const ChevronDown = forwardRef<SVGSVGElement, Omit<IconProps, "children">>(
  function ChevronDown(props, ref) {
    return (
      <Icon ref={ref} {...props}>
        <path d="m6 9 6 6 6-6" />
      </Icon>
    );
  }
);

export const ExternalLink = forwardRef<SVGSVGElement, Omit<IconProps, "children">>(
  function ExternalLink(props, ref) {
    return (
      <Icon ref={ref} {...props}>
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
        <path d="M15 3h6v6M10 14L21 3" />
      </Icon>
    );
  }
);

export const Upload = forwardRef<SVGSVGElement, Omit<IconProps, "children">>(
  function Upload(props, ref) {
    return (
      <Icon ref={ref} {...props}>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <path d="M17 8l-5-5-5 5M12 3v12" />
      </Icon>
    );
  }
);

export const Download = forwardRef<SVGSVGElement, Omit<IconProps, "children">>(
  function Download(props, ref) {
    return (
      <Icon ref={ref} {...props}>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <path d="M7 10l5 5 5-5M12 15V3" />
      </Icon>
    );
  }
);
