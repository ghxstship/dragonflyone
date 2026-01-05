import { cva } from "class-variance-authority";

export const aiChatSuggestionChipsVariants = cva("w-full", {
  variants: {
    variant: {
      default: "",
      compact: "",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});
