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
  DEMO_CASE_STUDIES,
  type DemoCaseStudy as CaseStudy,
} from "../../lib/demo-data";

const categories = ["All", "Safety", "Technical", "Operations", "Video", "Audio", "Lighting"];
const types = ["All", "Success", "Post-Mortem", "Lessons Learned"];

export default function CaseStudiesPage() {
  const router = useRouter();
  const [selectedStudy, setSelectedStudy] = useState<CaseStudy | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");

  const filteredStudies = DEMO_CASE_STUDIES.filter(s => {
    const matchesCategory = categoryFilter === "All" || s.category === categoryFilter;
    const matchesType = typeFilter === "All" || s.type === typeFilter;
    return matchesCategory && matchesType;
  });

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
              <StatCard value={DEMO_CASE_STUDIES.length.toString()} label="Total Studies" />
              <StatCard value={DEMO_CASE_STUDIES.filter(s => s.type === "Success").length.toString()} label="Success Stories" />
              <StatCard value={DEMO_CASE_STUDIES.filter(s => s.type === "Post-Mortem").length.toString()} label="Post-Mortems" />
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
                      <Body className="text-body-sm">{study.projectName}</Body>
                    </Stack>
                    <Body className="text-body-sm">{study.summary}</Body>
                    <Stack direction="horizontal" className="justify-between">
                      <Body className="text-body-sm">{study.author}</Body>
                      <Body className="text-body-sm">{study.date}</Body>
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
                      <Body className="text-body-sm">{m.label}</Body>
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
                <Body className="text-body-sm">{selectedStudy.author}</Body>
                <Body className="text-body-sm">{selectedStudy.date}</Body>
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
