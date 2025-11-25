"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "../../../components/navigation";
import {
  Container, H1, H3, Body, Label, Grid, Stack, StatCard, Input, Select,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Button,
  Section as UISection, Card, Tabs, TabsList, Tab, TabPanel, Badge,
  Modal, ModalHeader, ModalBody, ModalFooter, Textarea,
} from "@ghxstship/ui";

interface AssetSpec {
  id: string;
  name: string;
  category: "Audio" | "Lighting" | "Video" | "Staging" | "Rigging" | "Power" | "Communication";
  manufacturer: string;
  model: string;
  specifications: SpecDetail[];
  documents: Document[];
  relatedAssets: number;
  lastUpdated: string;
}

interface SpecDetail {
  label: string;
  value: string;
  unit?: string;
}

interface Document {
  id: string;
  name: string;
  type: "Manual" | "Datasheet" | "CAD" | "Firmware" | "Safety";
  url: string;
  size: string;
}

const mockSpecs: AssetSpec[] = [
  {
    id: "SPEC-001",
    name: "Robe MegaPointe",
    category: "Lighting",
    manufacturer: "Robe",
    model: "MegaPointe",
    specifications: [
      { label: "Lamp Type", value: "Osram Sirius HRI 470W" },
      { label: "Color Temperature", value: "6800K" },
      { label: "Lumen Output", value: "24000", unit: "lm" },
      { label: "Pan Range", value: "540°" },
      { label: "Tilt Range", value: "270°" },
      { label: "Weight", value: "35", unit: "kg" },
      { label: "Power Consumption", value: "650", unit: "W" },
      { label: "DMX Channels", value: "37" },
    ],
    documents: [
      { id: "DOC-001", name: "User Manual", type: "Manual", url: "/docs/megapointe-manual.pdf", size: "12.5 MB" },
      { id: "DOC-002", name: "Technical Datasheet", type: "Datasheet", url: "/docs/megapointe-spec.pdf", size: "2.1 MB" },
    ],
    relatedAssets: 24,
    lastUpdated: "2024-11-15",
  },
  {
    id: "SPEC-002",
    name: "Meyer Sound LEO-M",
    category: "Audio",
    manufacturer: "Meyer Sound",
    model: "LEO-M",
    specifications: [
      { label: "Frequency Response", value: "30 Hz - 18 kHz" },
      { label: "Max SPL", value: "140", unit: "dB" },
      { label: "Coverage Pattern", value: "110° x 50°" },
      { label: "Weight", value: "68", unit: "kg" },
      { label: "Power Consumption", value: "3600", unit: "W" },
      { label: "Rigging Points", value: "4" },
    ],
    documents: [
      { id: "DOC-003", name: "User Manual", type: "Manual", url: "/docs/leo-m-manual.pdf", size: "8.3 MB" },
      { id: "DOC-004", name: "Rigging Guide", type: "Safety", url: "/docs/leo-m-rigging.pdf", size: "4.2 MB" },
    ],
    relatedAssets: 12,
    lastUpdated: "2024-11-10",
  },
  {
    id: "SPEC-003",
    name: "ROE Visual CB5",
    category: "Video",
    manufacturer: "ROE Visual",
    model: "CB5",
    specifications: [
      { label: "Pixel Pitch", value: "5.77", unit: "mm" },
      { label: "Resolution", value: "104 x 104 px/panel" },
      { label: "Brightness", value: "5500", unit: "nits" },
      { label: "Refresh Rate", value: "3840", unit: "Hz" },
      { label: "Panel Size", value: "600 x 600", unit: "mm" },
      { label: "Weight", value: "9.5", unit: "kg" },
      { label: "Power Consumption", value: "180", unit: "W" },
    ],
    documents: [
      { id: "DOC-005", name: "Technical Manual", type: "Manual", url: "/docs/cb5-manual.pdf", size: "6.7 MB" },
      { id: "DOC-006", name: "CAD Drawings", type: "CAD", url: "/docs/cb5-cad.dwg", size: "1.8 MB" },
    ],
    relatedAssets: 200,
    lastUpdated: "2024-11-20",
  },
  {
    id: "SPEC-004",
    name: "CM Lodestar 1-Ton",
    category: "Rigging",
    manufacturer: "CM",
    model: "Lodestar 1-Ton",
    specifications: [
      { label: "Capacity", value: "1000", unit: "kg" },
      { label: "Lift Speed", value: "4", unit: "m/min" },
      { label: "Chain Size", value: "7.9", unit: "mm" },
      { label: "Motor Power", value: "1.5", unit: "kW" },
      { label: "Weight", value: "45", unit: "kg" },
      { label: "Noise Level", value: "65", unit: "dB" },
    ],
    documents: [
      { id: "DOC-007", name: "Safety Manual", type: "Safety", url: "/docs/lodestar-safety.pdf", size: "3.4 MB" },
      { id: "DOC-008", name: "Inspection Checklist", type: "Manual", url: "/docs/lodestar-inspection.pdf", size: "0.8 MB" },
    ],
    relatedAssets: 20,
    lastUpdated: "2024-10-25",
  },
];

export default function AssetSpecificationsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("library");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSpec, setSelectedSpec] = useState<AssetSpec | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSpecs = mockSpecs.filter(s => {
    const matchesCategory = selectedCategory === "All" || s.category === selectedCategory;
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.manufacturer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.model.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalDocs = mockSpecs.reduce((sum, s) => sum + s.documents.length, 0);

  return (
    <UISection className="relative min-h-screen overflow-hidden bg-ink-950 text-ink-50">
      <Card className="pointer-events-none absolute inset-0 grid-overlay opacity-40" />
      <Navigation />
      <Container className="py-16">
        <Stack gap={8}>
          <Stack gap={2}>
            <H1>Asset Specifications Library</H1>
            <Label className="text-ink-400">Technical documentation, specifications, and manuals for all equipment</Label>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard label="Spec Sheets" value={mockSpecs.length} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Documents" value={totalDocs} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Categories" value={7} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Linked Assets" value={mockSpecs.reduce((sum, s) => sum + s.relatedAssets, 0)} className="bg-transparent border-2 border-ink-800" />
          </Grid>

          <Grid cols={3} gap={4}>
            <Input type="search" placeholder="Search specifications..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="border-ink-700 bg-black text-white" />
            <Select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="border-ink-700 bg-black text-white">
              <option value="All">All Categories</option>
              <option value="Audio">Audio</option>
              <option value="Lighting">Lighting</option>
              <option value="Video">Video</option>
              <option value="Staging">Staging</option>
              <option value="Rigging">Rigging</option>
              <option value="Power">Power</option>
              <option value="Communication">Communication</option>
            </Select>
            <Button variant="outlineWhite" onClick={() => setShowAddModal(true)}>Add Specification</Button>
          </Grid>

          <Tabs>
            <TabsList>
              <Tab active={activeTab === "library"} onClick={() => setActiveTab("library")}>Spec Library</Tab>
              <Tab active={activeTab === "documents"} onClick={() => setActiveTab("documents")}>All Documents</Tab>
            </TabsList>

            <TabPanel active={activeTab === "library"}>
              <Grid cols={2} gap={6}>
                {filteredSpecs.map((spec) => (
                  <Card key={spec.id} className="border-2 border-ink-800 bg-ink-900/50 overflow-hidden">
                    <Card className="p-4 bg-ink-800">
                      <Stack direction="horizontal" className="justify-between items-start">
                        <Stack gap={1}>
                          <Body className="font-display text-white text-lg">{spec.name}</Body>
                          <Label className="text-ink-400">{spec.manufacturer} • {spec.model}</Label>
                        </Stack>
                        <Badge variant="outline">{spec.category}</Badge>
                      </Stack>
                    </Card>
                    <Stack className="p-4" gap={4}>
                      <Grid cols={2} gap={2}>
                        {spec.specifications.slice(0, 4).map((s, idx) => (
                          <Stack key={idx} gap={0}>
                            <Label size="xs" className="text-ink-500">{s.label}</Label>
                            <Label className="text-white">{s.value}{s.unit ? ` ${s.unit}` : ""}</Label>
                          </Stack>
                        ))}
                      </Grid>
                      <Stack direction="horizontal" className="justify-between items-center">
                        <Label className="text-ink-400">{spec.documents.length} documents • {spec.relatedAssets} assets</Label>
                        <Button variant="outline" size="sm" onClick={() => setSelectedSpec(spec)}>View Details</Button>
                      </Stack>
                    </Stack>
                  </Card>
                ))}
              </Grid>
            </TabPanel>

            <TabPanel active={activeTab === "documents"}>
              <Table className="border-2 border-ink-800">
                <TableHeader>
                  <TableRow className="bg-ink-900">
                    <TableHead>Document</TableHead>
                    <TableHead>Equipment</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockSpecs.flatMap(spec => spec.documents.map(doc => ({ ...doc, specName: spec.name, category: spec.category }))).map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell><Body className="text-white">{doc.name}</Body></TableCell>
                      <TableCell><Label className="text-ink-300">{doc.specName}</Label></TableCell>
                      <TableCell><Badge variant="outline">{doc.type}</Badge></TableCell>
                      <TableCell><Label className="text-ink-400">{doc.size}</Label></TableCell>
                      <TableCell>
                        <Stack direction="horizontal" gap={2}>
                          <Button variant="ghost" size="sm">View</Button>
                          <Button variant="outline" size="sm">Download</Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabPanel>
          </Tabs>

          <Grid cols={3} gap={4}>
            <Button variant="outline" className="border-ink-700 text-ink-400">Import Specs</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400">Export Library</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/assets")}>Back to Assets</Button>
          </Grid>
        </Stack>
      </Container>

      <Modal open={!!selectedSpec} onClose={() => setSelectedSpec(null)}>
        <ModalHeader><H3>{selectedSpec?.name}</H3></ModalHeader>
        <ModalBody>
          {selectedSpec && (
            <Stack gap={4}>
              <Stack direction="horizontal" gap={2}>
                <Badge variant="outline">{selectedSpec.category}</Badge>
                <Label className="text-ink-400">{selectedSpec.manufacturer} • {selectedSpec.model}</Label>
              </Stack>
              
              <Stack gap={2}>
                <Label className="text-ink-400">Specifications</Label>
                <Grid cols={2} gap={3}>
                  {selectedSpec.specifications.map((s, idx) => (
                    <Card key={idx} className="p-2 bg-ink-800 border border-ink-700">
                      <Stack gap={0}>
                        <Label size="xs" className="text-ink-500">{s.label}</Label>
                        <Label className="text-white">{s.value}{s.unit ? ` ${s.unit}` : ""}</Label>
                      </Stack>
                    </Card>
                  ))}
                </Grid>
              </Stack>

              <Stack gap={2}>
                <Label className="text-ink-400">Documents</Label>
                {selectedSpec.documents.map((doc) => (
                  <Card key={doc.id} className="p-3 bg-ink-800 border border-ink-700">
                    <Stack direction="horizontal" className="justify-between items-center">
                      <Stack gap={1}>
                        <Label className="text-white">{doc.name}</Label>
                        <Stack direction="horizontal" gap={2}>
                          <Badge variant="outline">{doc.type}</Badge>
                          <Label size="xs" className="text-ink-500">{doc.size}</Label>
                        </Stack>
                      </Stack>
                      <Button variant="outline" size="sm">Download</Button>
                    </Stack>
                  </Card>
                ))}
              </Stack>

              <Stack gap={1}>
                <Label size="xs" className="text-ink-500">Last Updated</Label>
                <Label className="text-white">{selectedSpec.lastUpdated}</Label>
              </Stack>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedSpec(null)}>Close</Button>
          <Button variant="solid">Edit Specification</Button>
        </ModalFooter>
      </Modal>

      <Modal open={showAddModal} onClose={() => setShowAddModal(false)}>
        <ModalHeader><H3>Add Specification</H3></ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Input placeholder="Equipment Name" className="border-ink-700 bg-black text-white" />
            <Grid cols={2} gap={4}>
              <Input placeholder="Manufacturer" className="border-ink-700 bg-black text-white" />
              <Input placeholder="Model" className="border-ink-700 bg-black text-white" />
            </Grid>
            <Select className="border-ink-700 bg-black text-white">
              <option value="">Category...</option>
              <option value="Audio">Audio</option>
              <option value="Lighting">Lighting</option>
              <option value="Video">Video</option>
              <option value="Staging">Staging</option>
              <option value="Rigging">Rigging</option>
              <option value="Power">Power</option>
              <option value="Communication">Communication</option>
            </Select>
            <Textarea placeholder="Key specifications (one per line)..." className="border-ink-700 bg-black text-white" rows={4} />
            <Stack gap={2}>
              <Label>Upload Documents</Label>
              <Card className="p-4 border-2 border-dashed border-ink-700 text-center cursor-pointer">
                <Label className="text-ink-400">Drop files here or click to upload</Label>
              </Card>
            </Stack>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
          <Button variant="solid" onClick={() => setShowAddModal(false)}>Add Specification</Button>
        </ModalFooter>
      </Modal>
    </UISection>
  );
}
