import { AtlvsAppLayout } from "../../components/app-layout";
import {
  Badge,
  Body,
  Button,
  Card,
  Container,
  Display,
  FullBleedSection,
  Grid,
  H1,
  H3,
  Label,
  Stack,
  Text,
} from '@ghxstship/ui';
import { Video, Calendar, Clock, Users, ArrowRight, Play, Bell, CheckCircle } from "lucide-react";
import NextLink from "next/link";

export const runtime = "edge";

const webinarsData = {
  hero: {
    headline: "WEBINARS & LIVE EVENTS",
    description: "Join live sessions with industry experts, product demos, and deep-dive workshops to master production management.",
  },
  upcoming: [
    {
      title: "Mastering Multi-Venue Festival Operations",
      description: "Learn proven strategies for coordinating complex multi-stage festivals with hundreds of vendors and crew members.",
      date: "January 15, 2025",
      time: "2:00 PM EST",
      duration: "60 min",
      speaker: "Sarah Chen, VP of Operations at III Points",
      attendees: 245,
      category: "Best Practices",
      slug: "multi-venue-festival-ops",
      featured: true,
    },
    {
      title: "ATLVS Product Deep Dive: Advanced Budgeting",
      description: "Explore advanced budgeting features including automated forecasting, variance analysis, and real-time cost tracking.",
      date: "January 22, 2025",
      time: "1:00 PM EST",
      duration: "45 min",
      speaker: "ATLVS Product Team",
      attendees: 189,
      category: "Product Training",
      slug: "advanced-budgeting",
      featured: false,
    },
    {
      title: "Building Resilient Crew Schedules",
      description: "Discover techniques for creating flexible schedules that adapt to last-minute changes without breaking your budget.",
      date: "January 29, 2025",
      time: "3:00 PM EST",
      duration: "45 min",
      speaker: "Marcus Johnson, Production Manager",
      attendees: 156,
      category: "Best Practices",
      slug: "resilient-crew-schedules",
      featured: false,
    },
    {
      title: "API Integration Workshop: QuickBooks & Payroll",
      description: "Hands-on workshop for connecting ATLVS with your accounting and payroll systems.",
      date: "February 5, 2025",
      time: "11:00 AM EST",
      duration: "90 min",
      speaker: "Tech Team",
      attendees: 98,
      category: "Technical",
      slug: "api-quickbooks-integration",
      featured: false,
    },
  ],
  onDemand: [
    {
      title: "Getting Started with ATLVS",
      description: "Complete walkthrough of setting up your first production in ATLVS.",
      duration: "30 min",
      views: 12450,
      category: "Getting Started",
      slug: "getting-started",
    },
    {
      title: "Production Budget Fundamentals",
      description: "Build accurate budgets with templates, line items, and approval workflows.",
      duration: "45 min",
      views: 8920,
      category: "Finance",
      slug: "budget-fundamentals",
    },
    {
      title: "Crew Management Best Practices",
      description: "From hiring to timesheets - optimize your entire crew workflow.",
      duration: "50 min",
      views: 7650,
      category: "Operations",
      slug: "crew-management",
    },
    {
      title: "Contract Templates & E-Signatures",
      description: "Create reusable contracts and streamline the signing process.",
      duration: "35 min",
      views: 6340,
      category: "Documents",
      slug: "contracts-esignatures",
    },
    {
      title: "Real-time Reporting & Analytics",
      description: "Build custom dashboards and reports for stakeholder visibility.",
      duration: "40 min",
      views: 5890,
      category: "Analytics",
      slug: "reporting-analytics",
    },
    {
      title: "Mobile App for On-Site Production",
      description: "Leverage the ATLVS mobile app for field operations and real-time updates.",
      duration: "25 min",
      views: 5120,
      category: "Mobile",
      slug: "mobile-app",
    },
  ],
  categories: ["All", "Getting Started", "Best Practices", "Product Training", "Technical", "Finance", "Operations"],
  stats: [
    { value: "50+", label: "Webinars Hosted" },
    { value: "15K+", label: "Total Attendees" },
    { value: "4.8", label: "Avg. Rating" },
    { value: "100%", label: "Free Access" },
  ],
};

export default function WebinarsPage() {
  return (
    <AtlvsAppLayout variant="public" background="white" rawContent>
      {/* Hero */}
      <FullBleedSection background="ink" pattern="grid" patternOpacity={0.03} className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-5xl px-4 sm:px-6 lg:px-8">
          <Stack gap={8} className="items-center text-center">
            <Stack className="flex size-16 items-center justify-center border-2 border-ink-700 bg-ink-800">
              <Video className="size-8 text-brand-pink" />
            </Stack>
            <Label size="xs" className="text-on-dark-muted">
              LEARNING CENTER
            </Label>
            <Display size="lg" className="text-white">
              {webinarsData.hero.headline}
            </Display>
            <Body size="lg" className="max-w-2xl text-on-dark-secondary">
              {webinarsData.hero.description}
            </Body>
          </Stack>
        </Container>
      </FullBleedSection>

      {/* Stats */}
      <FullBleedSection background="white" className="py-8 border-b border-grey-200">
        <Container className="mx-auto max-w-container-5xl px-4 sm:px-6 lg:px-8">
          <Grid cols={4} gap={8}>
            {webinarsData.stats.map((stat) => (
              <Stack key={stat.label} className="text-center">
                <Display size="md" className="text-ink-950">{stat.value}</Display>
                <Label size="xs" className="text-grey-500">{stat.label}</Label>
              </Stack>
            ))}
          </Grid>
        </Container>
      </FullBleedSection>

      {/* Upcoming Webinars */}
      <FullBleedSection background="white" className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-5xl px-4 sm:px-6 lg:px-8">
          <Stack gap={4} className="mb-12">
            <H1 className="text-ink-950">UPCOMING WEBINARS</H1>
            <Body size="lg" className="text-grey-600">
              Register now to secure your spot in our live sessions.
            </Body>
          </Stack>

          {/* Featured Webinar */}
          {webinarsData.upcoming.filter(w => w.featured).map((webinar) => (
            <Card key={webinar.slug} className="mb-8 border-2 border-ink-950 bg-white p-8 shadow-brand-lg">
              <Grid cols={2} gap={8} className="items-center">
                <Stack className="flex aspect-video items-center justify-center border-2 border-ink-950 bg-grey-100">
                  <Play className="size-16 text-grey-400" />
                </Stack>
                <Stack gap={4}>
                  <Badge variant="pop" className="w-fit uppercase">Featured</Badge>
                  <H1 className="text-ink-950">{webinar.title}</H1>
                  <Body size="lg" className="text-grey-600">{webinar.description}</Body>
                  <Stack direction="horizontal" gap={6} className="flex-wrap text-grey-500">
                    <Stack direction="horizontal" gap={1} className="items-center">
                      <Calendar className="size-4" />
                      <Label size="xs">{webinar.date}</Label>
                    </Stack>
                    <Stack direction="horizontal" gap={1} className="items-center">
                      <Clock className="size-4" />
                      <Label size="xs">{webinar.time} ({webinar.duration})</Label>
                    </Stack>
                    <Stack direction="horizontal" gap={1} className="items-center">
                      <Users className="size-4" />
                      <Label size="xs">{webinar.attendees} registered</Label>
                    </Stack>
                  </Stack>
                  <Body size="sm" className="text-grey-500">
                    Speaker: <Text className="text-ink-950">{webinar.speaker}</Text>
                  </Body>
                  <NextLink href={`/webinars/${webinar.slug}`}>
                    <Button variant="pop" size="lg" icon={<Bell />}>
                      Register Now
                    </Button>
                  </NextLink>
                </Stack>
              </Grid>
            </Card>
          ))}

          {/* Other Upcoming */}
          <Grid cols={3} gap={6}>
            {webinarsData.upcoming.filter(w => !w.featured).map((webinar) => (
              <Card key={webinar.slug} className="border-2 border-ink-950 bg-white shadow-md transition-all hover:-translate-y-1 hover:shadow-lg">
                <Stack className="flex aspect-video items-center justify-center border-b-2 border-ink-950 bg-grey-100">
                  <Video className="size-12 text-grey-400" />
                </Stack>
                <Stack gap={4} className="p-6">
                  <Badge variant="outline" className="w-fit border-grey-300 text-grey-500">
                    {webinar.category}
                  </Badge>
                  <H3 size="sm" className="text-ink-950">{webinar.title}</H3>
                  <Body size="xs" className="text-grey-600 line-clamp-2">{webinar.description}</Body>
                  <Stack gap={2} className="text-grey-500">
                    <Stack direction="horizontal" gap={1} className="items-center">
                      <Calendar className="size-4" />
                      <Label size="xs">{webinar.date} at {webinar.time}</Label>
                    </Stack>
                    <Stack direction="horizontal" gap={1} className="items-center">
                      <Clock className="size-4" />
                      <Label size="xs">{webinar.duration}</Label>
                    </Stack>
                  </Stack>
                  <NextLink href={`/webinars/${webinar.slug}`}>
                    <Button variant="outline" size="sm" fullWidth icon={<Bell />}>
                      Register
                    </Button>
                  </NextLink>
                </Stack>
              </Card>
            ))}
          </Grid>
        </Container>
      </FullBleedSection>

      {/* On-Demand Library */}
      <FullBleedSection background="ink" className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-5xl px-4 sm:px-6 lg:px-8">
          <Stack gap={4} className="mb-12">
            <H1 className="text-white">ON-DEMAND LIBRARY</H1>
            <Body size="lg" className="text-on-dark-secondary">
              Watch recordings of past webinars at your own pace.
            </Body>
          </Stack>

          {/* Category filters */}
          <Stack direction="horizontal" gap={3} className="mb-8 flex-wrap">
            {webinarsData.categories.map((category) => (
              <Badge
                key={category}
                variant="outline"
                className={category === "All" ? "border-white bg-white text-ink-950" : "border-ink-700 text-on-dark-muted"}
              >
                {category}
              </Badge>
            ))}
          </Stack>

          <Grid cols={3} gap={6}>
            {webinarsData.onDemand.map((webinar) => (
              <Card key={webinar.slug} inverted className="border-2 border-ink-800 bg-ink-900">
                <Stack className="relative flex aspect-video items-center justify-center border-b-2 border-ink-800 bg-ink-800">
                  <Play className="size-12 text-on-dark-muted" />
                  <Stack className="absolute bottom-2 right-2 bg-ink-950 px-2 py-1">
                    <Label size="xs" className="text-white">{webinar.duration}</Label>
                  </Stack>
                </Stack>
                <Stack gap={3} className="p-6">
                  <Badge variant="outline" className="w-fit border-ink-700 text-on-dark-muted">
                    {webinar.category}
                  </Badge>
                  <H3 size="sm" className="text-white">{webinar.title}</H3>
                  <Body size="xs" className="text-on-dark-muted line-clamp-2">{webinar.description}</Body>
                  <Stack direction="horizontal" gap={1} className="items-center text-on-dark-muted">
                    <Users className="size-4" />
                    <Label size="xs">{webinar.views.toLocaleString()} views</Label>
                  </Stack>
                  <NextLink href={`/webinars/${webinar.slug}`}>
                    <Button variant="outlineWhite" size="sm" fullWidth icon={<Play />}>
                      Watch Now
                    </Button>
                  </NextLink>
                </Stack>
              </Card>
            ))}
          </Grid>
        </Container>
      </FullBleedSection>

      {/* What You'll Learn */}
      <FullBleedSection background="white" pattern="grid" patternOpacity={0.03} className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-5xl px-4 sm:px-6 lg:px-8">
          <Grid cols={2} gap={12} className="items-center">
            <Stack gap={6}>
              <H1 className="text-ink-950">WHAT YOU&apos;LL LEARN</H1>
              <Body size="lg" className="text-grey-600">
                Our webinars cover everything you need to run successful productions.
              </Body>
              <Stack gap={4}>
                {[
                  "Production planning and timeline management",
                  "Budget creation and financial tracking",
                  "Crew scheduling and availability management",
                  "Vendor coordination and contract management",
                  "Real-time reporting and stakeholder updates",
                  "Mobile workflows for on-site operations",
                ].map((item) => (
                  <Stack key={item} direction="horizontal" gap={3} className="items-center">
                    <CheckCircle className="size-5 text-brand-pink" />
                    <Body size="sm" className="text-grey-700">{item}</Body>
                  </Stack>
                ))}
              </Stack>
            </Stack>
            <Card className="border-2 border-ink-950 bg-grey-100 p-8 shadow-brand-lg">
              <Stack gap={6} className="items-center text-center">
                <Stack className="flex size-16 items-center justify-center border-2 border-ink-950 bg-white">
                  <Bell className="size-8 text-ink-950" />
                </Stack>
                <H3 className="text-ink-950">NEVER MISS A WEBINAR</H3>
                <Body size="sm" className="text-grey-600">
                  Subscribe to get notified about upcoming webinars and new on-demand content.
                </Body>
                <NextLink href="/settings/notifications" className="w-full">
                  <Button variant="pop" size="lg" fullWidth icon={<ArrowRight />}>
                    Subscribe to Updates
                  </Button>
                </NextLink>
              </Stack>
            </Card>
          </Grid>
        </Container>
      </FullBleedSection>

      {/* CTA */}
      <FullBleedSection background="ink" pattern="grid" patternOpacity={0.05} className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-4xl px-4 text-center sm:px-6 lg:px-8">
          <Stack gap={8} className="items-center">
            <Display size="md" className="text-white">
              HAVE A TOPIC SUGGESTION?
            </Display>
            <Body size="lg" className="text-on-dark-secondary">
              We&apos;re always looking for new topics to cover. Let us know what you&apos;d like to learn.
            </Body>
            <Stack direction="horizontal" gap={4}>
              <NextLink href="/contact">
                <Button variant="pop" size="lg" icon={<ArrowRight />}>
                  Suggest a Topic
                </Button>
              </NextLink>
              <NextLink href="/community">
                <Button variant="outlineWhite" size="lg">
                  Join Community
                </Button>
              </NextLink>
            </Stack>
          </Stack>
        </Container>
      </FullBleedSection>
    </AtlvsAppLayout>
  );
}
