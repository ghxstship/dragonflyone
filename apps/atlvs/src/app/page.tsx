"use client";

import { AtlvsAppLayout } from "../components/app-layout";
import {
  Stack,
  Grid,
  Card,
  Body,
  H2,
  H3,
  Container,
  Display,
  Box,
  Text,
  Button,
  Section,
  MarketingPage,
  HeroSection,
  CTABanner,
  FeatureGrid,
  StatsSection,
  TestimonialSection,
  BentoGrid,
  type MarketingSection,
  type FeatureItem,
  type StatItem,
  type Testimonial,
  type BentoItem,
  Kicker,
} from "@ghxstship/ui";
import { useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import NextLink from "next/link";
import {
  Tent,
  Zap,
  Palette,
  MapPin,
  HardHat,
  Building,
  Building2,
  Handshake,
  BarChart3,
  Link2,
  Clock,
  Calendar,
  Users,
  Package,
  FileText,
  DollarSign,
  Shield,
  Puzzle,
  Check,
  FastForward,
  ClipboardList,
  MessageSquare,
  Smartphone,
  Mic2,
  Briefcase,
  Camera,
  BadgeDollarSign,
  GraduationCap,
  Heart,
  Megaphone,
  Link as LinkIcon,
  Target,
  FileSignature,
  Truck,
  Route,
  Radio,
  AlertTriangle,
  IdCard,
  Receipt,
  TrendingUp,
  GitBranch,
  Sparkles,
  Lock,
  Globe,
  ArrowRight,
  Eye,
  Compass,
  ArrowRightLeft,
  LayoutGrid,
  Calculator,
  Database,
  Download,
  Ticket,
  Headphones,
  Gift,
  RefreshCw,
} from "lucide-react";
import {
  atlvsVerticals,
  atlvsProblemSection,
  atlvsPillarsSolution,
  atlvsFeatureGrid,
  atlvsCompvssSection,
  atlvsHeroSection,
  atlvsGeneratorSection,
  atlvsGvtewaySection,
  atlvsStatsSection,
  atlvsTestimonials,
  atlvsCtaSection,
} from "../data/atlvs";
import { useBrand } from "@ghxstship/config/hooks";

export const runtime = "edge";

// =============================================================================
// ATLVS LANDING PAGE
// Marketing page for ATLVS - Production Management Platform
// Design: Bold Contemporary Pop Art Adventure with ATLVS Miami Pink accent
// Uses MarketingPage template and design system components from @ghxstship/ui
// =============================================================================

// Icon map for dynamic icon rendering
const iconMap: Record<string, LucideIcon> = {
  Tent,
  Zap,
  Palette,
  MapPin,
  HardHat,
  Building,
  Building2,
  Handshake,
  BarChart3,
  Link2,
  Clock,
  Calendar,
  Users,
  Package,
  FileText,
  DollarSign,
  Shield,
  Puzzle,
  Check,
  FastForward,
  ClipboardList,
  MessageSquare,
  Smartphone,
  Mic2,
  Briefcase,
  Camera,
  BadgeDollarSign,
  GraduationCap,
  Heart,
  Megaphone,
  Link: LinkIcon,
  Target,
  FileSignature,
  Truck,
  Route,
  Radio,
  AlertTriangle,
  IdCard,
  Receipt,
  TrendingUp,
  GitBranch,
  Sparkles,
  Lock,
  Globe,
  Eye,
  Compass,
  ArrowRightLeft,
  LayoutGrid,
  Calculator,
  Database,
  Download,
  Ticket,
  Headphones,
  Gift,
  RefreshCw,
  Box: Package,
  BarChart: BarChart3,
  chaos: BarChart3,
  silos: Link2,
  clock: Clock,
};

// Helper to render icon from string name
function renderIcon(iconName: string, className: string = "h-6 w-6") {
  const IconComponent = iconMap[iconName];
  if (!IconComponent) return null;
  return <IconComponent className={className} />;
}

// =============================================================================
// HERO SOCIAL PROOF
// =============================================================================
function HeroSocialProof() {
  return (
    <Stack gap={4} className="items-center">
      <Stack direction="horizontal" gap={6} className="flex-wrap justify-center">
        <Text size="sm" className="text-text-primary">PRODUCTIONS</Text>
        <Text size="sm" className="text-text-primary">·</Text>
        <Text size="sm" className="text-text-primary">ACTIVATIONS</Text>
        <Text size="sm" className="text-text-primary">·</Text>
        <Text size="sm" className="text-text-primary">INSTALLATIONS</Text>
        <Text size="sm" className="text-text-primary">·</Text>
        <Text size="sm" className="text-text-primary">DESTINATIONS</Text>
      </Stack>
      <Text size="sm" className="text-text-muted max-w-xl text-center">
        {atlvsHeroSection.trustedBy}
      </Text>
    </Stack>
  );
}

// =============================================================================
// VERTICALS SECTION - Using BentoGrid
// =============================================================================
function VerticalsSection() {
  const bentoItems: BentoItem[] = atlvsVerticals.map((vertical, index) => ({
    id: vertical.id,
    title: vertical.title,
    description: vertical.description,
    icon: renderIcon(vertical.icon, "h-6 w-6 text-primary"),
    size: index === 0 ? "large" : "small",
    background: index === 0 ? "primary" : "default",
  }));

  return (
    <BentoGrid
      kicker="BUILT FOR HOW YOU ACTUALLY WORK"
      title="Four Verticals. One Platform."
      description="Whether you're producing festivals, activating brands, installing art, or running destinations — ATLVS speaks your language."
      items={bentoItems}
      sectionVariant="light"
    />
  );
}

// =============================================================================
// PROBLEM SECTION - Using FeatureGrid (inverted)
// =============================================================================
function ProblemSection() {
  const problemFeatures: FeatureItem[] = atlvsProblemSection.problems.map((problem, index) => ({
    id: `problem-${index}`,
    icon: renderIcon(problem.icon, "h-6 w-6 text-primary"),
    title: problem.title,
    description: problem.description,
  }));

  return (
    <FeatureGrid
      kicker="THE CHAOS STOPS HERE"
      title={atlvsProblemSection.headline}
      description={atlvsProblemSection.tagline}
      features={problemFeatures}
      columns={3}
      variant="bordered"
      sectionVariant="dark"
      align="center"
    />
  );
}

// =============================================================================
// SOLUTIONS SECTION - Four Pillars with alternating layout
// =============================================================================
function SolutionsSection() {
  return (
    <Section className="section-light bg-surface-primary py-12 sm:py-16 md:py-24 lg:py-32">
      <Container size="xl">
        <Stack gap={4} className="mb-12 text-center items-center">
          <Kicker>EVERYTHING. CONNECTED. FINALLY.</Kicker>
          <H2 className="text-text-primary">Four Pillars. One Platform.</H2>
          <Body size="lg" className="text-text-muted max-w-2xl">
            Stop duct-taping tools together. Start shipping shows.
          </Body>
        </Stack>

        <Stack gap={16}>
          {atlvsPillarsSolution.map((pillar, index) => (
            <Box
              key={pillar.id}
              className={`grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12 items-center ${
                index % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
              }`}
            >
              <Card className="aspect-video border-2 border-border bg-surface-elevated overflow-hidden">
                <Box className="flex h-full items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
                  <Text className="font-mono text-mono-sm uppercase tracking-label text-text-muted">
                    {pillar.title} Screenshot
                  </Text>
                </Box>
              </Card>

              <Stack gap={6}>
                <H3 size="lg" className="text-text-primary">
                  {pillar.title}
                </H3>
                <Body className="text-text-secondary">{pillar.description}</Body>
                <Stack gap={3}>
                  {pillar.features.map((feature) => (
                    <Stack key={feature} direction="horizontal" gap={3} className="items-start">
                      <Check className="h-5 w-5 flex-shrink-0 text-primary mt-0.5" />
                      <Body size="sm" className="text-text-secondary">
                        {feature}
                      </Body>
                    </Stack>
                  ))}
                </Stack>
                <Text className="font-mono text-mono-xs uppercase tracking-label text-primary">
                  Replaces: {pillar.replaces}
                </Text>
              </Stack>
            </Box>
          ))}
        </Stack>
      </Container>
    </Section>
  );
}

// =============================================================================
// FEATURE GRID SECTION - 30 Tools
// =============================================================================
function FeatureGridSection() {
  const features: FeatureItem[] = atlvsFeatureGrid.map((feature, index) => ({
    id: `feature-${index}`,
    icon: renderIcon(feature.icon, "h-6 w-6 text-primary"),
    title: feature.title,
    description: feature.description,
  }));

  return (
    <FeatureGrid
      kicker="30 TOOLS. ZERO GAPS."
      title="The Toolkit Without Missing Tools"
      description="Every capability you need, from first pitch to final wrap. No more 'we'll figure that out later.'"
      features={features}
      columns={3}
      variant="bordered"
      sectionVariant="light"
      pattern="grid"
      align="center"
    />
  );
}

// =============================================================================
// EXPERIENCE GENERATOR SECTION - AI-Powered Blueprint Generator
// =============================================================================
function GeneratorSection() {
  return (
    <Section className="section-dark bg-surface-primary py-12 sm:py-16 md:py-24 lg:py-32">
      <Container size="xl">
        <Stack gap={4} className="mb-12 text-center items-center">
          <Kicker>{atlvsGeneratorSection.kicker}</Kicker>
          <Display size="md" className="text-text-primary">
            {atlvsGeneratorSection.title}
          </Display>
          <Body size="lg" className="text-text-muted max-w-3xl">
            {atlvsGeneratorSection.subtitle}
          </Body>
        </Stack>

        <Body className="text-text-secondary max-w-3xl mx-auto text-center mb-12">
          {atlvsGeneratorSection.description}
        </Body>

        <Grid cols={3} gap={6} className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {atlvsGeneratorSection.features.map((feature) => (
            <Card
              key={feature.title}
              className="p-6 border-2 border-border rounded-card hover:border-primary/50 transition-colors"
            >
              <Stack gap={4}>
                <Box className="p-3 bg-primary/20 rounded-card w-fit">
                  {renderIcon(feature.icon, "h-6 w-6 text-primary")}
                </Box>
                <H3 size="sm" className="text-text-primary">
                  {feature.title}
                </H3>
                <Body size="sm" className="text-text-muted">
                  {feature.description}
                </Body>
              </Stack>
            </Card>
          ))}
        </Grid>

        <Stack gap={4} className="mt-12 items-center">
          <Stack direction="horizontal" gap={2} className="items-center">
            <Check className="h-4 w-4 text-primary" />
            <Text className="font-mono text-mono-xs uppercase tracking-label text-primary">
              {atlvsGeneratorSection.note}
            </Text>
          </Stack>
          <NextLink href={atlvsGeneratorSection.cta.href}>
            <Button variant="solid" size="lg">
              {atlvsGeneratorSection.cta.label}
            </Button>
          </NextLink>
        </Stack>
      </Container>
    </Section>
  );
}

// =============================================================================
// COMPVSS SECTION - Crew & Vendor Portal
// =============================================================================
function CompvssSection() {
  return (
    <Section className="section-light bg-surface-primary py-12 sm:py-16 md:py-24 lg:py-32">
      <Container size="xl">
        <Card className="border-2 border-border bg-surface-inverse p-6 sm:p-10 lg:p-16 rounded-card">
          <Stack gap={4} className="mb-8">
            <Kicker className="text-brand-yellow">{atlvsCompvssSection.kicker}</Kicker>
            <Display size="lg" className="text-text-primary">
              {atlvsCompvssSection.title}
            </Display>
            <Body size="lg" className="text-text-muted">
              {atlvsCompvssSection.subtitle}
            </Body>
          </Stack>

          <Box className="h-px bg-border my-8" />

          <Body className="text-text-secondary max-w-3xl mb-8">
            {atlvsCompvssSection.description}
          </Body>

          <Grid cols={3} gap={4} className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {atlvsCompvssSection.features.map((feature) => (
              <Card
                key={feature.title}
                className="p-4 border-2 border-border bg-surface-elevated rounded-card"
              >
                <Stack gap={3}>
                  <Box className="p-2 bg-surface-inverse border-2 border-border w-fit rounded-card">
                    {renderIcon(feature.icon, "h-5 w-5 text-brand-yellow")}
                  </Box>
                  <H3 size="sm" className="text-text-primary uppercase tracking-label">
                    {feature.title}
                  </H3>
                  <Body size="sm" className="text-text-muted">
                    {feature.description}
                  </Body>
                </Stack>
              </Card>
            ))}
          </Grid>

          <Stack gap={4} className="mt-8 items-start">
            <Stack direction="horizontal" gap={2} className="items-center">
              <Check className="h-4 w-4 text-brand-yellow" />
              <Text className="font-mono text-mono-xs uppercase tracking-label text-brand-yellow">
                {atlvsCompvssSection.note}
              </Text>
            </Stack>
            <NextLink href={atlvsCompvssSection.cta.href}>
              <Button variant="outline" size="md">
                {atlvsCompvssSection.cta.label}
              </Button>
            </NextLink>
          </Stack>
        </Card>
      </Container>
    </Section>
  );
}

// =============================================================================
// GVTEWAY SECTION - Consumer Membership Platform
// =============================================================================
function GvtewaySection() {
  return (
    <Section className="section-light bg-surface-primary py-12 sm:py-16 md:py-24 lg:py-32">
      <Container size="xl">
        <Card className="border-2 border-border bg-gradient-to-br from-primary/5 to-secondary/5 p-6 sm:p-10 lg:p-16 rounded-card">
          <Stack gap={4} className="mb-8">
            <Kicker className="text-brand-cyan">{atlvsGvtewaySection.kicker}</Kicker>
            <Display size="lg" className="text-text-primary">
              {atlvsGvtewaySection.title}
            </Display>
            <Body size="lg" className="text-text-muted">
              {atlvsGvtewaySection.subtitle}
            </Body>
          </Stack>

          <Box className="h-px bg-border my-8" />

          <Body className="text-text-secondary max-w-3xl mb-8">
            {atlvsGvtewaySection.description}
          </Body>

          <Grid cols={3} gap={4} className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {atlvsGvtewaySection.features.map((feature) => (
              <Card
                key={feature.title}
                className="p-4 border-2 border-border bg-surface-inverse rounded-card hover:border-brand-cyan/50 transition-colors"
              >
                <Stack gap={3}>
                  <Box className="p-2 bg-brand-cyan/10 border-2 border-brand-cyan/20 w-fit rounded-card">
                    {renderIcon(feature.icon, "h-5 w-5 text-brand-cyan")}
                  </Box>
                  <H3 size="sm" className="text-text-primary uppercase tracking-label">
                    {feature.title}
                  </H3>
                  <Body size="sm" className="text-text-muted">
                    {feature.description}
                  </Body>
                </Stack>
              </Card>
            ))}
          </Grid>

          <Stack gap={4} className="mt-8 items-start">
            <Stack direction="horizontal" gap={2} className="items-center">
              <Check className="h-4 w-4 text-brand-cyan" />
              <Text className="font-mono text-mono-xs uppercase tracking-label text-brand-cyan">
                {atlvsGvtewaySection.note}
              </Text>
            </Stack>
            <NextLink href={atlvsGvtewaySection.cta.href}>
              <Button variant="outline" size="md">
                {atlvsGvtewaySection.cta.label}
              </Button>
            </NextLink>
          </Stack>
        </Card>
      </Container>
    </Section>
  );
}

// =============================================================================
// STATS SECTION - Using StatsSection component
// =============================================================================
function StatsDisplaySection() {
  const stats: StatItem[] = atlvsStatsSection.stats.map((stat) => ({
    id: stat.id,
    value: stat.value,
    prefix: stat.prefix,
    suffix: stat.suffix,
    label: stat.label,
    description: stat.description,
  }));

  return (
    <StatsSection
      kicker={atlvsStatsSection.kicker}
      title={atlvsStatsSection.title}
      description={atlvsStatsSection.description}
      stats={stats}
      columns={4}
      variant="dark"
      backgroundStyle="primary"
      animate={true}
      align="center"
    />
  );
}

// =============================================================================
// TESTIMONIALS SECTION - Using TestimonialSection component
// =============================================================================
function TestimonialsDisplaySection() {
  const testimonials: Testimonial[] = atlvsTestimonials.testimonials.map((t) => ({
    id: t.id,
    quote: t.quote,
    author: t.author,
    rating: t.rating,
    featured: t.featured,
  }));

  return (
    <TestimonialSection
      kicker={atlvsTestimonials.kicker}
      title={atlvsTestimonials.title}
      testimonials={testimonials}
      variant="grid"
      columns={3}
      sectionVariant="light"
      showRatings={true}
    />
  );
}

// =============================================================================
// PRICING SECTION - Simplified overview with CTA to full pricing page
// =============================================================================
function PricingSection() {
  return (
    <Section className="section-light bg-surface-primary py-12 sm:py-16 md:py-24 lg:py-32">
      <Container size="xl">
        <Stack gap={4} className="mb-12 text-center items-center">
          <Kicker>PAY FOR WHAT YOU USE. NOTHING MORE.</Kicker>
          <H2 className="text-text-primary">Modular By Design</H2>
          <Body size="lg" className="text-text-muted max-w-2xl">
            Seven tiers. Three products. Use what you need. Keep what you have.
          </Body>
        </Stack>

        <Grid cols={3} gap={6} className="grid-cols-1 md:grid-cols-3">
          <Card className="p-6 border-2 border-border rounded-card text-center h-full flex flex-col">
            <Stack gap={4} className="items-center flex-1">
              <Kicker>SINGLE PRODUCTS</Kicker>
              <H3 className="text-text-primary">BYO Everything Else</H3>
              <Display size="sm" className="text-text-primary">
                From $0
              </Display>
              <Body size="sm" className="text-text-muted">
                Use one product. Keep your existing tools for everything else.
              </Body>
              <Stack gap={2} className="w-full text-left flex-1">
                <Stack direction="horizontal" gap={2} className="items-center">
                  <Check className="h-4 w-4 text-brand-cyan" />
                  <Text size="sm" className="text-text-secondary">
                    GVTEWAY — Ticketing
                  </Text>
                </Stack>
                <Stack direction="horizontal" gap={2} className="items-center">
                  <Check className="h-4 w-4 text-brand-yellow" />
                  <Text size="sm" className="text-text-secondary">
                    COMPVSS — Crews
                  </Text>
                </Stack>
                <Stack direction="horizontal" gap={2} className="items-center">
                  <Check className="h-4 w-4 text-brand-pink" />
                  <Text size="sm" className="text-text-secondary">
                    {brandName} — Business
                  </Text>
                </Stack>
              </Stack>
              <NextLink href="/pricing#single" className="w-full mt-auto">
                <Button variant="outline" size="md" fullWidth>
                  See Options
                </Button>
              </NextLink>
            </Stack>
          </Card>

          <Card className="p-6 border-2 border-primary rounded-card text-center relative h-full flex flex-col ring-2 ring-primary/20">
            <Box className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary px-3 py-1 rounded-card">
              <Text size="xs" className="text-text-primary font-weight-semibold uppercase tracking-label">
                Most Popular
              </Text>
            </Box>
            <Stack gap={4} className="items-center flex-1">
              <Kicker className="text-primary">BUNDLES</Kicker>
              <H3 className="text-text-primary">Fill The Gaps</H3>
              <Display size="sm" className="text-text-primary">
                From $249
              </Display>
              <Body size="sm" className="text-text-muted">
                Two products that work together. Keep what you love.
              </Body>
              <Stack gap={2} className="w-full text-left flex-1">
                <Stack direction="horizontal" gap={2} className="items-center">
                  <Check className="h-4 w-4 text-success" />
                  <Text size="sm" className="text-text-secondary">
                    OPERATIONS — Crews + Tickets
                  </Text>
                </Stack>
                <Stack direction="horizontal" gap={2} className="items-center">
                  <Check className="h-4 w-4 text-warning" />
                  <Text size="sm" className="text-text-secondary">
                    EXPERIENCE — Business + Tickets
                  </Text>
                </Stack>
                <Stack direction="horizontal" gap={2} className="items-center">
                  <Check className="h-4 w-4 text-secondary" />
                  <Text size="sm" className="text-text-secondary">
                    PRODUCTION — Business + Crews
                  </Text>
                </Stack>
              </Stack>
              <NextLink href="/pricing#bundles" className="w-full mt-auto">
                <Button variant="solid" size="md" fullWidth>
                  See Bundles
                </Button>
              </NextLink>
            </Stack>
          </Card>

          <Card className="p-6 border-2 border-border rounded-card text-center h-full flex flex-col">
            <Stack gap={4} className="items-center flex-1">
              <Kicker className="text-text-muted">FULL STACK</Kicker>
              <H3 className="text-text-primary">Replace Everything</H3>
              <Display size="sm" className="text-text-primary">
                $1,499
              </Display>
              <Body size="sm" className="text-text-secondary">
                All three products. Lowest fees. One platform.
              </Body>
              <Stack gap={2} className="w-full text-left flex-1">
                <Stack direction="horizontal" gap={2} className="items-center">
                  <Check className="h-4 w-4 text-primary" />
                  <Text size="sm" className="text-text-secondary">
                    {brandName} + COMPVSS + GVTEWAY
                  </Text>
                </Stack>
                <Stack direction="horizontal" gap={2} className="items-center">
                  <Check className="h-4 w-4 text-primary" />
                  <Text size="sm" className="text-text-secondary">
                    2.0% transaction fees
                  </Text>
                </Stack>
                <Stack direction="horizontal" gap={2} className="items-center">
                  <Check className="h-4 w-4 text-primary" />
                  <Text size="sm" className="text-text-secondary">
                    Dedicated CSM + SLA
                  </Text>
                </Stack>
              </Stack>
              <NextLink href="/contact?plan=enterprise" className="w-full mt-auto">
                <Button variant="outline" size="md" fullWidth>
                  Go Enterprise
                </Button>
              </NextLink>
            </Stack>
          </Card>
        </Grid>

        <Stack gap={4} className="mt-12 text-center items-center">
          <Body size="sm" className="text-text-muted">
            No per-seat charges. Unlimited users on ATLVS and COMPVSS.
          </Body>
          <NextLink href="/pricing">
            <Button variant="solid" size="md" icon={<ArrowRight className="h-4 w-4" />}>
              See Full Pricing
            </Button>
          </NextLink>
        </Stack>
      </Container>
    </Section>
  );
}

// =============================================================================
// MARKETING SECTIONS FACTORY
// =============================================================================
function createMarketingSections(router: ReturnType<typeof useRouter>, brandName: string): MarketingSection[] {
  return [
    {
      id: "hero",
      background: "gradient",
      pattern: "halftone",
      patternOpacity: 0.05,
      content: (
        <HeroSection
          kicker={atlvsHeroSection.kicker}
          title={atlvsHeroSection.title}
          description={atlvsHeroSection.description}
          primaryCta={{
            label: atlvsHeroSection.primaryCta.label,
            onClick: () => router.push(atlvsHeroSection.primaryCta.href),
          }}
          secondaryCta={{
            label: atlvsHeroSection.secondaryCta.label,
            onClick: () => router.push(atlvsHeroSection.secondaryCta.href),
          }}
          backgroundStyle="gradient"
          pattern="none"
          fullHeight={false}
          align="center"
          socialProof={<HeroSocialProof />}
        />
      ),
    },
    {
      id: "verticals",
      background: "white",
      content: <VerticalsSection />,
    },
    {
      id: "problem",
      background: "ink",
      content: <ProblemSection />,
    },
    {
      id: "solutions",
      background: "white",
      content: <SolutionsSection />,
    },
    {
      id: "feature-grid",
      background: "white",
      pattern: "grid",
      patternOpacity: 0.03,
      content: <FeatureGridSection />,
    },
    {
      id: "generator",
      background: "ink",
      pattern: "halftone",
      patternOpacity: 0.05,
      content: <GeneratorSection />,
    },
    {
      id: "compvss",
      background: "white",
      content: <CompvssSection />,
    },
    {
      id: "gvteway",
      background: "white",
      content: <GvtewaySection />,
    },
    {
      id: "stats",
      background: "gradient",
      content: <StatsDisplaySection />,
    },
    {
      id: "testimonials",
      background: "white",
      content: <TestimonialsDisplaySection />,
    },
    {
      id: "pricing",
      background: "white",
      pattern: "grid",
      patternOpacity: 0.03,
      content: <PricingSection />,
    },
    {
      id: "cta",
      background: "ink",
      pattern: "stripes",
      content: (
        <CTABanner
          title={atlvsCtaSection.title}
          description={atlvsCtaSection.description}
          primaryCta={{
            label: atlvsCtaSection.primaryCta.label,
            onClick: () => router.push(atlvsCtaSection.primaryCta.href),
          }}
          secondaryCta={{
            label: atlvsCtaSection.secondaryCta.label,
            onClick: () => router.push(atlvsCtaSection.secondaryCta.href),
          }}
          backgroundStyle="solid"
        />
      ),
    },
  ];
}

// =============================================================================
// PAGE COMPONENT
// =============================================================================
export default function Home() {
  const router = useRouter();
  const { name } = useBrand();
  const marketingSections = createMarketingSections(router, name);

  return (
    <AtlvsAppLayout variant="public" background="surface">
      <MarketingPage sections={marketingSections} inverted={false} />
    </AtlvsAppLayout>
  );
}
