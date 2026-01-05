import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";

export const importExportDialogVariants = cva("", {
  variants: {
    mode: {
      import: "",
      export: "",
    },
  },
  defaultVariants: {
    mode: "import",
  },
});

export const dropZoneVariants = cva("px-8 py-12 border-2 border-dashed text-center cursor-pointer transition-colors duration-100 rounded-card", {
  variants: {
    dragActive: {
      true: "border-primary-500 bg-primary-500/10",
      false: "border-border bg-surface-primary hover:border-primary-500",
    },
  },
  defaultVariants: {
    dragActive: false,
  },
});

export const formatButtonVariants = cva("px-4 py-2 font-mono text-sm tracking-wide uppercase border-2 border-border cursor-pointer", {
  variants: {
    selected: {
      true: "bg-surface-inverse text-text-primary",
      false: "bg-surface-primary text-text-primary hover:bg-muted",
    },
  },
  defaultVariants: {
    selected: false,
  },
});

export type ImportExportDialogVariants = VariantProps<typeof importExportDialogVariants>;
export type DropZoneVariants = VariantProps<typeof dropZoneVariants>;
export type FormatButtonVariants = VariantProps<typeof formatButtonVariants>;
