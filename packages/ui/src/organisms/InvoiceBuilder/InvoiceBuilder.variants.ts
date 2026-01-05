import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";

export const invoiceBuilderVariants = cva("space-y-4", {
  variants: {
    readonly: {
      true: "",
      false: "",
    },
  },
  defaultVariants: {
    readonly: false,
  },
});

export const lineItemTableVariants = cva("border-2 border-border rounded-card overflow-hidden", {
  variants: {
    readonly: {
      true: "",
      false: "",
    },
  },
  defaultVariants: {
    readonly: false,
  },
});

export const lineItemRowVariants = cva("px-4 py-2 grid grid-cols-12 gap-2 items-center", {
  variants: {
    readonly: {
      true: "",
      false: "",
    },
  },
  defaultVariants: {
    readonly: false,
  },
});

export const inputVariants = cva("w-full px-2 py-1 border-2 border-border rounded-button text-body-sm focus:outline-none focus:border-primary", {
  variants: {
    textAlign: {
      left: "text-left",
      right: "text-right",
    },
  },
  defaultVariants: {
    textAlign: "left",
  },
});

export type InvoiceBuilderVariants = VariantProps<typeof invoiceBuilderVariants>;
export type LineItemTableVariants = VariantProps<typeof lineItemTableVariants>;
export type LineItemRowVariants = VariantProps<typeof lineItemRowVariants>;
export type InputVariants = VariantProps<typeof inputVariants>;
