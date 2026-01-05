"use client";

import React from "react";
import { footerLinkVariants } from "./FooterLink.variants.js";
import type { FooterLinkProps } from "./FooterLink.types.js";

/**
 * FooterLink component - Bold Contemporary Pop Art Adventure
 * 
 * A link component for footer navigation
 */
export function FooterLink({
  href,
  children,
  external = false,
  className,
}: FooterLinkProps) {
  const Component = external ? "a" : "a";
  
  return (
    <Component
      href={href}
      className={footerLinkVariants({ className })}
      {...(external && { target: "_blank", rel: "noopener noreferrer" })}
    >
      {children}
    </Component>
  );
}
