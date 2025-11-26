"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "../../components/navigation";
import {
  Container, H1, H3, Body, Label, Grid, Stack, StatCard, Input, Select, Button,
  Section as UISection, Card, Tabs, TabsList, Tab, TabPanel, Badge,
  Modal, ModalHeader, ModalBody, ModalFooter,
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

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Success": return "text-success-400";
      case "Post-Mortem": return "text-error-400";
      case "Lessons Learned": return "text-warning-400";
      default: return "text-ink-400";
    }
  };

  return (
    <UISection className="relative min-h-screen overflow-hidden bg-ink-950 text-ink-50">
      <Card className="pointer-events-none absolute inset-0 grid-overlay opacity-40" />
      <Navigation />
      <Container className="py-16">
        <Stack gap={8}>
          <Stack gap={2}>
            <H1>Case Studies</H1>
            <Label className="text-ink-400">Project post-mortems and lessons learned</Label>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard label="Total Studies" value={mockCaseStudies.length} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Success Stories" value={mockCaseStudies.filter(s => s.type === "Success").length} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Post-Mortems" value={mockCaseStudies.filter(s => s.type === "Post-Mortem").length} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Categories" value={categories.length - 1} className="bg-transparent border-2 border-ink-800" />
          </Grid>

          <Grid cols={3} gap={4}>
            <Input type="search" placeholder="Search case studies..." className="border-ink-700 bg-black text-white" />
            <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="border-ink-700 bg-black text-white">
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </Select>
            <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="border-ink-700 bg-black text-white">
              {types.map(t => <option key={t} value={t}>{t}</option>)}
            </Select>
          </Grid>

          <Grid cols={2} gap={4}>
            {filteredStudies.map((study) => (
              <Card key={study.id} className="border-2 border-ink-800 bg-ink-900/50 p-6 cursor-pointer hover:border-white" onClick={() => setSelectedStudy(study)}>
                <Stack gap={4}>
                  <Stack direction="horizontal" className="justify-between">
                    <Body className="font-display text-white">{study.title}</Body>
                    <Label className={getTypeColor(study.type)}>{study.type}</Label>
                  </Stack>
                  <Stack direction="horizontal" gap={2}>
                    <Badge variant="outline">{study.category}</Badge>
                    <Label className="text-ink-500">{study.projectName}</Label>
                  </Stack>
                  <Label className="text-ink-300">{study.summary}</Label>
                  <Stack direction="horizontal" className="justify-between">
                    <Label size="xs" className="text-ink-500">{study.author}</Label>
                    <Label size="xs" className="text-ink-500">{study.date}</Label>
                  </Stack>
                </Stack>
              </Card>
            ))}
          </Grid>

          <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/knowledge")}>Knowledge Base</Button>
        </Stack>
      </Container>

      <Modal open={!!selectedStudy} onClose={() => setSelectedStudy(null)}>
        <ModalHeader><H3>{selectedStudy?.title}</H3></ModalHeader>
        <ModalBody>
          {selectedStudy && (
            <Stack gap={4}>
              <Stack direction="horizontal" gap={2}>
                <Badge variant="outline">{selectedStudy.category}</Badge>
                <Label className={getTypeColor(selectedStudy.type)}>{selectedStudy.type}</Label>
              </Stack>
              <Stack gap={1}><Label className="text-ink-400">Project</Label><Label className="text-white">{selectedStudy.projectName}</Label></Stack>
              <Stack gap={1}><Label className="text-ink-400">Summary</Label><Body className="text-ink-300">{selectedStudy.summary}</Body></Stack>
              {selectedStudy.metrics && (
                <Grid cols={2} gap={4}>
                  {selectedStudy.metrics.map((m, idx) => (
                    <Card key={idx} className="p-3 border border-ink-700 text-center">
                      <Label className="font-mono text-white text-xl">{m.value}</Label>
                      <Label size="xs" className="text-ink-500">{m.label}</Label>
                    </Card>
                  ))}
                </Grid>
              )}
              <Stack gap={2}>
                <Label className="text-ink-400">Key Takeaways</Label>
                {selectedStudy.keyTakeaways.map((takeaway, idx) => (
                  <Card key={idx} className="p-3 border border-ink-700">
                    <Stack direction="horizontal" gap={2}>
                      <Label className="text-success-400">✓</Label>
                      <Label className="text-ink-300">{takeaway}</Label>
                    </Stack>
                  </Card>
                ))}
              </Stack>
              <Stack direction="horizontal" className="justify-between">
                <Label className="text-ink-500">{selectedStudy.author}</Label>
                <Label className="text-ink-500">{selectedStudy.date}</Label>
              </Stack>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedStudy(null)}>Close</Button>
          <Button variant="solid">Download PDF</Button>
        </ModalFooter>
      </Modal>
    </UISection>
  );
}
