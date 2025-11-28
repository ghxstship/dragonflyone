"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreatorNavigationAuthenticated } from "../../components/navigation";
import {
  Container,
  H3,
  Body,
  Grid,
  Stack,
  StatCard,
  Input,
  Select,
  Button,
  Section,
  Card,
  Badge,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  PageLayout,
  SectionHeader,
} from "@ghxstship/ui";

interface TroubleshootingGuide {
  id: string;
  title: string;
  category: string;
  symptom: string;
  steps: string[];
  resolution: string;
  views: number;
  helpful: number;
}

const mockGuides: TroubleshootingGuide[] = [
  { id: "TS-001", title: "No Audio Output", category: "Audio", symptom: "Console shows signal but no sound from speakers", steps: ["Check amplifier power", "Verify speaker cables", "Check mute status", "Test with different source"], resolution: "Most commonly caused by muted output or disconnected cables", views: 2456, helpful: 89 },
  { id: "TS-002", title: "LED Panel Artifacts", category: "Video", symptom: "Random pixels or lines appearing on LED wall", steps: ["Check data cable connections", "Verify processor settings", "Test individual panels", "Check for EMI interference"], resolution: "Usually resolved by reseating data cables or replacing faulty panel", views: 1234, helpful: 76 },
  { id: "TS-003", title: "Fixture Not Responding", category: "Lighting", symptom: "Moving light not responding to DMX commands", steps: ["Verify DMX address", "Check DMX cable chain", "Test fixture in standalone", "Reset fixture"], resolution: "Address conflicts or cable issues are most common causes", views: 1890, helpful: 82 },
  { id: "TS-004", title: "Intercom Static", category: "Communications", symptom: "Excessive static or noise on intercom system", steps: ["Check cable shielding", "Verify power supply", "Test individual stations", "Check for RF interference"], resolution: "Ground loops or damaged cables typically cause this issue", views: 987, helpful: 71 },
];

const categories = ["All", "Audio", "Video", "Lighting", "Communications", "Power", "Rigging"];

export default function TroubleshootingPage() {
  const router = useRouter();
  const [selectedGuide, setSelectedGuide] = useState<TroubleshootingGuide | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredGuides = mockGuides.filter(g => {
    const matchesCategory = categoryFilter === "All" || g.category === categoryFilter;
    const matchesSearch = g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          g.symptom.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <PageLayout background="white" header={<CreatorNavigationAuthenticated />}>
      <Section className="min-h-screen py-16">
        <Container>
          <Stack gap={10}>
            <SectionHeader
              kicker="COMPVSS"
              title="Troubleshooting Guides"
              description="Decision trees and step-by-step problem resolution"
              colorScheme="on-light"
              gap="lg"
            />

            <Grid cols={4} gap={6}>
              <StatCard label="Total Guides" value={mockGuides.length.toString()} />
              <StatCard label="Categories" value={(categories.length - 1).toString()} />
              <StatCard label="Total Views" value={mockGuides.reduce((s, g) => s + g.views, 0).toString()} />
              <StatCard label="Helpful Rate" value="81%" />
            </Grid>

            <Grid cols={2} gap={4}>
              <Input type="search" placeholder="Describe your issue..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </Select>
            </Grid>

            <Stack gap={4}>
              {filteredGuides.map((guide) => (
                <Card key={guide.id} onClick={() => setSelectedGuide(guide)}>
                  <Stack gap={3}>
                    <Stack direction="horizontal" className="justify-between">
                      <Body className="font-display">{guide.title}</Body>
                      <Badge variant="outline">{guide.category}</Badge>
                    </Stack>
                    <Body>Symptom: {guide.symptom}</Body>
                    <Stack direction="horizontal" className="justify-between">
                      <Body className="text-body-sm">{guide.steps.length} steps</Body>
                      <Body className="text-body-sm">{guide.views} views • {guide.helpful}% found helpful</Body>
                    </Stack>
                  </Stack>
                </Card>
              ))}
            </Stack>

            <Button variant="outline" onClick={() => router.push("/knowledge")}>Knowledge Base</Button>
          </Stack>
        </Container>
      </Section>

      <Modal open={!!selectedGuide} onClose={() => setSelectedGuide(null)}>
        <ModalHeader><H3>{selectedGuide?.title}</H3></ModalHeader>
        <ModalBody>
          {selectedGuide && (
            <Stack gap={4}>
              <Badge variant="outline">{selectedGuide.category}</Badge>
              <Stack gap={1}>
                <Body className="text-body-sm">Symptom</Body>
                <Body>{selectedGuide.symptom}</Body>
              </Stack>
              <Stack gap={2}>
                <Body className="text-body-sm">Troubleshooting Steps</Body>
                {selectedGuide.steps.map((step, idx) => (
                  <Card key={idx}>
                    <Stack direction="horizontal" gap={3}>
                      <Body>{idx + 1}</Body>
                      <Body>{step}</Body>
                    </Stack>
                  </Card>
                ))}
              </Stack>
              <Stack gap={1}>
                <Body className="text-body-sm">Resolution</Body>
                <Body>{selectedGuide.resolution}</Body>
              </Stack>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedGuide(null)}>Close</Button>
          <Button variant="outline">Not Helpful</Button>
          <Button variant="solid">Helpful</Button>
        </ModalFooter>
      </Modal>
    </PageLayout>
  );
}
