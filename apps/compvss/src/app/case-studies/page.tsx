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

interface CaseStudy {
  id: string;
  title: string;
  projectName: string;
  type: "Success" | "Post-Mortem" | "Lessons Learned";
  category: string;
  date: string;
  author: string;
  summary: string;
  keyTakeaways: string[];
  metrics?: { label: string; value: string }[];
}

const mockCaseStudies: CaseStudy[] = [
  { id: "CS-001", title: "Festival Stage Collapse Prevention", projectName: "Summer Fest 2023", type: "Success", category: "Safety", date: "2024-02-15", author: "Safety Team", summary: "How early weather monitoring and proactive rigging inspection prevented a potential stage collapse during high winds.", keyTakeaways: ["Implement 48-hour weather monitoring", "Daily rigging inspections during setup", "Clear evacuation protocols"], metrics: [{ label: "Wind Speed", value: "45 mph" }, { label: "Response Time", value: "12 min" }] },
  { id: "CS-002", title: "Audio System Failure Analysis", projectName: "Arena Tour 2023", type: "Post-Mortem", category: "Technical", date: "2024-01-20", author: "Audio Dept", summary: "Root cause analysis of main PA failure during headliner set and improvements implemented.", keyTakeaways: ["Redundant amplifier racks", "Pre-show stress testing", "Backup system hot standby"], metrics: [{ label: "Downtime", value: "8 min" }, { label: "Affected", value: "15,000" }] },
  { id: "CS-003", title: "Crew Scheduling Optimization", projectName: "Corporate Gala", type: "Lessons Learned", category: "Operations", date: "2024-03-10", author: "Ops Team", summary: "How we reduced overtime by 30% through better advance planning and skill-based crew assignment.", keyTakeaways: ["Skill matrix for assignments", "Buffer time between calls", "Cross-training program"], metrics: [{ label: "OT Reduction", value: "30%" }, { label: "Cost Saved", value: "$45K" }] },
  { id: "CS-004", title: "LED Wall Calibration Standards", projectName: "Multiple Events", type: "Success", category: "Video", date: "2024-04-05", author: "Video Dept", summary: "Establishing company-wide LED calibration standards that improved client satisfaction scores.", keyTakeaways: ["Standardized color profiles", "Pre-event calibration checklist", "Client approval workflow"], metrics: [{ label: "Satisfaction", value: "+25%" }, { label: "Callbacks", value: "-60%" }] },
];

const categories = ["All", "Safety", "Technical", "Operations", "Video", "Audio", "Lighting"];
const types = ["All", "Success", "Post-Mortem", "Lessons Learned"];

export default function CaseStudiesPage() {
  const router = useRouter();
  const [selectedStudy, setSelectedStudy] = useState<CaseStudy | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");

  const filteredStudies = mockCaseStudies.filter(s => {
    const matchesCategory = categoryFilter === "All" || s.category === categoryFilter;
    const matchesType = typeFilter === "All" || s.type === typeFilter;
    return matchesCategory && matchesType;
  });

  return (
    <PageLayout background="white" header={<CreatorNavigationAuthenticated />}>
      <Section className="min-h-screen py-16">
        <Container>
          <Stack gap={10}>
            {/* Page Header */}
            <SectionHeader
              kicker="COMPVSS"
              title="Case Studies"
              description="Project post-mortems and lessons learned"
              colorScheme="on-light"
              gap="lg"
            />

            {/* Stats Grid */}
            <Grid cols={4} gap={6}>
              <StatCard value={mockCaseStudies.length.toString()} label="Total Studies" />
              <StatCard value={mockCaseStudies.filter(s => s.type === "Success").length.toString()} label="Success Stories" />
              <StatCard value={mockCaseStudies.filter(s => s.type === "Post-Mortem").length.toString()} label="Post-Mortems" />
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
      </Section>

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
    </PageLayout>
  );
}
