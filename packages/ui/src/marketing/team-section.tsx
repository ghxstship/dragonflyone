"use client";

import { forwardRef } from "react";
import clsx from "clsx";
import { Container, Stack, Grid } from "../foundations/layout.js";
import { Card } from "../molecules/card.js";
import { Kicker } from "../atoms/kicker.js";
import { Body, H2 } from "../atoms/typography.js";
import { Avatar } from "../atoms/avatar.js";
import { Linkedin, Instagram } from "lucide-react";

/**
 * TeamSection - Display team members
 * 2026 Best Practices:
 * - Professional photos with hover effects
 * - Social links for credibility
 * - Responsive grid layout
 * Bold Contemporary Pop Art Adventure Design System
 */

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio?: string;
  avatar?: string;
  social?: {
    linkedin?: string;
    instagram?: string;
    bluesky?: string;
  };
}

export interface TeamSectionProps {
  /** Section kicker text */
  kicker?: string;
  /** Section title */
  title?: string;
  /** Section description */
  description?: string;
  /** Team members */
  members: TeamMember[];
  /** Number of columns */
  columns?: 3 | 4;
  /** 
   * Section theme variant
   * - "dark": Force dark theme (default)
   * - "light": Force light theme
   * - "inverted": Invert relative to page theme
   */
  sectionVariant?: "dark" | "light" | "inverted";
  /** Show social links */
  showSocial?: boolean;
  /** Show bios */
  showBios?: boolean;
  className?: string;
}

export const TeamSection = forwardRef<HTMLElement, TeamSectionProps>(
  function TeamSection(
    {
      kicker,
      title,
      description,
      members,
      columns = 4,
      sectionVariant = "dark",
      showSocial = true,
      showBios = false,
      className,
    },
    ref
  ) {
    const sectionVariantClasses = {
      dark: "section-dark bg-surface-primary",
      light: "section-light bg-surface-primary",
      inverted: "section-inverted bg-surface-primary",
    };

    const colClasses = {
      3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
      4: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
    };

    return (
      <section
        ref={ref}
        className={clsx("py-20 md:py-32", sectionVariantClasses[sectionVariant], className)}
      >
        <Container size="xl">
          {/* Section Header */}
          {(kicker || title || description) && (
            <Stack gap={4} className="mb-12 md:mb-16 text-center items-center">
              {kicker && <Kicker>{kicker}</Kicker>}
              {title && <H2 className="text-text-primary">{title}</H2>}
              {description && (
                <Body size="lg" className="text-text-muted max-w-2xl">
                  {description}
                </Body>
              )}
            </Stack>
          )}

          {/* Team Grid */}
          <Grid cols={columns} gap={6} className={colClasses[columns]}>
            {members.map((member) => (
              <Card
                key={member.id}
                className="p-6 border-2 border-border rounded-card text-center group hover:border-primary/50 transition-colors"
              >
                <Stack gap={4} className="items-center">
                  {/* Avatar */}
                  <div className="relative">
                    <Avatar
                      src={member.avatar}
                      initials={member.name.split(" ").map(n => n[0]).join("")}
                      alt={member.name}
                      size="xl"
                      className="grayscale group-hover:grayscale-0 transition-all duration-300"
                    />
                  </div>

                  {/* Info */}
                  <Stack gap={1} className="items-center">
                    <Body className="text-text-primary font-semibold">
                      {member.name}
                    </Body>
                    <Body size="sm" className="text-primary">
                      {member.role}
                    </Body>
                  </Stack>

                  {/* Bio */}
                  {showBios && member.bio && (
                    <Body size="sm" className="text-text-muted line-clamp-3">
                      {member.bio}
                    </Body>
                  )}

                  {/* Social Links */}
                  {showSocial && member.social && (
                    <Stack direction="horizontal" gap={3}>
                      {member.social.linkedin && (
                        <a
                          href={member.social.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-text-disabled hover:text-primary transition-colors"
                          aria-label={`${member.name} on LinkedIn`}
                        >
                          <Linkedin className="size-5" />
                        </a>
                      )}
                      {member.social.instagram && (
                        <a
                          href={member.social.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-text-disabled hover:text-primary transition-colors"
                          aria-label={`${member.name} on Instagram`}
                        >
                          <Instagram className="size-5" />
                        </a>
                      )}
                      {member.social.bluesky && (
                        <a
                          href={member.social.bluesky}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-text-disabled hover:text-primary transition-colors"
                          aria-label={`${member.name} on Bluesky`}
                        >
                          <svg className="size-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                            <path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 0 1-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.206-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8Z" />
                          </svg>
                        </a>
                      )}
                    </Stack>
                  )}
                </Stack>
              </Card>
            ))}
          </Grid>
        </Container>
      </section>
    );
  }
);

export default TeamSection;
