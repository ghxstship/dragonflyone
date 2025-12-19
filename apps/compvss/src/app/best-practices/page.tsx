"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CompvssAppLayout } from "../../components/app-layout";
import { Star } from "lucide-react";
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
  useBestPractices,
  type BestPractice,
} from "../../hooks/useKnowledge";

import { getTopLevelCategories, getSubcategoryNames } from "@ghxstship/config";

const categories = ['All', ...getTopLevelCategories().map(c => c.name)];
const disciplines = ['All', ...getSubcategoryNames('TECH')];

export default function BestPracticesPage() {
  const router = useRouter();
  const { data: bestPractices = [], isLoading, error } = useBestPractices();
  const [selectedPractice, setSelectedPractice] = useState<BestPractice | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [disciplineFilter, setDisciplineFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  if (isLoading) {
    return (
      <CompvssAppLayout>
        <MainContent padding="lg">
          <Container className="flex min-h-[60vh] items-center justify-center">
            <Stack gap={4} className="items-center">
              <div className="h-8 w-8 animate-spin rounded-avatar border-4 border-primary border-t-transparent" />
              <Body>Loading best practices...</Body>
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
                <Body className="text-destructive font-display">Failed to load best practices</Body>
                <Body className="text-destructive">{error instanceof Error ? error.message : 'An error occurred'}</Body>
                <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
              </Stack>
            </Card>
          </Container>
        </MainContent>
      </CompvssAppLayout>
    );
  }

  const filteredPractices = bestPractices.filter(p => {
    const matchesCategory = categoryFilter === "All" || p.category === categoryFilter;
    const matchesDiscipline = disciplineFilter === "All" || p.discipline === disciplineFilter;
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesDiscipline && matchesSearch;
  });

  return (
    <CompvssAppLayout>
      <EnterprisePageHeader
        title="Best Practices Library"
        subtitle="Industry best practices organized by discipline"


        showFavorite
        showSettings
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={10}>

            {/* Stats Grid */}
            <Grid cols={4} gap={6}>
              <StatCard value={bestPractices.length.toString()} label="Total Guides" />
              <StatCard value={(categories.length - 1).toString()} label="Categories" />
              <StatCard value={bestPractices.reduce((s, p) => s + p.views, 0).toString()} label="Total Views" />
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
                    <Body size="sm" className="">{practice.summary}</Body>
                    <Stack direction="horizontal" gap={2}>
                      {practice.tags.map(tag => <Badge key={tag} variant="outline">#{tag}</Badge>)}
                    </Stack>
                    <Stack direction="horizontal" className="justify-between">
                      <Body size="sm" className="">{practice.author}</Body>
                      <Body size="sm" className=""><Star className="size-4 inline mr-1" />{practice.rating} • {practice.views} views</Body>
                    </Stack>
                  </Stack>
                </Card>
              ))}
            </Grid>

            {/* Quick Links */}
            <Button variant="outline" onClick={() => router.push("/knowledge")}>Knowledge Base</Button>
          </Stack>
        </Container>
      </MainContent>

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
                <Body size="sm" className="">{selectedPractice.author}</Body>
                <Body size="sm" className=""><Star className="size-4 inline mr-1" />{selectedPractice.rating}</Body>
              </Stack>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedPractice(null)}>Close</Button>
          <Button variant="solid">View Full Guide</Button>
        </ModalFooter>
      </Modal>
    </CompvssAppLayout>
  );
}
