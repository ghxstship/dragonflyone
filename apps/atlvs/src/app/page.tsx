"use client";

import { AtlvsAppLayout } from "../components/app-layout";
import {
  Stack, Grid, Card, Body, H1, H3, Label, Container, Display, Article, Box, Text, Button, MarketingPage, HeroSection, CTABanner, type MarketingSection} from '@ghxstship/ui';
import { useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import NextLink from "next/link";
import {
  Tent, Zap, Palette, MapPin, HardHat, Building, Building2, Handshake, BarChart3, Link2, Clock, Calendar, Users, Package, FileText, DollarSign, Shield, Puzzle, Check, FastForward, ClipboardList, MessageSquare, Smartphone, Mic2, Briefcase, Camera, BadgeDollarSign, GraduationCap, Heart, Megaphone, Link as LinkIcon, Target, FileSignature, Truck, Route, Radio, AlertTriangle, IdCard, Receipt, TrendingUp, GitBranch, Sparkles, Lock, Globe, ArrowRight} from "lucide-react";
import {
  atlvsVerticals,
  atlvsProblemSection,
  atlvsPillarsSolution,
  atlvsFeatureGrid,
  atlvsCompvssSection,
  atlvsSocialProof,
} from "../data/atlvs";

export const runtime = "edge";

// =============================================================================
// ATLVS LANDING PAGE
// Marketing page for ATLVS - Production Management Platform
// Design: Bold Contemporary Pop Art Adventure with ATLVS Miami Pink accent
// Uses MarketingPage template from @ghxstship/ui
// =============================================================================

// Hero section social proof element
function HeroSocialProof() {
  return (
    <Stack direction="horizontal" gap={6} className="flex-wrap justify-center">
      <Text size="sm" className="text-on-dark-disabled">PRODUCTIONS</Text>
      <Text size="sm" className="text-on-dark-disabled">·</Text>
      <Text size="sm" className="text-on-dark-disabled">ACTIVATIONS</Text>
      <Text size="sm" className="text-on-dark-disabled">·</Text>
      <Text size="sm" className="text-on-dark-disabled">INSTALLATIONS</Text>
      <Text size="sm" className="text-on-dark-disabled">·</Text>
      <Text size="sm" className="text-on-dark-disabled">DESTINATIONS</Text>
    </Stack>
  );
}

function VerticalsSection() {
  return (
    <Container size="2xl" className="py-12 sm:py-16 lg:py-24">
      <Stack gap={4} className="text-center">
        <H1 className="text-on-light-primary">NATIVE TO YOUR WORLD.</H1>
        <Body className="text-on-light-muted">Four verticals. One platform. Infinite possibilities.</Body>
      </Stack>
      <Grid cols={4} gap={4} className="mt-8 md:mt-12 md:gap-6">
        {atlvsVerticals.map((vertical) => (
          <Article key={vertical.id} className="group flex h-full flex-col border-2 border-border bg-white p-4 pop-card-atlvs sm:p-6">
            <Box className="mb-4 flex h-12 w-12 items-center justify-center border-2 border-border bg-muted">
              {vertical.icon === "Tent" && <Tent className="h-6 w-6 text-on-light-primary" />}
              {vertical.icon === "Zap" && <Zap className="h-6 w-6 text-on-light-primary" />}
              {vertical.icon === "Palette" && <Palette className="h-6 w-6 text-on-light-primary" />}
              {vertical.icon === "MapPin" && <MapPin className="h-6 w-6 text-on-light-primary" />}
            </Box>
            <H3 className="font-display text-h5-md uppercase tracking-label text-on-light-primary">{vertical.title}</H3>
            <Body className="mt-3 flex-1 text-on-light-muted">{vertical.description}</Body>
            <Stack gap={1} className="mt-4">
              {vertical.features.map((feature) => (
                <Text key={feature} className="font-mono text-mono-xs uppercase tracking-label text-on-light-muted">{feature}</Text>
              ))}
            </Stack>
            <NextLink href={vertical.href} className="mt-6 inline-block font-mono text-mono-xs uppercase tracking-label text-brand-pink transition-colors hover:text-on-light-primary">
              Learn More →
            </NextLink>
          </Article>
        ))}
      </Grid>
    </Container>
  );
}

function ProblemSection() {
  return (
    <Container size="2xl" className="py-12 sm:py-16 lg:py-24">
      <H1 className="text-center text-white">
        {atlvsProblemSection.headline}
      </H1>
      <Grid cols={3} gap={4} className="mt-8 md:mt-12 md:gap-6">
        {atlvsProblemSection.problems.map((problem) => (
          <Article key={problem.title} className="border-2 border-border bg-surface-inverse p-4 pop-card-dark sm:p-6">
            <Box className="mb-4 flex h-12 w-12 items-center justify-center border-2 border-border bg-surface-elevated">
              {problem.icon === "chaos" && <BarChart3 className="h-6 w-6 text-on-dark-muted" />}
              {problem.icon === "silos" && <Link2 className="h-6 w-6 text-on-dark-muted" />}
              {problem.icon === "clock" && <Clock className="h-6 w-6 text-on-dark-muted" />}
            </Box>
            <H3 className="font-display text-h5-md uppercase tracking-label text-white">{problem.title}</H3>
            <Body className="mt-3 text-on-dark-muted">{problem.description}</Body>
          </Article>
        ))}
      </Grid>
      <Body className="mx-auto mt-12 max-w-2xl text-center text-body-lg text-on-dark-secondary">
        {atlvsProblemSection.tagline}
      </Body>
    </Container>
  );
}

function SolutionsSection() {
  return (
    <Container size="2xl" className="py-12 sm:py-16 lg:py-24">
      <H1 className="text-center text-on-light-primary">FOUR PILLARS. ONE PLATFORM.</H1>
      <Stack gap={8} className="mt-8 sm:mt-12 sm:gap-16">
        {atlvsPillarsSolution.map((pillar, index) => (
          <Article key={pillar.id} className={`grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-2 ${index % 2 === 1 ? "lg:flex-row-reverse" : ""}`}>
            <Card className={`border-2 aspect-video border-border bg-muted shadow-[4px_4px_0_rgba(0,0,0,0.15)] ${index % 2 === 1 ? "lg:order-2" : ""}`}>
              <Box className="flex h-full items-center justify-center">
                <Text className="font-mono text-mono-sm uppercase tracking-label text-on-light-muted">{pillar.title} Screenshot</Text>
              </Box>
            </Card>
            <Stack gap={6} className={index % 2 === 1 ? "lg:order-1" : ""}>
              <H3 className="font-display text-h3-md uppercase tracking-label text-on-light-primary">{pillar.title}</H3>
              <Body className="text-body-md text-on-light-muted">{pillar.description}</Body>
              <Stack gap={2}>
                {pillar.features.map((feature) => (
                  <Stack key={feature} direction="horizontal" gap={3} className="items-start">
                    <Check className="h-4 w-4 flex-shrink-0 text-brand-pink" />
                    <Text size="sm" className="text-on-light-secondary">{feature}</Text>
                  </Stack>
                ))}
              </Stack>
              <Text className="font-mono text-mono-xs uppercase tracking-label text-brand-pink">Replaces: {pillar.replaces}</Text>
            </Stack>
          </Article>
        ))}
      </Stack>
    </Container>
  );
}

function FeatureGridSection() {
  const iconMap: Record<string, LucideIcon> = {
    Target,
    FileSignature,
    Handshake,
    FastForward,
    DollarSign,
    Calendar,
    Building2,
    Truck,
    Route,
    ClipboardList,
    Users,
    Box: Package,
    FileText,
    Mic2,
    Clock,
    Smartphone,
    MessageSquare,
    Shield,
    Radio,
    AlertTriangle,
    IdCard,
    BarChart: BarChart3,
    Receipt,
    TrendingUp,
    GitBranch,
    Zap,
    Sparkles,
    Puzzle,
    Lock,
    Globe,
  };

  return (
    <Container size="2xl" className="py-12 sm:py-16 lg:py-24">
      <H1 className="text-center text-on-light-primary">THE TOOLKIT WITHOUT MISSING TOOLS</H1>
      <Grid cols={3} gap={4} className="mt-8 md:mt-12 md:gap-6">
        {atlvsFeatureGrid.map((feature) => {
          const IconComponent = iconMap[feature.icon];
          return (
            <Article key={feature.title} className="border-2 border-border bg-white p-4 pop-card-atlvs sm:p-6">
              <Box className="mb-4 flex h-10 w-10 items-center justify-center border-2 border-border bg-muted">
                {IconComponent && <IconComponent className="h-5 w-5 text-on-light-primary" />}
              </Box>
              <H3 className="font-display text-h6-md uppercase tracking-label text-on-light-primary">{feature.title}</H3>
              <Body className="mt-2 text-on-light-muted">{feature.description}</Body>
            </Article>
          );
        })}
      </Grid>
    </Container>
  );
}

function CompvssSection() {
  return (
    <Container size="2xl" className="py-12 sm:py-16 lg:py-24">
      <Box className="border-2 border-border bg-surface-inverse p-4 sm:p-8 lg:p-12">
        <Label className="font-mono text-mono-xs uppercase tracking-label text-brand-cyan">{atlvsCompvssSection.kicker}</Label>
        <Display className="mt-4 font-display text-display-sm uppercase text-white md:text-display-md">{atlvsCompvssSection.title}</Display>
        <Body className="mt-4 text-body-md text-on-dark-muted sm:text-body-lg">{atlvsCompvssSection.subtitle}</Body>
        <Box className="my-6 h-px bg-border sm:my-8" />
        <Body className="max-w-3xl text-on-dark-secondary sm:text-body-md">{atlvsCompvssSection.description}</Body>
        <Grid cols={3} gap={4} className="mt-6 sm:mt-8 sm:gap-6">
          {atlvsCompvssSection.features.map((feature) => (
            <Article key={feature.title} className="border-2 border-border bg-surface-elevated p-3 pop-card-compvss sm:p-4">
              <Box className="mb-2 flex h-10 w-10 items-center justify-center border-2 border-border bg-surface-inverse">
                {feature.icon === "HardHat" && <HardHat className="h-5 w-5 text-brand-cyan" />}
                {feature.icon === "Users" && <Users className="h-5 w-5 text-brand-cyan" />}
                {feature.icon === "Building" && <Building className="h-5 w-5 text-brand-cyan" />}
                {feature.icon === "Mic2" && <Mic2 className="h-5 w-5 text-brand-cyan" />}
                {feature.icon === "Briefcase" && <Briefcase className="h-5 w-5 text-brand-cyan" />}
                {feature.icon === "Camera" && <Camera className="h-5 w-5 text-brand-cyan" />}
                {feature.icon === "BadgeDollarSign" && <BadgeDollarSign className="h-5 w-5 text-brand-cyan" />}
                {feature.icon === "Handshake" && <Handshake className="h-5 w-5 text-brand-cyan" />}
                {feature.icon === "Building2" && <Building2 className="h-5 w-5 text-brand-cyan" />}
                {feature.icon === "GraduationCap" && <GraduationCap className="h-5 w-5 text-brand-cyan" />}
                {feature.icon === "Heart" && <Heart className="h-5 w-5 text-brand-cyan" />}
                {feature.icon === "Megaphone" && <Megaphone className="h-5 w-5 text-brand-cyan" />}
                {feature.icon === "Link" && <LinkIcon className="h-5 w-5 text-brand-cyan" />}
              </Box>
              <H3 className="font-display text-h6-md uppercase tracking-label text-white">{feature.title}</H3>
              <Body className="mt-2 text-on-dark-muted">{feature.description}</Body>
            </Article>
          ))}
        </Grid>
        <Stack gap={4} className="mt-8">
          <Stack direction="horizontal" gap={2} className="items-center">
            <Check className="h-4 w-4 text-brand-cyan" />
            <Text className="font-mono text-mono-xs uppercase tracking-label text-brand-cyan">{atlvsCompvssSection.note}</Text>
          </Stack>
          <NextLink href={atlvsCompvssSection.cta.href}>
            <Button variant="outline" size="md">
              {atlvsCompvssSection.cta.label}
            </Button>
          </NextLink>
        </Stack>
      </Box>
    </Container>
  );
}

function SocialProofSection() {
  return (
    <Container size="2xl" className="py-12 sm:py-16 lg:py-24">
      <H1 className="text-center text-on-light-primary">{atlvsSocialProof.headline}</H1>
      <Article className="border-2 mx-auto mt-8 max-w-4xl border-border bg-white p-4 shadow-lg sm:mt-12 sm:p-8 lg:p-12">
        <Body className="text-center text-body-md text-on-light-secondary italic sm:text-body-lg">&ldquo;{atlvsSocialProof.testimonial.quote}&rdquo;</Body>
        <Text className="mt-4 block text-center font-mono text-mono-xs uppercase tracking-label text-on-light-muted sm:mt-6 sm:text-mono-sm">
          — {atlvsSocialProof.testimonial.author}, {atlvsSocialProof.testimonial.company}
        </Text>
      </Article>
      <Grid cols={4} gap={4} className="mt-8 md:mt-12 md:gap-6">
        {atlvsSocialProof.stats.map((stat) => (
          <Stack key={stat.label} className="text-center">
            <Display className="font-display text-display-sm uppercase text-on-light-primary">{stat.value}</Display>
            <Text className="mt-2 font-mono text-mono-xs uppercase tracking-label text-on-light-muted">{stat.label}</Text>
          </Stack>
        ))}
      </Grid>
    </Container>
  );
}

function PricingSection() {
  return (
    <Container className="mx-auto max-w-container-5xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
      <Stack gap={4} className="mb-12 text-center">
        <Label size="xs" className="text-on-light-muted">PRICING</Label>
        <H1 className="text-on-light-primary">MODULAR BY DESIGN</H1>
        <Body size="lg" className="text-on-light-muted max-w-2xl mx-auto">Seven tiers. Three products. Use what you need. Keep what you have.</Body>
      </Stack>

      <Grid cols={3} gap={6}>
        <Card className="border-2 border-border bg-white p-6 text-center h-full flex flex-col">
          <Stack gap={4} className="items-center flex-1">
            <Label size="xs" className="text-on-light-muted">SINGLE PRODUCTS</Label>
            <H3 className="text-on-light-primary">BYO EVERYTHING ELSE</H3>
            <Display size="md" className="text-on-light-primary">From $0</Display>
            <Body size="sm" className="text-on-light-muted">Use one product. Keep your existing tools for everything else.</Body>
            <Stack gap={2} className="w-full text-left flex-1">
              <Stack direction="horizontal" gap={2} className="items-center"><Check className="h-4 w-4 text-brand-yellow" /><Text size="sm" className="text-on-light-secondary">GVTEWAY — Ticketing</Text></Stack>
              <Stack direction="horizontal" gap={2} className="items-center"><Check className="h-4 w-4 text-brand-cyan" /><Text size="sm" className="text-on-light-secondary">COMPVSS — Crews</Text></Stack>
              <Stack direction="horizontal" gap={2} className="items-center"><Check className="h-4 w-4 text-brand-pink" /><Text size="sm" className="text-on-light-secondary">ATLVS — Business</Text></Stack>
            </Stack>
            <NextLink href="/pricing#single" className="w-full mt-auto"><Button variant="outline" size="md" fullWidth inverted={false}>See Options</Button></NextLink>
          </Stack>
        </Card>

        <Card className="border-2 border-brand-pink bg-white p-6 text-center relative h-full flex flex-col">
          <Label size="xs" className="absolute -top-3 left-1/2 -translate-x-1/2 border-2 border-brand-pink bg-brand-pink px-3 py-1 text-white">MOST POPULAR</Label>
          <Stack gap={4} className="items-center flex-1">
            <Label size="xs" className="text-brand-pink">BUNDLES</Label>
            <H3 className="text-on-light-primary">FILL THE GAPS</H3>
            <Display size="md" className="text-on-light-primary">From $249</Display>
            <Body size="sm" className="text-on-light-muted">Two products that work together. Keep what you love.</Body>
            <Stack gap={2} className="w-full text-left flex-1">
              <Stack direction="horizontal" gap={2} className="items-center"><Check className="h-4 w-4 text-success" /><Text size="sm" className="text-on-light-secondary">OPERATIONS — Crews + Tickets</Text></Stack>
              <Stack direction="horizontal" gap={2} className="items-center"><Check className="h-4 w-4 text-warning" /><Text size="sm" className="text-on-light-secondary">EXPERIENCE — Business + Tickets</Text></Stack>
              <Stack direction="horizontal" gap={2} className="items-center"><Check className="h-4 w-4 text-secondary" /><Text size="sm" className="text-on-light-secondary">PRODUCTION — Business + Crews</Text></Stack>
            </Stack>
            <NextLink href="/pricing#bundles" className="w-full mt-auto"><Button variant="accent" size="md" fullWidth inverted={false}>See Bundles</Button></NextLink>
          </Stack>
        </Card>

        <Card inverted className="border-2 border-white p-6 text-center h-full flex flex-col">
          <Stack gap={4} className="items-center flex-1">
            <Label size="xs" className="text-on-dark-muted">FULL STACK</Label>
            <H3 className="text-white">REPLACE EVERYTHING</H3>
            <Display size="md" className="text-white">$1,499</Display>
            <Body size="sm" className="text-on-dark-secondary">All three products. Lowest fees. One platform.</Body>
            <Stack gap={2} className="w-full text-left flex-1">
              <Stack direction="horizontal" gap={2} className="items-center"><Check className="h-4 w-4 text-brand-pink" /><Text size="sm" className="text-on-dark-secondary">ATLVS + COMPVSS + GVTEWAY</Text></Stack>
              <Stack direction="horizontal" gap={2} className="items-center"><Check className="h-4 w-4 text-brand-pink" /><Text size="sm" className="text-on-dark-secondary">2.0% transaction fees</Text></Stack>
              <Stack direction="horizontal" gap={2} className="items-center"><Check className="h-4 w-4 text-brand-pink" /><Text size="sm" className="text-on-dark-secondary">Dedicated CSM + SLA</Text></Stack>
            </Stack>
            <NextLink href="/contact?plan=enterprise" className="w-full mt-auto"><Button variant="outline" size="md" fullWidth>Go Enterprise</Button></NextLink>
          </Stack>
        </Card>
      </Grid>

      <Stack gap={4} className="mt-12 text-center">
        <Body size="sm" className="text-on-light-muted">No per-seat charges. Unlimited users on ATLVS and COMPVSS.</Body>
        <NextLink href="/pricing"><Button variant="primary" size="md" inverted={false} icon={<ArrowRight />}>See Full Pricing</Button></NextLink>
      </Stack>
    </Container>
  );
}


// Marketing sections factory - needs router for navigation
function createMarketingSections(router: ReturnType<typeof useRouter>): MarketingSection[] {
  return [
    {
      id: "hero",
      background: "gradient",
      pattern: "halftone",
      patternOpacity: 0.05,
      content: (
        <HeroSection
          kicker="The Industry Standard"
          title="The Platform for Live Entertainment"
          description="Modular. Compatible. Scalable. Built for productions, activations, installations, and destinations of any size."
          primaryCta={{
            label: "Explore Products",
            onClick: () => router.push("/products"),
          }}
          secondaryCta={{
            label: "See Pricing",
            onClick: () => router.push("/pricing"),
          }}
          background="gradient"
          pattern="none"
          fullHeight={false}
          align="center"
          socialProof={<HeroSocialProof />}
        />
      ),
    },
    { id: "features", background: "white", content: <VerticalsSection /> },
    { id: "problem", background: "ink", content: <ProblemSection /> },
    { id: "solutions", background: "white", content: <SolutionsSection /> },
    { id: "feature-grid", background: "white", pattern: "grid", patternOpacity: 0.03, content: <FeatureGridSection /> },
    { id: "compvss", background: "white", content: <CompvssSection /> },
    { id: "about", background: "white", content: <SocialProofSection /> },
    { id: "pricing", background: "white", pattern: "grid", patternOpacity: 0.03, content: <PricingSection /> },
    {
      id: "cta",
      background: "ink",
      pattern: "stripes",
      content: (
        <CTABanner
          title="Not Sure Where to Start?"
          description="Modular by design. Find the tier that fits your stack."
          primaryCta={{
            label: "Explore Products",
            onClick: () => router.push("/products"),
          }}
          secondaryCta={{
            label: "See Pricing",
            onClick: () => router.push("/pricing"),
          }}
          background="ink"
        />
      ),
    },
  ];
}

export default function Home() {
  const router = useRouter();
  const marketingSections = createMarketingSections(router);

  return (
    <AtlvsAppLayout variant="public" background="white" rawContent>
      <MarketingPage
        sections={marketingSections}
        inverted={false}
      />
    </AtlvsAppLayout>
  );
}
