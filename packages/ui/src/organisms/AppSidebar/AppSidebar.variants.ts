import { cva } from "class-variance-authority";

export const appSidebarVariants = cva(
  // Base styles
  "flex flex-col border-r transition-all duration-300",
  {
    variants: {
      collapsed: {
        true: "w-16",
        false: "w-64",
      },
      inverted: {
        true: "bg-surface-inverse border-border-inverse text-text-primary",
        false: "bg-surface-primary border-border text-text-primary",
      },
      sticky: {
        true: "sticky top-0 h-screen",
        false: "relative h-auto",
      },
    },
    defaultVariants: {
      collapsed: false,
      inverted: false,
      sticky: true,
    },
  }
);

export const sidebarItemVariants = cva(
  // Base styles
  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
  {
    variants: {
      active: {
        true: "bg-primary-100 text-primary-700",
        false: "text-text-muted hover:text-text-primary hover:bg-surface-secondary",
      },
      disabled: {
        true: "opacity-50 cursor-not-allowed",
        false: "cursor-pointer",
      },
      collapsed: {
        true: "justify-center px-2",
        false: "justify-start px-3",
      },
      inverted: {
        true: "",
        false: "",
      },
    },
    defaultVariants: {
      active: false,
      disabled: false,
      collapsed: false,
      inverted: false,
    },
  }
);

export const sidebarSectionVariants = cva(
  // Base styles
  "py-2",
  {
    variants: {
      collapsed: {
        true: "px-2",
        false: "px-4",
      },
      inverted: {
        true: "",
        false: "",
      },
    },
    defaultVariants: {
      collapsed: false,
      inverted: false,
    },
  }
);
