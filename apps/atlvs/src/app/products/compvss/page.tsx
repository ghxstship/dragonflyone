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
  Box,
  Text,
} from "@ghxstship/ui";
import {
  Users,
  ArrowRight,
  Check,
  Calendar,
  Clock,
  MessageSquare,
  Truck,
  Smartphone,
  Shield,
  Bell,
  MapPin,
  type LucideIcon,
} from "lucide-react";
import NextLink from "next/link";
import { atlvsProductsData } from "../../../data/atlvs";

export const runtime = "edge";

const capabilityIcons: Record<string, LucideIcon> = {
  Users,
  Calendar,
  Clock,
  MessageSquare,
  Truck,
  Smartphone,
};

export default function CompvssProductPage() {
  const product = atlvsProductsData.compvss;

  const crewFeatures = [
    { title: "Skills & Certifications", description: "Track crew skills, certifications, and training with expiration alerts" },
    { title: "Availability Calendar", description: "Real-time availability tracking with conflict detection" },
    { title: "Performance Profiles", description: "Rate and review crew performance across productions" },
    { title: "Background Checks", description: "Integrated background check verification and compliance" },
  ];

  const schedulingFeatures = [
    { title: "Shift Management", description: "Create, assign, and manage shifts with drag-and-drop ease" },
    { title: "Show Calls & Day Sheets", description: "Generate and distribute call times automatically" },
    { title: "Load-In Coordination", description: "Coordinate vendor and crew arrivals with dock scheduling" },
    { title: "Conflict Detection", description: "Prevent double-booking with intelligent scheduling" },
  ];

  const mobileFeatures = [
    { title: "Push Notifications", description: "Instant alerts for schedule changes and announcements" },
    { title: "Digital Timesheets", description: "Clock in/out with GPS verification and photo capture" },
    { title: "Team Chat", description: "Real-time messaging for crews and departments" },
    { title: "Document Access", description: "View schedules, maps, and documents on the go" },
  ];

  return (
    <AtlvsAppLayout variant="public" background="white" rawContent>
      {/* Hero Section */}
      <FullBleedSection background="ink" pattern="grid" patternOpacity={0.03} className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-5xl px-4 sm:px-6 lg:px-8">
          <Grid cols={2} gap={12} className="items-center">
            <Stack gap={8}>
              <Stack direction="horizontal" gap={3} className="items-center">
                <Box className="p-3 border-2 border-brand-cyan bg-ink-800">
                  <Users className="h-6 w-6 text-brand-cyan" />
                </Box>
                <Label size="sm" className="text-brand-cyan uppercase tracking-kicker">
                  {product.tagline}
                </Label>
              </Stack>
              <Display size="lg" className="text-white">
                {product.headline}
              </Display>
              <Body size="lg" className="text-on-dark-secondary">
                {product.description}
              </Body>
              <Stack direction="horizontal" gap={4}>
                <NextLink href="/auth/signup">
                  <Button variant="pop" size="lg" icon={<ArrowRight />}>
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
            <Box className="hidden lg:block">
              <Card className="border-2 aspect-video border-ink-700 bg-ink-900 shadow-brand-xl">
                <Box className="flex h-full items-center justify-center">
                  <Stack gap={4} className="text-center">
                    <Smartphone className="h-16 w-16 text-grey-600 mx-auto" />
                    <Text className="font-mono text-mono-sm uppercase tracking-label text-grey-500">
                      Mobile App Preview
                    </Text>
                  </Stack>
                </Box>
              </Card>
            </Box>
          </Grid>
        </Container>
      </FullBleedSection>

      {/* Core Capabilities */}
      <FullBleedSection background="white" className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-6xl px-4 sm:px-6 lg:px-8">
          <Stack gap={12}>
            <Stack gap={4} className="text-center">
              <Label size="xs" className="text-grey-500">CORE CAPABILITIES</Label>
              <H1 className="text-ink-950">BUILT FOR PRODUCTION CREWS</H1>
              <Body size="lg" className="text-grey-600 max-w-2xl mx-auto">
                Everything your crew needs to show up prepared, stay informed, and get paid on time.
              </Body>
            </Stack>

            <Grid cols={3} gap={6} className="sm:grid-cols-1 lg:grid-cols-3">
              {product.capabilities.map((cap) => {
                const IconComponent = capabilityIcons[cap.icon] || Users;
                return (
                  <Card key={cap.title} className="border-2 border-ink-950 bg-white p-6 shadow-subtle-sm transition-all duration-150 hover:-translate-y-2 hover:shadow-brand-xl">
                    <Stack gap={4}>
                      <Box className="flex h-12 w-12 items-center justify-center border-2 border-brand-cyan bg-grey-100">
                        <IconComponent className="h-6 w-6 text-brand-cyan" />
                      </Box>
                      <H3 size="sm" className="text-ink-950">{cap.title}</H3>
                      <Body size="sm" className="text-grey-600">{cap.description}</Body>
                    </Stack>
                  </Card>
                );
              })}
            </Grid>
          </Stack>
        </Container>
      </FullBleedSection>

      {/* Crew Database */}
      <FullBleedSection background="white" pattern="grid" patternOpacity={0.03} className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-6xl px-4 sm:px-6 lg:px-8">
          <Grid cols={2} gap={12} className="items-center">
            <Stack gap={8}>
              <Stack gap={2}>
                <Label size="xs" className="text-brand-cyan uppercase tracking-kicker">CREW DATABASE</Label>
                <H1 className="text-ink-950">KNOW YOUR CREW</H1>
              </Stack>
              <Body size="lg" className="text-grey-600">
                Build a comprehensive database of your production crew with skills, certifications, and performance history. Find the right person for every role.
              </Body>
              <Stack gap={3}>
                {crewFeatures.map((feature) => (
                  <Stack key={feature.title} direction="horizontal" gap={3} className="items-start">
                    <Check className="h-5 w-5 mt-0.5 shrink-0 text-brand-cyan" />
                    <Stack gap={1}>
                      <Text size="sm" weight="medium" className="text-ink-950">{feature.title}</Text>
                      <Text size="xs" className="text-grey-500">{feature.description}</Text>
                    </Stack>
                  </Stack>
                ))}
              </Stack>
            </Stack>
            <Box className="hidden lg:block">
              <Card className="border-2 aspect-square border-ink-950 bg-grey-100 shadow-brand-lg">
                <Box className="flex h-full items-center justify-center p-8">
                  <Stack gap={4} className="text-center">
                    <Users className="h-16 w-16 text-grey-400 mx-auto" />
                    <Text className="font-mono text-mono-sm uppercase tracking-label text-grey-400">
                      Crew Directory
                    </Text>
                  </Stack>
                </Box>
              </Card>
            </Box>
          </Grid>
        </Container>
      </FullBleedSection>

      {/* Scheduling */}
      <FullBleedSection background="ink" className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-6xl px-4 sm:px-6 lg:px-8">
          <Grid cols={2} gap={12} className="items-center">
            <Box className="hidden lg:block">
              <Card className="border-2 aspect-square border-ink-700 bg-ink-900 shadow-brand-lg">
                <Box className="flex h-full items-center justify-center p-8">
                  <Stack gap={4} className="text-center">
                    <Calendar className="h-16 w-16 text-grey-600 mx-auto" />
                    <Text className="font-mono text-mono-sm uppercase tracking-label text-grey-500">
                      Scheduling Dashboard
                    </Text>
                  </Stack>
                </Box>
              </Card>
            </Box>
            <Stack gap={8}>
              <Stack gap={2}>
                <Label size="xs" className="text-brand-cyan uppercase tracking-kicker">SCHEDULING</Label>
                <H1 className="text-white">ORCHESTRATE YOUR TEAM</H1>
              </Stack>
              <Body size="lg" className="text-grey-400">
                Create schedules, manage shifts, and coordinate load-ins with intelligent tools that prevent conflicts and optimize efficiency.
              </Body>
              <Stack gap={3}>
                {schedulingFeatures.map((feature) => (
                  <Stack key={feature.title} direction="horizontal" gap={3} className="items-start">
                    <Check className="h-5 w-5 mt-0.5 shrink-0 text-brand-cyan" />
                    <Stack gap={1}>
                      <Text size="sm" weight="medium" className="text-white">{feature.title}</Text>
                      <Text size="xs" className="text-grey-500">{feature.description}</Text>
                    </Stack>
                  </Stack>
                ))}
              </Stack>
            </Stack>
          </Grid>
        </Container>
      </FullBleedSection>

      {/* Mobile App */}
      <FullBleedSection background="white" className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-6xl px-4 sm:px-6 lg:px-8">
          <Grid cols={2} gap={12} className="items-center">
            <Stack gap={8}>
              <Stack gap={2}>
                <Label size="xs" className="text-brand-cyan uppercase tracking-kicker">MOBILE APP</Label>
                <H1 className="text-ink-950">EVERYTHING IN YOUR POCKET</H1>
              </Stack>
              <Body size="lg" className="text-grey-600">
                Native iOS and Android apps put everything crews need at their fingertips. Schedules, timesheets, communications, and documents—all available offline.
              </Body>
              <Stack gap={3}>
                {mobileFeatures.map((feature) => (
                  <Stack key={feature.title} direction="horizontal" gap={3} className="items-start">
                    <Check className="h-5 w-5 mt-0.5 shrink-0 text-brand-cyan" />
                    <Stack gap={1}>
                      <Text size="sm" weight="medium" className="text-ink-950">{feature.title}</Text>
                      <Text size="xs" className="text-grey-500">{feature.description}</Text>
                    </Stack>
                  </Stack>
                ))}
              </Stack>
              <Stack direction="horizontal" gap={4}>
                <Button variant="outline" size="sm">
                  Download for iOS
                </Button>
                <Button variant="outline" size="sm">
                  Download for Android
                </Button>
              </Stack>
            </Stack>
            <Box className="hidden lg:block">
              <Card className="border-2 aspect-[9/16] max-w-[300px] mx-auto border-ink-950 bg-grey-100 shadow-brand-lg">
                <Box className="flex h-full items-center justify-center p-8">
                  <Stack gap={4} className="text-center">
                    <Smartphone className="h-16 w-16 text-grey-400 mx-auto" />
                    <Text className="font-mono text-mono-sm uppercase tracking-label text-grey-400">
                      Mobile App
                    </Text>
                  </Stack>
                </Box>
              </Card>
            </Box>
          </Grid>
        </Container>
      </FullBleedSection>

      {/* Key Benefits */}
      <FullBleedSection background="white" pattern="grid" patternOpacity={0.03} className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-5xl px-4 sm:px-6 lg:px-8">
          <Stack gap={12}>
            <Stack gap={4} className="text-center">
              <H1 className="text-ink-950">WHY CREWS LOVE COMPVSS</H1>
            </Stack>

            <Grid cols={4} gap={6} className="sm:grid-cols-2">
              <Card className="border-2 border-ink-950 bg-white p-6 text-center">
                <Stack gap={3} className="items-center">
                  <Box className="flex h-12 w-12 items-center justify-center border-2 border-brand-cyan bg-grey-100">
                    <Bell className="h-6 w-6 text-brand-cyan" />
                  </Box>
                  <H3 size="sm" className="text-ink-950">INSTANT ALERTS</H3>
                  <Body size="xs" className="text-grey-600">
                    Never miss a schedule change or announcement
                  </Body>
                </Stack>
              </Card>

              <Card className="border-2 border-ink-950 bg-white p-6 text-center">
                <Stack gap={3} className="items-center">
                  <Box className="flex h-12 w-12 items-center justify-center border-2 border-brand-cyan bg-grey-100">
                    <Clock className="h-6 w-6 text-brand-cyan" />
                  </Box>
                  <H3 size="sm" className="text-ink-950">FAST PAYMENTS</H3>
                  <Body size="xs" className="text-grey-600">
                    Digital timesheets mean faster payroll processing
                  </Body>
                </Stack>
              </Card>

              <Card className="border-2 border-ink-950 bg-white p-6 text-center">
                <Stack gap={3} className="items-center">
                  <Box className="flex h-12 w-12 items-center justify-center border-2 border-brand-cyan bg-grey-100">
                    <MapPin className="h-6 w-6 text-brand-cyan" />
                  </Box>
                  <H3 size="sm" className="text-ink-950">LOCATION INFO</H3>
                  <Body size="xs" className="text-grey-600">
                    Maps, parking, and venue details at your fingertips
                  </Body>
                </Stack>
              </Card>

              <Card className="border-2 border-ink-950 bg-white p-6 text-center">
                <Stack gap={3} className="items-center">
                  <Box className="flex h-12 w-12 items-center justify-center border-2 border-brand-cyan bg-grey-100">
                    <Shield className="h-6 w-6 text-brand-cyan" />
                  </Box>
                  <H3 size="sm" className="text-ink-950">COMPLIANCE</H3>
                  <Body size="xs" className="text-grey-600">
                    Track certifications and training requirements
                  </Body>
                </Stack>
              </Card>
            </Grid>
          </Stack>
        </Container>
      </FullBleedSection>

      {/* Integration with ATLVS */}
      <FullBleedSection background="ink" className="py-8 sm:py-12 lg:py-16">
        <Container className="mx-auto max-w-container-4xl px-4 sm:px-6 lg:px-8">
          <Stack direction="horizontal" className="items-center justify-between flex-wrap gap-6">
            <Stack gap={2}>
              <H3 className="text-white">Works seamlessly with ATLVS</H3>
              <Body className="text-grey-400">Crew data syncs automatically with your production management tools.</Body>
            </Stack>
            <NextLink href="/products/atlvs">
              <Button variant="outlineWhite" size="lg" icon={<ArrowRight />}>
                Learn About ATLVS
              </Button>
            </NextLink>
          </Stack>
        </Container>
      </FullBleedSection>

      {/* Final CTA */}
      <FullBleedSection background="white" pattern="grid" patternOpacity={0.03} className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-4xl px-4 text-center sm:px-6 lg:px-8">
          <Stack gap={8} className="items-center">
            <Display size="md" className="text-ink-950">
              READY TO EMPOWER YOUR CREW?
            </Display>
            <Body size="lg" className="text-grey-600 max-w-xl">
              Give your production teams the tools they need to do their best work. Start your 14-day free trial today.
            </Body>
            <Stack direction="horizontal" gap={4}>
              <NextLink href="/auth/signup">
                <Button variant="pop" size="lg" icon={<ArrowRight />}>
                  Start Free Trial
                </Button>
              </NextLink>
              <NextLink href="/pricing">
                <Button variant="outline" size="lg">
                  View Pricing
                </Button>
              </NextLink>
            </Stack>
            <Label size="xs" className="text-grey-500">
              No credit card required • 14-day free trial • Cancel anytime
            </Label>
          </Stack>
        </Container>
      </FullBleedSection>
    </AtlvsAppLayout>
  );
}
