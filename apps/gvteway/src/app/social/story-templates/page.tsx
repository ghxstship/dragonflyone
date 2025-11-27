"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Container, H1, H3, Body, Label, Grid, Stack, StatCard, Input, Select, Button,
  Section as UISection, Card, Tabs, TabsList, Tab, TabPanel, Badge,
  Modal, ModalHeader, ModalBody, ModalFooter,
} from "@ghxstship/ui";

interface StoryTemplate {
  id: string;
  name: string;
  category: string;
  platform: "Instagram" | "TikTok" | "Both";
  dimensions: string;
  uses: number;
  preview: string;
  elements: string[];
}

const mockTemplates: StoryTemplate[] = [
  { id: "ST-001", name: "Event Countdown", category: "Promotion", platform: "Instagram", dimensions: "1080x1920", uses: 2456, preview: "⏰", elements: ["Countdown Timer", "Event Logo", "Date/Time", "CTA Button"] },
  { id: "ST-002", name: "Lineup Reveal", category: "Announcement", platform: "Both", dimensions: "1080x1920", uses: 1890, preview: "🎤", elements: ["Artist Photos", "Names", "Stage Info", "Animated Reveal"] },
  { id: "ST-003", name: "Ticket Giveaway", category: "Contest", platform: "Instagram", dimensions: "1080x1920", uses: 3245, preview: "🎁", elements: ["Prize Info", "Entry Rules", "Deadline", "Swipe Up"] },
  { id: "ST-004", name: "Behind the Scenes", category: "Content", platform: "Both", dimensions: "1080x1920", uses: 1567, preview: "🎬", elements: ["Photo Frame", "Caption Area", "Stickers", "Location Tag"] },
  { id: "ST-005", name: "Artist Spotlight", category: "Promotion", platform: "Instagram", dimensions: "1080x1920", uses: 2134, preview: "⭐", elements: ["Artist Photo", "Bio", "Social Links", "Music Player"] },
  { id: "ST-006", name: "Flash Sale", category: "Sales", platform: "Both", dimensions: "1080x1920", uses: 4567, preview: "⚡", elements: ["Discount Badge", "Timer", "Price", "Shop Link"] },
];

const categories = ["All", "Promotion", "Announcement", "Contest", "Content", "Sales"];

export default function StoryTemplatesPage() {
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState<StoryTemplate | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [platformFilter, setPlatformFilter] = useState("All");

  const filteredTemplates = mockTemplates.filter(t => {
    const matchesCategory = categoryFilter === "All" || t.category === categoryFilter;
    const matchesPlatform = platformFilter === "All" || t.platform === platformFilter || t.platform === "Both";
    return matchesCategory && matchesPlatform;
  });

  return (
    <UISection className="min-h-screen bg-white">
      <Container className="py-8">
        <Stack gap={8}>
          <Stack gap={2}>
            <H1>STORY TEMPLATES</H1>
            <Body className="text-grey-600">Branded Instagram and TikTok story templates</Body>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard label="Templates" value={mockTemplates.length} className="border-2 border-black" />
            <StatCard label="Total Uses" value={mockTemplates.reduce((s, t) => s + t.uses, 0)} className="border-2 border-black" />
            <StatCard label="Instagram" value={mockTemplates.filter(t => t.platform !== "TikTok").length} className="border-2 border-black" />
            <StatCard label="TikTok" value={mockTemplates.filter(t => t.platform !== "Instagram").length} className="border-2 border-black" />
          </Grid>

          <Grid cols={3} gap={4}>
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

          <Grid cols={3} gap={4}>
            {filteredTemplates.map((template) => (
              <Card key={template.id} className="border-2 border-black overflow-hidden">
                <Card className="h-48 bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Label className="text-h1-sm">{template.preview}</Label>
                </Card>
                <Stack className="p-4" gap={3}>
                  <Stack direction="horizontal" className="justify-between">
                    <Body className="font-bold">{template.name}</Body>
                    <Badge variant="outline">{template.platform}</Badge>
                  </Stack>
                  <Stack direction="horizontal" gap={2}>
                    <Badge variant="outline">{template.category}</Badge>
                    <Label className="text-grey-500">{template.dimensions}</Label>
                  </Stack>
                  <Label className="text-grey-500">{template.uses.toLocaleString()} uses</Label>
                  <Stack direction="horizontal" gap={2}>
                    <Button variant="outline" size="sm" onClick={() => setSelectedTemplate(template)}>Preview</Button>
                    <Button variant="solid" size="sm">Use Template</Button>
                  </Stack>
                </Stack>
              </Card>
            ))}
          </Grid>

          <Grid cols={2} gap={4}>
            <Button variant="outline" onClick={() => router.push("/social")}>Back to Social</Button>
            <Button variant="solid">Create Custom Template</Button>
          </Grid>
        </Stack>
      </Container>

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
                <Label className="text-grey-500">{selectedTemplate.dimensions}</Label>
              </Stack>
              <Stack gap={2}>
                <Label className="text-grey-500">Template Elements</Label>
                <Grid cols={2} gap={2}>
                  {selectedTemplate.elements.map((el, idx) => (
                    <Card key={idx} className="p-2 border border-grey-200">
                      <Label>{el}</Label>
                    </Card>
                  ))}
                </Grid>
              </Stack>
              <Label className="text-grey-500">{selectedTemplate.uses.toLocaleString()} total uses</Label>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedTemplate(null)}>Close</Button>
          <Button variant="solid">Use Template</Button>
        </ModalFooter>
      </Modal>
    </UISection>
  );
}
