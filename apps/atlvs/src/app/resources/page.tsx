"use client";

/**
 * Resources Page
 * Resource hub with guides, templates, and tools
 * Uses DetailPage template for consistent layout
 */

import { useRouter } from "next/navigation";
import { Book, FileText, Video, Download, ExternalLink, List, Star } from "lucide-react";
import {
  Body,
  Button,
  Card,
  Grid,
  DetailPage,
  Section,
  SectionHeader,
} from "@ghxstship/ui";

const RESOURCE_CATEGORIES = [
  { id: "guides", title: "Guides", description: "Step-by-step tutorials", icon: <Book className="size-6" />, href: "/guides", count: 25 },
  { id: "templates", title: "Templates", description: "Ready-to-use templates", icon: <FileText className="size-6" />, href: "/resources/templates", count: 15 },
  { id: "videos", title: "Video Tutorials", description: "Watch and learn", icon: <Video className="size-6" />, href: "/help/tutorials", count: 20 },
  { id: "docs", title: "Documentation", description: "Technical reference", icon: <FileText className="size-6" />, href: "/docs", count: 50 },
];

const FEATURED_RESOURCES = [
  { title: "Production Planning Template", type: "Template", format: "XLSX" },
  { title: "Budget Tracking Spreadsheet", type: "Template", format: "XLSX" },
  { title: "Crew Call Sheet Template", type: "Template", format: "PDF" },
  { title: "Event Timeline Template", type: "Template", format: "PDF" },
];

export default function ResourcesPage() {
  const router = useRouter();

  const tabs = [
    {
      id: "resources",
      label: "Resources",
      icon: <List className="size-4" />,
      content: (
        <Section>
          <Grid cols={4} gap={6} className="grid-cols-2 md:grid-cols-4 mb-8">
            {RESOURCE_CATEGORIES.map((category) => (
              <Card key={category.id} className="p-6 cursor-pointer hover:border-primary transition-colors" onClick={() => router.push(category.href)}>
                <div className="p-3 bg-primary/20 rounded-card text-primary w-fit mb-4">{category.icon}</div>
                <Body className="font-weight-bold">{category.title}</Body>
                <Body size="sm" className="text-grey-400">{category.description}</Body>
                <Body size="sm" className="text-primary mt-2">{category.count} resources</Body>
              </Card>
            ))}
          </Grid>

          <SectionHeader title="Featured Resources" description="Popular downloads and templates" />
          <Grid cols={2} gap={4} className="grid-cols-1 md:grid-cols-2 mt-4">
            {FEATURED_RESOURCES.map((resource, idx) => (
              <Card key={idx} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="size-5 text-grey-400" />
                    <div>
                      <Body className="font-weight-medium">{resource.title}</Body>
                      <Body size="sm" className="text-grey-400">{resource.type} • {resource.format}</Body>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" icon={<Download className="size-4" />} />
                </div>
              </Card>
            ))}
          </Grid>
        </Section>
      ),
    },
    {
      id: "webinars",
      label: "Webinars",
      icon: <Star className="size-4" />,
      content: (
        <Section>
          <SectionHeader title="Upcoming Webinars" description="Live training sessions" />
          <Card className="p-8 text-center mt-4">
            <Video className="size-12 text-grey-600 mx-auto mb-4" />
            <Body className="font-weight-medium font-weight-medium mb-2">No Upcoming Webinars</Body>
            <Body className="text-grey-400 mb-4">Check back soon for new sessions</Body>
            <Button variant="outline">View Past Webinars</Button>
          </Card>
        </Section>
      ),
    },
  ];

  return (
    <DetailPage
      header={{ kicker: "Learn", title: "Resources", description: "Guides, templates, and tools to help you succeed" }}
      tabs={tabs}
    />
  );
}
