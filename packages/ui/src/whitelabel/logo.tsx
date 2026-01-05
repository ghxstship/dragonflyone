import React from "react";
import { useBrand, useColorMode } from "./theme-provider.js";

export type LogoVariant = "full" | "mark" | "wordmark";
export type LogoSize = "sm" | "md" | "lg" | "xl";

const sizeMap: Record<LogoSize, Record<LogoVariant, { width: number; height: number }>> = {
  sm: { full: { width: 96, height: 32 }, mark: { width: 24, height: 24 }, wordmark: { width: 80, height: 24 } },
  md: { full: { width: 128, height: 40 }, mark: { width: 32, height: 32 }, wordmark: { width: 104, height: 32 } },
  lg: { full: { width: 160, height: 52 }, mark: { width: 40, height: 40 }, wordmark: { width: 132, height: 40 } },
  xl: { full: { width: 192, height: 64 }, mark: { width: 48, height: 48 }, wordmark: { width: 160, height: 48 } },
};

export interface LogoProps {
  variant?: LogoVariant;
  size?: LogoSize;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  variant = "full",
  size = "md",
  className,
}) => {
  const brand = useBrand();
  const { resolvedColorMode } = useColorMode();

  const getLogoSrc = (): string => {
    const isDark = resolvedColorMode === "dark";
    const darkLogos = brand.logo.dark;
    switch (variant) {
      case "mark":
        return isDark && darkLogos?.mark ? darkLogos.mark : brand.logo.mark;
      case "wordmark":
        return brand.logo.wordmark ?? brand.logo.primary;
      default:
        return isDark && darkLogos?.primary ? darkLogos.primary : brand.logo.primary;
    }
  };

  const { width, height } = sizeMap[size][variant];

  return (
    <div
      role="img"
      aria-label={brand.name}
      className={className}
      style={{
        width,
        height,
        maxWidth: "100%",
        backgroundImage: `url(${getLogoSrc()})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "contain",
        backgroundPosition: "left center",
      }}
    />
  );
};
