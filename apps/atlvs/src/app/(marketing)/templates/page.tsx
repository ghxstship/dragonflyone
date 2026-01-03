"use client";

/**
 * Templates Page - ATLVS Marketing
 * Browse and download all available templates
 * Content sourced from centralized marketing-content configuration
 */

import { useState } from "react";
import { FileText, Download, Search, Filter } from "lucide-react";
import {
  MarketingPage,
  HeroSection,
  Container,
  Stack,
  Grid,
  Card,
  Body,
  H3,
  Button,
  Badge,
  Box,
  Input,
} from "@ghxstship/ui";
import {
  TEMPLATES,
  TEMPLATE_CATEGORIES,
  FORMAT_INFO,
  type Template,
  type TemplateCategory,
} from "@ghxstship/config/marketing-content";

export default function TemplatesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | "all">("all");

  const filteredTemplates = TEMPLATES.filter((template) => {
    const matchesSearch =
      searchQuery === "" ||
      template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === "all" || template.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleDownload = (template: Template) => {
    if (template.downloadUrl) {
      window.open(template.downloadUrl, "_blank");
    }
  };

  const categories = Object.entries(TEMPLATE_CATEGORIES) as [TemplateCategory, { label: string; description: string; icon: string }][];

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
              kicker="Downloads"
              title="Production Templates"
              description="Ready-to-use templates for production planning, crew management, finance, and more. All templates are dual-purpose: human-readable and import-ready."
              background="gradient"
              pattern="none"
              fullHeight={false}
              align="center"
            />
          ),
        },
        {
          id: "filters",
          background: "ink",
          content: (
            <Container size="2xl" className="py-8">
              <Stack direction="horizontal" gap={4} className="flex-wrap items-center justify-between">
                <Stack direction="horizontal" gap={2} className="flex-wrap">
                  <Button
                    variant={selectedCategory === "all" ? "primary" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory("all")}
                  >
                    All ({TEMPLATES.length})
                  </Button>
                  {categories.map(([key, value]) => {
                    const count = TEMPLATES.filter((t) => t.category === key).length;
                    return (
                      <Button
                        key={key}
                        variant={selectedCategory === key ? "primary" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCategory(key)}
                      >
                        {value.label} ({count})
                      </Button>
                    );
                  })}
                </Stack>
                <Box className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-muted" />
                  <Input
                    placeholder="Search templates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </Box>
              </Stack>
            </Container>
          ),
        },
        {
          id: "templates",
          background: "black",
          content: (
            <Container size="2xl" className="py-12">
              <Stack gap={8}>
                {filteredTemplates.length === 0 ? (
                  <Card className="p-12 text-center border-2 border-border">
                    <Stack gap={4} className="items-center">
                      <Filter className="size-12 text-text-muted" />
                      <Body className="text-text-muted">No templates match your search criteria.</Body>
                      <Button variant="outline" onClick={() => { setSearchQuery(""); setSelectedCategory("all"); }}>
                        Clear Filters
                      </Button>
                    </Stack>
                  </Card>
                ) : (
                  <Grid cols={2} gap={4} className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {filteredTemplates.map((template) => {
                      const formatInfo = FORMAT_INFO[template.format];
                      const categoryInfo = TEMPLATE_CATEGORIES[template.category];
                      return (
                        <Card
                          key={template.id}
                          className="p-5 border-2 border-border rounded-card pop-card-atlvs group"
                        >
                          <Stack gap={4}>
                            <Stack direction="horizontal" className="justify-between items-start">
                              <Box className="p-2 bg-surface-elevated rounded-card group-hover:bg-primary/20 transition-colors">
                                <FileText className="size-5 text-text-muted group-hover:text-primary transition-colors" />
                              </Box>
                              <Stack direction="horizontal" gap={2}>
                                {template.new && <Badge variant="success">New</Badge>}
                                {template.featured && <Badge variant="warning">Featured</Badge>}
                              </Stack>
                            </Stack>
                            <Stack gap={2}>
                              <Body className="text-white font-weight-bold group-hover:text-primary transition-colors">
                                {template.title}
                              </Body>
                              <Body size="sm" className="text-text-muted line-clamp-2">
                                {template.description}
                              </Body>
                            </Stack>
                            <Stack direction="horizontal" gap={2} className="flex-wrap">
                              <Badge variant="outline">{categoryInfo.label}</Badge>
                              <Badge variant="outline">
                                {formatInfo.label}
                              </Badge>
                              {template.fileSize && (
                                <Body size="sm" className="text-text-disabled">
                                  {template.fileSize}
                                </Body>
                              )}
                            </Stack>
                            {template.downloads && (
                              <Body size="sm" className="text-text-disabled">
                                {template.downloads.toLocaleString()} downloads
                              </Body>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              icon={<Download className="size-4" />}
                              onClick={() => handleDownload(template)}
                              disabled={!template.downloadUrl}
                              className="w-full group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-colors"
                            >
                              Download Template
                            </Button>
                          </Stack>
                        </Card>
                      );
                    })}
                  </Grid>
                )}
              </Stack>
            </Container>
          ),
        },
        {
          id: "import-info",
          background: "ink",
          content: (
            <Container size="2xl" className="py-16">
              <Card className="p-8 border-2 border-primary/30 bg-primary/5">
                <Stack gap={6}>
                  <Stack gap={2} className="text-center">
                    <H3 className="text-white">Import-Ready Templates</H3>
                    <Body className="text-text-muted max-w-2xl mx-auto">
                      All templates are dual-purpose: use them as human-readable documents or import directly into ATLVS. 
                      Each template includes database-compatible headers and import instructions.
                    </Body>
                  </Stack>
                  <Grid cols={3} gap={6} className="grid-cols-1 md:grid-cols-3">
                    <Stack gap={2} className="text-center">
                      <Body className="text-primary font-weight-bold">1. Download</Body>
                      <Body size="sm" className="text-text-muted">Get the template in CSV or Markdown format</Body>
                    </Stack>
                    <Stack gap={2} className="text-center">
                      <Body className="text-primary font-weight-bold">2. Fill In</Body>
                      <Body size="sm" className="text-text-muted">Add your data following the field definitions</Body>
                    </Stack>
                    <Stack gap={2} className="text-center">
                      <Body className="text-primary font-weight-bold">3. Import</Body>
                      <Body size="sm" className="text-text-muted">Use Settings → Data Import to bulk upload</Body>
                    </Stack>
                  </Grid>
                </Stack>
              </Card>
            </Container>
          ),
        },
      ]}
    />
  );
}
