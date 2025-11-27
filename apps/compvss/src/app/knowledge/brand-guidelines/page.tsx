"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreatorNavigationAuthenticated } from "../../../components/navigation";
import {
  Container, H1, H3, Body, Label, Grid, Stack, StatCard, Input, Select, Button,
  Section as UISection, Card, Tabs, TabsList, Tab, TabPanel, Badge,
  Modal, ModalHeader, ModalBody, ModalFooter,
} from "@ghxstship/ui";

interface BrandAsset {
  id: string;
  name: string;
  type: "Logo" | "Color" | "Typography" | "Template" | "Icon" | "Photo";
  format?: string;
  usage: string;
  downloadUrl?: string;
}

interface BrandGuideline {
  id: string;
  title: string;
  category: string;
  content: string;
  examples?: string[];
}

const mockAssets: BrandAsset[] = [
  { id: "BA-001", name: "Primary Logo - Full Color", type: "Logo", format: "SVG, PNG, EPS", usage: "Primary use on light backgrounds" },
  { id: "BA-002", name: "Primary Logo - White", type: "Logo", format: "SVG, PNG, EPS", usage: "Use on dark backgrounds or photos" },
  { id: "BA-003", name: "Icon Mark", type: "Icon", format: "SVG, PNG", usage: "Social media, favicons, small applications" },
  { id: "BA-004", name: "Brand Colors", type: "Color", usage: "Primary: #000000, Secondary: #FFFFFF, Accent: #3B82F6" },
  { id: "BA-005", name: "Typography - Display", type: "Typography", usage: "Headlines and titles: Inter Bold" },
  { id: "BA-006", name: "Typography - Body", type: "Typography", usage: "Body text: Inter Regular" },
  { id: "BA-007", name: "Email Template", type: "Template", format: "HTML", usage: "Official email communications" },
  { id: "BA-008", name: "Presentation Template", type: "Template", format: "PPTX, KEY", usage: "Client presentations and proposals" },
];

const mockGuidelines: BrandGuideline[] = [
  { id: "BG-001", title: "Logo Clear Space", category: "Logo Usage", content: "Maintain minimum clear space equal to the height of the icon mark around all sides of the logo." },
  { id: "BG-002", title: "Minimum Size", category: "Logo Usage", content: "Logo should never appear smaller than 100px wide for digital or 1 inch for print." },
  { id: "BG-003", title: "Color Application", category: "Color", content: "Primary black should be used for text and primary elements. Accent blue for CTAs and highlights." },
  { id: "BG-004", title: "Photography Style", category: "Photography", content: "Use high-contrast, dynamic imagery that captures the energy of live events. Avoid stock photos." },
  { id: "BG-005", title: "Voice & Tone", category: "Messaging", content: "Professional yet approachable. Confident but not arrogant. Technical expertise with accessible language." },
];

const categories = ["All", "Logo Usage", "Color", "Typography", "Photography", "Messaging"];

export default function BrandGuidelinesPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("assets");
  const [selectedAsset, setSelectedAsset] = useState<BrandAsset | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("All");

  const filteredGuidelines = categoryFilter === "All" ? mockGuidelines : mockGuidelines.filter(g => g.category === categoryFilter);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Logo": return "🎨";
      case "Color": return "🎨";
      case "Typography": return "🔤";
      case "Template": return "📄";
      case "Icon": return "⭐";
      case "Photo": return "📷";
      default: return "📁";
    }
  };

  return (
    <UISection className="relative min-h-screen overflow-hidden bg-ink-950 text-ink-50">
      <Card className="pointer-events-none absolute inset-0 grid-overlay opacity-40" />
      <CreatorNavigationAuthenticated />
      <Container className="py-16">
        <Stack gap={8}>
          <Stack gap={2}>
            <H1>Brand Guidelines</H1>
            <Label className="text-ink-600">Brand standards and asset documentation</Label>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard label="Brand Assets" value={mockAssets.length} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Guidelines" value={mockGuidelines.length} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Templates" value={mockAssets.filter(a => a.type === "Template").length} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Categories" value={categories.length - 1} className="bg-transparent border-2 border-ink-800" />
          </Grid>

          <Tabs>
            <TabsList>
              <Tab active={activeTab === "assets"} onClick={() => setActiveTab("assets")}>Assets</Tab>
              <Tab active={activeTab === "guidelines"} onClick={() => setActiveTab("guidelines")}>Guidelines</Tab>
              <Tab active={activeTab === "colors"} onClick={() => setActiveTab("colors")}>Colors</Tab>
              <Tab active={activeTab === "typography"} onClick={() => setActiveTab("typography")}>Typography</Tab>
            </TabsList>

            <TabPanel active={activeTab === "assets"}>
              <Grid cols={4} gap={4}>
                {mockAssets.map((asset) => (
                  <Card key={asset.id} className="border-2 border-ink-800 bg-ink-900/50 p-4">
                    <Stack gap={3}>
                      <Card className="h-24 bg-ink-800 flex items-center justify-center">
                        <Label className="text-h3-md">{getTypeIcon(asset.type)}</Label>
                      </Card>
                      <Stack gap={1}>
                        <Label className="text-white">{asset.name}</Label>
                        <Badge variant="outline">{asset.type}</Badge>
                      </Stack>
                      {asset.format && <Label size="xs" className="text-ink-500">{asset.format}</Label>}
                      <Button variant="outline" size="sm" onClick={() => setSelectedAsset(asset)}>View</Button>
                    </Stack>
                  </Card>
                ))}
              </Grid>
            </TabPanel>

            <TabPanel active={activeTab === "guidelines"}>
              <Stack gap={4}>
                <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="border-ink-700 bg-black text-white w-48">
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </Select>
                {filteredGuidelines.map((guideline) => (
                  <Card key={guideline.id} className="border-2 border-ink-800 bg-ink-900/50 p-6">
                    <Stack gap={3}>
                      <Stack direction="horizontal" className="justify-between">
                        <Body className="font-display text-white">{guideline.title}</Body>
                        <Badge variant="outline">{guideline.category}</Badge>
                      </Stack>
                      <Body className="text-ink-700">{guideline.content}</Body>
                    </Stack>
                  </Card>
                ))}
              </Stack>
            </TabPanel>

            <TabPanel active={activeTab === "colors"}>
              <Grid cols={3} gap={4}>
                <Card className="border-2 border-ink-800 bg-ink-900/50 overflow-hidden">
                  <Card className="h-32 bg-black" />
                  <Stack className="p-4" gap={2}>
                    <Label className="text-white">Primary Black</Label>
                    <Label className="font-mono text-ink-600">#000000</Label>
                    <Label size="xs" className="text-ink-500">RGB: 0, 0, 0</Label>
                  </Stack>
                </Card>
                <Card className="border-2 border-ink-800 bg-ink-900/50 overflow-hidden">
                  <Card className="h-32 bg-white" />
                  <Stack className="p-4" gap={2}>
                    <Label className="text-white">Primary White</Label>
                    <Label className="font-mono text-ink-600">#FFFFFF</Label>
                    <Label size="xs" className="text-ink-500">RGB: 255, 255, 255</Label>
                  </Stack>
                </Card>
                <Card className="border-2 border-ink-800 bg-ink-900/50 overflow-hidden">
                  <Card className="h-32 bg-info-500" />
                  <Stack className="p-4" gap={2}>
                    <Label className="text-white">Accent Blue</Label>
                    <Label className="font-mono text-ink-600">#3B82F6</Label>
                    <Label size="xs" className="text-ink-500">RGB: 59, 130, 246</Label>
                  </Stack>
                </Card>
              </Grid>
            </TabPanel>

            <TabPanel active={activeTab === "typography"}>
              <Stack gap={6}>
                <Card className="border-2 border-ink-800 bg-ink-900/50 p-6">
                  <Stack gap={4}>
                    <Stack gap={2}>
                      <Badge variant="outline">Display</Badge>
                      <H1>Inter Bold - Headlines</H1>
                    </Stack>
                    <Label className="text-ink-600">Use for main headlines, hero text, and primary titles. Sizes: 48px, 36px, 24px</Label>
                  </Stack>
                </Card>
                <Card className="border-2 border-ink-800 bg-ink-900/50 p-6">
                  <Stack gap={4}>
                    <Stack gap={2}>
                      <Badge variant="outline">Body</Badge>
                      <Body>Inter Regular - Body Text</Body>
                    </Stack>
                    <Label className="text-ink-600">Use for paragraphs, descriptions, and general content. Sizes: 16px, 14px</Label>
                  </Stack>
                </Card>
                <Card className="border-2 border-ink-800 bg-ink-900/50 p-6">
                  <Stack gap={4}>
                    <Stack gap={2}>
                      <Badge variant="outline">Labels</Badge>
                      <Label>Inter Medium - Labels & Captions</Label>
                    </Stack>
                    <Label className="text-ink-600">Use for labels, captions, and supporting text. Sizes: 12px, 10px</Label>
                  </Stack>
                </Card>
              </Stack>
            </TabPanel>
          </Tabs>

          <Grid cols={3} gap={4}>
            <Button variant="outline" className="border-ink-700 text-ink-600" onClick={() => router.push("/knowledge")}>Knowledge Base</Button>
            <Button variant="outline" className="border-ink-700 text-ink-600" onClick={() => router.push("/documents")}>Documents</Button>
            <Button variant="outline" className="border-ink-700 text-ink-600" onClick={() => router.push("/")}>Dashboard</Button>
          </Grid>
        </Stack>
      </Container>

      <Modal open={!!selectedAsset} onClose={() => setSelectedAsset(null)}>
        <ModalHeader><H3>{selectedAsset?.name}</H3></ModalHeader>
        <ModalBody>
          {selectedAsset && (
            <Stack gap={4}>
              <Card className="h-40 bg-ink-800 flex items-center justify-center">
                <Label className="text-h1-sm">{getTypeIcon(selectedAsset.type)}</Label>
              </Card>
              <Badge variant="outline">{selectedAsset.type}</Badge>
              {selectedAsset.format && <Stack gap={1}><Label className="text-ink-600">Formats</Label><Label className="text-white">{selectedAsset.format}</Label></Stack>}
              <Stack gap={1}><Label className="text-ink-600">Usage</Label><Body className="text-ink-700">{selectedAsset.usage}</Body></Stack>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedAsset(null)}>Close</Button>
          <Button variant="solid">Download</Button>
        </ModalFooter>
      </Modal>
    </UISection>
  );
}
