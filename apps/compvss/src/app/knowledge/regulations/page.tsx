"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreatorNavigationAuthenticated } from "../../../components/navigation";
import {
  Container, H1, H3, Body, Label, Grid, Stack, StatCard, Input, Select, Button,
  Section as UISection, Card, Tabs, TabsList, Tab, TabPanel, Badge,
  Modal, ModalHeader, ModalBody, ModalFooter,
} from "@ghxstship/ui";

interface Regulation {
  id: string;
  title: string;
  category: "OSHA" | "Fire" | "Electrical" | "Labor" | "ADA" | "Environmental" | "Noise";
  jurisdiction: string;
  lastUpdated: string;
  status: "Current" | "Updated" | "Review Required";
  summary: string;
  documentUrl?: string;
}

const mockRegulations: Regulation[] = [
  { id: "REG-001", title: "OSHA General Industry Standards", category: "OSHA", jurisdiction: "Federal", lastUpdated: "2024-10-15", status: "Current", summary: "Comprehensive workplace safety standards including fall protection, PPE requirements, and hazard communication." },
  { id: "REG-002", title: "NFPA 102 - Assembly Seating", category: "Fire", jurisdiction: "Federal", lastUpdated: "2024-08-01", status: "Current", summary: "Fire safety requirements for assembly occupancies including egress, fire suppression, and crowd management." },
  { id: "REG-003", title: "NEC Article 525 - Carnivals/Fairs", category: "Electrical", jurisdiction: "Federal", lastUpdated: "2024-06-20", status: "Current", summary: "Electrical installation requirements for temporary events including grounding, GFCI protection, and cable management." },
  { id: "REG-004", title: "California Labor Code", category: "Labor", jurisdiction: "California", lastUpdated: "2024-11-01", status: "Updated", summary: "State labor laws including meal breaks, overtime, and worker classification requirements." },
  { id: "REG-005", title: "ADA Accessibility Guidelines", category: "ADA", jurisdiction: "Federal", lastUpdated: "2024-03-15", status: "Current", summary: "Accessibility requirements for public events including wheelchair access, signage, and assistive services." },
  { id: "REG-006", title: "EPA Noise Regulations", category: "Noise", jurisdiction: "Federal", lastUpdated: "2024-05-10", status: "Review Required", summary: "Environmental noise limits and monitoring requirements for outdoor events." },
];

const categories = ["All", "OSHA", "Fire", "Electrical", "Labor", "ADA", "Environmental", "Noise"];

export default function RegulationsPage() {
  const router = useRouter();
  const [selectedRegulation, setSelectedRegulation] = useState<Regulation | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRegulations = mockRegulations.filter(r => {
    const matchesCategory = categoryFilter === "All" || r.category === categoryFilter;
    const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) || r.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const updatedCount = mockRegulations.filter(r => r.status === "Updated").length;
  const reviewCount = mockRegulations.filter(r => r.status === "Review Required").length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Current": return "text-success-400";
      case "Updated": return "text-info-400";
      case "Review Required": return "text-warning-400";
      default: return "text-ink-400";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "OSHA": return "🦺";
      case "Fire": return "🔥";
      case "Electrical": return "⚡";
      case "Labor": return "👷";
      case "ADA": return "♿";
      case "Environmental": return "🌿";
      case "Noise": return "🔊";
      default: return "📋";
    }
  };

  return (
    <UISection className="relative min-h-screen overflow-hidden bg-ink-950 text-ink-50">
      <Card className="pointer-events-none absolute inset-0 grid-overlay opacity-40" />
      <CreatorNavigationAuthenticated />
      <Container className="py-16">
        <Stack gap={8}>
          <Stack gap={2}>
            <H1>Industry Regulations</H1>
            <Label className="text-ink-400">Compliance documentation and regulatory references</Label>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard label="Total Regulations" value={mockRegulations.length} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Categories" value={categories.length - 1} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Recently Updated" value={updatedCount} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Review Required" value={reviewCount} trend={reviewCount > 0 ? "down" : "neutral"} className="bg-transparent border-2 border-ink-800" />
          </Grid>

          <Stack direction="horizontal" className="justify-between">
            <Stack direction="horizontal" gap={4}>
              <Input type="search" placeholder="Search regulations..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="border-ink-700 bg-black text-white w-64" />
              <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="border-ink-700 bg-black text-white">
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </Select>
            </Stack>
            <Button variant="outlineWhite">Request Update</Button>
          </Stack>

          <Grid cols={2} gap={4}>
            {filteredRegulations.map((reg) => (
              <Card key={reg.id} className="border-2 border-ink-800 bg-ink-900/50 p-6">
                <Stack gap={4}>
                  <Stack direction="horizontal" className="justify-between">
                    <Stack direction="horizontal" gap={3}>
                      <Label className="text-h5-md">{getCategoryIcon(reg.category)}</Label>
                      <Stack gap={1}>
                        <Body className="font-display text-white">{reg.title}</Body>
                        <Stack direction="horizontal" gap={2}>
                          <Badge variant="outline">{reg.category}</Badge>
                          <Badge variant="outline">{reg.jurisdiction}</Badge>
                        </Stack>
                      </Stack>
                    </Stack>
                    <Label className={getStatusColor(reg.status)}>{reg.status}</Label>
                  </Stack>
                  <Body className="text-ink-300">{reg.summary}</Body>
                  <Stack direction="horizontal" className="justify-between items-center">
                    <Label size="xs" className="text-ink-500">Updated: {reg.lastUpdated}</Label>
                    <Stack direction="horizontal" gap={2}>
                      <Button variant="outline" size="sm" onClick={() => setSelectedRegulation(reg)}>View Details</Button>
                      <Button variant="ghost" size="sm">Download PDF</Button>
                    </Stack>
                  </Stack>
                </Stack>
              </Card>
            ))}
          </Grid>

          <Card className="border-2 border-ink-800 bg-ink-900/50 p-6">
            <Stack gap={4}>
              <H3>Quick Reference by Category</H3>
              <Grid cols={4} gap={4}>
                {categories.slice(1).map((cat) => (
                  <Card key={cat} className="p-4 border border-ink-700 cursor-pointer hover:border-white" onClick={() => setCategoryFilter(cat)}>
                    <Stack gap={2} className="text-center">
                      <Label className="text-h5-md">{getCategoryIcon(cat)}</Label>
                      <Label className="text-white">{cat}</Label>
                      <Label size="xs" className="text-ink-500">{mockRegulations.filter(r => r.category === cat).length} docs</Label>
                    </Stack>
                  </Card>
                ))}
              </Grid>
            </Stack>
          </Card>

          <Grid cols={3} gap={4}>
            <Button variant="outlineInk" onClick={() => router.push("/knowledge")}>Knowledge Base</Button>
            <Button variant="outlineInk" onClick={() => router.push("/safety")}>Safety</Button>
            <Button variant="outlineInk" onClick={() => router.push("/")}>Dashboard</Button>
          </Grid>
        </Stack>
      </Container>

      <Modal open={!!selectedRegulation} onClose={() => setSelectedRegulation(null)}>
        <ModalHeader><H3>{selectedRegulation?.title}</H3></ModalHeader>
        <ModalBody>
          {selectedRegulation && (
            <Stack gap={4}>
              <Stack direction="horizontal" gap={2}>
                <Label className="text-h6-md">{getCategoryIcon(selectedRegulation.category)}</Label>
                <Badge variant="outline">{selectedRegulation.category}</Badge>
                <Badge variant="outline">{selectedRegulation.jurisdiction}</Badge>
                <Label className={getStatusColor(selectedRegulation.status)}>{selectedRegulation.status}</Label>
              </Stack>
              <Stack gap={1}><Label className="text-ink-400">Last Updated</Label><Label className="text-white">{selectedRegulation.lastUpdated}</Label></Stack>
              <Stack gap={1}><Label className="text-ink-400">Summary</Label><Body className="text-ink-300">{selectedRegulation.summary}</Body></Stack>
              <Card className="p-4 border border-ink-700">
                <Stack gap={2}>
                  <Label className="text-ink-400">Key Requirements</Label>
                  <Stack gap={1}>
                    <Label className="text-ink-300">• Compliance documentation required</Label>
                    <Label className="text-ink-300">• Regular inspections and audits</Label>
                    <Label className="text-ink-300">• Training and certification records</Label>
                    <Label className="text-ink-300">• Incident reporting procedures</Label>
                  </Stack>
                </Stack>
              </Card>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedRegulation(null)}>Close</Button>
          <Button variant="outline">Download PDF</Button>
          <Button variant="solid">View Full Document</Button>
        </ModalFooter>
      </Modal>
    </UISection>
  );
}
