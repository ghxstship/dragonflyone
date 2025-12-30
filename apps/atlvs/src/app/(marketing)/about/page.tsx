"use client";

/**
 * About Page - 2026 Landing Page Best Practices
 * Full-width marketing layout with hero, mission, team, values, and CTA
 * Bold Contemporary Pop Art Adventure Design System
 */

import { useRouter } from "next/navigation";
import { Heart, Target, Users, Globe } from "lucide-react";
import {
  MarketingPage, HeroSection, StatsSection, TeamSection, FeatureGrid, CTABanner} from "@ghxstship/ui";

const STATS: StatItem[] = [
  { id: "founded", value: 2020, label: "Founded", description: "Building the future of production" },
  { id: "team", value: 50, suffix: "+", label: "Team Members", description: "Passionate professionals" },
  { id: "customers", value: 1000, suffix: "+", label: "Customers", description: "Production teams worldwide" },
  { id: "events", value: 10000, suffix: "+", label: "Events Managed", description: "Successful productions" },
];

const TEAM_MEMBERS: TeamMember[] = [
  {
    id: "alex",
    name: "Alex Chen",
    role: "CEO & Founder",
    bio: "Former production director with 15+ years in live events. Founded ATLVS to solve the challenges he faced firsthand.",
    avatar: "/team/alex.jpg",
    social: { linkedin: "https://linkedin.com/in/alexchen", twitter: "https://twitter.com/alexchen" },
  },
  {
    id: "sarah",
    name: "Sarah Williams",
    role: "CTO",
    bio: "Engineering leader from Spotify and Netflix. Passionate about building scalable systems for creative teams.",
    avatar: "/team/sarah.jpg",
    social: { linkedin: "https://linkedin.com/in/sarahwilliams" },
  },
  {
    id: "michael",
    name: "Michael Brown",
    role: "Head of Product",
    bio: "Product veteran from Figma and Notion. Obsessed with creating intuitive experiences for complex workflows.",
    avatar: "/team/michael.jpg",
    social: { linkedin: "https://linkedin.com/in/michaelbrown", twitter: "https://twitter.com/michaelbrown" },
  },
  {
    id: "emily",
    name: "Emily Davis",
    role: "Head of Sales",
    bio: "Enterprise sales leader with deep experience in the events industry. Connects teams with solutions that work.",
    avatar: "/team/emily.jpg",
    social: { linkedin: "https://linkedin.com/in/emilydavis" },
  },
];

const VALUES: FeatureItem[] = [
  {
    id: "customer-first",
    icon: <Heart className="size-8" />,
    title: "Customer First",
    description: "We put our customers at the center of everything we do. Their success is our success.",
    highlights: ["24/7 support", "Customer advisory board", "Regular feedback loops", "Success-driven roadmap"],
  },
  {
    id: "excellence",
    icon: <Target className="size-8" />,
    title: "Excellence",
    description: "We strive for excellence in every aspect of our work, from code quality to customer service.",
    highlights: ["99.99% uptime", "SOC 2 certified", "Continuous improvement", "Best-in-class UX"],
  },
  {
    id: "collaboration",
    icon: <Users className="size-8" />,
    title: "Collaboration",
    description: "We believe in the power of teamwork and partnership, both internally and with our customers.",
    highlights: ["Cross-functional teams", "Open communication", "Partner ecosystem", "Community events"],
  },
  {
    id: "innovation",
    icon: <Globe className="size-8" />,
    title: "Innovation",
    description: "We continuously push boundaries to create better solutions for the production industry.",
    highlights: ["R&D investment", "AI-powered features", "Industry-first tools", "Patent portfolio"],
  },
];

export default function AboutPage() {
  const router = useRouter();

  return (
    <MarketingPage
      sections={[
        {
          id: "hero",
          background: "gradient",
          pattern: "halftone",
          patternOpacity: 0.05,
          content: (
            <HeroSection
              kicker="About Us"
              title="Building the Future of Production Management"
              description="ATLVS is the premier production management platform designed for live events, entertainment, and experiential marketing. We empower teams to deliver exceptional experiences."
              primaryCta={{
                label: "Join Our Team",
                onClick: () => router.push("/careers"),
              }}
              secondaryCta={{
                label: "Contact Us",
                onClick: () => router.push("/contact"),
              }}
              background="gradient"
              pattern="none"
              fullHeight={false}
              align="center"
            />
          ),
        },
        {
          id: "stats",
          background: "primary",
          content: (
            <StatsSection
              kicker="By the Numbers"
              title="Our Impact"
              stats={STATS}
              background="primary"
              animate
            />
          ),
        },
        {
          id: "values",
          background: "ink",
          pattern: "grid",
          patternOpacity: 0.03,
          content: (
            <FeatureGrid
              kicker="Our Values"
              title="The Principles That Guide Us"
              description="These core values shape every decision we make and every product we build"
              features={VALUES}
              columns={2}
              variant="bordered"
              background="ink"
              align="center"
            />
          ),
        },
        {
          id: "team",
          background: "black",
          content: (
            <TeamSection
              kicker="Leadership"
              title="Meet Our Team"
              description="The passionate people building the future of production management"
              members={TEAM_MEMBERS}
              columns={4}
              showSocial
              showBios
              background="black"
            />
          ),
        },
        {
          id: "cta",
          background: "ink",
          pattern: "stripes",
          content: (
            <CTABanner
              title="Want to Join Our Mission?"
              description="We're always looking for talented people who are passionate about transforming the production industry."
              primaryCta={{
                label: "View Open Positions",
                onClick: () => router.push("/careers"),
              }}
              secondaryCta={{
                label: "Contact Us",
                onClick: () => router.push("/contact"),
              }}
              background="ink"
            />
          ),
        },
      ]}
    />
  );
}
