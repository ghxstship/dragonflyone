import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";

export const protectedRouteVariants = cva("flex min-h-screen items-center justify-center bg-black text-white", {
  variants: {
    loadingState: {
      true: "",
      false: "",
    },
  },
  defaultVariants: {
    loadingState: false,
  },
});

export type ProtectedRouteVariants = VariantProps<typeof protectedRouteVariants>;
