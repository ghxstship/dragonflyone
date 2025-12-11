"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTabState } from "@ghxstship/config/hooks";
import { CompvssAppLayout } from "../../../components/app-layout";
import {
  Container,
  H3,
  Body,
  Grid,
  Stack,
  StatCard,
  Select,
  Button,
  Card,
  Tabs,
  TabsList,
  Tab,
  TabPanel,
  Badge,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  EnterprisePageHeader,
  MainContent,
} from "@ghxstship/ui";

import {
  DEMO_BRAND_ASSETS,
  DEMO_BRAND_GUIDELINES,
  type DemoBrandAsset as BrandAsset,
} from "../../../lib/demo-data";

const mockAssets = DEMO_BRAND_ASSETS;
const mockGuidelines = DEMO_BRAND_GUIDELINES;

const categories = ["All", "Logo Usage", "Color", "Typography", "Photography", "Messaging"];

export default function BrandGuidelinesPage() {
  const router = useRouter();
  
  // URL-synced tab state for deep-linking support
  const { setActiveTab, isActive } = useTabState({
    defaultTab: 'assets',
    validTabs: ['assets', 'guidelines', 'colors', 'typography'],
  });
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
    <CompvssAppLayout>
      <EnterprisePageHeader
        title="Brand Guidelines"
        subtitle="Brand standards and asset documentation"


        showFavorite
        showSettings
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={10}>

            <Grid cols={4} gap={6}>
              <StatCard value={mockAssets.length.toString()} label="Brand Assets" />
              <StatCard value={mockGuidelines.length.toString()} label="Guidelines" />
              <StatCard value={mockAssets.filter(a => a.type === "Template").length.toString()} label="Templates" />
              <StatCard value={(categories.length - 1).toString()} label="Categories" />
            </Grid>

            <Tabs>
              <TabsList>
                <Tab active={isActive('assets')} onClick={() => setActiveTab('assets')}>Assets</Tab>
                <Tab active={isActive('guidelines')} onClick={() => setActiveTab('guidelines')}>Guidelines</Tab>
                <Tab active={isActive('colors')} onClick={() => setActiveTab('colors')}>Colors</Tab>
                <Tab active={isActive('typography')} onClick={() => setActiveTab('typography')}>Typography</Tab>
              </TabsList>

              <TabPanel active={isActive('assets')}>
                <Grid cols={4} gap={4}>
                  {mockAssets.map((asset) => (
                    <Card key={asset.id} className="p-4">
                      <Stack gap={3}>
                        <Card className="flex h-24 items-center justify-center">
                          <Body className="text-h3-md">{getTypeIcon(asset.type)}</Body>
                        </Card>
                        <Stack gap={1}>
                          <Body>{asset.name}</Body>
                          <Badge variant="outline">{asset.type}</Badge>
                        </Stack>
                        {asset.format && <Body className="text-body-sm">{asset.format}</Body>}
                        <Button variant="outline" size="sm" onClick={() => setSelectedAsset(asset)}>View</Button>
                      </Stack>
                    </Card>
                  ))}
                </Grid>
              </TabPanel>

              <TabPanel active={isActive('guidelines')}>
                <Stack gap={4}>
                  <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="w-48">
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </Select>
                  {filteredGuidelines.map((guideline) => (
                    <Card key={guideline.id} className="p-6">
                      <Stack gap={3}>
                        <Stack direction="horizontal" className="justify-between">
                          <Body className="font-display">{guideline.title}</Body>
                          <Badge variant="outline">{guideline.category}</Badge>
                        </Stack>
                        <Body>{guideline.content}</Body>
                      </Stack>
                    </Card>
                  ))}
                </Stack>
              </TabPanel>

              <TabPanel active={isActive('colors')}>
                <Grid cols={3} gap={4}>
                  <Card className="overflow-hidden">
                    <Card className="h-32 bg-black" />
                    <Stack className="p-4" gap={2}>
                      <Body>Primary Black</Body>
                      <Body className="text-body-sm">#000000</Body>
                      <Body className="text-body-sm">RGB: 0, 0, 0</Body>
                    </Stack>
                  </Card>
                  <Card className="overflow-hidden">
                    <Card className="h-32 bg-white border-b" />
                    <Stack className="p-4" gap={2}>
                      <Body>Primary White</Body>
                      <Body className="text-body-sm">#FFFFFF</Body>
                      <Body className="text-body-sm">RGB: 255, 255, 255</Body>
                    </Stack>
                  </Card>
                  <Card className="overflow-hidden">
                    <Card className="h-32 bg-primary-500" />
                    <Stack className="p-4" gap={2}>
                      <Body>Accent Blue</Body>
                      <Body className="text-body-sm">#3B82F6</Body>
                      <Body className="text-body-sm">RGB: 59, 130, 246</Body>
                    </Stack>
                  </Card>
                </Grid>
              </TabPanel>

              <TabPanel active={isActive('typography')}>
                <Stack gap={6}>
                  <Card className="p-6">
                    <Stack gap={4}>
                      <Stack gap={2}>
                        <Badge variant="outline">Display</Badge>
                        <H3>Inter Bold - Headlines</H3>
                      </Stack>
                      <Body className="text-body-sm">Use for main headlines, hero text, and primary titles. Sizes: 48px, 36px, 24px</Body>
                    </Stack>
                  </Card>
                  <Card className="p-6">
                    <Stack gap={4}>
                      <Stack gap={2}>
                        <Badge variant="outline">Body</Badge>
                        <Body>Inter Regular - Body Text</Body>
                      </Stack>
                      <Body className="text-body-sm">Use for paragraphs, descriptions, and general content. Sizes: 16px, 14px</Body>
                    </Stack>
                  </Card>
                  <Card className="p-6">
                    <Stack gap={4}>
                      <Stack gap={2}>
                        <Badge variant="outline">Labels</Badge>
                        <Body className="text-body-sm">Inter Medium - Labels & Captions</Body>
                      </Stack>
                      <Body className="text-body-sm">Use for labels, captions, and supporting text. Sizes: 12px, 10px</Body>
                    </Stack>
                  </Card>
                </Stack>
              </TabPanel>
            </Tabs>

            <Grid cols={3} gap={4}>
              <Button variant="outline" onClick={() => router.push("/knowledge")}>Knowledge Base</Button>
              <Button variant="outline" onClick={() => router.push("/documents")}>Documents</Button>
              <Button variant="outline" onClick={() => router.push("/dashboard")}>Dashboard</Button>
            </Grid>
          </Stack>
        </Container>
      </MainContent>

      <Modal open={!!selectedAsset} onClose={() => setSelectedAsset(null)}>
        <ModalHeader><H3>{selectedAsset?.name}</H3></ModalHeader>
        <ModalBody>
          {selectedAsset && (
            <Stack gap={4}>
              <Card className="flex h-40 items-center justify-center">
                <Body className="text-h1-sm">{getTypeIcon(selectedAsset.type)}</Body>
              </Card>
              <Badge variant="outline">{selectedAsset.type}</Badge>
              {selectedAsset.format && (
                <Stack gap={1}>
                  <Body className="font-display">Formats</Body>
                  <Body>{selectedAsset.format}</Body>
                </Stack>
              )}
              <Stack gap={1}>
                <Body className="font-display">Usage</Body>
                <Body>{selectedAsset.usage}</Body>
              </Stack>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedAsset(null)}>Close</Button>
          <Button variant="solid">Download</Button>
        </ModalFooter>
      </Modal>
    </CompvssAppLayout>
  );
}
