"use client";

/**
 * Help Docs Page
 * Documentation within help center
 * Uses DetailPage template for consistent layout
 */

import { useRouter } from "next/navigation";
import { Book, FileText, Search, ExternalLink, List, Bookmark } from "lucide-react";
import { useState } from "react";
import {
  Body, Button, Card, Grid, Input, DetailPage, Section, SectionHeader, Box, Stack } from "@ghxstship/ui";

const DOC_CATEGORIES = [
  { id: "basics", title: "Basics", articles: ["Getting Started", "Creating Projects", "Managing Tasks", "Team Collaboration"] },
  { id: "advanced", title: "Advanced", articles: ["Workflow Automation", "Custom Fields", "API Integration", "Webhooks"] },
  { id: "admin", title: "Administration", articles: ["User Management", "Permissions", "Billing", "Security Settings"] },
];

export default function HelpDocsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const filteredCategories = DOC_CATEGORIES.filter((cat) => !search || cat.title.toLowerCase().includes(search.toLowerCase()) || cat.articles.some((a) => a.toLowerCase().includes(search.toLowerCase())));

  const tabs = [
    {
      id: "docs",
      label: "Documentation",
      icon: <List className="size-4" />,
      content: (
        <Section>
          <Card className="p-4 mb-6">
            <Box className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-on-dark-muted" />
              <Input placeholder="Search documentation..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </Box>
          </Card>

          <Grid cols={3} gap={6} className="grid-cols-1 md:grid-cols-3">
            {filteredCategories.map((category) => (
              <Card key={category.id} className="p-6">
                <Box className="flex items-center gap-2 mb-4">
                  <Book className="size-5 text-primary" />
                  <Body className="font-weight-bold">{category.title}</Body>
                </Box>
                <Stack gap={2}>
                  {category.articles.map((article, idx) => (
                    <Button key={idx} variant="ghost" className="w-full justify-start" onClick={() => router.push(`/docs/${category.id}/${article.toLowerCase().replace(/\s+/g, "-")}`)}>
                      <FileText className="size-4 mr-2" />
                      {article}
                    </Button>
                  ))}
                </Stack>
              </Card>
            ))}
          </Grid>
        </Section>
      ),
    },
    {
      id: "popular",
      label: "Popular",
      icon: <Bookmark className="size-4" />,
      content: (
        <Section>
          <SectionHeader title="Most Viewed Articles" />
          <Stack gap={2} className="mt-4">
            {DOC_CATEGORIES.flatMap((c) => c.articles).slice(0, 8).map((article, idx) => (
              <Card key={idx} className="p-4 cursor-pointer hover:border-primary">
                <Box className="flex items-center justify-between">
                  <Box className="flex items-center gap-2">
                    <FileText className="size-4 text-on-dark-muted" />
                    <Body>{article}</Body>
                  </Box>
                  <ExternalLink className="size-4 text-on-dark-disabled" />
                </Box>
              </Card>
            ))}
          </Stack>
        </Section>
      ),
    },
  ];

  return (
    <DetailPage
      header={{ kicker: "Help", title: "Documentation", description: "Comprehensive guides and reference" }}
      backButton={{ label: "Help Center", href: "/help" }}
      tabs={tabs}
      actions={<Button variant="outline" onClick={() => router.push("/docs")}>Full Documentation</Button>}
    />
  );
}
