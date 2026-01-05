import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";

export const calendarVariants = cva("overflow-hidden border-2 rounded-[var(--radius-card)]", {
  variants: {
    inverted: {
      true: "bg-surface-inverse text-text-primary border-border shadow-[4px_4px_0_rgba(255,255,255,0.15)]",
      false: "bg-white text-black border-black shadow-[4px_4px_0_rgba(0,0,0,0.15)]",
    },
    showWeekNumbers: {
      true: "",
      false: "",
    },
    weekStartsOnMonday: {
      true: "",
      false: "",
    },
  },
  defaultVariants: {
    inverted: true,
    showWeekNumbers: false,
    weekStartsOnMonday: false,
  },
});

export type CalendarVariants = VariantProps<typeof calendarVariants>;
