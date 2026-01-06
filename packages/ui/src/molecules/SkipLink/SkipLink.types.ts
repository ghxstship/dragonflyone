import type { ComponentProps } from "react";

export interface SkipLinkProps extends Omit<ComponentProps<"a">, "className"> {
  href: string;
  label: string;
  className?: string;
}
