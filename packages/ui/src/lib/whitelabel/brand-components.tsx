"use client";

import React from "react";
import { useBrand } from "./whitelabel-provider.js";
import type { BrandConfig } from "../../design-system/tokens/types.js";

/**
 * Brand Logo Component
 * 
 * Renders the appropriate logo based on the current brand configuration.
 */
export interface BrandLogoProps {
  /** Logo variant */
  variant?: "primary" | "mark" | "wordmark";
  
  /** Logo size */
  size?: number | string;
  
  /** Dark mode variant */
  dark?: boolean;
  
  /** Additional CSS classes */
  className?: string;
  
  /** Alt text for accessibility */
  alt?: string;
  
  /** Click handler */
  onClick?: () => void;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = "primary",
  size = 40,
  dark = false,
  className = "",
  alt,
  onClick,
}) => {
  const { brand } = useBrand();

  const getLogoSrc = () => {
    if (!brand?.logo) return "";

    switch (variant) {
      case "mark":
        return dark && brand.logo.dark?.mark 
          ? brand.logo.dark.mark 
          : brand.logo.mark;
      case "wordmark":
        return brand.logo.wordmark || brand.logo.primary;
      default:
        return dark && brand.logo.dark?.primary 
          ? brand.logo.dark.primary 
          : brand.logo.primary;
    }
  };

  const getAltText = () => {
    if (alt) return alt;
    return `${brand?.content?.appName || "Application"} ${variant} logo`;
  };

  return (
    <img
      src={getLogoSrc()}
      alt={getAltText()}
      className={className}
      style={{ 
        width: typeof size === "number" ? `${size}px` : size,
        height: typeof size === "number" ? `${size}px` : size,
        objectFit: "contain",
      }}
      onClick={onClick}
    />
  );
};

/**
 * Brand Name Component
 * 
 * Renders the application name from brand configuration.
 */
export interface BrandNameProps {
  /** Whether to show the full name or short version */
  variant?: "full" | "short";
  
  /** Additional CSS classes */
  className?: string;
  
  /** Custom render function */
  render?: (name: string) => React.ReactNode;
}

export const BrandName: React.FC<BrandNameProps> = ({
  variant = "full",
  className = "",
  render,
}) => {
  const { brand } = useBrand();

  const name = variant === "full" 
    ? brand?.content?.appName || "Application"
    : brand?.content?.appName?.split(" ")[0] || "App";

  if (render) {
    return <>{render(name)}</>;
  }

  return <span className={className}>{name}</span>;
};

/**
 * Brand Tagline Component
 * 
 * Renders the tagline from brand configuration.
 */
export interface BrandTaglineProps {
  /** Additional CSS classes */
  className?: string;
  
  /** Custom render function */
  render?: (tagline: string) => React.ReactNode;
}

export const BrandTagline: React.FC<BrandTaglineProps> = ({
  className = "",
  render,
}) => {
  const { brand } = useBrand();

  const tagline = brand?.content?.tagline || "";

  if (!tagline) return null;

  if (render) {
    return <>{render(tagline)}</>;
  }

  return <span className={className}>{tagline}</span>;
};

/**
 * Powered By Component
 * 
 * Renders "Powered by" branding if enabled.
 */
export interface PoweredByProps {
  /** Additional CSS classes */
  className?: string;
  
  /** Custom text */
  text?: string;
  
  /** Show logo */
  showLogo?: boolean;
  
  /** Link URL */
  href?: string;
}

export const PoweredBy: React.FC<PoweredByProps> = ({
  className = "",
  text,
  showLogo = true,
  href,
}) => {
  const { brand } = useBrand();

  // Check if powered by is enabled
  if (!brand?.features?.showPoweredBy && !text) return null;

  const defaultText = `Powered by ${brand?.content?.appName || "ATLVS"}`;
  const displayText = text || defaultText;
  const linkHref = href || brand?.content?.supportUrl || "#";

  return (
    <a 
      href={linkHref}
      className={className}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        fontSize: "12px",
        color: "var(--color-text-muted)",
        textDecoration: "none",
      }}
    >
      {showLogo && (
        <BrandLogo 
          variant="mark" 
          size={16} 
          alt={brand?.content?.appName || "ATLVS"}
        />
      )}
      {displayText}
    </a>
  );
};

/**
 * Brand Colors Component
 * 
 * Renders a palette of brand colors for preview/debugging.
 */
export interface BrandColorsProps {
  /** Additional CSS classes */
  className?: string;
  
  /** Show color names */
  showNames?: boolean;
  
  /** Color size */
  size?: number;
}

export const BrandColors: React.FC<BrandColorsProps> = ({
  className = "",
  showNames = true,
  size = 32,
}) => {
  const { brand } = useBrand();

  const colors = brand?.colors || {};

  return (
    <div className={className} style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
      {Object.entries(colors).map(([name, value]) => (
        <div
          key={name}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <div
            style={{
              width: `${size}px`,
              height: `${size}px`,
              backgroundColor: value,
              border: "1px solid var(--color-border-input)",
              borderRadius: "4px",
            }}
          />
          {showNames && (
            <span style={{ fontSize: "10px", color: "var(--color-text-muted)" }}>
              {name}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

/**
 * Brand Theme Preview Component
 * 
 * Renders a preview of the current brand theme.
 */
export interface BrandThemePreviewProps {
  /** Additional CSS classes */
  className?: string;
  
  /** Show color palette */
  showColors?: boolean;
  
  /** Show typography */
  showTypography?: boolean;
  
  /** Show logo */
  showLogo?: boolean;
}

export const BrandThemePreview: React.FC<BrandThemePreviewProps> = ({
  className = "",
  showColors = true,
  showTypography = true,
  showLogo = true,
}) => {
  const { brand } = useBrand();

  return (
    <div 
      className={className}
      style={{
        padding: "16px",
        border: "1px solid var(--color-border-input)",
        borderRadius: "8px",
        backgroundColor: "var(--color-surface-primary)",
      }}
    >
      {showLogo && (
        <div style={{ marginBottom: "16px" }}>
          <BrandLogo size={48} />
        </div>
      )}

      {showTypography && (
        <div style={{ marginBottom: "16px" }}>
          <h3 style={{ 
            fontFamily: brand?.fonts?.primary || "sans-serif",
            color: "var(--color-text-primary)",
            marginBottom: "8px",
          }}>
            {brand?.content?.appName || "Application"}
          </h3>
          <p style={{ 
            fontFamily: brand?.fonts?.secondary || "sans-serif",
            color: "var(--color-text-secondary)",
            marginBottom: "4px",
          }}>
            {brand?.content?.tagline || "Tagline goes here"}
          </p>
          <code style={{ 
            fontFamily: brand?.fonts?.mono || "monospace",
            color: "var(--color-text-muted)",
            fontSize: "12px",
          }}>
            Monospace text sample
          </code>
        </div>
      )}

      {showColors && (
        <div>
          <h4 style={{ 
            fontSize: "14px", 
            marginBottom: "8px",
            color: "var(--color-text-primary)",
          }}>
            Brand Colors
          </h4>
          <BrandColors size={24} />
        </div>
      )}
    </div>
  );
};
