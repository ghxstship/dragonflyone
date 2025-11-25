// Re-export UI library components for backward compatibility
export { 
  Badge,
  H2,
  Body,
  Label,
  Stack,
  Section,
} from "@ghxstship/ui";

import { PropsWithChildren } from "react";
import { Stack, Label, H2, Body, Section as UISection } from "@ghxstship/ui";

// Custom Section wrapper that maintains backward compatibility with local props
export function SectionWithBorder({
  id,
  border = false,
  className = "",
  children,
}: PropsWithChildren<{ id?: string; border?: boolean; className?: string }>) {
  const borderClass = border ? "border border-ink-800" : "";
  const paddingClass = border ? "p-6" : "";

  return (
    <UISection
      id={id}
      className={`flex flex-col gap-6 ${borderClass} ${paddingClass} ${className}`.trim()}
    >
      {children}
    </UISection>
  );
}

export function SectionHeader({
  kicker,
  title,
  description,
  align = "left",
}: {
  kicker?: string;
  title?: string;
  description?: string;
  align?: "left" | "center";
}) {
  return (
    <Stack gap={3} className={align === "center" ? "text-center" : "text-left"}>
      {kicker ? (
        <Label className="font-code text-xs uppercase tracking-[0.4em] text-ink-500">{kicker}</Label>
      ) : null}
      {title ? <H2 className="font-display text-4xl uppercase md:text-5xl">{title}</H2> : null}
      {description ? (
        <Body className={`text-sm text-ink-300 md:text-base ${align === "center" ? "mx-auto max-w-2xl" : "max-w-3xl"}`}>
          {description}
        </Body>
      ) : null}
    </Stack>
  );
}
