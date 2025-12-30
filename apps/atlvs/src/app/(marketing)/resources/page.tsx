"use client";

/**
 * Resources Page - 2026 Landing Page Best Practices
 * Full-width marketing layout with hero, resource categories, and featured downloads
 * Bold Contemporary Pop Art Adventure Design System
 */

import { useRouter } from "next/navigation";
import { Book, FileText, Video, Download, ArrowRight, Presentation, Wrench, GraduationCap } from "lucide-react";
import {
  MarketingPage, HeroSection, FeatureGrid, CTABanner, Container, Stack, Grid, Card, Body, H3, Button, Badge} from "@ghxstship/ui";

const RESOURCE_CATEGORIES: FeatureItem[] = [
  { id: "guides", icon: <Book className="size-8" />, title: "Guides", description: "Step-by-step tutorials to help you master ATLVS and production management best practices." },
  { id: "templates", icon: <FileText className="size-8" />, title: "Templates", description: "Ready-to-use templates for production planning, budgeting, and crew management." },
  { id: "videos", icon: <Video className="size-8" />, title: "Video Tutorials", description: "Watch and learn with our comprehensive video library covering all features." },
  { id: "docs", icon: <FileText className="size-8" />, title: "Documentation", description: "Technical reference and API documentation for developers and power users." },
  { id: "webinars", icon: <Presentation className="size-8" />, title: "Webinars", description: "Live and recorded training sessions from industry experts and our team." },
  { id: "tools", icon: <Wrench className="size-8" />, title: "Tools", description: "Free calculators, estimators, and utilities to streamline your workflow." },
];

const FEATURED_RESOURCES = [
  { id: "1", title: "Production Planning Template", type: "Template", format: "XLSX", description: "Comprehensive production planning spreadsheet with timeline and resource allocation.", downloads: 2500 },
  { id: "2", title: "Budget Tracking Spreadsheet", type: "Template", format: "XLSX", description: "Track production budgets with automated calculations and variance analysis.", downloads: 1800 },
  { id: "3", title: "Crew Call Sheet Template", type: "Template", format: "PDF", description: "Professional call sheet template with all essential crew information fields.", downloads: 3200 },
  { id: "4", title: "Event Timeline Template", type: "Template", format: "PDF", description: "Visual timeline template for event scheduling and milestone tracking.", downloads: 1500 },
  { id: "5", title: "Vendor Contract Template", type: "Template", format: "DOCX", description: "Standard vendor contract template with customizable terms and conditions.", downloads: 900 },
  { id: "6", title: "Post-Production Checklist", type: "Guide", format: "PDF", description: "Comprehensive checklist for post-production wrap and asset management.", downloads: 1100 },
];

const LEARNING_PATHS = [
  { id: "beginner", title: "Getting Started", description: "New to ATLVS? Start here.", icon: <GraduationCap className="size-6" />, articles: 12, duration: "2 hours" },
  { id: "intermediate", title: "Advanced Features", description: "Master powerful features.", icon: <Wrench className="size-6" />, articles: 18, duration: "4 hours" },
  { id: "expert", title: "API & Integrations", description: "Build custom solutions.", icon: <FileText className="size-6" />, articles: 25, duration: "6 hours" },
];

export default function ResourcesPage() {
  const router = useRouter();

  return (
    <MarketingPage
      sections={[
        {
          id: "hero",
          background: "gradient",
          pattern: "halftone",
          patternOpacity: 0.05,
          content: (
            <HeroSection
              kicker="Learn"
              title="Resources & Learning"
              description="Everything you need to succeed with ATLVS. Guides, templates, video tutorials, and documentation to help you master production management."
              primaryCta={{
                label: "Browse Guides",
                onClick: () => router.push("/guides"),
              }}
              secondaryCta={{
                label: "View Documentation",
                onClick: () => router.push("/docs"),
              }}
              background="gradient"
              pattern="none"
              fullHeight={false}
              align="center"
            />
          ),
        },
        {
          id: "categories",
          background: "ink",
          pattern: "grid",
          patternOpacity: 0.03,
          content: (
            <FeatureGrid
              kicker="Browse by Category"
              title="Resource Library"
              description="Find the resources you need to succeed"
              features={RESOURCE_CATEGORIES}
              columns={3}
              variant="bordered"
              background="ink"
              align="center"
            />
          ),
        },
        {
          id: "learning-paths",
          background: "black",
          content: (
            <Container size="xl" className="py-20">
              <Stack gap={8}>
                <Stack gap={4} className="text-center items-center">
                  <Body className="text-primary uppercase tracking-kicker font-weight-semibold">Learning Paths</Body>
                  <H3 className="text-white">Structured Learning</H3>
                  <Body className="text-on-dark-muted max-w-2xl">Follow our curated learning paths to master ATLVS at your own pace.</Body>
                </Stack>

                <Grid cols={3} gap={6} className="grid-cols-1 md:grid-cols-3">
                  {LEARNING_PATHS.map((path) => (
                    <Card
                      key={path.id}
                      className="p-6 border-2 border-grey-800 rounded-card cursor-pointer hover:border-primary/50 transition-all group"
                      onClick={() => router.push(`/guides/${path.id}`)}
                    >
                      <Stack gap={4}>
                        <div className="p-3 bg-primary/20 rounded-card text-primary w-fit group-hover:bg-primary group-hover:text-white transition-all">
                          {path.icon}
                        </div>
                        <Stack gap={2}>
                          <Body className="text-white font-weight-bold group-hover:text-primary transition-colors">{path.title}</Body>
                          <Body className="text-on-dark-muted">{path.description}</Body>
                        </Stack>
                        <Stack direction="horizontal" gap={4} className="text-on-dark-disabled">
                          <Body size="sm">{path.articles} articles</Body>
                          <Body size="sm">{path.duration}</Body>
                        </Stack>
                        <Button variant="outline" size="sm" className="w-fit group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-colors" icon={<ArrowRight className="size-4" />} iconPosition="right">
                          Start Learning
                        </Button>
                      </Stack>
                    </Card>
                  ))}
                </Grid>
              </Stack>
            </Container>
          ),
        },
        {
          id: "featured",
          background: "ink",
          content: (
            <Container size="xl" className="py-20">
              <Stack gap={8}>
                <Stack gap={4} className="text-center items-center">
                  <Body className="text-primary uppercase tracking-kicker font-weight-semibold">Downloads</Body>
                  <H3 className="text-white">Featured Resources</H3>
                  <Body className="text-on-dark-muted max-w-2xl">Popular templates and guides downloaded by thousands of production professionals.</Body>
                </Stack>

                <Grid cols={2} gap={4} className="grid-cols-1 md:grid-cols-2">
                  {FEATURED_RESOURCES.map((resource) => (
                    <Card key={resource.id} className="p-5 border-2 border-grey-800 rounded-card hover:border-grey-700 transition-all">
                      <Stack direction="horizontal" className="justify-between items-start gap-4">
                        <Stack direction="horizontal" gap={4} className="items-start">
                          <div className="p-2 bg-grey-800 rounded-card">
                            <FileText className="size-5 text-on-dark-muted" />
                          </div>
                          <Stack gap={1}>
                            <Body className="text-white font-weight-bold">{resource.title}</Body>
                            <Body size="sm" className="text-on-dark-muted">{resource.description}</Body>
                            <Stack direction="horizontal" gap={2} className="mt-2">
                              <Badge variant="outline">{resource.type}</Badge>
                              <Badge variant="outline">{resource.format}</Badge>
                              <Body size="sm" className="text-on-dark-disabled">{resource.downloads.toLocaleString()} downloads</Body>
                            </Stack>
                          </Stack>
                        </Stack>
                        <Button variant="ghost" size="sm" icon={<Download className="size-4" />} />
                      </Stack>
                    </Card>
                  ))}
                </Grid>

                <Stack className="items-center">
                  <Button variant="outline" onClick={() => router.push("/resources/templates")}>
                    View All Templates
                  </Button>
                </Stack>
              </Stack>
            </Container>
          ),
        },
        {
          id: "cta",
          background: "primary",
          pattern: "halftone",
          content: (
            <CTABanner
              title="Need Personalized Help?"
              description="Our team is here to help you get the most out of ATLVS. Schedule a training session or contact support."
              primaryCta={{
                label: "Schedule Training",
                onClick: () => router.push("/demo"),
              }}
              secondaryCta={{
                label: "Contact Support",
                onClick: () => router.push("/contact"),
              }}
              background="primary"
            />
          ),
        },
      ]}
    />
  );
}
