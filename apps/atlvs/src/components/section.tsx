// Re-export UI library components for backward compatibility
export { 
  Badge,
  H2,
  Body,
  Label,
  Stack,
  Section,
  Kicker,
  SectionHeader,
} from "@ghxstship/ui";

import { PropsWithChildren } from "react";
import { Section as UISection, SectionHeader as UISectionHeader } from "@ghxstship/ui";

// Normalized Section wrapper props - consistent across all apps
type SectionWrapperProps = PropsWithChildren<{
  id?: string;
  kicker?: string;
  title?: string;
  description?: string;
  border?: boolean;
  className?: string;
  align?: "left" | "center";
}>;

/**
 * Normalized Section wrapper component.
 * Provides consistent section styling across all GHXSTSHIP apps.
 */
export function SectionWithBorder({
  id,
  kicker,
  title,
  description,
  border = true,
  className = "",
  align = "left",
  children,
}: SectionWrapperProps) {
  const borderClass = border ? "border border-ink-800" : "";
  const paddingClass = border ? "p-6" : "";

  return (
    <UISection
      id={id}
      className={`flex flex-col gap-6 ${borderClass} ${paddingClass} ${className}`.trim()}
    >
      {(kicker || title || description) && (
        <UISectionHeader kicker={kicker} title={title} description={description} align={align} />
      )}
      {children}
    </UISection>
  );
}
