"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "../../components/navigation";
import {
  Container, H1, H3, Body, Label, Grid, Stack, StatCard, Input, Select, Button,
  Section as UISection, Card, Tabs, TabsList, Tab, TabPanel, Badge,
  Modal, ModalHeader, ModalBody, ModalFooter,
} from "@ghxstship/ui";

interface BestPractice {
  id: string;
  title: string;
  category: string;
  discipline: string;
  summary: string;
  author: string;
  views: number;
  rating: number;
  tags: string[];
}

const mockPractices: BestPractice[] = [
  { id: "BP-001", title: "Line Array Rigging Safety", category: "Safety", discipline: "Audio", summary: "Essential safety protocols for flying line array systems.", author: "Safety Team", views: 1245, rating: 4.9, tags: ["rigging", "audio"] },
  { id: "BP-002", title: "LED Wall Calibration", category: "Technical", discipline: "Video", summary: "Guide for calibrating LED video walls for optimal color accuracy.", author: "Video Dept", views: 892, rating: 4.7, tags: ["video", "calibration"] },
  { id: "BP-003", title: "Festival Stage Changeover", category: "Operations", discipline: "Stage", summary: "Efficient changeover procedures for multi-act festival stages.", author: "Stage Mgmt", views: 2156, rating: 4.8, tags: ["festival", "changeover"] },
  { id: "BP-004", title: "Power Distribution Planning", category: "Technical", discipline: "Power", summary: "Best practices for calculating power requirements.", author: "Electrical", views: 1567, rating: 4.6, tags: ["power", "planning"] },
  { id: "BP-005", title: "Crew Communication", category: "Operations", discipline: "General", summary: "Effective radio and intercom communication protocols.", author: "Ops Team", views: 1890, rating: 4.8, tags: ["communication", "radio"] },
];

const categories = ["All", "Safety", "Technical", "Operations", "Planning"];
const disciplines = ["All", "Audio", "Lighting", "Video", "Stage", "Rigging", "Power", "General"];

export default function BestPracticesPage() {
  const router = useRouter();
  const [selectedPractice, setSelectedPractice] = useState<BestPractice | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [disciplineFilter, setDisciplineFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPractices = mockPractices.filter(p => {
    const matchesCategory = categoryFilter === "All" || p.category === categoryFilter;
    const matchesDiscipline = disciplineFilter === "All" || p.discipline === disciplineFilter;
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesDiscipline && matchesSearch;
  });

  return (
    <UISection className="relative min-h-screen overflow-hidden bg-ink-950 text-ink-50">
      <Card className="pointer-events-none absolute inset-0 grid-overlay opacity-40" />
      <Navigation />
      <Container className="py-16">
        <Stack gap={8}>
          <Stack gap={2}>
            <H1>Best Practices Library</H1>
            <Label className="text-ink-400">Industry best practices organized by discipline</Label>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard label="Total Guides" value={mockPractices.length} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Categories" value={categories.length - 1} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Total Views" value={mockPractices.reduce((s, p) => s + p.views, 0)} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Avg Rating" value="4.8" className="bg-transparent border-2 border-ink-800" />
          </Grid>

          <Grid cols={3} gap={4}>
            <Input type="search" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="border-ink-700 bg-black text-white" />
            <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="border-ink-700 bg-black text-white">
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </Select>
            <Select value={disciplineFilter} onChange={(e) => setDisciplineFilter(e.target.value)} className="border-ink-700 bg-black text-white">
              {disciplines.map(d => <option key={d} value={d}>{d}</option>)}
            </Select>
          </Grid>

          <Grid cols={2} gap={4}>
            {filteredPractices.map((practice) => (
              <Card key={practice.id} className="border-2 border-ink-800 bg-ink-900/50 p-6 cursor-pointer hover:border-white" onClick={() => setSelectedPractice(practice)}>
                <Stack gap={4}>
                  <Stack direction="horizontal" className="justify-between">
                    <Body className="font-display text-white">{practice.title}</Body>
                    <Badge variant="outline">{practice.discipline}</Badge>
                  </Stack>
                  <Label className="text-ink-300">{practice.summary}</Label>
                  <Stack direction="horizontal" gap={2}>
                    {practice.tags.map(tag => <Badge key={tag} variant="outline">#{tag}</Badge>)}
                  </Stack>
                  <Stack direction="horizontal" className="justify-between">
                    <Label size="xs" className="text-ink-500">{practice.author}</Label>
                    <Label size="xs" className="text-ink-500">⭐ {practice.rating} • {practice.views} views</Label>
                  </Stack>
                </Stack>
              </Card>
            ))}
          </Grid>

          <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/knowledge")}>Knowledge Base</Button>
        </Stack>
      </Container>

      <Modal open={!!selectedPractice} onClose={() => setSelectedPractice(null)}>
        <ModalHeader><H3>{selectedPractice?.title}</H3></ModalHeader>
        <ModalBody>
          {selectedPractice && (
            <Stack gap={4}>
              <Stack direction="horizontal" gap={2}>
                <Badge variant="outline">{selectedPractice.category}</Badge>
                <Badge variant="outline">{selectedPractice.discipline}</Badge>
              </Stack>
              <Body className="text-ink-300">{selectedPractice.summary}</Body>
              <Stack direction="horizontal" className="justify-between">
                <Label className="text-ink-400">{selectedPractice.author}</Label>
                <Label className="text-ink-400">⭐ {selectedPractice.rating}</Label>
              </Stack>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedPractice(null)}>Close</Button>
          <Button variant="solid">View Full Guide</Button>
        </ModalFooter>
      </Modal>
    </UISection>
  );
}
