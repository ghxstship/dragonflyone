import { cva } from 'class-variance-authority';

export const listPageVariants = cva('w-full', {
  variants: {
    variant: {
      default: 'bg-surface-primary',
      inverted: 'bg-surface-inverse',
    },
    size: {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'md',
  },
});

export const listPageHeaderVariants = cva('flex items-center justify-between gap-4 p-4 border-b-2', {
  variants: {
    variant: {
      default: 'bg-surface-primary border-border',
      inverted: 'bg-surface-inverse border-border',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export const listPageContentVariants = cva('flex-1 overflow-hidden', {
  variants: {
    variant: {
      default: 'bg-surface-primary',
      inverted: 'bg-surface-inverse',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});
