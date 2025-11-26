// Re-export UI library components for backward compatibility
export { 
  Badge,
  H2,
  Body,
  Label,
  Stack,
  Kicker,
  SectionHeader,
} from "@ghxstship/ui";

import { PropsWithChildren } from "react";
import { Section as UISection, SectionHeader as UISectionHeader } from "@ghxstship/ui";

// Custom Section wrapper that maintains backward compatibility with local props
type SectionProps = PropsWithChildren<{
  id?: string;
  kicker?: string;
  title?: string;
  description?: string;
  border?: boolean;
  className?: string;
  align?: "left" | "center";
}>;

export function Section({
  id,
  kicker,
  title,
  description,
  border = true,
  className = "",
  align = "left",
  children,
}: SectionProps) {
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
