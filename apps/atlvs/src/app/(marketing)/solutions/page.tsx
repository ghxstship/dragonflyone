"use client";

/**
 * Solutions Page - 2026 Landing Page Best Practices
 * Full-width marketing layout with hero, industry solutions, and role-based solutions
 * Bold Contemporary Pop Art Adventure Design System
 */

import { useRouter } from "next/navigation";
import { Music, Building2, Award, ArrowRight, Users, Briefcase, MapPin, Mic, Camera, Shield, DollarSign, Megaphone, Wrench, UserCheck } from "lucide-react";
import {
  MarketingPage, HeroSection, FeatureGrid, CTABanner, Container, Stack, Grid, Card, Body, H3, Box, type FeatureItem} from "@ghxstship/ui";

const INDUSTRY_SOLUTIONS: FeatureItem[] = [
  { id: "festivals", icon: <Music className="size-8" />, title: "Festivals", description: "Multi-stage event management for music festivals, food festivals, and cultural events." },
  { id: "corporate", icon: <Building2 className="size-8" />, title: "Corporate Events", description: "Professional event management for conferences, trade shows, and corporate gatherings." },
  { id: "concerts", icon: <Mic className="size-8" />, title: "Concerts & Tours", description: "Tour and concert production management for artists and promoters." },
  { id: "theater", icon: <Award className="size-8" />, title: "Theater & Film", description: "Theater and film production management with comprehensive crew coordination." },
  { id: "sports", icon: <Users className="size-8" />, title: "Sports Events", description: "Sports event production from local tournaments to major championships." },
  { id: "broadcast", icon: <Camera className="size-8" />, title: "Broadcast & Media", description: "Live broadcast and media production with real-time coordination." },
];

const ROLE_SOLUTIONS = [
  { id: "producers", title: "Producers", description: "End-to-end production management tools for executive and line producers.", icon: <Briefcase className="size-6" />, href: "/solutions/producers" },
  { id: "project-managers", title: "Project Managers", description: "Timeline, budget, and resource management for production PMs.", icon: <Users className="size-6" />, href: "/solutions/project-managers" },
  { id: "artists", title: "Artists & Talent", description: "Booking management, scheduling, and career tools for performers.", icon: <Mic className="size-6" />, href: "/solutions/artists" },
  { id: "contractors", title: "Contractors", description: "Freelance business tools for independent production professionals.", icon: <Wrench className="size-6" />, href: "/solutions/contractors" },
  { id: "production-crews", title: "Production Crews", description: "Crew coordination, call sheets, and communication tools.", icon: <UserCheck className="size-6" />, href: "/solutions/production-crews" },
  { id: "destinations", title: "Venues & Destinations", description: "Venue management and event hosting coordination.", icon: <MapPin className="size-6" />, href: "/solutions/destinations" },
  { id: "sponsors", title: "Sponsors & Brands", description: "Sponsorship activation and brand partnership management.", icon: <DollarSign className="size-6" />, href: "/solutions/sponsors" },
  { id: "promoters", title: "Promoters", description: "Event promotion, ticketing integration, and marketing tools.", icon: <Megaphone className="size-6" />, href: "/solutions/promoters" },
  { id: "public-safety", title: "Public Safety", description: "Safety planning, emergency coordination, and compliance tools.", icon: <Shield className="size-6" />, href: "/solutions/public-safety" },
];

export default function SolutionsPage() {
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
              kicker="Platform"
              title="Solutions for Every Production"
              description="Whether you are managing festivals, corporate events, or film productions, ATLVS has the tools you need. Find the right solution for your industry and role."
              primaryCta={{
                label: "Request Demo",
                onClick: () => router.push("/demo"),
              }}
              secondaryCta={{
                label: "View Pricing",
                onClick: () => router.push("/pricing"),
              }}
              background="gradient"
              pattern="none"
              fullHeight={false}
              align="center"
            />
          ),
        },
        {
          id: "industries",
          background: "ink",
          pattern: "grid",
          patternOpacity: 0.03,
          content: (
            <FeatureGrid
              kicker="By Industry"
              title="Industry Solutions"
              description="Tailored solutions for your specific industry and event type"
              features={INDUSTRY_SOLUTIONS}
              columns={3}
              variant="bordered"
              background="ink"
              align="center"
            />
          ),
        },
        {
          id: "roles",
          background: "black",
          content: (
            <Container size="2xl" className="py-20">
              <Stack gap={8}>
                <Stack gap={4} className="text-center items-center">
                  <Body className="text-primary uppercase tracking-kicker font-weight-semibold">By Role</Body>
                  <H3 className="text-white">Role-Based Solutions</H3>
                  <Body className="text-text-muted max-w-2xl">Tools designed for your specific role in the production ecosystem.</Body>
                </Stack>

                <Grid cols={3} gap={4} className="grid-cols-1 md:grid-cols-3">
                  {ROLE_SOLUTIONS.map((role) => (
                    <Card
                      key={role.id}
                      className="p-5 border-2 border-border rounded-card pop-card-atlvs group"
                      onClick={() => router.push(role.href)}
                    >
                      <Stack direction="horizontal" className="justify-between items-start gap-4">
                        <Stack direction="horizontal" gap={4} className="items-start">
                          <Box className="p-2 bg-primary/20 rounded-card text-primary group-hover:bg-primary group-hover:text-white transition-all">
                            {role.icon}
                          </Box>
                          <Stack gap={1}>
                            <Body className="text-white font-weight-bold group-hover:text-primary transition-colors">{role.title}</Body>
                            <Body size="sm" className="text-text-muted">{role.description}</Body>
                          </Stack>
                        </Stack>
                        <ArrowRight className="size-5 text-text-disabled group-hover:text-primary transition-colors flex-shrink-0" />
                      </Stack>
                    </Card>
                  ))}
                </Grid>
              </Stack>
            </Container>
          ),
        },
        {
          id: "cta",
          background: "primary",
          pattern: "halftone",
          content: (
            <CTABanner
              title="Not Sure Which Solution is Right for You?"
              description="Talk to our team to find the perfect solution for your production needs. We will help you get started."
              primaryCta={{
                label: "Schedule a Demo",
                onClick: () => router.push("/demo"),
              }}
              secondaryCta={{
                label: "Contact Sales",
                onClick: () => router.push("/contact?reason=sales"),
              }}
              background="primary"
            />
          ),
        },
      ]}
    />
  );
}
