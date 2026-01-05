import React from "react";
import { useBrand } from "./theme-provider.js";
import { Logo } from "./logo.js";

export interface PoweredByProps {
  className?: string;
  layout?: "inline" | "stacked";
}

export const PoweredBy: React.FC<PoweredByProps> = ({ className, layout = "inline" }) => {
  const brand = useBrand();

  if (brand.features?.showPoweredBy === false) return null;

  const isInline = layout === "inline";

  return (
    <div
      className={className}
      style={{
        display: "flex",
        flexDirection: isInline ? "row" : "column",
        alignItems: isInline ? "center" : "flex-start",
        gap: isInline ? "0.35rem" : "0.25rem",
        color: "var(--color-text-secondary, #595959)",
        fontSize: "0.75rem",
        lineHeight: 1.4,
      }}
    >
      <span style={{ opacity: 0.9 }}>Powered by</span>
      <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
        <Logo variant="mark" size="sm" />
        <span style={{ fontWeight: 600 }}>{brand.content?.appName || brand.name}</span>
      </div>
    </div>
  );
};
