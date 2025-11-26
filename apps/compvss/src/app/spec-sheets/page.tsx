"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "../../components/navigation";
import {
  Container, H1, H3, Body, Label, Grid, Stack, StatCard, Input, Select, Button,
  Section as UISection, Card, Tabs, TabsList, Tab, TabPanel, Badge,
  Modal, ModalHeader, ModalBody, ModalFooter,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@ghxstship/ui";

interface SpecSheet {
  id: string;
  name: string;
  manufacturer: string;
  category: "Audio" | "Lighting" | "Video" | "Staging" | "Rigging" | "Power";
  model: string;
  version: string;
  lastUpdated: string;
  fileSize: string;
  downloads: number;
  specs: { label: string; value: string }[];
}

const mockSpecs: SpecSheet[] = [
  { id: "SPEC-001", name: "L-Acoustics K2", manufacturer: "L-Acoustics", category: "Audio", model: "K2", version: "2.1", lastUpdated: "2024-10-15", fileSize: "2.4 MB", downloads: 342, specs: [{ label: "Frequency Range", value: "35Hz - 20kHz" }, { label: "Max SPL", value: "145 dB" }, { label: "Weight", value: "61 kg" }] },
  { id: "SPEC-002", name: "Clay Paky Sharpy Plus", manufacturer: "Clay Paky", category: "Lighting", model: "Sharpy Plus", version: "1.3", lastUpdated: "2024-09-20", fileSize: "1.8 MB", downloads: 256, specs: [{ label: "Lamp", value: "440W" }, { label: "Beam Angle", value: "5.5°" }, { label: "Weight", value: "21 kg" }] },
  { id: "SPEC-003", name: "ROE Visual CB5", manufacturer: "ROE Visual", category: "Video", model: "CB5", version: "3.0", lastUpdated: "2024-11-01", fileSize: "3.2 MB", downloads: 189, specs: [{ label: "Pixel Pitch", value: "5.77mm" }, { label: "Brightness", value: "5500 nits" }, { label: "Panel Size", value: "500x500mm" }] },
  { id: "SPEC-004", name: "CM Lodestar", manufacturer: "CM", category: "Rigging", model: "Lodestar", version: "2.0", lastUpdated: "2024-08-10", fileSize: "1.5 MB", downloads: 423, specs: [{ label: "Capacity", value: "1 ton" }, { label: "Speed", value: "4 m/min" }, { label: "Weight", value: "45 kg" }] },
  { id: "SPEC-005", name: "DiGiCo SD12", manufacturer: "DiGiCo", category: "Audio", model: "SD12", version: "1.8", lastUpdated: "2024-10-25", fileSize: "4.1 MB", downloads: 312, specs: [{ label: "Channels", value: "72" }, { label: "Buses", value: "36" }, { label: "Sample Rate", value: "96kHz" }] },
];

const categories = ["All", "Audio", "Lighting", "Video", "Staging", "Rigging", "Power"];

export default function SpecSheetsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  const [selectedSpec, setSelectedSpec] = useState<SpecSheet | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const filteredSpecs = mockSpecs.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.manufacturer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "All" || s.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Audio": return "bg-info-900/20 border-info-800";
      case "Lighting": return "bg-warning-900/20 border-warning-800";
      case "Video": return "bg-purple-900/20 border-purple-800";
      case "Staging": return "bg-success-900/20 border-success-800";
      case "Rigging": return "bg-error-900/20 border-error-800";
      case "Power": return "bg-warning-900/20 border-warning-800";
      default: return "bg-ink-900/50 border-ink-800";
    }
  };

  return (
    <UISection className="relative min-h-screen overflow-hidden bg-ink-950 text-ink-50">
      <Card className="pointer-events-none absolute inset-0 grid-overlay opacity-40" />
      <Navigation />
      <Container className="py-16">
        <Stack gap={8}>
          <Stack gap={2}>
            <H1>Technical Specifications</H1>
            <Label className="text-ink-400">Equipment specification sheets and cut sheets library</Label>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard label="Total Specs" value={mockSpecs.length} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Categories" value={categories.length - 1} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Manufacturers" value={new Set(mockSpecs.map(s => s.manufacturer)).size} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Downloads" value={mockSpecs.reduce((sum, s) => sum + s.downloads, 0)} className="bg-transparent border-2 border-ink-800" />
          </Grid>

          <Grid cols={3} gap={4}>
            <Input type="search" placeholder="Search specs..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="border-ink-700 bg-black text-white col-span-2" />
            <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="border-ink-700 bg-black text-white">
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </Select>
          </Grid>

          <Grid cols={3} gap={4}>
            {filteredSpecs.map((spec) => (
              <Card key={spec.id} className={`border-2 p-4 cursor-pointer hover:border-white transition-colors ${getCategoryColor(spec.category)}`} onClick={() => setSelectedSpec(spec)}>
                <Stack gap={4}>
                  <Stack direction="horizontal" className="justify-between items-start">
                    <Stack gap={1}>
                      <Body className="font-display text-white">{spec.name}</Body>
                      <Label className="text-ink-400">{spec.manufacturer}</Label>
                    </Stack>
                    <Badge variant="outline">{spec.category}</Badge>
                  </Stack>
                  <Grid cols={3} gap={2}>
                    {spec.specs.slice(0, 3).map((s, idx) => (
                      <Stack key={idx} gap={0}>
                        <Label size="xs" className="text-ink-500">{s.label}</Label>
                        <Label className="text-white">{s.value}</Label>
                      </Stack>
                    ))}
                  </Grid>
                  <Stack direction="horizontal" className="justify-between">
                    <Label size="xs" className="text-ink-500">v{spec.version} • {spec.fileSize}</Label>
                    <Label size="xs" className="text-ink-500">{spec.downloads} downloads</Label>
                  </Stack>
                </Stack>
              </Card>
            ))}
          </Grid>

          <Grid cols={3} gap={4}>
            <Button variant="outline" className="border-ink-700 text-ink-400">Upload Spec Sheet</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/equipment")}>Equipment</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/knowledge")}>Knowledge Base</Button>
          </Grid>
        </Stack>
      </Container>

      <Modal open={!!selectedSpec} onClose={() => setSelectedSpec(null)}>
        <ModalHeader><H3>{selectedSpec?.name}</H3></ModalHeader>
        <ModalBody>
          {selectedSpec && (
            <Stack gap={4}>
              <Stack direction="horizontal" className="justify-between">
                <Stack gap={1}>
                  <Label className="text-ink-400">Manufacturer</Label>
                  <Body className="text-white">{selectedSpec.manufacturer}</Body>
                </Stack>
                <Badge variant="outline" className={getCategoryColor(selectedSpec.category)}>{selectedSpec.category}</Badge>
              </Stack>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label size="xs" className="text-ink-500">Model</Label><Label className="text-white">{selectedSpec.model}</Label></Stack>
                <Stack gap={1}><Label size="xs" className="text-ink-500">Version</Label><Label className="text-white">{selectedSpec.version}</Label></Stack>
              </Grid>
              <Stack gap={2}>
                <Label className="text-ink-400">Specifications</Label>
                <Table className="border border-ink-700">
                  <TableBody>
                    {selectedSpec.specs.map((spec, idx) => (
                      <TableRow key={idx} className="border-ink-700">
                        <TableCell className="bg-ink-800/50"><Label className="text-ink-400">{spec.label}</Label></TableCell>
                        <TableCell><Label className="text-white">{spec.value}</Label></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Stack>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label size="xs" className="text-ink-500">Last Updated</Label><Label className="text-white">{selectedSpec.lastUpdated}</Label></Stack>
                <Stack gap={1}><Label size="xs" className="text-ink-500">File Size</Label><Label className="text-white">{selectedSpec.fileSize}</Label></Stack>
              </Grid>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedSpec(null)}>Close</Button>
          <Button variant="solid">Download PDF</Button>
        </ModalFooter>
      </Modal>
    </UISection>
  );
}
