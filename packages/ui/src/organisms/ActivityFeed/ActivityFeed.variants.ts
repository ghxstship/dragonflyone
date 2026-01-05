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
        created: "bg-success-100 text-success-600",
        updated: "bg-blue-100 text-blue-600",
        deleted: "bg-error-100 text-error-600",
        commented: "bg-purple-100 text-purple-600",
        mentioned: "bg-indigo-100 text-indigo-600",
        status_changed: "bg-orange-100 text-orange-600",
        assigned: "bg-teal-100 text-teal-600",
        completed: "bg-green-100 text-green-600",
        automation: "bg-gray-100 text-gray-600",
        system: "bg-gray-100 text-gray-600",
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
