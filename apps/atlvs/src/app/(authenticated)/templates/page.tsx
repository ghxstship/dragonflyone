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
  Badge,
} from "@ghxstship/ui";
import { FileText, Download, ArrowRight, Star, Users, DollarSign, Calendar, ClipboardList } from "lucide-react";
import NextLink from "next/link";

export const runtime = "edge";

const templatesData = {
  hero: {
    headline: "PRODUCTION TEMPLATES",
    description: "Ready-to-use templates to jumpstart your productions. Free for all ATLVS users.",
  },
  categories: [
    { name: "All", count: 24 },
    { name: "Budgets", count: 6 },
    { name: "Schedules", count: 5 },
    { name: "Contracts", count: 4 },
    { name: "Checklists", count: 5 },
    { name: "Reports", count: 4 },
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
    },
    {
      title: "Crew Call Sheet",
      description: "Professional call sheet template with all essential crew information.",
      category: "Schedules",
      icon: Users,
      downloads: "4.8K",
      rating: 4.8,
      slug: "crew-call-sheet",
    },
    {
      title: "Vendor Agreement",
      description: "Standard vendor contract template with customizable terms.",
      category: "Contracts",
      icon: FileText,
      downloads: "3.1K",
      rating: 4.7,
      slug: "vendor-agreement",
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
    },
    {
      title: "Production Schedule",
      description: "Week-by-week production timeline template.",
      category: "Schedules",
      icon: Calendar,
      downloads: "2.7K",
      slug: "production-schedule",
    },
    {
      title: "Expense Report",
      description: "Track and categorize production expenses.",
      category: "Reports",
      icon: DollarSign,
      downloads: "2.4K",
      slug: "expense-report",
    },
    {
      title: "Crew Contract",
      description: "Standard employment agreement for crew members.",
      category: "Contracts",
      icon: FileText,
      downloads: "2.2K",
      slug: "crew-contract",
    },
    {
      title: "Load-In Schedule",
      description: "Detailed load-in timeline with department assignments.",
      category: "Schedules",
      icon: Calendar,
      downloads: "2.0K",
      slug: "load-in-schedule",
    },
    {
      title: "Post-Event Report",
      description: "Template for documenting event outcomes and learnings.",
      category: "Reports",
      icon: ClipboardList,
      downloads: "1.8K",
      slug: "post-event-report",
    },
  ],
};

export default function TemplatesPage() {
  return (
    <AtlvsAppLayout variant="public" background="white" rawContent>
      {/* Hero */}
      <FullBleedSection background="ink" pattern="grid" patternOpacity={0.03} className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-5xl px-4 sm:px-6 lg:px-8">
          <Stack gap={8} className="items-center text-center">
            <Stack className="flex size-16 items-center justify-center border-2 border-ink-700 bg-ink-800">
              <FileText className="size-8 text-brand-pink" />
            </Stack>
            <Label size="xs" className="text-on-dark-muted">
              RESOURCES
            </Label>
            <Display size="lg" className="text-white">
              {templatesData.hero.headline}
            </Display>
            <Body size="lg" className="max-w-2xl text-on-dark-secondary">
              {templatesData.hero.description}
            </Body>
          </Stack>
        </Container>
      </FullBleedSection>

      {/* Categories */}
      <FullBleedSection background="white" className="py-8">
        <Container className="mx-auto max-w-container-5xl px-4 sm:px-6 lg:px-8">
          <Stack direction="horizontal" gap={3} className="flex-wrap justify-center">
            {templatesData.categories.map((category) => (
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
      <FullBleedSection background="white" className="py-8 sm:py-12 lg:py-16">
        <Container className="mx-auto max-w-container-5xl px-4 sm:px-6 lg:px-8">
          <Stack gap={4} className="mb-12">
            <H1 className="text-ink-950">MOST POPULAR</H1>
          </Stack>

          <Grid cols={3} gap={6} className="sm:grid-cols-2 lg:grid-cols-3">
            {templatesData.featured.map((template) => (
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
                      Download
                    </Button>
                  </NextLink>
                </Stack>
              </Card>
            ))}
          </Grid>
        </Container>
      </FullBleedSection>

      {/* All Templates */}
      <FullBleedSection background="white" pattern="grid" patternOpacity={0.03} className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-5xl px-4 sm:px-6 lg:px-8">
          <Stack gap={4} className="mb-12">
            <H1 className="text-ink-950">ALL TEMPLATES</H1>
          </Stack>

          <Grid cols={3} gap={6} className="sm:grid-cols-2 lg:grid-cols-3">
            {templatesData.templates.map((template) => (
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

      {/* CTA */}
      <FullBleedSection background="ink" pattern="grid" patternOpacity={0.05} className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-4xl px-4 text-center sm:px-6 lg:px-8">
          <Stack gap={8} className="items-center">
            <Display size="md" className="text-white">
              NEED A CUSTOM TEMPLATE?
            </Display>
            <Body size="lg" className="text-on-dark-secondary">
              Our team can help you create custom templates for your specific production needs.
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
