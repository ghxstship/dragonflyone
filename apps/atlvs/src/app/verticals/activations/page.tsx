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
import { Zap, Target, Megaphone, Palette, Users, MapPin, Check, ArrowRight } from "lucide-react";
import NextLink from "next/link";

export const runtime = "edge";

const activationsData = {
  hero: {
    kicker: "ATLVS FOR ACTIVATIONS",
    headline: "BRAND EXPERIENCES THAT CREATE LASTING IMPRESSIONS",
    description:
      "Pop-ups, roadshows, experiential marketing campaigns. Build brand moments that people remember forever.",
  },
  stats: [
    { value: "1,200+", label: "Activations Delivered" },
    { value: "89M", label: "Brand Impressions" },
    { value: "340%", label: "Avg. ROI Increase" },
    { value: "48", label: "Countries Reached" },
  ],
  features: [
    {
      icon: Target,
      title: "CAMPAIGN MANAGEMENT",
      description:
        "Multi-market activation planning with budget tracking, timeline management, and KPI dashboards.",
    },
    {
      icon: Megaphone,
      title: "BRAND ASSET MANAGEMENT",
      description:
        "Centralized brand guidelines, asset libraries, and approval workflows that keep every touchpoint on-brand.",
    },
    {
      icon: Palette,
      title: "FOOTPRINT PLANNING",
      description:
        "Site selection, floor plans, and build specs for pop-ups, booths, and experiential installations.",
    },
    {
      icon: Users,
      title: "AMBASSADOR COORDINATION",
      description:
        "Staff scheduling, training materials, and real-time check-ins for brand ambassadors across markets.",
    },
    {
      icon: MapPin,
      title: "MULTI-MARKET LOGISTICS",
      description:
        "Coordinate equipment, materials, and teams across multiple cities and venues simultaneously.",
    },
    {
      icon: Zap,
      title: "REAL-TIME REPORTING",
      description:
        "Live engagement metrics, foot traffic data, and conversion tracking to prove activation ROI.",
    },
  ],
  useCases: [
    {
      title: "POP-UPS",
      description: "Temporary retail and brand experiences that create buzz.",
      examples: ["Retail pop-ups", "Product launches", "Seasonal experiences"],
    },
    {
      title: "ROADSHOWS",
      description: "Multi-city tours that bring your brand directly to audiences.",
      examples: ["Mobile tours", "Campus activations", "Festival circuits"],
    },
    {
      title: "EXPERIENTIAL",
      description: "Immersive brand experiences that engage all senses.",
      examples: ["Interactive installations", "VR/AR experiences", "Sensory marketing"],
    },
    {
      title: "SPONSORSHIPS",
      description: "Maximize brand presence at events and venues.",
      examples: ["Event sponsorships", "Venue partnerships", "Sports activations"],
    },
  ],
  testimonial: {
    quote:
      "Our activation ROI increased 340% after switching to ATLVS. The real-time reporting alone changed how we plan campaigns.",
    author: "Marcus Webb",
    role: "VP of Experiential",
    company: "Red Bull North America",
  },
};

export default function ActivationsPage() {
  return (
    <AtlvsAppLayout variant="public" background="white" rawContent>
      {/* Hero Section */}
      <FullBleedSection background="ink" pattern="grid" patternOpacity={0.03} className="py-24">
        <Container className="mx-auto max-w-container-5xl px-6 lg:px-8">
          <Stack gap={8} className="max-w-3xl">
            <Stack direction="horizontal" gap={3} className="items-center">
              <Zap className="size-6 text-primary" />
              <Label size="xs" className="text-on-dark-muted">
                {activationsData.hero.kicker}
              </Label>
            </Stack>
            <Display size="lg" className="text-white">
              {activationsData.hero.headline}
            </Display>
            <Body size="lg" className="text-on-dark-secondary">
              {activationsData.hero.description}
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
            {activationsData.stats.map((stat) => (
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
            <H2 className="text-ink-950">PURPOSE-BUILT FOR ACTIVATIONS</H2>
            <Body className="mx-auto max-w-2xl text-grey-600">
              Every feature designed by brand experience professionals, for brand experience professionals.
            </Body>
          </Stack>

          <Grid cols={3} gap={6}>
            {activationsData.features.map((feature) => (
              <Card
                key={feature.title}
                className="flex flex-col border-2 border-ink-950 bg-white p-6 shadow-md"
              >
                <Stack gap={4}>
                  <Stack className="flex size-12 items-center justify-center border-2 border-ink-950 bg-grey-100">
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
            <H2 className="text-white">BUILT FOR EVERY ACTIVATION TYPE</H2>
          </Stack>

          <Grid cols={4} gap={6}>
            {activationsData.useCases.map((useCase) => (
              <Card key={useCase.title} inverted className="border-2 border-ink-800 bg-ink-900 p-6">
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
                &ldquo;{activationsData.testimonial.quote}&rdquo;
              </Body>
              <Stack gap={1}>
                <Label size="sm" className="text-ink-950">
                  {activationsData.testimonial.author}
                </Label>
                <Label size="xs" className="text-grey-500">
                  {activationsData.testimonial.role}, {activationsData.testimonial.company}
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
              READY TO TRANSFORM YOUR ACTIVATIONS?
            </Display>
            <Body size="lg" className="text-on-dark-secondary">
              Join 1,200+ activations already running on ATLVS.
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
