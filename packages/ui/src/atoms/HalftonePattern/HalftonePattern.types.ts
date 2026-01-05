import type { CSSProperties } from "react";

export interface HalftonePatternProps {
  /** Pattern type */
  pattern?: "dots" | "lines" | "grid" | "diagonal";
  /** Dot/line size in pixels */
  size?: number;
  /** Spacing between elements */
  spacing?: number;
  /** Pattern color - use 'black' or 'white' for token colors */
  color?: "black" | "white" | "grey" | string;
  /** Background color */
  backgroundColor?: string;
  /** Opacity of the pattern (0-1) */
  opacity?: number;
  /** Whether to use as overlay (absolute positioned) */
  overlay?: boolean;
  /** Custom className */
  className?: string;
  /** Children to render on top */
  children?: React.ReactNode;
}

export interface HeroHalftoneProps {
  /** Theme variant */
  variant?: "light" | "dark";
  /** Custom className */
  className?: string;
  /** Children to render on top */
  children?: React.ReactNode;
}

export interface GridPatternProps {
  /** Pattern variant */
  variant?: "subtle" | "bold";
  /** Custom className */
  className?: string;
  /** Children to render on top */
  children?: React.ReactNode;
}

export interface HalftonePatternVariants {
  /** Pattern type */
  pattern?: "dots" | "lines" | "grid" | "diagonal";
  /** Dot/line size */
  size?: number;
  /** Spacing */
  spacing?: number;
  /** Pattern color */
  color?: "black" | "white" | "grey" | string;
  /** Background color */
  backgroundColor?: string;
  /** Opacity */
  opacity?: number;
  /** Overlay mode */
  overlay?: boolean;
  /** Additional CSS classes */
  className?: string;
}
