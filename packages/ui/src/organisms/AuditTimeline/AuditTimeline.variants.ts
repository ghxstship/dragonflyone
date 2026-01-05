import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";

export const auditTimelineVariants = cva("relative", {
  variants: {
    loading: {
      true: "",
      false: "",
    },
    showFieldChanges: {
      true: "",
      false: "",
    },
    compact: {
      true: "",
      false: "",
    },
  },
  defaultVariants: {
    loading: false,
    showFieldChanges: true,
    compact: false,
  },
});

export type AuditTimelineVariants = VariantProps<typeof auditTimelineVariants>;
