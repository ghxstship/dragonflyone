"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
// Layout provided by route group
import {
  H2, H3, Body, Label, Grid, Stack, StatCard, Input, Select, Button,
  Card, Badge,
  Modal, ModalHeader, ModalBody, ModalFooter,
  Kicker,
} from "@ghxstship/ui";

import { useStoryTemplates } from "@ghxstship/config";
import { DEMO_STORY_TEMPLATES, DEMO_STORY_CATEGORIES } from "@/lib/demo-data";

interface StoryTemplate {
  id: string;
  name: string;
  category: string;
  platform: string;
  dimensions: string;
  uses: number;
  preview: string;
  elements: string[];
}

export default function StoryTemplatesPage() {
  const router = useRouter();
  const { templates: apiTemplates, isLoading } = useStoryTemplates();
  const [selectedTemplate, setSelectedTemplate] = useState<StoryTemplate | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [platformFilter, setPlatformFilter] = useState("All");

  // Use API data or fall back to demo data
  const templates: StoryTemplate[] = apiTemplates.length > 0 ? (apiTemplates as unknown as StoryTemplate[]) : (DEMO_STORY_TEMPLATES as unknown as StoryTemplate[]);
  const categories = DEMO_STORY_CATEGORIES;

  const filteredTemplates = templates.filter(t => {
    const matchesCategory = categoryFilter === "All" || t.category === categoryFilter;
    const matchesPlatform = platformFilter === "All" || t.platform === platformFilter || t.platform === "Both";
    return matchesCategory && matchesPlatform;
  });

  return (
    <>
          <Stack gap={10}>
            {/* Page Header */}
            <Stack gap={2}>
              <Kicker colorScheme="on-dark">Social</Kicker>
              <H2 size="lg" className="text-white">Story Templates</H2>
              <Body className="text-on-dark-muted">Branded Instagram and TikTok story templates</Body>
            </Stack>

          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-pulse text-muted-foreground">Loading templates...</div>
            </div>
          )}

          <Grid cols={4} gap={6} className="sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Templates" value={templates.length} className="border-2 border-black" />
            <StatCard label="Total Uses" value={templates.reduce((s, t) => s + t.uses, 0)} className="border-2 border-black" />
            <StatCard label="Instagram" value={templates.filter(t => t.platform !== "TikTok").length} className="border-2 border-black" />
            <StatCard label="TikTok" value={templates.filter(t => t.platform !== "Instagram").length} className="border-2 border-black" />
          </Grid>

          <Grid cols={3} gap={4} className="sm:grid-cols-2 lg:grid-cols-3">
            <Input type="search" placeholder="Search templates..." className="border-2 border-black" />
            <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="border-2 border-black">
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </Select>
            <Select value={platformFilter} onChange={(e) => setPlatformFilter(e.target.value)} className="border-2 border-black">
              <option value="All">All Platforms</option>
              <option value="Instagram">Instagram</option>
              <option value="TikTok">TikTok</option>
            </Select>
          </Grid>

          <Grid cols={3} gap={4} className="sm:grid-cols-2 lg:grid-cols-3">
            {filteredTemplates.map((template) => (
              <Card key={template.id} className="border-2 border-black overflow-hidden">
                <Card className="h-48 bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Label className="text-h1-sm">{template.preview}</Label>
                </Card>
                <Stack className="p-4" gap={3}>
                  <Stack direction="horizontal" className="justify-between">
                    <Body className="font-weight-bold">{template.name}</Body>
                    <Badge variant="outline">{template.platform}</Badge>
                  </Stack>
                  <Stack direction="horizontal" gap={2}>
                    <Badge variant="outline">{template.category}</Badge>
                    <Label className="text-ink-500">{template.dimensions}</Label>
                  </Stack>
                  <Label className="text-ink-500">{template.uses.toLocaleString()} uses</Label>
                  <Stack direction="horizontal" gap={2}>
                    <Button variant="outline" size="sm" onClick={() => setSelectedTemplate(template)}>Preview</Button>
                    <Button variant="solid" size="sm">Use Template</Button>
                  </Stack>
                </Stack>
              </Card>
            ))}
          </Grid>

          <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
            <Button variant="outlineInk" onClick={() => router.push("/social")}>Back to Social</Button>
            <Button variant="solid" inverted>Create Custom Template</Button>
          </Grid>
          </Stack>

      <Modal open={!!selectedTemplate} onClose={() => setSelectedTemplate(null)}>
        <ModalHeader><H3>{selectedTemplate?.name}</H3></ModalHeader>
        <ModalBody>
          {selectedTemplate && (
            <Stack gap={4}>
              <Card className="h-64 bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Label className="text-display-md">{selectedTemplate.preview}</Label>
              </Card>
              <Stack direction="horizontal" gap={2}>
                <Badge variant="outline">{selectedTemplate.platform}</Badge>
                <Badge variant="outline">{selectedTemplate.category}</Badge>
                <Label className="text-ink-500">{selectedTemplate.dimensions}</Label>
              </Stack>
              <Stack gap={2}>
                <Label className="text-ink-500">Template Elements</Label>
                <Grid cols={2} gap={2} className="sm:grid-cols-1 lg:grid-cols-2">
                  {selectedTemplate.elements.map((el, idx) => (
                    <Card key={idx} className="p-2 border-2 border-ink-200">
                      <Label>{el}</Label>
                    </Card>
                  ))}
                </Grid>
              </Stack>
              <Label className="text-ink-500">{selectedTemplate.uses.toLocaleString()} total uses</Label>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedTemplate(null)}>Close</Button>
          <Button variant="solid">Use Template</Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
