"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CompvssAppLayout } from "../../components/app-layout";
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
  Card,
  Badge,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  EnterprisePageHeader,
  MainContent,
} from "@ghxstship/ui";
import { DEMO_TROUBLESHOOTING_GUIDES } from '../../lib/demo-data';

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

const mockGuides = DEMO_TROUBLESHOOTING_GUIDES as unknown as TroubleshootingGuide[];


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
    <CompvssAppLayout>
      <EnterprisePageHeader
        title="Troubleshooting Guides"
        subtitle="Decision trees and step-by-step problem resolution"


        showFavorite
        showSettings
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={10}>

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
      </MainContent>

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
    </CompvssAppLayout>
  );
}
