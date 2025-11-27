"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Container, H1, H3, Body, Label, Grid, Stack, StatCard, Input, Select, Button,
  Section as UISection, Card, Tabs, TabsList, Tab, TabPanel, Badge,
  Modal, ModalHeader, ModalBody, ModalFooter, Textarea,
} from "@ghxstship/ui";

interface MediaAsset {
  id: string;
  name: string;
  type: "Logo" | "Photo" | "Video" | "Press Release" | "Fact Sheet" | "Bio";
  format: string;
  size: string;
  event?: string;
  lastUpdated: string;
}

interface PressRelease {
  id: string;
  title: string;
  event: string;
  date: string;
  status: "Draft" | "Published" | "Distributed";
  downloads: number;
}

const mockAssets: MediaAsset[] = [
  { id: "MA-001", name: "Event Logo - Full Color", type: "Logo", format: "SVG, PNG, EPS", size: "2.4 MB", event: "Summer Music Festival 2025", lastUpdated: "2024-11-20" },
  { id: "MA-002", name: "Event Logo - White", type: "Logo", format: "SVG, PNG, EPS", size: "2.1 MB", event: "Summer Music Festival 2025", lastUpdated: "2024-11-20" },
  { id: "MA-003", name: "Hero Image - Main Stage", type: "Photo", format: "JPG", size: "8.5 MB", event: "Summer Music Festival 2025", lastUpdated: "2024-11-18" },
  { id: "MA-004", name: "Promo Video - 30s", type: "Video", format: "MP4", size: "45 MB", event: "Summer Music Festival 2025", lastUpdated: "2024-11-15" },
  { id: "MA-005", name: "Event Fact Sheet", type: "Fact Sheet", format: "PDF", size: "1.2 MB", event: "Summer Music Festival 2025", lastUpdated: "2024-11-22" },
  { id: "MA-006", name: "Artist Bios", type: "Bio", format: "PDF, DOCX", size: "3.8 MB", event: "Summer Music Festival 2025", lastUpdated: "2024-11-19" },
];

const mockReleases: PressRelease[] = [
  { id: "PR-001", title: "Summer Music Festival 2025 Lineup Announced", event: "Summer Music Festival 2025", date: "2024-11-20", status: "Published", downloads: 245 },
  { id: "PR-002", title: "Early Bird Tickets Now Available", event: "Summer Music Festival 2025", date: "2024-11-15", status: "Distributed", downloads: 189 },
  { id: "PR-003", title: "New Year Gala VIP Experience Details", event: "New Year Gala", date: "2024-11-25", status: "Draft", downloads: 0 },
];

export default function MediaKitPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("assets");
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showReleaseModal, setShowReleaseModal] = useState(false);

  const totalDownloads = mockReleases.reduce((s, r) => s + r.downloads, 0);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Logo": return "🎨";
      case "Photo": return "📷";
      case "Video": return "🎬";
      case "Press Release": return "📰";
      case "Fact Sheet": return "📋";
      case "Bio": return "👤";
      default: return "📁";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Published": return "text-success-600";
      case "Distributed": return "text-info-600";
      case "Draft": return "text-ink-600";
      default: return "text-ink-600";
    }
  };

  return (
    <UISection className="min-h-screen bg-white">
      <Container className="py-8">
        <Stack gap={8}>
          <Stack gap={2}>
            <H1>MEDIA KIT</H1>
            <Body className="text-ink-600">Press materials and media asset distribution</Body>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard label="Media Assets" value={mockAssets.length} className="border-2 border-black" />
            <StatCard label="Press Releases" value={mockReleases.length} className="border-2 border-black" />
            <StatCard label="Total Downloads" value={totalDownloads} className="border-2 border-black" />
            <StatCard label="Published" value={mockReleases.filter(r => r.status !== "Draft").length} className="border-2 border-black" />
          </Grid>

          <Tabs>
            <TabsList>
              <Tab active={activeTab === "assets"} onClick={() => setActiveTab("assets")}>Media Assets</Tab>
              <Tab active={activeTab === "releases"} onClick={() => setActiveTab("releases")}>Press Releases</Tab>
              <Tab active={activeTab === "contacts"} onClick={() => setActiveTab("contacts")}>Press Contacts</Tab>
            </TabsList>

            <TabPanel active={activeTab === "assets"}>
              <Stack gap={4}>
                <Stack direction="horizontal" className="justify-between">
                  <Select className="border-2 border-black">
                    <option value="">All Events</option>
                    <option value="summer">Summer Music Festival 2025</option>
                    <option value="gala">New Year Gala</option>
                  </Select>
                  <Button variant="solid" onClick={() => setShowUploadModal(true)}>Upload Asset</Button>
                </Stack>
                <Grid cols={3} gap={4}>
                  {mockAssets.map((asset) => (
                    <Card key={asset.id} className="border-2 border-black p-4">
                      <Stack gap={3}>
                        <Card className="h-24 bg-ink-100 flex items-center justify-center">
                          <Label className="text-h3-md">{getTypeIcon(asset.type)}</Label>
                        </Card>
                        <Stack gap={1}>
                          <Label className="font-bold">{asset.name}</Label>
                          <Badge variant="outline">{asset.type}</Badge>
                        </Stack>
                        <Stack direction="horizontal" className="justify-between">
                          <Label className="text-ink-500">{asset.format}</Label>
                          <Label className="text-ink-500">{asset.size}</Label>
                        </Stack>
                        <Stack direction="horizontal" gap={2}>
                          <Button variant="outline" size="sm" onClick={() => setSelectedAsset(asset)}>Preview</Button>
                          <Button variant="solid" size="sm">Download</Button>
                        </Stack>
                      </Stack>
                    </Card>
                  ))}
                </Grid>
              </Stack>
            </TabPanel>

            <TabPanel active={activeTab === "releases"}>
              <Stack gap={4}>
                <Stack direction="horizontal" className="justify-end">
                  <Button variant="solid" onClick={() => setShowReleaseModal(true)}>Create Release</Button>
                </Stack>
                {mockReleases.map((release) => (
                  <Card key={release.id} className="border-2 border-black p-6">
                    <Grid cols={4} gap={4} className="items-center">
                      <Stack gap={1}>
                        <Body className="font-bold">{release.title}</Body>
                        <Label className="text-ink-500">{release.event}</Label>
                      </Stack>
                      <Label className="text-ink-600">{release.date}</Label>
                      <Stack direction="horizontal" gap={2}>
                        <Label className={getStatusColor(release.status)}>{release.status}</Label>
                        {release.downloads > 0 && <Label className="text-ink-500">{release.downloads} downloads</Label>}
                      </Stack>
                      <Stack direction="horizontal" gap={2}>
                        <Button variant="outline" size="sm">Edit</Button>
                        {release.status === "Draft" && <Button variant="solid" size="sm">Publish</Button>}
                        {release.status === "Published" && <Button variant="solid" size="sm">Distribute</Button>}
                      </Stack>
                    </Grid>
                  </Card>
                ))}
              </Stack>
            </TabPanel>

            <TabPanel active={activeTab === "contacts"}>
              <Card className="border-2 border-black p-6">
                <Stack gap={6}>
                  <H3>Press Contact Information</H3>
                  <Grid cols={2} gap={6}>
                    <Card className="p-4 border border-ink-200">
                      <Stack gap={2}>
                        <Label className="font-bold">Media Inquiries</Label>
                        <Label>press@company.com</Label>
                        <Label>+1 (555) 123-4567</Label>
                      </Stack>
                    </Card>
                    <Card className="p-4 border border-ink-200">
                      <Stack gap={2}>
                        <Label className="font-bold">Press Contact</Label>
                        <Label>Sarah Johnson</Label>
                        <Label>Director of Communications</Label>
                      </Stack>
                    </Card>
                  </Grid>
                  <Stack gap={2}>
                    <Label className="font-bold">Distribution Lists</Label>
                    <Grid cols={3} gap={4}>
                      {[
                        { name: "Music Press", count: 245 },
                        { name: "Local Media", count: 89 },
                        { name: "Industry Publications", count: 56 },
                      ].map((list, idx) => (
                        <Card key={idx} className="p-3 border border-ink-200">
                          <Stack direction="horizontal" className="justify-between">
                            <Label>{list.name}</Label>
                            <Label className="text-ink-500">{list.count} contacts</Label>
                          </Stack>
                        </Card>
                      ))}
                    </Grid>
                  </Stack>
                </Stack>
              </Card>
            </TabPanel>
          </Tabs>

          <Card className="border-2 border-black p-6">
            <Stack gap={4}>
              <H3>Download Complete Media Kit</H3>
              <Body className="text-ink-600">Get all media assets, press releases, and fact sheets in one download.</Body>
              <Stack direction="horizontal" gap={4}>
                <Button variant="solid">Download Full Kit (ZIP)</Button>
                <Button variant="outline">Generate Custom Kit</Button>
              </Stack>
            </Stack>
          </Card>

          <Button variant="outline" onClick={() => router.push("/marketing")}>Back to Marketing</Button>
        </Stack>
      </Container>

      <Modal open={!!selectedAsset} onClose={() => setSelectedAsset(null)}>
        <ModalHeader><H3>Asset Preview</H3></ModalHeader>
        <ModalBody>
          {selectedAsset && (
            <Stack gap={4}>
              <Card className="h-48 bg-ink-100 flex items-center justify-center">
                <Label className="text-h1-sm">{getTypeIcon(selectedAsset.type)}</Label>
              </Card>
              <Body className="font-bold">{selectedAsset.name}</Body>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label className="text-ink-500">Type</Label><Badge variant="outline">{selectedAsset.type}</Badge></Stack>
                <Stack gap={1}><Label className="text-ink-500">Format</Label><Label>{selectedAsset.format}</Label></Stack>
              </Grid>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label className="text-ink-500">Size</Label><Label>{selectedAsset.size}</Label></Stack>
                <Stack gap={1}><Label className="text-ink-500">Updated</Label><Label>{selectedAsset.lastUpdated}</Label></Stack>
              </Grid>
              {selectedAsset.event && <Stack gap={1}><Label className="text-ink-500">Event</Label><Label>{selectedAsset.event}</Label></Stack>}
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedAsset(null)}>Close</Button>
          <Button variant="solid">Download</Button>
        </ModalFooter>
      </Modal>

      <Modal open={showUploadModal} onClose={() => setShowUploadModal(false)}>
        <ModalHeader><H3>Upload Media Asset</H3></ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Card className="p-8 border-2 border-dashed border-ink-300 text-center">
              <Stack gap={2}>
                <Label className="text-h3-md">📁</Label>
                <Label className="text-ink-500">Drag and drop files here</Label>
                <Button variant="outline">Browse Files</Button>
              </Stack>
            </Card>
            <Input placeholder="Asset Name" className="border-2 border-black" />
            <Select className="border-2 border-black">
              <option value="">Asset Type...</option>
              <option value="logo">Logo</option>
              <option value="photo">Photo</option>
              <option value="video">Video</option>
              <option value="factsheet">Fact Sheet</option>
              <option value="bio">Bio</option>
            </Select>
            <Select className="border-2 border-black">
              <option value="">Event...</option>
              <option value="summer">Summer Music Festival 2025</option>
              <option value="gala">New Year Gala</option>
            </Select>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowUploadModal(false)}>Cancel</Button>
          <Button variant="solid" onClick={() => setShowUploadModal(false)}>Upload</Button>
        </ModalFooter>
      </Modal>

      <Modal open={showReleaseModal} onClose={() => setShowReleaseModal(false)}>
        <ModalHeader><H3>Create Press Release</H3></ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Input placeholder="Title" className="border-2 border-black" />
            <Select className="border-2 border-black">
              <option value="">Event...</option>
              <option value="summer">Summer Music Festival 2025</option>
              <option value="gala">New Year Gala</option>
            </Select>
            <Input type="date" className="border-2 border-black" />
            <Textarea placeholder="Press release content..." rows={6} className="border-2 border-black" />
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowReleaseModal(false)}>Cancel</Button>
          <Button variant="outline">Save Draft</Button>
          <Button variant="solid" onClick={() => setShowReleaseModal(false)}>Publish</Button>
        </ModalFooter>
      </Modal>
    </UISection>
  );
}
