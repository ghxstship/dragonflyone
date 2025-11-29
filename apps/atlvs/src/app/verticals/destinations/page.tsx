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
import { MapPin, Building, Calendar, Users, Star, Settings, Check, ArrowRight } from "lucide-react";
import NextLink from "next/link";

export const runtime = "edge";

const destinationsData = {
  hero: {
    kicker: "ATLVS FOR DESTINATIONS",
    headline: "VENUES, RETREATS, AND EXPERIENCE PROPERTIES",
    description:
      "Spaces designed for extraordinary moments. Manage property operations, bookings, and guest experiences at any scale.",
  },
  stats: [
    { value: "320+", label: "Properties Managed" },
    { value: "4.2M", label: "Guests Annually" },
    { value: "28", label: "Countries" },
    { value: "4.8/5", label: "Guest Satisfaction" },
  ],
  features: [
    {
      icon: Building,
      title: "PROPERTY OPERATIONS",
      description:
        "Facility management, maintenance scheduling, and operational workflows for venues of any size.",
    },
    {
      icon: Calendar,
      title: "BOOKING MANAGEMENT",
      description:
        "Reservation systems, availability calendars, and pricing management with real-time updates.",
    },
    {
      icon: Users,
      title: "GUEST EXPERIENCE FLOWS",
      description:
        "Check-in workflows, guest communications, and experience personalization tools.",
    },
    {
      icon: Star,
      title: "REPUTATION MANAGEMENT",
      description:
        "Review monitoring, feedback collection, and guest satisfaction tracking across platforms.",
    },
    {
      icon: Settings,
      title: "VENDOR COORDINATION",
      description:
        "Catering, AV, and service provider management with contract tracking and scheduling.",
    },
    {
      icon: MapPin,
      title: "MULTI-VENUE MANAGEMENT",
      description:
        "Portfolio-level visibility across multiple properties with consolidated reporting.",
    },
  ],
  useCases: [
    {
      title: "VENUES",
      description: "Event spaces, theaters, and performance halls.",
      examples: ["Concert halls", "Event spaces", "Conference centers"],
    },
    {
      title: "RETREATS",
      description: "Wellness, corporate, and creative retreat properties.",
      examples: ["Wellness retreats", "Corporate offsites", "Artist residencies"],
    },
    {
      title: "RESORTS",
      description: "Hospitality properties with experience programming.",
      examples: ["Boutique resorts", "Adventure lodges", "Eco-retreats"],
    },
    {
      title: "EXPERIENCE PROPERTIES",
      description: "Unique spaces designed for memorable moments.",
      examples: ["Pop-up venues", "Experiential spaces", "Private estates"],
    },
  ],
  testimonial: {
    quote:
      "Managing 12 properties across 4 countries used to require a team of 20. With ATLVS, we do it with 8 and deliver better guest experiences.",
    author: "James Chen",
    role: "VP of Operations",
    company: "Habitas",
  },
};

export default function DestinationsPage() {
  return (
    <AtlvsAppLayout variant="public" background="white" rawContent>
      {/* Hero Section */}
      <FullBleedSection background="ink" pattern="grid" patternOpacity={0.03} className="py-24">
        <Container className="mx-auto max-w-container-5xl px-6 lg:px-8">
          <Stack gap={8} className="max-w-3xl">
            <Stack direction="horizontal" gap={3} className="items-center">
              <MapPin className="size-6 text-[#FF006E]" />
              <Label size="xs" className="text-on-dark-muted">
                {destinationsData.hero.kicker}
              </Label>
            </Stack>
            <Display size="lg" className="text-white">
              {destinationsData.hero.headline}
            </Display>
            <Body size="lg" className="text-on-dark-secondary">
              {destinationsData.hero.description}
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
            {destinationsData.stats.map((stat) => (
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
            <H1 className="text-ink-950">PURPOSE-BUILT FOR DESTINATIONS</H1>
            <Body className="mx-auto max-w-2xl text-grey-600">
              Every feature designed by hospitality professionals, for hospitality professionals.
            </Body>
          </Stack>

          <Grid cols={3} gap={6}>
            {destinationsData.features.map((feature) => (
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
            <H1 className="text-white">BUILT FOR EVERY DESTINATION TYPE</H1>
          </Stack>

          <Grid cols={4} gap={6}>
            {destinationsData.useCases.map((useCase) => (
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
                &ldquo;{destinationsData.testimonial.quote}&rdquo;
              </Body>
              <Stack gap={1}>
                <Label size="sm" className="text-ink-950">
                  {destinationsData.testimonial.author}
                </Label>
                <Label size="xs" className="text-grey-500">
                  {destinationsData.testimonial.role}, {destinationsData.testimonial.company}
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
              READY TO TRANSFORM YOUR DESTINATIONS?
            </Display>
            <Body size="lg" className="text-on-dark-secondary">
              Join 320+ properties already running on ATLVS.
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
