import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";

export const kanbanBoardVariants = cva("flex flex-col md:flex-row gap-3 md:gap-4 overflow-x-auto p-2 md:p-4", {
  variants: {
    inverted: {
      true: "",
      false: "",
    },
    loading: {
      true: "",
      false: "",
    },
    collapsed: {
      true: "",
      false: "",
    },
  },
  defaultVariants: {
    inverted: true,
    loading: false,
    collapsed: false,
  },
});

export type KanbanBoardVariants = VariantProps<typeof kanbanBoardVariants>;
