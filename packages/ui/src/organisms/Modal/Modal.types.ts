import type { HTMLAttributes } from 'react';

export type ModalProps = HTMLAttributes<HTMLDivElement> & {
  open: boolean;
  onClose?: () => void;
  title?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showClose?: boolean;
  inverted?: boolean;
};

export type ModalHeaderProps = HTMLAttributes<HTMLDivElement> & {
  inverted?: boolean;
};

export type ModalBodyProps = HTMLAttributes<HTMLDivElement> & {
  inverted?: boolean;
};

export type ModalFooterProps = HTMLAttributes<HTMLDivElement> & {
  inverted?: boolean;
};
