import { cva } from "class-variance-authority";

export const activityFeedVariants = cva(
  // Base styles
  "space-y-4",
  {
    variants: {
      compact: {
        true: "space-y-2",
        false: "space-y-4",
      },
      inverted: {
        true: "",
        false: "",
      },
    },
    defaultVariants: {
      compact: false,
      inverted: false,
    },
  }
);

export const activityItemVariants = cva(
  // Base styles
  "flex items-start gap-3 p-4 rounded-lg border transition-all duration-200",
  {
    variants: {
      compact: {
        true: "p-2 gap-2",
        false: "p-4 gap-3",
      },
      inverted: {
        true: "bg-surface-inverse border-border text-text-primary hover:bg-surface-elevated",
        false: "bg-surface-primary border-border text-text-primary hover:bg-surface-elevated",
      },
    },
    defaultVariants: {
      compact: false,
      inverted: false,
    },
  }
);

export const activityIconVariants = cva(
  // Base styles
  "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
  {
    variants: {
      type: {
        created: "bg-success-subtle text-success",
        updated: "bg-info-subtle text-info",
        deleted: "bg-error-subtle text-error",
        commented: "bg-surface-accent text-text-primary",
        mentioned: "bg-surface-accent text-text-primary",
        status_changed: "bg-warning-subtle text-warning",
        assigned: "bg-success-subtle text-success",
        completed: "bg-success-subtle text-success",
        automation: "bg-surface-muted text-text-muted",
        system: "bg-surface-muted text-text-muted",
      },
      inverted: {
        true: "",
        false: "",
      },
    },
    defaultVariants: {
      type: "created",
      inverted: false,
    },
  }
);
