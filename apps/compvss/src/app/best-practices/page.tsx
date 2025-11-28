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
    <PageLayout background="white" header={<CreatorNavigationAuthenticated />}>
      <Section className="min-h-screen py-16">
        <Container>
          <Stack gap={10}>
            {/* Page Header */}
            <SectionHeader
              kicker="COMPVSS"
              title="Best Practices Library"
              description="Industry best practices organized by discipline"
              colorScheme="on-light"
              gap="lg"
            />

            {/* Stats Grid */}
            <Grid cols={4} gap={6}>
              <StatCard value={mockPractices.length.toString()} label="Total Guides" />
              <StatCard value={(categories.length - 1).toString()} label="Categories" />
              <StatCard value={mockPractices.reduce((s, p) => s + p.views, 0).toString()} label="Total Views" />
              <StatCard value="4.8" label="Avg Rating" />
            </Grid>

            {/* Filters */}
            <Grid cols={3} gap={4}>
              <Input type="search" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </Select>
              <Select value={disciplineFilter} onChange={(e) => setDisciplineFilter(e.target.value)}>
                {disciplines.map(d => <option key={d} value={d}>{d}</option>)}
              </Select>
            </Grid>

            {/* Practices Grid */}
            <Grid cols={2} gap={4}>
              {filteredPractices.map((practice) => (
                <Card key={practice.id} className="p-6 cursor-pointer" onClick={() => setSelectedPractice(practice)}>
                  <Stack gap={4}>
                    <Stack direction="horizontal" className="justify-between">
                      <Body className="font-display text-body-md">{practice.title}</Body>
                      <Badge variant="outline">{practice.discipline}</Badge>
                    </Stack>
                    <Body className="text-body-sm">{practice.summary}</Body>
                    <Stack direction="horizontal" gap={2}>
                      {practice.tags.map(tag => <Badge key={tag} variant="outline">#{tag}</Badge>)}
                    </Stack>
                    <Stack direction="horizontal" className="justify-between">
                      <Body className="text-body-sm">{practice.author}</Body>
                      <Body className="text-body-sm">⭐ {practice.rating} • {practice.views} views</Body>
                    </Stack>
                  </Stack>
                </Card>
              ))}
            </Grid>

            {/* Quick Links */}
            <Button variant="outline" onClick={() => router.push("/knowledge")}>Knowledge Base</Button>
          </Stack>
        </Container>
      </Section>

      {/* Detail Modal */}
      <Modal open={!!selectedPractice} onClose={() => setSelectedPractice(null)}>
        <ModalHeader><H3>{selectedPractice?.title}</H3></ModalHeader>
        <ModalBody>
          {selectedPractice && (
            <Stack gap={4}>
              <Stack direction="horizontal" gap={2}>
                <Badge variant="outline">{selectedPractice.category}</Badge>
                <Badge variant="outline">{selectedPractice.discipline}</Badge>
              </Stack>
              <Body>{selectedPractice.summary}</Body>
              <Stack direction="horizontal" className="justify-between">
                <Body className="text-body-sm">{selectedPractice.author}</Body>
                <Body className="text-body-sm">⭐ {selectedPractice.rating}</Body>
              </Stack>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedPractice(null)}>Close</Button>
          <Button variant="solid">View Full Guide</Button>
        </ModalFooter>
      </Modal>
    </PageLayout>
  );
}
