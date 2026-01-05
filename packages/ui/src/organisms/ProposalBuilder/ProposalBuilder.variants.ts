import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";

export const proposalBuilderVariants = cva("space-y-4", {
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

export type ProposalBuilderVariants = VariantProps<typeof proposalBuilderVariants>;
