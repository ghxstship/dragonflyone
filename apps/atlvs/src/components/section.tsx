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
import { Stack, Label, H2, Body, Card, Section as UISection } from "@ghxstship/ui";

// Custom Section wrapper that maintains backward compatibility with local props
type SectionProps = PropsWithChildren<{
  id?: string;
  kicker?: string;
  title?: string;
  description?: string;
  border?: boolean;
  className?: string;
}>;

export function SectionWithBorder({
  id,
  kicker,
  title,
  description,
  border = true,
  className = "",
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
        <SectionHeader kicker={kicker} title={title} description={description} />
      )}
      {children}
    </UISection>
  );
}

type SectionHeaderProps = {
  kicker?: string;
  title?: string;
  description?: string;
  align?: "left" | "center";
};

export function SectionHeader({ kicker, title, description, align = "left" }: SectionHeaderProps) {
  return (
    <Stack gap={2} className={align === "center" ? "text-center" : "text-left"}>
      {kicker ? (
        <Label className="font-code text-xs uppercase tracking-[0.4em] text-ink-500">{kicker}</Label>
      ) : null}
      {title ? <H2 className="text-3xl md:text-4xl">{title}</H2> : null}
      {description ? <Body className="max-w-3xl text-ink-300">{description}</Body> : null}
    </Stack>
  );
}
