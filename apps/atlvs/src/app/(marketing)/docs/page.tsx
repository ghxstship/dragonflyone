"use client";

/**
 * Documentation Page - 2026 Landing Page Best Practices
 * Full-width marketing layout with hero, doc sections, and search
 * Bold Contemporary Pop Art Adventure Design System
 */

import { useRouter } from "next/navigation";
import { Book, Code, Zap, FileText, Search, ArrowRight, Terminal, Settings, Users } from "lucide-react";
import { useState } from "react";
import {
  MarketingPage, HeroSection, FeatureGrid, CTABanner, Container, Stack, Grid, Card, Body, H3, Button, Input, Box,
  type FeatureItem} from "@ghxstship/ui";

interface DocSection {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  articles: { title: string; href: string }[];
}

const DOC_SECTIONS: DocSection[] = [
  { id: "getting-started", title: "Getting Started", description: "Learn the basics of ATLVS and get up and running quickly.", icon: <Zap className="size-8" />, articles: [{ title: "Quick Start Guide", href: "/docs/quick-start" }, { title: "Creating Your First Project", href: "/docs/first-project" }, { title: "Inviting Team Members", href: "/docs/invite-team" }] },
  { id: "features", title: "Features", description: "Explore all platform features and capabilities in depth.", icon: <Book className="size-8" />, articles: [{ title: "Production Planning", href: "/docs/production-planning" }, { title: "Team Collaboration", href: "/docs/collaboration" }, { title: "Document Management", href: "/docs/documents" }] },
  { id: "api", title: "API Reference", description: "Build custom integrations with our comprehensive API.", icon: <Code className="size-8" />, articles: [{ title: "Authentication", href: "/docs/api/auth" }, { title: "REST API", href: "/docs/api/rest" }, { title: "Webhooks", href: "/docs/api/webhooks" }] },
  { id: "guides", title: "Guides", description: "Step-by-step tutorials for common workflows.", icon: <FileText className="size-8" />, articles: [{ title: "Best Practices", href: "/docs/best-practices" }, { title: "Workflow Automation", href: "/docs/automation" }, { title: "Reporting", href: "/docs/reporting" }] },
];

const QUICK_LINKS: FeatureItem[] = [
  { id: "quickstart", icon: <Zap className="size-8" />, title: "Quick Start", description: "Get up and running in under 5 minutes with our quick start guide." },
  { id: "api", icon: <Terminal className="size-8" />, title: "API Reference", description: "Complete API documentation for developers building integrations." },
  { id: "config", icon: <Settings className="size-8" />, title: "Configuration", description: "Learn how to configure ATLVS for your team and workflows." },
  { id: "team", icon: <Users className="size-8" />, title: "Team Setup", description: "Set up your team, roles, and permissions for collaboration." },
];

export default function DocsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const filteredSections = DOC_SECTIONS.filter((section) => {
    if (!search) return true;
    const lowerSearch = search.toLowerCase();
    return section.title.toLowerCase().includes(lowerSearch) || section.description.toLowerCase().includes(lowerSearch) || section.articles.some((a) => a.title.toLowerCase().includes(lowerSearch));
  });

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
              kicker="Resources"
              title="Documentation"
              description="Everything you need to know about using ATLVS. Comprehensive guides, API reference, and tutorials."
              primaryCta={{
                label: "Quick Start Guide",
                onClick: () => router.push("/docs/quick-start"),
              }}
              secondaryCta={{
                label: "API Reference",
                onClick: () => router.push("/docs/api"),
              }}
              background="gradient"
              pattern="none"
              fullHeight={false}
              align="center"
            />
          ),
        },
        {
          id: "search",
          background: "ink",
          content: (
            <Container size="2xl" className="py-12">
              <Card className="p-6 border-2 border-border rounded-card">
                <Box className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-text-muted" />
                  <Input
                    placeholder="Search documentation..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-12 h-14"
                  />
                </Box>
              </Card>
            </Container>
          ),
        },
        {
          id: "quick-links",
          background: "ink",
          pattern: "grid",
          patternOpacity: 0.03,
          content: (
            <FeatureGrid
              kicker="Quick Links"
              title="Popular Topics"
              description="Jump to the most commonly accessed documentation"
              features={QUICK_LINKS}
              columns={4}
              variant="bordered"
              background="ink"
              align="center"
            />
          ),
        },
        {
          id: "sections",
          background: "black",
          content: (
            <Container size="2xl" className="py-20">
              <Stack gap={8}>
                <Stack gap={4} className="text-center items-center">
                  <Body className="text-primary uppercase tracking-kicker font-weight-semibold">Browse</Body>
                  <H3 className="text-white">Documentation Sections</H3>
                </Stack>

                {filteredSections.length === 0 ? (
                  <Card className="p-12 text-center border-2 border-border rounded-card">
                    <Book className="size-16 text-text-disabled mx-auto mb-4" />
                    <Body className="text-white font-weight-medium mb-2">No Results Found</Body>
                    <Body className="text-text-muted mb-4">Try a different search term</Body>
                    <Button variant="outline" onClick={() => setSearch("")}>Clear Search</Button>
                  </Card>
                ) : (
                  <Grid cols={2} gap={6} className="grid-cols-1 md:grid-cols-2">
                    {filteredSections.map((section) => (
                      <Card key={section.id} className="p-6 border-2 border-border rounded-card pop-card">
                        <Stack gap={4}>
                          <Stack direction="horizontal" gap={4} className="items-start">
                            <Box className="p-3 bg-primary/20 rounded-card text-primary">
                              {section.icon}
                            </Box>
                            <Stack gap={1}>
                              <Body className="text-white font-weight-bold">{section.title}</Body>
                              <Body size="sm" className="text-text-muted">{section.description}</Body>
                            </Stack>
                          </Stack>
                          <Stack gap={2}>
                            {section.articles.map((article, idx) => (
                              <Card
                                key={idx}
                                className="p-3 border-2 border-border rounded-card pop-card-atlvs group"
                                onClick={() => router.push(article.href)}
                              >
                                <Stack direction="horizontal" className="justify-between items-center">
                                  <Stack direction="horizontal" gap={2} className="items-center">
                                    <FileText className="size-4 text-text-disabled group-hover:text-primary transition-colors" />
                                    <Body size="sm" className="text-text-secondary group-hover:text-white transition-colors">{article.title}</Body>
                                  </Stack>
                                  <ArrowRight className="size-4 text-text-disabled group-hover:text-primary transition-colors" />
                                </Stack>
                              </Card>
                            ))}
                          </Stack>
                        </Stack>
                      </Card>
                    ))}
                  </Grid>
                )}
              </Stack>
            </Container>
          ),
        },
        {
          id: "cta",
          background: "ink",
          pattern: "stripes",
          content: (
            <CTABanner
              title="Need Help?"
              description="Cannot find what you are looking for? Our support team is here to help."
              primaryCta={{
                label: "Contact Support",
                onClick: () => router.push("/contact"),
              }}
              secondaryCta={{
                label: "Join Community",
                onClick: () => router.push("/help/community"),
              }}
              background="ink"
            />
          ),
        },
      ]}
    />
  );
}
