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
  Textarea,
  PageLayout,
  SectionHeader,
  EnterprisePageHeader,
  MainContent,} from "@ghxstship/ui";

interface Drawing {
  id: string;
  name: string;
  type: "CAD" | "PDF" | "Vectorworks" | "AutoCAD" | "SketchUp";
  category: "Stage" | "Lighting" | "Audio" | "Video" | "Rigging" | "Site";
  project: string;
  version: number;
  uploadedBy: string;
  uploadedAt: string;
  size: string;
  status: "Current" | "Superseded" | "Draft";
  markups: number;
}

const mockDrawings: Drawing[] = [
  { id: "DWG-001", name: "Main Stage Layout", type: "Vectorworks", category: "Stage", project: "Summer Fest 2024", version: 4, uploadedBy: "John Smith", uploadedAt: "2024-11-24", size: "12.4 MB", status: "Current", markups: 3 },
  { id: "DWG-002", name: "Lighting Plot", type: "Vectorworks", category: "Lighting", project: "Summer Fest 2024", version: 6, uploadedBy: "Sarah Johnson", uploadedAt: "2024-11-23", size: "8.7 MB", status: "Current", markups: 5 },
  { id: "DWG-003", name: "Audio System Layout", type: "AutoCAD", category: "Audio", project: "Summer Fest 2024", version: 3, uploadedBy: "Mike Davis", uploadedAt: "2024-11-22", size: "5.2 MB", status: "Current", markups: 2 },
  { id: "DWG-004", name: "Rigging Plot", type: "CAD", category: "Rigging", project: "Summer Fest 2024", version: 2, uploadedBy: "Emily Chen", uploadedAt: "2024-11-21", size: "6.8 MB", status: "Current", markups: 1 },
  { id: "DWG-005", name: "Site Plan", type: "PDF", category: "Site", project: "Summer Fest 2024", version: 1, uploadedBy: "John Smith", uploadedAt: "2024-11-20", size: "3.5 MB", status: "Current", markups: 0 },
];

const categories = ["All", "Stage", "Lighting", "Audio", "Video", "Rigging", "Site"];

export default function DrawingsPage() {
  const router = useRouter();
  const [selectedDrawing, setSelectedDrawing] = useState<Drawing | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filteredDrawings = categoryFilter === "All" ? mockDrawings : mockDrawings.filter(d => d.category === categoryFilter);
  const totalMarkups = mockDrawings.reduce((s, d) => s + d.markups, 0);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Vectorworks": return "📐";
      case "AutoCAD": return "🔧";
      case "SketchUp": return "🏗️";
      case "CAD": return "📏";
      case "PDF": return "📄";
      default: return "📁";
    }
  };

  return (
    <PageLayout background="white" header={<CreatorNavigationAuthenticated />}>
      <Section className="min-h-screen py-16">
        <Container>
          <Stack gap={10}>
            {/* Page Header */}
            <EnterprisePageHeader
        title="Drawings & CAD Files"
        subtitle="Technical drawings with markup and version control"
        breadcrumbs={[{ label: 'COMPVSS', href: '/dashboard' }, { label: 'Drawings' }]}
        views={[
          { id: 'default', label: 'Default', icon: 'grid' },
        ]}
        activeView="default"
        showFavorite
        showSettings
      />

            {/* Stats Grid */}
            <Grid cols={4} gap={6}>
              <StatCard value={mockDrawings.length.toString()} label="Total Drawings" />
              <StatCard value={(categories.length - 1).toString()} label="Categories" />
              <StatCard value={totalMarkups.toString()} label="Active Markups" />
              <StatCard value={mockDrawings.filter(d => d.uploadedAt === "2024-11-24").length.toString()} label="Updated Today" />
            </Grid>

            {/* Filters and Actions */}
            <Stack direction="horizontal" className="justify-between">
              <Stack direction="horizontal" gap={4}>
                <Input type="search" placeholder="Search drawings..." className="w-64" />
                <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </Select>
              </Stack>
              <Stack direction="horizontal" gap={2}>
                <Button variant={viewMode === "grid" ? "solid" : "outline"} size="sm" onClick={() => setViewMode("grid")}>Grid</Button>
                <Button variant={viewMode === "list" ? "solid" : "outline"} size="sm" onClick={() => setViewMode("list")}>List</Button>
                <Button variant="solid" onClick={() => setShowUploadModal(true)}>Upload Drawing</Button>
              </Stack>
            </Stack>

            {/* Drawings Display */}
            {viewMode === "grid" ? (
              <Grid cols={3} gap={4}>
                {filteredDrawings.map((drawing) => (
                  <Card key={drawing.id} className="overflow-hidden">
                    <Card className="flex h-40 items-center justify-center">
                      <Body className="text-h1-sm">{getTypeIcon(drawing.type)}</Body>
                    </Card>
                    <Stack className="p-4" gap={3}>
                      <Stack direction="horizontal" className="justify-between">
                        <Body className="text-body-md font-display">{drawing.name}</Body>
                        <Badge variant="solid">v{drawing.version}</Badge>
                      </Stack>
                      <Stack direction="horizontal" gap={2}>
                        <Badge variant="outline">{drawing.category}</Badge>
                        <Badge variant="outline">{drawing.type}</Badge>
                      </Stack>
                      <Stack direction="horizontal" className="justify-between">
                        <Body className="text-body-sm">{drawing.size}</Body>
                        {drawing.markups > 0 && <Badge variant="outline">{drawing.markups} markups</Badge>}
                      </Stack>
                      <Stack direction="horizontal" gap={2}>
                        <Button variant="outline" size="sm" onClick={() => setSelectedDrawing(drawing)}>View</Button>
                        <Button variant="ghost" size="sm">Download</Button>
                      </Stack>
                    </Stack>
                  </Card>
                ))}
              </Grid>
            ) : (
              <Stack gap={3}>
                {filteredDrawings.map((drawing) => (
                  <Card key={drawing.id} className="p-4">
                    <Grid cols={6} gap={4} className="items-center">
                      <Stack direction="horizontal" gap={3}>
                        <Body className="text-h5-md">{getTypeIcon(drawing.type)}</Body>
                        <Stack gap={1}>
                          <Body className="font-display">{drawing.name}</Body>
                          <Badge variant="outline">{drawing.category}</Badge>
                        </Stack>
                      </Stack>
                      <Badge variant="outline">{drawing.type}</Badge>
                      <Badge variant="solid">v{drawing.version}</Badge>
                      <Body className="text-body-sm">{drawing.size}</Body>
                      <Stack gap={0}>
                        <Body className="text-body-sm">{drawing.uploadedAt}</Body>
                        <Body className="text-body-sm">{drawing.uploadedBy}</Body>
                      </Stack>
                      <Stack direction="horizontal" gap={2}>
                        <Button variant="outline" size="sm" onClick={() => setSelectedDrawing(drawing)}>View</Button>
                        <Button variant="ghost" size="sm">Download</Button>
                      </Stack>
                    </Grid>
                  </Card>
                ))}
              </Stack>
            )}

            {/* Quick Links */}
            <Grid cols={3} gap={4}>
              <Button variant="outline" onClick={() => router.push("/files")}>All Files</Button>
              <Button variant="outline" onClick={() => router.push("/projects")}>Projects</Button>
              <Button variant="outline" onClick={() => router.push("/dashboard")}>Dashboard</Button>
            </Grid>
          </Stack>
        </Container>
      </Section>

      {/* View Drawing Modal */}
      <Modal open={!!selectedDrawing} onClose={() => setSelectedDrawing(null)}>
        <ModalHeader><H3>{selectedDrawing?.name}</H3></ModalHeader>
        <ModalBody>
          {selectedDrawing && (
            <Stack gap={4}>
              <Card className="flex h-48 items-center justify-center">
                <Body className="text-h1-sm">{getTypeIcon(selectedDrawing.type)}</Body>
              </Card>
              <Stack direction="horizontal" gap={2}>
                <Badge variant="outline">{selectedDrawing.category}</Badge>
                <Badge variant="outline">{selectedDrawing.type}</Badge>
                <Badge variant="solid">v{selectedDrawing.version}</Badge>
              </Stack>
              <Grid cols={2} gap={4}>
                <Stack gap={1}>
                  <Body className="font-display">Project</Body>
                  <Body>{selectedDrawing.project}</Body>
                </Stack>
                <Stack gap={1}>
                  <Body className="font-display">Size</Body>
                  <Body>{selectedDrawing.size}</Body>
                </Stack>
              </Grid>
              <Grid cols={2} gap={4}>
                <Stack gap={1}>
                  <Body className="font-display">Uploaded By</Body>
                  <Body>{selectedDrawing.uploadedBy}</Body>
                </Stack>
                <Stack gap={1}>
                  <Body className="font-display">Date</Body>
                  <Body>{selectedDrawing.uploadedAt}</Body>
                </Stack>
              </Grid>
              {selectedDrawing.markups > 0 && (
                <Stack gap={2}>
                  <Body className="font-display">Active Markups ({selectedDrawing.markups})</Body>
                  <Card className="p-3">
                    <Body className="text-body-sm">View markups and comments in the drawing viewer</Body>
                  </Card>
                </Stack>
              )}
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedDrawing(null)}>Close</Button>
          <Button variant="outline">Add Markup</Button>
          <Button variant="solid">Open in Viewer</Button>
        </ModalFooter>
      </Modal>

      {/* Upload Modal */}
      <Modal open={showUploadModal} onClose={() => setShowUploadModal(false)}>
        <ModalHeader><H3>Upload Drawing</H3></ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Card className="border-2 border-dashed p-8 text-center">
              <Stack gap={2}>
                <Body className="text-h3-md">📐</Body>
                <Body>Drag and drop CAD files here</Body>
                <Body className="text-body-sm">Supports: DWG, VWX, SKP, PDF</Body>
                <Button variant="outline">Browse Files</Button>
              </Stack>
            </Card>
            <Input placeholder="Drawing Name" />
            <Grid cols={2} gap={4}>
              <Select>
                <option value="">Category...</option>
                {categories.slice(1).map(c => <option key={c} value={c}>{c}</option>)}
              </Select>
              <Select>
                <option value="">Project...</option>
                <option value="summer">Summer Fest 2024</option>
                <option value="corporate">Corporate Gala</option>
              </Select>
            </Grid>
            <Textarea placeholder="Description or notes..." rows={2} />
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowUploadModal(false)}>Cancel</Button>
          <Button variant="solid" onClick={() => setShowUploadModal(false)}>Upload</Button>
        </ModalFooter>
      </Modal>
    </PageLayout>
  );
}
