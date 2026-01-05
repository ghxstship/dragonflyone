import type { AnchorHTMLAttributes } from "react";

export interface SocialIconProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  platform: "twitter" | "instagram" | "facebook" | "linkedin" | "tiktok" | "youtube" | "email";
  size?: "sm" | "md" | "lg";
  inverted?: boolean;
}

export interface SocialIconVariants {
  platform: "twitter" | "instagram" | "facebook" | "linkedin" | "tiktok" | "youtube" | "email";
  size?: "sm" | "md" | "lg";
  inverted?: boolean;
  className?: string;
}
