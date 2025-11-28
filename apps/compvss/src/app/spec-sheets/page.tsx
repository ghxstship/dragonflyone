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
  Table,
  TableBody,
  TableRow,
  TableCell,
  PageLayout,
  SectionHeader,
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
    <PageLayout background="white" header={<CreatorNavigationAuthenticated />}>
      <Section className="min-h-screen py-16">
        <Container>
          <Stack gap={10}>
            <SectionHeader
              kicker="COMPVSS"
              title="Technical Specifications"
              description="Equipment specification sheets and cut sheets library"
              colorScheme="on-light"
              gap="lg"
            />

            <Grid cols={4} gap={6}>
              <StatCard value={mockSpecs.length.toString()} label="Total Specs" />
              <StatCard value={(categories.length - 1).toString()} label="Categories" />
              <StatCard value={new Set(mockSpecs.map(s => s.manufacturer)).size.toString()} label="Manufacturers" />
              <StatCard value={mockSpecs.reduce((sum, s) => sum + s.downloads, 0).toString()} label="Downloads" />
            </Grid>

            <Grid cols={3} gap={4}>
              <Input type="search" placeholder="Search specs..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="col-span-2" />
              <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </Select>
            </Grid>

            <Grid cols={3} gap={4}>
              {filteredSpecs.map((spec) => (
                <Card key={spec.id} className="cursor-pointer p-4" onClick={() => setSelectedSpec(spec)}>
                  <Stack gap={4}>
                    <Stack direction="horizontal" className="items-start justify-between">
                      <Stack gap={1}>
                        <Body className="font-display">{spec.name}</Body>
                        <Body className="text-body-sm">{spec.manufacturer}</Body>
                      </Stack>
                      <Badge variant="outline">{spec.category}</Badge>
                    </Stack>
                    <Grid cols={3} gap={2}>
                      {spec.specs.slice(0, 3).map((s, idx) => (
                        <Stack key={idx} gap={0}>
                          <Body className="text-body-sm">{s.label}</Body>
                          <Body>{s.value}</Body>
                        </Stack>
                      ))}
                    </Grid>
                    <Stack direction="horizontal" className="justify-between">
                      <Body className="text-body-sm">v{spec.version} • {spec.fileSize}</Body>
                      <Body className="text-body-sm">{spec.downloads} downloads</Body>
                    </Stack>
                  </Stack>
                </Card>
              ))}
            </Grid>

            <Grid cols={3} gap={4}>
              <Button variant="solid">Upload Spec Sheet</Button>
              <Button variant="outline" onClick={() => router.push("/equipment")}>Equipment</Button>
              <Button variant="outline" onClick={() => router.push("/knowledge")}>Knowledge Base</Button>
            </Grid>
          </Stack>
        </Container>
      </Section>

      <Modal open={!!selectedSpec} onClose={() => setSelectedSpec(null)}>
        <ModalHeader><H3>{selectedSpec?.name}</H3></ModalHeader>
        <ModalBody>
          {selectedSpec && (
            <Stack gap={4}>
              <Stack direction="horizontal" className="justify-between">
                <Stack gap={1}>
                  <Body className="text-body-sm">Manufacturer</Body>
                  <Body>{selectedSpec.manufacturer}</Body>
                </Stack>
                <Badge variant="outline">{selectedSpec.category}</Badge>
              </Stack>
              <Grid cols={2} gap={4}>
                <Stack gap={1}>
                  <Body className="text-body-sm">Model</Body>
                  <Body>{selectedSpec.model}</Body>
                </Stack>
                <Stack gap={1}>
                  <Body className="text-body-sm">Version</Body>
                  <Body>{selectedSpec.version}</Body>
                </Stack>
              </Grid>
              <Stack gap={2}>
                <Body className="font-display">Specifications</Body>
                <Table>
                  <TableBody>
                    {selectedSpec.specs.map((spec, idx) => (
                      <TableRow key={idx}>
                        <TableCell><Body className="text-body-sm">{spec.label}</Body></TableCell>
                        <TableCell><Body>{spec.value}</Body></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Stack>
              <Grid cols={2} gap={4}>
                <Stack gap={1}>
                  <Body className="text-body-sm">Last Updated</Body>
                  <Body>{selectedSpec.lastUpdated}</Body>
                </Stack>
                <Stack gap={1}>
                  <Body className="text-body-sm">File Size</Body>
                  <Body>{selectedSpec.fileSize}</Body>
                </Stack>
              </Grid>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedSpec(null)}>Close</Button>
          <Button variant="solid">Download PDF</Button>
        </ModalFooter>
      </Modal>
    </PageLayout>
  );
}
