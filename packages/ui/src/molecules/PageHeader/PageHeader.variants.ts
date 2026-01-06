import { cva } from "class-variance-authority";

export const pageHeaderVariants = cva(
  "flex flex-col",
  {
    variants: {
      align: {
        left: "",
        center: "text-center items-center",
      },
      size: {
        sm: "gap-3 py-6",
        md: "gap-4 py-8 md:py-12",
        lg: "gap-6 py-12 md:py-16",
      },
    },
    defaultVariants: {
      align: "left",
      size: "md",
    },
  }
);

export const pageHeaderTitleVariants = cva(
  "font-semibold text-[var(--color-text-primary)]",
  {
    variants: {
      size: {
        sm: "text-xl",
        md: "text-2xl",
        lg: "text-3xl",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

export const pageHeaderSubtitleVariants = cva(
  "text-sm text-text-muted mt-1",
  {
    variants: {
    },
    defaultVariants: {
    },
  }
);

export const pageHeaderActionsVariants = cva(
  "flex items-center gap-3 shrink-0",
  {
    variants: {},
    defaultVariants: {},
  }
);
