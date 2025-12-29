"use client";

import { forwardRef } from "react";
import clsx from "clsx";
import { Container, Stack, Grid } from "../foundations/layout.js";
import { Card } from "../molecules/card.js";
import { Kicker } from "../atoms/kicker.js";
import { Body, H2 } from "../atoms/typography.js";
import { Avatar } from "../atoms/avatar.js";
import { Linkedin, Twitter } from "lucide-react";

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
    twitter?: string;
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
  /** Background color */
  background?: "black" | "ink" | "grey";
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
      background = "ink",
      showSocial = true,
      showBios = false,
      className,
    },
    ref
  ) {
    const bgClasses = {
      black: "bg-black text-white",
      ink: "bg-ink-950 text-white",
      grey: "bg-grey-900 text-white",
    };

    const colClasses = {
      3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
      4: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
    };

    return (
      <section
        ref={ref}
        className={clsx("py-20 md:py-32", bgClasses[background], className)}
      >
        <Container size="xl">
          {/* Section Header */}
          {(kicker || title || description) && (
            <Stack gap={4} className="mb-12 md:mb-16 text-center items-center">
              {kicker && <Kicker>{kicker}</Kicker>}
              {title && <H2 className="text-white">{title}</H2>}
              {description && (
                <Body size="lg" className="text-grey-400 max-w-2xl">
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
                className="p-6 border-2 border-grey-800 rounded-card text-center group hover:border-primary/50 transition-colors"
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
                    <Body className="text-white font-semibold">
                      {member.name}
                    </Body>
                    <Body size="sm" className="text-primary">
                      {member.role}
                    </Body>
                  </Stack>

                  {/* Bio */}
                  {showBios && member.bio && (
                    <Body size="sm" className="text-grey-400 line-clamp-3">
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
                          className="text-grey-500 hover:text-primary transition-colors"
                          aria-label={`${member.name} on LinkedIn`}
                        >
                          <Linkedin className="size-5" />
                        </a>
                      )}
                      {member.social.twitter && (
                        <a
                          href={member.social.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-grey-500 hover:text-primary transition-colors"
                          aria-label={`${member.name} on Twitter`}
                        >
                          <Twitter className="size-5" />
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
