import { cva } from "class-variance-authority";

/**
 * PipelineStage variants using CVA (Class Variance Authority)
 * 
 * Uses CSS custom properties from the design token system for consistent
 * styling across themes and whitelabel configurations.
 * 
 * Features:
 * - Bold Contemporary Pop Art Adventure aesthetic
 * - Bold borders and shadows
 * - Clear visual hierarchy
 * - Pipeline stage styling
 */
export const pipelineStageVariants = cva(
  [
    // Base styles
    "flex-shrink-0",
    "w-72",
    "border-2",
    "rounded-[var(--radius-card)]",
    "h-full",
    "flex",
    "flex-col",
    "transition-all",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
  ],
  {
    variants: {
      /**
       * Drop target state
       */
      isDropTarget: {
        true: "",
        false: "",
      },
      
      /**
       * Theme inversion
       */
      inverted: {
        true: "",
        false: "",
      },
    },
    defaultVariants: {
      isDropTarget: false,
      inverted: false,
    },
    
    compoundVariants: [
      // Drop target state combinations
      {
        isDropTarget: true,
        inverted: true,
        class: "bg-surface-primary-inverse border-brand-primary",
      },
      {
        isDropTarget: true,
        inverted: false,
        class: "bg-surface-primary border-brand-primary",
      },
      
      // Normal state combinations
      {
        isDropTarget: false,
        inverted: true,
        class: "bg-surface-elevated-inverse border-border-inverse",
      },
      {
        isDropTarget: false,
        inverted: false,
        class: "bg-surface-elevated border-border",
      },
    ],
  }
);

/**
 * PipelineStage header variants using CVA (Class Variance Authority)
 */
export const pipelineStageHeaderVariants = cva(
  [
    // Base styles
    "p-4",
    "border-b-2",
    "transition-all",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
  ],
  {
    variants: {
      /**
       * Theme inversion
       */
      inverted: {
        true: "border-border-inverse",
        false: "border-border",
      },
    },
    defaultVariants: {
      inverted: false,
    },
  }
);

/**
 * PipelineStage title area variants using CVA (Class Variance Authority)
 */
export const pipelineStageTitleAreaVariants = cva(
  [
    // Base styles
    "flex",
    "items-center",
    "justify-between",
    "gap-2",
    "transition-all",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
  ],
  {
    variants: {
      /**
       * Theme inversion
       */
      inverted: {
        true: "",
        false: "",
      },
    },
    defaultVariants: {
      inverted: false,
    },
  }
);

/**
 * PipelineStage title variants using CVA (Class Variance Authority)
 */
export const pipelineStageTitleVariants = cva(
  [
    // Base styles
    "font-bold",
    "transition-colors",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
  ],
  {
    variants: {
      /**
       * Theme inversion
       */
      inverted: {
        true: "text-text-inverse",
        false: "text-text-primary",
      },
    },
    defaultVariants: {
      inverted: false,
    },
  }
);

/**
 * PipelineStage actions variants using CVA (Class Variance Authority)
 */
export const pipelineStageActionsVariants = cva(
  [
    // Base styles
    "flex",
    "items-center",
    "gap-1",
    "transition-all",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
  ],
  {
    variants: {
      /**
       * Theme inversion
       */
      inverted: {
        true: "",
        false: "",
      },
    },
    defaultVariants: {
      inverted: false,
    },
  }
);

/**
 * PipelineStage action button variants using CVA (Class Variance Authority)
 */
export const pipelineStageActionButtonVariants = cva(
  [
    // Base styles
    "p-1.5",
    "border-2",
    "rounded-button",
    "transition-all",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
    "hover:scale-110",
    "focus:outline-none",
    "focus:ring-2",
    "focus:ring-offset-2",
  ],
  {
    variants: {
      /**
       * Theme inversion
       */
      inverted: {
        true: "bg-surface-elevated-inverse border-border-inverse text-text-secondary-inverse hover:bg-surface-hover-inverse focus:ring-[var(--color-brand-primary)]",
        false: "bg-surface-elevated border-border text-text-secondary hover:bg-surface-hover focus:ring-[var(--color-brand-primary)]",
      },
    },
    defaultVariants: {
      inverted: false,
    },
  }
);

/**
 * PipelineStage metrics variants using CVA (Class Variance Authority)
 */
export const pipelineStageMetricsVariants = cva(
  [
    // Base styles
    "p-4",
    "space-y-2",
    "transition-all",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
  ],
  {
    variants: {
      /**
       * Theme inversion
       */
      inverted: {
        true: "",
        false: "",
      },
    },
    defaultVariants: {
      inverted: false,
    },
  }
);

/**
 * PipelineStage metric variants using CVA (Class Variance Authority)
 */
export const pipelineStageMetricVariants = cva(
  [
    // Base styles
    "flex",
    "items-center",
    "justify-between",
    "transition-colors",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
  ],
  {
    variants: {
      /**
       * Theme inversion
       */
      inverted: {
        true: "text-text-inverse",
        false: "text-text-primary",
      },
    },
    defaultVariants: {
      inverted: false,
    },
  }
);

/**
 * PipelineStage metric label variants using CVA (Class Variance Authority)
 */
export const pipelineStageMetricLabelVariants = cva(
  [
    // Base styles
    "text-xs",
    "font-medium",
    "uppercase",
    "tracking-wider",
    "transition-colors",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
  ],
  {
    variants: {
      /**
       * Theme inversion
       */
      inverted: {
        true: "text-text-muted-inverse",
        false: "text-text-muted",
      },
    },
    defaultVariants: {
      inverted: false,
    },
  }
);

/**
 * PipelineStage metric value variants using CVA (Class Variance Authority)
 */
export const pipelineStageMetricValueVariants = cva(
  [
    // Base styles
    "font-bold",
    "transition-colors",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
  ],
  {
    variants: {
      /**
       * Theme inversion
       */
      inverted: {
        true: "text-text-inverse",
        false: "text-text-primary",
      },
    },
    defaultVariants: {
      inverted: false,
    },
  }
);

/**
 * PipelineStage content variants using CVA (Class Variance Authority)
 */
export const pipelineStageContentVariants = cva(
  [
    // Base styles
    "flex-1",
    "overflow-y-auto",
    "transition-all",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
  ],
  {
    variants: {
      /**
       * Theme inversion
       */
      inverted: {
        true: "",
        false: "",
      },
    },
    defaultVariants: {
      inverted: false,
    },
  }
);

/**
 * PipelineStage probability variants using CVA (Class Variance Authority)
 */
export const pipelineStageProbabilityVariants = cva(
  [
    // Base styles
    "px-2",
    "py-1",
    "text-xs",
    "font-bold",
    "rounded-badge",
    "transition-all",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
  ],
  {
    variants: {
      /**
       * Theme inversion
       */
      inverted: {
        true: "",
        false: "",
      },
    },
    defaultVariants: {
      inverted: false,
    },
  }
);
