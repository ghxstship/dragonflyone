"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTabState } from "@ghxstship/config/hooks";
import { CompvssAppLayout } from "../../../components/app-layout";
import { Palette, Type, FileText, Star, Camera, Folder } from "lucide-react";
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
  useBrandAssets,
  useBrandGuidelines,
  type BrandAsset,
} from "../../../hooks/useBrandAssets";

const categories = ["All", "Logo Usage", "Color", "Typography", "Photography", "Messaging"];

export default function BrandGuidelinesPage() {
  const router = useRouter();
  const { data: assets = [] } = useBrandAssets();
  const { data: guidelines = [] } = useBrandGuidelines();
  
  // URL-synced tab state for deep-linking support
  const { setActiveTab, isActive } = useTabState({
    defaultTab: 'assets',
    validTabs: ['assets', 'guidelines', 'colors', 'typography'],
  });
  const [selectedAsset, setSelectedAsset] = useState<BrandAsset | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("All");

  const filteredGuidelines = categoryFilter === "All" ? guidelines : guidelines.filter(g => g.category === categoryFilter);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Logo": return <Palette className="size-8" />;
      case "Color": return <Palette className="size-8" />;
      case "Typography": return <Type className="size-8" />;
      case "Template": return <FileText className="size-8" />;
      case "Icon": return <Star className="size-8" />;
      case "Photo": return <Camera className="size-8" />;
      default: return <Folder className="size-8" />;
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
              <StatCard value={assets.length.toString()} label="Brand Assets" />
              <StatCard value={guidelines.length.toString()} label="Guidelines" />
              <StatCard value={assets.filter(a => a.type === "Template").length.toString()} label="Templates" />
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
                  {assets.map((asset) => (
                    <Card key={asset.id} className="p-4">
                      <Stack gap={3}>
                        <Card className="flex h-24 items-center justify-center">
                          {getTypeIcon(asset.type)}
                        </Card>
                        <Stack gap={1}>
                          <Body>{asset.name}</Body>
                          <Badge variant="outline">{asset.type}</Badge>
                        </Stack>
                        {asset.format && <Body size="sm" className="">{asset.format}</Body>}
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
                      <Body size="sm" className="">#000000</Body>
                      <Body size="sm" className="">RGB: 0, 0, 0</Body>
                    </Stack>
                  </Card>
                  <Card className="overflow-hidden">
                    <Card className="h-32 bg-white border-b" />
                    <Stack className="p-4" gap={2}>
                      <Body>Primary White</Body>
                      <Body size="sm" className="">#FFFFFF</Body>
                      <Body size="sm" className="">RGB: 255, 255, 255</Body>
                    </Stack>
                  </Card>
                  <Card className="overflow-hidden">
                    <Card className="h-32 bg-primary-500" />
                    <Stack className="p-4" gap={2}>
                      <Body>Accent Blue</Body>
                      <Body size="sm" className="">#3B82F6</Body>
                      <Body size="sm" className="">RGB: 59, 130, 246</Body>
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
                      <Body size="sm" className="">Use for main headlines, hero text, and primary titles. Sizes: 48px, 36px, 24px</Body>
                    </Stack>
                  </Card>
                  <Card className="p-6">
                    <Stack gap={4}>
                      <Stack gap={2}>
                        <Badge variant="outline">Body</Badge>
                        <Body>Inter Regular - Body Text</Body>
                      </Stack>
                      <Body size="sm" className="">Use for paragraphs, descriptions, and general content. Sizes: 16px, 14px</Body>
                    </Stack>
                  </Card>
                  <Card className="p-6">
                    <Stack gap={4}>
                      <Stack gap={2}>
                        <Badge variant="outline">Labels</Badge>
                        <Body size="sm" className="">Inter Medium - Labels & Captions</Body>
                      </Stack>
                      <Body size="sm" className="">Use for labels, captions, and supporting text. Sizes: 12px, 10px</Body>
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
                {getTypeIcon(selectedAsset.type)}
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
