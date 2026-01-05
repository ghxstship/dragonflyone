import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";

export const pipelineBoardVariants = cva("flex gap-4 overflow-x-auto pb-4 min-h-[600px]", {
  variants: {
    loading: {
      true: "",
      false: "",
    },
  },
  defaultVariants: {
    loading: false,
  },
});

export type PipelineBoardVariants = VariantProps<typeof pipelineBoardVariants>;
