import type { ReactNode, ChangeEvent } from "react";

export interface AuthCheckboxProps {
  checked: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  children: ReactNode;
  className?: string;
}
