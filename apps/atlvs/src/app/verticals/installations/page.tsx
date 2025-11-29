import { AtlvsAppLayout } from "../../../components/app-layout";
import {
  Stack,
  Grid,
  Card,
  Body,
  H1,
  H3,
  Label,
  Container,
  Display,
  Button,
  FullBleedSection,
} from "@ghxstship/ui";
import { Palette, Wrench, FileText, Calendar, Shield, Eye, Check, ArrowRight } from "lucide-react";
import NextLink from "next/link";

export const runtime = "edge";

const installationsData = {
  hero: {
    kicker: "ATLVS FOR INSTALLATIONS",
    headline: "IMMERSIVE ENVIRONMENTS AND ARTISTIC EXHIBITIONS",
    description:
      "Permanent and temporary installations. From museum exhibitions to themed environments, manage every detail of your creative vision.",
  },
  stats: [
    { value: "850+", label: "Installations Completed" },
    { value: "23M", label: "Visitors Annually" },
    { value: "42", label: "Countries" },
    { value: "98%", label: "On-Time Delivery" },
  ],
  features: [
    {
      icon: Calendar,
      title: "BUILD SCHEDULES",
      description:
        "Phase-based project timelines with milestone tracking, dependencies, and critical path analysis.",
    },
    {
      icon: FileText,
      title: "TECHNICAL SPECS",
      description:
        "Centralized documentation for engineering specs, material lists, and fabrication requirements.",
    },
    {
      icon: Wrench,
      title: "MAINTENANCE WORKFLOWS",
      description:
        "Scheduled maintenance, repair tracking, and asset lifecycle management for permanent installations.",
    },
    {
      icon: Shield,
      title: "COMPLIANCE TRACKING",
      description:
        "Safety certifications, permits, and regulatory compliance documentation in one place.",
    },
    {
      icon: Eye,
      title: "VISITOR ANALYTICS",
      description:
        "Traffic patterns, dwell time, and engagement metrics to optimize the visitor experience.",
    },
    {
      icon: Palette,
      title: "CREATIVE COLLABORATION",
      description:
        "Artist coordination, design approvals, and creative asset management for complex installations.",
    },
  ],
  useCases: [
    {
      title: "ART INSTALLATIONS",
      description: "Large-scale artistic works and interactive experiences.",
      examples: ["Public art", "Gallery installations", "Digital art"],
    },
    {
      title: "IMMERSIVE EXPERIENCES",
      description: "Multi-sensory environments that transport visitors.",
      examples: ["Immersive theater", "VR experiences", "Sensory rooms"],
    },
    {
      title: "EXHIBITIONS",
      description: "Museum and gallery exhibitions of any scale.",
      examples: ["Museum shows", "Traveling exhibitions", "Pop-up galleries"],
    },
    {
      title: "THEMED ENVIRONMENTS",
      description: "Permanent themed spaces and attractions.",
      examples: ["Theme parks", "Retail environments", "Corporate spaces"],
    },
  ],
  testimonial: {
    quote:
      "Managing a 50,000 sq ft immersive installation across 3 cities was only possible because of ATLVS. The technical spec management alone saved us months.",
    author: "Elena Rodriguez",
    role: "Creative Director",
    company: "Meow Wolf",
  },
};

export default function InstallationsPage() {
  return (
    <AtlvsAppLayout variant="public" background="white" rawContent>
      {/* Hero Section */}
      <FullBleedSection background="ink" pattern="grid" patternOpacity={0.03} className="py-24">
        <Container className="mx-auto max-w-container-5xl px-6 lg:px-8">
          <Stack gap={8} className="max-w-3xl">
            <Stack direction="horizontal" gap={3} className="items-center">
              <Palette className="size-6 text-[#FF006E]" />
              <Label size="xs" className="text-on-dark-muted">
                {installationsData.hero.kicker}
              </Label>
            </Stack>
            <Display size="lg" className="text-white">
              {installationsData.hero.headline}
            </Display>
            <Body size="lg" className="text-on-dark-secondary">
              {installationsData.hero.description}
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
            {installationsData.stats.map((stat) => (
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
            <H1 className="text-ink-950">PURPOSE-BUILT FOR INSTALLATIONS</H1>
            <Body className="mx-auto max-w-2xl text-grey-600">
              Every feature designed by installation professionals, for installation professionals.
            </Body>
          </Stack>

          <Grid cols={3} gap={6}>
            {installationsData.features.map((feature) => (
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
            <H1 className="text-white">BUILT FOR EVERY INSTALLATION TYPE</H1>
          </Stack>

          <Grid cols={4} gap={6}>
            {installationsData.useCases.map((useCase) => (
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
                        <Check className="size-3 text-[#FF006E]" />
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
          <Card className="border-2 border-ink-950 bg-white p-12 shadow-[6px_6px_0_#FF006E]">
            <Stack gap={6} className="text-center">
              <Body size="lg" className="text-grey-700 italic">
                &ldquo;{installationsData.testimonial.quote}&rdquo;
              </Body>
              <Stack gap={1}>
                <Label size="sm" className="text-ink-950">
                  {installationsData.testimonial.author}
                </Label>
                <Label size="xs" className="text-grey-500">
                  {installationsData.testimonial.role}, {installationsData.testimonial.company}
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
              READY TO TRANSFORM YOUR INSTALLATIONS?
            </Display>
            <Body size="lg" className="text-on-dark-secondary">
              Join 850+ installations already running on ATLVS.
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
