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
  useCaseStudies,
  type CaseStudy,
} from "../../hooks/useKnowledge";

import { getTopLevelCategories } from "@ghxstship/config";

const categories = ['All', ...getTopLevelCategories().map(c => c.name)];
const types = ["All", "Success", "Post-Mortem", "Lessons Learned"];

export default function CaseStudiesPage() {
  const router = useRouter();
  const { data: caseStudies = [], isLoading, error } = useCaseStudies();
  const [selectedStudy, setSelectedStudy] = useState<CaseStudy | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");

  const filteredStudies = caseStudies.filter(s => {
    const matchesCategory = categoryFilter === "All" || s.category === categoryFilter;
    const matchesType = typeFilter === "All" || s.type === typeFilter;
    return matchesCategory && matchesType;
  });

  if (isLoading) {
    return (
      <CompvssAppLayout>
        <MainContent padding="lg">
          <Container className="flex min-h-[60vh] items-center justify-center">
            <Stack gap={4} className="items-center">
              <div className="h-8 w-8 animate-spin rounded-avatar border-4 border-primary border-t-transparent" />
              <Body>Loading case studies...</Body>
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
                <Body className="text-destructive font-display">Failed to load case studies</Body>
                <Body className="text-destructive">{error instanceof Error ? error.message : 'An error occurred'}</Body>
                <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
              </Stack>
            </Card>
          </Container>
        </MainContent>
      </CompvssAppLayout>
    );
  }

  return (
    <CompvssAppLayout>
      <EnterprisePageHeader
        title="Case Studies"
        subtitle="Project post-mortems and lessons learned"


        showFavorite
        showSettings
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={10}>

            {/* Stats Grid */}
            <Grid cols={4} gap={6}>
              <StatCard value={caseStudies.length.toString()} label="Total Studies" />
              <StatCard value={caseStudies.filter(s => s.type === "Success").length.toString()} label="Success Stories" />
              <StatCard value={caseStudies.filter(s => s.type === "Post-Mortem").length.toString()} label="Post-Mortems" />
              <StatCard value={(categories.length - 1).toString()} label="Categories" />
            </Grid>

            {/* Filters */}
            <Grid cols={3} gap={4}>
              <Input type="search" placeholder="Search case studies..." />
              <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </Select>
              <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                {types.map(t => <option key={t} value={t}>{t}</option>)}
              </Select>
            </Grid>

            {/* Case Studies Grid */}
            <Grid cols={2} gap={4}>
              {filteredStudies.map((study) => (
                <Card key={study.id} className="cursor-pointer p-6" onClick={() => setSelectedStudy(study)}>
                  <Stack gap={4}>
                    <Stack direction="horizontal" className="justify-between">
                      <Body className="text-body-md font-display">{study.title}</Body>
                      <Badge variant={study.type === "Success" ? "solid" : "outline"}>{study.type}</Badge>
                    </Stack>
                    <Stack direction="horizontal" gap={2}>
                      <Badge variant="outline">{study.category}</Badge>
                      <Body size="sm" className="">{study.projectName}</Body>
                    </Stack>
                    <Body size="sm" className="">{study.summary}</Body>
                    <Stack direction="horizontal" className="justify-between">
                      <Body size="sm" className="">{study.author}</Body>
                      <Body size="sm" className="">{study.date}</Body>
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

      {/* Detail Modal */}
      <Modal open={!!selectedStudy} onClose={() => setSelectedStudy(null)}>
        <ModalHeader><H3>{selectedStudy?.title}</H3></ModalHeader>
        <ModalBody>
          {selectedStudy && (
            <Stack gap={4}>
              <Stack direction="horizontal" gap={2}>
                <Badge variant="outline">{selectedStudy.category}</Badge>
                <Badge variant={selectedStudy.type === "Success" ? "solid" : "outline"}>{selectedStudy.type}</Badge>
              </Stack>
              <Stack gap={1}>
                <Body className="font-display">Project</Body>
                <Body>{selectedStudy.projectName}</Body>
              </Stack>
              <Stack gap={1}>
                <Body className="font-display">Summary</Body>
                <Body>{selectedStudy.summary}</Body>
              </Stack>
              {selectedStudy.metrics && (
                <Grid cols={2} gap={4}>
                  {selectedStudy.metrics.map((m, idx) => (
                    <Card key={idx} className="p-3 text-center">
                      <Body className="text-body-lg font-display">{m.value}</Body>
                      <Body size="sm" className="">{m.label}</Body>
                    </Card>
                  ))}
                </Grid>
              )}
              <Stack gap={2}>
                <Body className="font-display">Key Takeaways</Body>
                {selectedStudy.keyTakeaways.map((takeaway, idx) => (
                  <Card key={idx} className="p-3">
                    <Stack direction="horizontal" gap={2}>
                      <Badge variant="solid">✓</Badge>
                      <Body>{takeaway}</Body>
                    </Stack>
                  </Card>
                ))}
              </Stack>
              <Stack direction="horizontal" className="justify-between">
                <Body size="sm" className="">{selectedStudy.author}</Body>
                <Body size="sm" className="">{selectedStudy.date}</Body>
              </Stack>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedStudy(null)}>Close</Button>
          <Button variant="solid">Download PDF</Button>
        </ModalFooter>
      </Modal>
    </CompvssAppLayout>
  );
}
