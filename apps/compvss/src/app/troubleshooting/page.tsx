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
import {
  useTroubleshootingGuides,
  type TroubleshootingGuide,
} from '../../hooks/useTroubleshooting';


import { getSubcategoryNames } from "@ghxstship/config";

const categories = ['All', ...getSubcategoryNames('TECH')];

export default function TroubleshootingPage() {
  const router = useRouter();
  const { data: guides = [], isLoading, error } = useTroubleshootingGuides();
  const [selectedGuide, setSelectedGuide] = useState<TroubleshootingGuide | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  if (isLoading) {
    return (
      <CompvssAppLayout>
        <MainContent padding="lg">
          <Container className="flex min-h-[60vh] items-center justify-center">
            <Stack gap={4} className="items-center">
              <div className="h-8 w-8 animate-spin rounded-avatar border-4 border-primary border-t-transparent" />
              <Body>Loading troubleshooting guides...</Body>
            </Stack>
          </Container>
        </MainContent>
      </CompvssAppLayout>
    );
  }

  if (error) {
    return (
      <CompvssAppLayout>
        <MainContent padding="lg">
          <Container>
            <Card className="p-6 border-destructive bg-destructive/10">
              <Stack gap={4} className="items-center text-center">
                <Body className="text-destructive font-display">Failed to load guides</Body>
                <Body className="text-destructive">{error instanceof Error ? error.message : 'An error occurred'}</Body>
                <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
              </Stack>
            </Card>
          </Container>
        </MainContent>
      </CompvssAppLayout>
    );
  }

  const filteredGuides = guides.filter(g => {
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

            <Grid cols={4} gap={6} className="sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Total Guides" value={guides.length.toString()} />
              <StatCard label="Categories" value={(categories.length - 1).toString()} />
              <StatCard label="Total Views" value={guides.reduce((s, g) => s + g.views, 0).toString()} />
              <StatCard label="Helpful Rate" value="81%" />
            </Grid>

            <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
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
                      <Body size="sm" className="">{guide.steps.length} steps</Body>
                      <Body size="sm" className="">{guide.views} views • {guide.helpful}% found helpful</Body>
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
                <Body size="sm" className="">Symptom</Body>
                <Body>{selectedGuide.symptom}</Body>
              </Stack>
              <Stack gap={2}>
                <Body size="sm" className="">Troubleshooting Steps</Body>
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
                <Body size="sm" className="">Resolution</Body>
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
