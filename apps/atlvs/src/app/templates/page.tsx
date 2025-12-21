"use client";

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
import { FileText, Download, ArrowRight, Star, Users, DollarSign, Calendar, ClipboardList, Sparkles } from "lucide-react";
import NextLink from "next/link";

export const runtime = "edge";

const publicTemplatesData = {
  hero: {
    headline: "FREE PRODUCTION TEMPLATES",
    subheadline: "Lead Magnet Library",
    description: "Download professional templates used by top production companies. No signup required for basic templates.",
  },
  categories: [
    { name: "All", count: 24, slug: "all" },
    { name: "Budgets", count: 6, slug: "budgets" },
    { name: "Schedules", count: 5, slug: "schedules" },
    { name: "Contracts", count: 4, slug: "contracts" },
    { name: "Checklists", count: 5, slug: "checklists" },
    { name: "Reports", count: 4, slug: "reports" },
  ],
  featured: [
    {
      title: "Festival Production Budget",
      description: "Comprehensive budget template for multi-day festivals with 50+ line items.",
      category: "Budgets",
      icon: DollarSign,
      downloads: "5.2K",
      rating: 4.9,
      slug: "festival-budget",
      premium: false,
    },
    {
      title: "Crew Call Sheet",
      description: "Professional call sheet template with all essential crew information.",
      category: "Schedules",
      icon: Users,
      downloads: "4.8K",
      rating: 4.8,
      slug: "crew-call-sheet",
      premium: false,
    },
    {
      title: "Vendor Agreement",
      description: "Standard vendor contract template with customizable terms.",
      category: "Contracts",
      icon: FileText,
      downloads: "3.1K",
      rating: 4.7,
      slug: "vendor-agreement",
      premium: false,
    },
  ],
  templates: [
    {
      title: "Event Day Checklist",
      description: "Comprehensive checklist for event day operations.",
      category: "Checklists",
      icon: ClipboardList,
      downloads: "2.9K",
      slug: "event-day-checklist",
      premium: false,
    },
    {
      title: "Production Schedule",
      description: "Week-by-week production timeline template.",
      category: "Schedules",
      icon: Calendar,
      downloads: "2.7K",
      slug: "production-schedule",
      premium: false,
    },
    {
      title: "Expense Report",
      description: "Track and categorize production expenses.",
      category: "Reports",
      icon: DollarSign,
      downloads: "2.4K",
      slug: "expense-report",
      premium: false,
    },
    {
      title: "Crew Contract",
      description: "Standard employment agreement for crew members.",
      category: "Contracts",
      icon: FileText,
      downloads: "2.2K",
      slug: "crew-contract",
      premium: false,
    },
    {
      title: "Load-In Schedule",
      description: "Detailed load-in timeline with department assignments.",
      category: "Schedules",
      icon: Calendar,
      downloads: "2.0K",
      slug: "load-in-schedule",
      premium: false,
    },
    {
      title: "Post-Event Report",
      description: "Template for documenting event outcomes and learnings.",
      category: "Reports",
      icon: ClipboardList,
      downloads: "1.8K",
      slug: "post-event-report",
      premium: false,
    },
  ],
  premiumTeaser: [
    {
      title: "Multi-Event Budget Pack",
      description: "10 specialized budget templates for different event types.",
      category: "Budgets",
      icon: DollarSign,
      slug: "multi-event-budget-pack",
    },
    {
      title: "Complete Contract Suite",
      description: "15 legally-reviewed contract templates for all vendor types.",
      category: "Contracts",
      icon: FileText,
      slug: "complete-contract-suite",
    },
    {
      title: "Production Playbook",
      description: "Full production workflow with 25+ interconnected templates.",
      category: "Checklists",
      icon: ClipboardList,
      slug: "production-playbook",
    },
  ],
};

export default function PublicTemplatesPage() {
  return (
    <AtlvsAppLayout variant="public" background="white" rawContent>
      {/* Hero */}
      <FullBleedSection background="ink" pattern="grid" patternOpacity={0.03} className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-5xl px-4 sm:px-6 lg:px-8">
          <Stack gap={8} className="items-center text-center">
            <Stack className="flex size-16 items-center justify-center border-2 border-ink-700 bg-ink-800">
              <FileText className="size-8 text-brand-pink" />
            </Stack>
            <Badge variant="solid" className="uppercase">
              {publicTemplatesData.hero.subheadline}
            </Badge>
            <Display size="lg" className="text-white">
              {publicTemplatesData.hero.headline}
            </Display>
            <Body size="lg" className="max-w-2xl text-on-dark-secondary">
              {publicTemplatesData.hero.description}
            </Body>
            <Stack direction="horizontal" gap={4}>
              <NextLink href="#templates">
                <Button variant="pop" size="lg" icon={<Download />}>
                  Browse Templates
                </Button>
              </NextLink>
              <NextLink href="/auth/signup">
                <Button variant="outlineWhite" size="lg" icon={<Sparkles />}>
                  Get Premium Access
                </Button>
              </NextLink>
            </Stack>
          </Stack>
        </Container>
      </FullBleedSection>

      {/* Categories */}
      <FullBleedSection background="white" className="py-8">
        <Container className="mx-auto max-w-container-5xl px-4 sm:px-6 lg:px-8">
          <Stack direction="horizontal" gap={3} className="flex-wrap justify-center">
            {publicTemplatesData.categories.map((category) => (
              <Badge
                key={category.name}
                variant="outline"
                className={category.name === "All" ? "border-ink-950 bg-ink-950 text-white" : "border-ink-950 text-ink-950"}
              >
                {category.name} ({category.count})
              </Badge>
            ))}
          </Stack>
        </Container>
      </FullBleedSection>

      {/* Featured Templates */}
      <FullBleedSection id="templates" background="white" className="py-8 sm:py-12 lg:py-16">
        <Container className="mx-auto max-w-container-5xl px-4 sm:px-6 lg:px-8">
          <Stack gap={4} className="mb-12">
            <H1 className="text-ink-950">MOST POPULAR</H1>
            <Body className="text-grey-600">Free to download, no signup required</Body>
          </Stack>

          <Grid cols={3} gap={6}>
            {publicTemplatesData.featured.map((template) => (
              <Card key={template.slug} className="border-2 border-ink-950 bg-white shadow-brand-lg">
                <Stack className="flex aspect-video items-center justify-center border-b-2 border-ink-950 bg-grey-100">
                  <template.icon className="size-12 text-grey-400" />
                </Stack>
                <Stack gap={4} className="p-6">
                  <Badge variant="outline" className="w-fit border-brand-pink text-brand-pink">
                    {template.category}
                  </Badge>
                  <H3 className="text-ink-950">{template.title}</H3>
                  <Body size="sm" className="text-grey-600">
                    {template.description}
                  </Body>
                  <Stack direction="horizontal" className="items-center justify-between">
                    <Stack direction="horizontal" gap={1} className="items-center text-grey-500">
                      <Download className="size-4" />
                      <Label size="xs">{template.downloads}</Label>
                    </Stack>
                    <Stack direction="horizontal" gap={1} className="items-center text-brand-pink">
                      <Star className="size-4 fill-current" />
                      <Label size="xs">{template.rating}</Label>
                    </Stack>
                  </Stack>
                  <NextLink href={`/templates/${template.slug}`}>
                    <Button variant="pop" size="sm" className="w-full" icon={<Download />}>
                      Download Free
                    </Button>
                  </NextLink>
                </Stack>
              </Card>
            ))}
          </Grid>
        </Container>
      </FullBleedSection>

      {/* All Free Templates */}
      <FullBleedSection background="white" pattern="grid" patternOpacity={0.03} className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-5xl px-4 sm:px-6 lg:px-8">
          <Stack gap={4} className="mb-12">
            <H1 className="text-ink-950">ALL FREE TEMPLATES</H1>
          </Stack>

          <Grid cols={3} gap={6}>
            {publicTemplatesData.templates.map((template) => (
              <Card key={template.slug} className="border-2 border-ink-950 bg-white p-6 shadow-md transition-all hover:-translate-y-1 hover:shadow-lg">
                <Stack gap={4}>
                  <Stack direction="horizontal" gap={4} className="items-start">
                    <Stack className="flex size-12 items-center justify-center border-2 border-ink-950 bg-grey-100">
                      <template.icon className="size-6 text-ink-950" />
                    </Stack>
                    <Stack gap={1} className="flex-1">
                      <H3 size="sm" className="text-ink-950">{template.title}</H3>
                      <Badge variant="outline" className="w-fit border-grey-300 text-grey-500">
                        {template.category}
                      </Badge>
                    </Stack>
                  </Stack>
                  <Body size="xs" className="text-grey-600">
                    {template.description}
                  </Body>
                  <Stack direction="horizontal" className="items-center justify-between">
                    <Stack direction="horizontal" gap={1} className="items-center text-grey-500">
                      <Download className="size-4" />
                      <Label size="xs">{template.downloads} downloads</Label>
                    </Stack>
                    <NextLink href={`/templates/${template.slug}`}>
                      <Button variant="outline" size="sm" icon={<Download />}>
                        Get
                      </Button>
                    </NextLink>
                  </Stack>
                </Stack>
              </Card>
            ))}
          </Grid>
        </Container>
      </FullBleedSection>

      {/* Premium Templates Teaser */}
      <FullBleedSection background="grey" className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-5xl px-4 sm:px-6 lg:px-8">
          <Stack gap={4} className="mb-12 text-center">
            <Badge variant="pink" className="mx-auto w-fit uppercase">
              Premium Access
            </Badge>
            <Display size="md" className="text-ink-950">
              UNLOCK 200+ PREMIUM TEMPLATES
            </Display>
            <Body size="lg" className="mx-auto max-w-2xl text-grey-600">
              Get access to our complete template library with your ATLVS subscription. Includes custom branding, team sharing, and more.
            </Body>
          </Stack>

          <Grid cols={3} gap={6} className="mb-12">
            {publicTemplatesData.premiumTeaser.map((template) => (
              <Card key={template.slug} className="relative overflow-hidden border-2 border-ink-950 bg-white p-6">
                <Stack className="absolute right-0 top-0 bg-brand-pink px-3 py-1">
                  <Label size="xs" className="text-white uppercase">Premium</Label>
                </Stack>
                <Stack gap={4}>
                  <Stack className="flex size-12 items-center justify-center border-2 border-ink-950 bg-grey-100">
                    <template.icon className="size-6 text-ink-950" />
                  </Stack>
                  <H3 size="sm" className="text-ink-950">{template.title}</H3>
                  <Body size="xs" className="text-grey-600">
                    {template.description}
                  </Body>
                  <Badge variant="outline" className="w-fit border-grey-300 text-grey-500">
                    {template.category}
                  </Badge>
                </Stack>
              </Card>
            ))}
          </Grid>

          <Stack className="items-center">
            <NextLink href="/auth/signup">
              <Button variant="pop" size="lg" icon={<ArrowRight />}>
                Start Free Trial
              </Button>
            </NextLink>
          </Stack>
        </Container>
      </FullBleedSection>

      {/* CTA */}
      <FullBleedSection background="ink" pattern="grid" patternOpacity={0.05} className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-4xl px-4 text-center sm:px-6 lg:px-8">
          <Stack gap={8} className="items-center">
            <Display size="md" className="text-white">
              NEED A CUSTOM TEMPLATE?
            </Display>
            <Body size="lg" className="text-on-dark-secondary">
              Our team can help you create custom templates tailored to your specific production needs.
            </Body>
            <Stack direction="horizontal" gap={4}>
              <NextLink href="/contact">
                <Button variant="pop" size="lg" icon={<ArrowRight />}>
                  Request Custom Template
                </Button>
              </NextLink>
              <NextLink href="/auth/signup">
                <Button variant="outlineWhite" size="lg">
                  Start Free Trial
                </Button>
              </NextLink>
            </Stack>
          </Stack>
        </Container>
      </FullBleedSection>
    </AtlvsAppLayout>
  );
}
