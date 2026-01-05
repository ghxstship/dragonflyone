import type { HTMLAttributes, ReactNode } from 'react';

export type NavigationProps = HTMLAttributes<HTMLElement> & {
  logo?: ReactNode;
  children?: ReactNode;
  cta?: ReactNode;
  fixed?: boolean;
  inverted?: boolean;
};

export type NavLinkProps = HTMLAttributes<HTMLAnchorElement> & {
  href: string;
  active?: boolean;
  inverted?: boolean;
};
