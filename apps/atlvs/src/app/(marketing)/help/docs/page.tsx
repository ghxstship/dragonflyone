"use client";

/**
 * Help Docs Page - 2026 Landing Page Best Practices
 * Documentation within help center
 * Full-width marketing layout with hero and content sections
 * Bold Contemporary Pop Art Adventure Design System
 */

import { useRouter } from "next/navigation";
import { Book, FileText, Search, ExternalLink, Bookmark, Zap, Code } from "lucide-react";
import { useState } from "react";
import {
  MarketingPage, HeroSection, CTABanner, Container,
  Body, Button, Card, Grid, Input, Stack, Box
} from "@ghxstship/ui";

const DOC_CATEGORIES = [
  { id: "basics", title: "Basics", icon: <Book className="size-8" />, articles: ["Getting Started", "Creating Projects", "Managing Tasks", "Team Collaboration"] },
  { id: "advanced", title: "Advanced", icon: <Zap className="size-8" />, articles: ["Workflow Automation", "Custom Fields", "API Integration", "Webhooks"] },
  { id: "admin", title: "Administration", icon: <Code className="size-8" />, articles: ["User Management", "Permissions", "Billing", "Security Settings"] },
];

const POPULAR_ARTICLES = [
  "Getting Started",
  "Creating Projects",
  "Team Collaboration",
  "Workflow Automation",
  "API Integration",
  "User Management",
  "Permissions",
  "Billing",
];

export default function HelpDocsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const filteredCategories = DOC_CATEGORIES.filter((cat) => !search || cat.title.toLowerCase().includes(search.toLowerCase()) || cat.articles.some((a) => a.toLowerCase().includes(search.toLowerCase())));

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
              kicker="Help"
              title="Documentation"
              description="Comprehensive guides and reference materials to help you master ATLVS."
              primaryCta={{
                label: "Full Documentation",
                onClick: () => router.push("/docs"),
              }}
              secondaryCta={{
                label: "Contact Support",
                onClick: () => router.push("/contact"),
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
              <Card className="p-6 border-2 border-grey-800 rounded-card">
                <Box className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-on-dark-muted" />
                  <Input placeholder="Search documentation..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-12 h-14" />
                </Box>
              </Card>
            </Container>
          ),
        },
        {
          id: "categories",
          background: "black",
          content: (
            <Container size="2xl" className="py-20">
              <Stack gap={8}>
                <Stack gap={4} className="text-center items-center">
                  <Body className="text-primary uppercase tracking-kicker font-weight-semibold">Browse</Body>
                  <Body className="text-white font-weight-bold text-h3-md">Documentation Categories</Body>
                </Stack>

                <Grid cols={3} gap={6} className="grid-cols-1 md:grid-cols-3">
                  {filteredCategories.map((category) => (
                    <Card key={category.id} className="p-6 border-2 border-grey-800 rounded-card pop-card">
                      <Stack gap={4}>
                        <Stack direction="horizontal" gap={3} className="items-center">
                          <Box className="p-3 bg-primary/20 rounded-card text-primary">
                            {category.icon}
                          </Box>
                          <Body className="text-white font-weight-bold">{category.title}</Body>
                        </Stack>
                        <Stack gap={2}>
                          {category.articles.map((article, idx) => (
                            <Button key={idx} variant="ghost" className="w-full justify-start" onClick={() => router.push(`/docs/${category.id}/${article.toLowerCase().replace(/\s+/g, "-")}`)}>
                              <FileText className="size-4 mr-2" />
                              {article}
                            </Button>
                          ))}
                        </Stack>
                      </Stack>
                    </Card>
                  ))}
                </Grid>
              </Stack>
            </Container>
          ),
        },
        {
          id: "popular",
          background: "ink",
          pattern: "grid",
          patternOpacity: 0.03,
          content: (
            <Container size="2xl" className="py-20">
              <Stack gap={8}>
                <Stack gap={4} className="text-center items-center">
                  <Body className="text-primary uppercase tracking-kicker font-weight-semibold">Popular</Body>
                  <Body className="text-white font-weight-bold text-h3-md">Most Viewed Articles</Body>
                </Stack>

                <Grid cols={2} gap={4} className="grid-cols-1 md:grid-cols-2">
                  {POPULAR_ARTICLES.map((article, idx) => (
                    <Card key={idx} className="p-5 border-2 border-grey-800 rounded-card pop-card cursor-pointer">
                      <Box className="flex items-center justify-between">
                        <Box className="flex items-center gap-3">
                          <Bookmark className="size-5 text-primary" />
                          <Body className="text-white">{article}</Body>
                        </Box>
                        <ExternalLink className="size-4 text-on-dark-disabled" />
                      </Box>
                    </Card>
                  ))}
                </Grid>
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
              title="Need More Help?"
              description="Cannot find what you are looking for? Our support team is here to help."
              primaryCta={{
                label: "Contact Support",
                onClick: () => router.push("/contact"),
              }}
              secondaryCta={{
                label: "Full Documentation",
                onClick: () => router.push("/docs"),
              }}
              background="primary"
            />
          ),
        },
      ]}
    />
  );
}
