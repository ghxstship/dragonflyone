import { AtlvsAppLayout } from "../../../components/app-layout";
import {
  Stack,
  Grid,
  Card,
  Body,
  H2,
  H3,
  Label,
  Container,
  Display,
  Button,
  FullBleedSection,
} from "@ghxstship/ui";
import {
  Tent,
  Calendar,
  Users,
  ClipboardList,
  Music,
  Mic2,
  MapPin,
  Check,
  ArrowRight,
} from "lucide-react";
import NextLink from "next/link";

export const runtime = "edge";

const productionsData = {
  hero: {
    kicker: "ATLVS FOR PRODUCTIONS",
    headline: "LIVE ENTERTAINMENT AT ANY SCALE",
    description:
      "From 200-person club shows to 400K-attendee festivals. Purpose-built tools for production professionals who refuse to compromise.",
  },
  stats: [
    { value: "2,400+", label: "Productions Managed" },
    { value: "47M", label: "Attendees Served" },
    { value: "99.9%", label: "Uptime SLA" },
    { value: "4.9/5", label: "Customer Rating" },
  ],
  features: [
    {
      icon: Calendar,
      title: "PRODUCTION CALENDARS",
      description:
        "Multi-show scheduling with conflict detection, resource allocation, and venue availability tracking.",
    },
    {
      icon: Users,
      title: "CREW MANAGEMENT",
      description:
        "Call sheets, check-ins, time tracking, and payroll integration. Know who's where, when.",
    },
    {
      icon: ClipboardList,
      title: "RUN OF SHOW",
      description:
        "Minute-by-minute timelines with cue sheets, stage plots, and real-time updates for your entire team.",
    },
    {
      icon: Music,
      title: "ARTIST ADVANCING",
      description:
        "Rider management, hospitality tracking, and artist liaison tools that keep talent happy.",
    },
    {
      icon: Mic2,
      title: "STAGE MANAGEMENT",
      description:
        "Technical specs, equipment tracking, and stage plot management across multiple stages.",
    },
    {
      icon: MapPin,
      title: "VENUE OPERATIONS",
      description:
        "Site plans, load-in schedules, and venue-specific workflows that adapt to any space.",
    },
  ],
  useCases: [
    {
      title: "FESTIVALS",
      description: "Multi-stage, multi-day events with thousands of moving parts.",
      examples: ["Music festivals", "Food & wine events", "Cultural celebrations"],
    },
    {
      title: "CONCERTS",
      description: "Single-artist shows from intimate venues to stadium tours.",
      examples: ["Arena tours", "Club shows", "Amphitheater series"],
    },
    {
      title: "TOURS",
      description: "Multi-city productions with consistent execution across markets.",
      examples: ["National tours", "Regional circuits", "International runs"],
    },
    {
      title: "LIVE EVENTS",
      description: "Corporate, broadcast, and special events that demand precision.",
      examples: ["Award shows", "Live broadcasts", "Corporate galas"],
    },
  ],
  testimonial: {
    quote:
      "ATLVS replaced our entire production stack. What used to take 3 tools and 47 spreadsheets now lives in one place.",
    author: "Sarah Chen",
    role: "Head of Production",
    company: "Insomniac Events",
  },
};

export default function ProductionsPage() {
  return (
    <AtlvsAppLayout variant="public" background="white" rawContent>
      {/* Hero Section */}
      <FullBleedSection background="ink" pattern="grid" patternOpacity={0.03} className="py-24">
        <Container className="mx-auto max-w-container-5xl px-6 lg:px-8">
          <Stack gap={8} className="max-w-3xl">
            <Stack direction="horizontal" gap={3} className="items-center">
              <Tent className="size-6 text-primary" />
              <Label size="xs" className="text-on-dark-muted">
                {productionsData.hero.kicker}
              </Label>
            </Stack>
            <Display size="lg" className="text-white">
              {productionsData.hero.headline}
            </Display>
            <Body size="lg" className="text-on-dark-secondary">
              {productionsData.hero.description}
            </Body>
            <Stack direction="horizontal" gap={4} className="pt-4">
              <NextLink href="/auth/signup">
                <Button variant="pop" size="lg">
                  Start Free Trial
                </Button>
              </NextLink>
              <NextLink href="/demo">
                <Button variant="outlineWhite" size="lg">
                  Watch Demo
                </Button>
              </NextLink>
            </Stack>
          </Stack>
        </Container>
      </FullBleedSection>

      {/* Stats Section */}
      <FullBleedSection background="white" className="py-16">
        <Container className="mx-auto max-w-container-5xl px-6 lg:px-8">
          <Grid cols={4} gap={8}>
            {productionsData.stats.map((stat) => (
              <Stack key={stat.label} className="text-center">
                <Display size="md" className="text-ink-950">
                  {stat.value}
                </Display>
                <Label size="xs" className="text-grey-500">
                  {stat.label}
                </Label>
              </Stack>
            ))}
          </Grid>
        </Container>
      </FullBleedSection>

      {/* Features Grid */}
      <FullBleedSection background="white" pattern="grid" patternOpacity={0.03} className="py-24">
        <Container className="mx-auto max-w-container-5xl px-6 lg:px-8">
          <Stack gap={4} className="mb-16 text-center">
            <H2 className="text-ink-950">PURPOSE-BUILT FOR PRODUCTIONS</H2>
            <Body className="mx-auto max-w-2xl text-grey-600">
              Every feature designed by production professionals, for production professionals.
            </Body>
          </Stack>

          <Grid cols={3} gap={6}>
            {productionsData.features.map((feature) => (
              <Card
                key={feature.title}
                className="flex flex-col border-2 border-ink-950 bg-white p-6 shadow-md"
              >
                <Stack gap={4}>
                  <Stack
                    className="flex size-12 items-center justify-center border-2 border-ink-950 bg-grey-100"
                  >
                    <feature.icon className="size-6 text-ink-950" />
                  </Stack>
                  <H3 size="sm" className="text-ink-950">
                    {feature.title}
                  </H3>
                  <Body size="sm" className="text-grey-600">
                    {feature.description}
                  </Body>
                </Stack>
              </Card>
            ))}
          </Grid>
        </Container>
      </FullBleedSection>

      {/* Use Cases */}
      <FullBleedSection background="ink" className="py-24">
        <Container className="mx-auto max-w-container-5xl px-6 lg:px-8">
          <Stack gap={4} className="mb-16 text-center">
            <H2 className="text-white">BUILT FOR EVERY PRODUCTION TYPE</H2>
          </Stack>

          <Grid cols={4} gap={6}>
            {productionsData.useCases.map((useCase) => (
              <Card
                key={useCase.title}
                inverted
                className="border-2 border-ink-800 bg-ink-900 p-6"
              >
                <Stack gap={4}>
                  <H3 size="sm" className="text-white">
                    {useCase.title}
                  </H3>
                  <Body size="sm" className="text-on-dark-muted">
                    {useCase.description}
                  </Body>
                  <Stack gap={2}>
                    {useCase.examples.map((example) => (
                      <Stack key={example} direction="horizontal" gap={2} className="items-center">
                        <Check className="size-3 text-primary" />
                        <Label size="xs" className="text-on-dark-secondary">
                          {example}
                        </Label>
                      </Stack>
                    ))}
                  </Stack>
                </Stack>
              </Card>
            ))}
          </Grid>
        </Container>
      </FullBleedSection>

      {/* Testimonial */}
      <FullBleedSection background="white" className="py-24">
        <Container className="mx-auto max-w-container-4xl px-6 lg:px-8">
          <Card className="border-2 border-ink-950 bg-white p-12 shadow-primary">
            <Stack gap={6} className="text-center">
              <Body size="lg" className="text-grey-700 italic">
                &ldquo;{productionsData.testimonial.quote}&rdquo;
              </Body>
              <Stack gap={1}>
                <Label size="sm" className="text-ink-950">
                  {productionsData.testimonial.author}
                </Label>
                <Label size="xs" className="text-grey-500">
                  {productionsData.testimonial.role}, {productionsData.testimonial.company}
                </Label>
              </Stack>
            </Stack>
          </Card>
        </Container>
      </FullBleedSection>

      {/* CTA */}
      <FullBleedSection background="ink" pattern="grid" patternOpacity={0.05} className="py-24">
        <Container className="mx-auto max-w-container-4xl px-6 text-center lg:px-8">
          <Stack gap={8} className="items-center">
            <Display size="md" className="text-white">
              READY TO TRANSFORM YOUR PRODUCTIONS?
            </Display>
            <Body size="lg" className="text-on-dark-secondary">
              Join 2,400+ productions already running on ATLVS.
            </Body>
            <Stack direction="horizontal" gap={4}>
              <NextLink href="/auth/signup">
                <Button variant="pop" size="lg" icon={<ArrowRight />}>
                  Start Free Trial
                </Button>
              </NextLink>
              <NextLink href="/contact">
                <Button variant="outlineWhite" size="lg">
                  Contact Sales
                </Button>
              </NextLink>
            </Stack>
          </Stack>
        </Container>
      </FullBleedSection>
    </AtlvsAppLayout>
  );
}
