"use client";

/**
 * Documentation Page
 * Product documentation hub
 * Uses DetailPage template for consistent layout
 */

import { useRouter } from "next/navigation";
import { Book, Code, Zap, FileText, Search, ExternalLink, List, Bookmark } from "lucide-react";
import { useState } from "react";
import {
  Body,
  Button,
  Card,
  Grid,
  Stack,
  Input,
  DetailPage,
  Section,
  SectionHeader,
} from "@ghxstship/ui";

interface DocSection {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  articles: { title: string; href: string }[];
}

const DOC_SECTIONS: DocSection[] = [
  { id: "getting-started", title: "Getting Started", description: "Learn the basics of ATLVS", icon: <Zap className="size-6" />, articles: [{ title: "Quick Start Guide", href: "/docs/quick-start" }, { title: "Creating Your First Project", href: "/docs/first-project" }, { title: "Inviting Team Members", href: "/docs/invite-team" }] },
  { id: "features", title: "Features", description: "Explore all platform features", icon: <Book className="size-6" />, articles: [{ title: "Production Planning", href: "/docs/production-planning" }, { title: "Team Collaboration", href: "/docs/collaboration" }, { title: "Document Management", href: "/docs/documents" }] },
  { id: "api", title: "API Reference", description: "Build integrations with our API", icon: <Code className="size-6" />, articles: [{ title: "Authentication", href: "/docs/api/auth" }, { title: "REST API", href: "/docs/api/rest" }, { title: "Webhooks", href: "/docs/api/webhooks" }] },
  { id: "guides", title: "Guides", description: "Step-by-step tutorials", icon: <FileText className="size-6" />, articles: [{ title: "Best Practices", href: "/docs/best-practices" }, { title: "Workflow Automation", href: "/docs/automation" }, { title: "Reporting", href: "/docs/reporting" }] },
];

export default function DocsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const filteredSections = DOC_SECTIONS.filter((section) => {
    if (!search) return true;
    const lowerSearch = search.toLowerCase();
    return section.title.toLowerCase().includes(lowerSearch) || section.description.toLowerCase().includes(lowerSearch) || section.articles.some((a) => a.title.toLowerCase().includes(lowerSearch));
  });

  const tabs = [
    {
      id: "docs",
      label: "Documentation",
      icon: <List className="size-4" />,
      content: (
        <Section>
          <Card className="p-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-grey-400" />
              <Input placeholder="Search documentation..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
          </Card>

          {filteredSections.length === 0 ? (
            <Card className="p-8 text-center">
              <Book className="size-12 text-grey-600 mx-auto mb-4" />
              <Body className="font-weight-medium font-weight-medium mb-2">No Results Found</Body>
              <Body className="text-grey-400">Try a different search term</Body>
            </Card>
          ) : (
            <Grid cols={2} gap={6} className="grid-cols-1 md:grid-cols-2">
              {filteredSections.map((section) => (
                <Card key={section.id} className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 bg-primary/20 rounded-card text-primary">{section.icon}</div>
                    <div>
                      <Body className="font-weight-bold font-weight-medium">{section.title}</Body>
                      <Body size="sm" className="text-grey-400">{section.description}</Body>
                    </div>
                  </div>
                  <Stack gap={2}>
                    {section.articles.map((article, idx) => (
                      <Button key={idx} variant="ghost" className="w-full justify-start" onClick={() => router.push(article.href)}>
                        <FileText className="size-4 mr-2" />
                        {article.title}
                      </Button>
                    ))}
                  </Stack>
                </Card>
              ))}
            </Grid>
          )}
        </Section>
      ),
    },
    {
      id: "popular",
      label: "Popular",
      icon: <Bookmark className="size-4" />,
      content: (
        <Section>
          <SectionHeader title="Popular Articles" description="Most viewed documentation" />
          <div className="space-y-4 mt-6">
            {DOC_SECTIONS.flatMap((s) => s.articles).slice(0, 8).map((article, idx) => (
              <Card key={idx} className="p-4 cursor-pointer hover:border-primary transition-colors" onClick={() => router.push(article.href)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="size-5 text-grey-400" />
                    <Body className="font-weight-medium">{article.title}</Body>
                  </div>
                  <ExternalLink className="size-4 text-grey-500" />
                </div>
              </Card>
            ))}
          </div>
        </Section>
      ),
    },
  ];

  return (
    <DetailPage
      header={{
        kicker: "Resources",
        title: "Documentation",
        description: "Everything you need to know about using ATLVS",
      }}
      tabs={tabs}
      actions={<Button variant="outline" onClick={() => router.push("/docs/api")}>API Reference</Button>}
    />
  );
}
