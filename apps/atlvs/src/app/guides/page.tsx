import { AtlvsAppLayout } from "../../components/app-layout";
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
  Badge,
} from "@ghxstship/ui";
import { BookOpen, Clock, ArrowRight, Download, Users, DollarSign, Package, Calendar } from "lucide-react";
import NextLink from "next/link";

export const runtime = "edge";

const guidesData = {
  hero: {
    headline: "GUIDES & TUTORIALS",
    description: "Step-by-step guides to help you get the most out of ATLVS.",
  },
  featured: {
    title: "The Complete Guide to Production Management",
    description: "Everything you need to know about managing productions from start to finish.",
    chapters: 12,
    readTime: "45 min",
    slug: "complete-production-management",
  },
  categories: [
    {
      icon: Users,
      title: "GETTING STARTED",
      description: "New to ATLVS? Start here.",
      guides: [
        { title: "Quick Start Guide", readTime: "5 min", slug: "quick-start" },
        { title: "Setting Up Your First Project", readTime: "10 min", slug: "first-project" },
        { title: "Inviting Your Team", readTime: "5 min", slug: "inviting-team" },
      ],
    },
    {
      icon: DollarSign,
      title: "FINANCIAL MANAGEMENT",
      description: "Master budgets and expenses.",
      guides: [
        { title: "Creating Production Budgets", readTime: "15 min", slug: "creating-budgets" },
        { title: "Expense Tracking Best Practices", readTime: "10 min", slug: "expense-tracking" },
        { title: "Invoice Management", readTime: "8 min", slug: "invoice-management" },
      ],
    },
    {
      icon: Package,
      title: "ASSET MANAGEMENT",
      description: "Track and manage equipment.",
      guides: [
        { title: "Setting Up Asset Tracking", readTime: "12 min", slug: "asset-tracking-setup" },
        { title: "QR Code Scanning", readTime: "5 min", slug: "qr-scanning" },
        { title: "Maintenance Scheduling", readTime: "8 min", slug: "maintenance-scheduling" },
      ],
    },
    {
      icon: Calendar,
      title: "SCHEDULING",
      description: "Coordinate crews and timelines.",
      guides: [
        { title: "Building Production Schedules", readTime: "15 min", slug: "building-schedules" },
        { title: "Crew Availability Management", readTime: "10 min", slug: "crew-availability" },
        { title: "Calendar Integrations", readTime: "8 min", slug: "calendar-integrations" },
      ],
    },
  ],
  popular: [
    { title: "Migrating from Spreadsheets", readTime: "20 min", downloads: "2.4K", slug: "migrating-spreadsheets" },
    { title: "Advanced Reporting", readTime: "15 min", downloads: "1.8K", slug: "advanced-reporting" },
    { title: "API Integration Guide", readTime: "25 min", downloads: "1.2K", slug: "api-integration" },
  ],
};

export default function GuidesPage() {
  return (
    <AtlvsAppLayout variant="public" background="white" rawContent>
      {/* Hero */}
      <FullBleedSection background="ink" pattern="grid" patternOpacity={0.03} className="py-24">
        <Container className="mx-auto max-w-container-5xl px-6 lg:px-8">
          <Stack gap={8} className="items-center text-center">
            <Stack className="flex size-16 items-center justify-center border-2 border-ink-700 bg-ink-800">
              <BookOpen className="size-8 text-brand-pink" />
            </Stack>
            <Label size="xs" className="text-on-dark-muted">
              LEARNING CENTER
            </Label>
            <Display size="lg" className="text-white">
              {guidesData.hero.headline}
            </Display>
            <Body size="lg" className="max-w-2xl text-on-dark-secondary">
              {guidesData.hero.description}
            </Body>
          </Stack>
        </Container>
      </FullBleedSection>

      {/* Featured Guide */}
      <FullBleedSection background="white" className="py-16">
        <Container className="mx-auto max-w-container-5xl px-6 lg:px-8">
          <NextLink href={`/guides/${guidesData.featured.slug}`}>
            <Card className="border-2 border-ink-950 bg-white p-8 shadow-brand-lg transition-all hover:-translate-y-1 hover:shadow-brand-xl">
              <Stack direction="horizontal" className="flex-col items-center justify-between gap-8 sm:flex-row">
                <Stack gap={4}>
                  <Badge variant="outline" className="w-fit border-brand-pink text-brand-pink">
                    COMPREHENSIVE GUIDE
                  </Badge>
                  <H1 className="text-ink-950">{guidesData.featured.title}</H1>
                  <Body size="lg" className="text-grey-600">
                    {guidesData.featured.description}
                  </Body>
                  <Stack direction="horizontal" gap={4} className="text-grey-500">
                    <Stack direction="horizontal" gap={1} className="items-center">
                      <BookOpen className="size-4" />
                      <Label size="xs">{guidesData.featured.chapters} chapters</Label>
                    </Stack>
                    <Stack direction="horizontal" gap={1} className="items-center">
                      <Clock className="size-4" />
                      <Label size="xs">{guidesData.featured.readTime}</Label>
                    </Stack>
                  </Stack>
                </Stack>
                <Button variant="pop" size="lg" icon={<ArrowRight />}>
                  Start Reading
                </Button>
              </Stack>
            </Card>
          </NextLink>
        </Container>
      </FullBleedSection>

      {/* Guide Categories */}
      <FullBleedSection background="white" pattern="grid" patternOpacity={0.03} className="py-24">
        <Container className="mx-auto max-w-container-5xl px-6 lg:px-8">
          <Grid cols={2} gap={8} className="sm:grid-cols-1">
            {guidesData.categories.map((category) => (
              <Card key={category.title} className="border-2 border-ink-950 bg-white p-8 shadow-md">
                <Stack gap={6}>
                  <Stack direction="horizontal" gap={4} className="items-start">
                    <Stack className="flex size-12 items-center justify-center border-2 border-ink-950 bg-grey-100">
                      <category.icon className="size-6 text-ink-950" />
                    </Stack>
                    <Stack gap={1}>
                      <H3 className="text-ink-950">{category.title}</H3>
                      <Label size="xs" className="text-grey-500">{category.description}</Label>
                    </Stack>
                  </Stack>
                  <Stack gap={3}>
                    {category.guides.map((guide) => (
                      <NextLink key={guide.slug} href={`/guides/${guide.slug}`}>
                        <Stack direction="horizontal" className="items-center justify-between border-b border-grey-200 pb-3 transition-colors hover:border-brand-pink">
                          <Label size="sm" className="text-ink-950">{guide.title}</Label>
                          <Label size="xs" className="text-grey-400">{guide.readTime}</Label>
                        </Stack>
                      </NextLink>
                    ))}
                  </Stack>
                </Stack>
              </Card>
            ))}
          </Grid>
        </Container>
      </FullBleedSection>

      {/* Popular Downloads */}
      <FullBleedSection background="ink" className="py-24">
        <Container className="mx-auto max-w-container-5xl px-6 lg:px-8">
          <Stack gap={4} className="mb-12 text-center">
            <H1 className="text-white">POPULAR DOWNLOADS</H1>
            <Body size="lg" className="text-on-dark-secondary">
              Our most downloaded guides and resources.
            </Body>
          </Stack>

          <Grid cols={3} gap={6} className="sm:grid-cols-1">
            {guidesData.popular.map((guide) => (
              <Card key={guide.slug} inverted className="border-2 border-ink-800 bg-ink-900 p-6">
                <Stack gap={4}>
                  <H3 size="sm" className="text-white">{guide.title}</H3>
                  <Stack direction="horizontal" gap={4} className="text-on-dark-muted">
                    <Stack direction="horizontal" gap={1} className="items-center">
                      <Clock className="size-4" />
                      <Label size="xs">{guide.readTime}</Label>
                    </Stack>
                    <Stack direction="horizontal" gap={1} className="items-center">
                      <Download className="size-4" />
                      <Label size="xs">{guide.downloads} downloads</Label>
                    </Stack>
                  </Stack>
                  <NextLink href={`/guides/${guide.slug}`}>
                    <Button variant="outlineWhite" size="sm" className="w-full" icon={<Download />}>
                      Download PDF
                    </Button>
                  </NextLink>
                </Stack>
              </Card>
            ))}
          </Grid>
        </Container>
      </FullBleedSection>

      {/* CTA */}
      <FullBleedSection background="white" pattern="grid" patternOpacity={0.03} className="py-24">
        <Container className="mx-auto max-w-container-4xl px-6 text-center lg:px-8">
          <Stack gap={8} className="items-center">
            <Display size="md" className="text-ink-950">
              NEED MORE HELP?
            </Display>
            <Body size="lg" className="text-grey-600">
              Our support team is here to help you succeed.
            </Body>
            <Stack direction="horizontal" gap={4}>
              <NextLink href="/help">
                <Button variant="pop" size="lg" icon={<ArrowRight />}>
                  Visit Help Center
                </Button>
              </NextLink>
              <NextLink href="/contact">
                <Button variant="outline" size="lg">
                  Contact Support
                </Button>
              </NextLink>
            </Stack>
          </Stack>
        </Container>
      </FullBleedSection>
    </AtlvsAppLayout>
  );
}
