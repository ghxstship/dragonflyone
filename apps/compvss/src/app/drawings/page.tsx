"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "../../components/navigation";
import {
  Container, H1, H3, Body, Label, Grid, Stack, StatCard, Input, Select, Button,
  Section as UISection, Card, Tabs, TabsList, Tab, TabPanel, Badge,
  Modal, ModalHeader, ModalBody, ModalFooter, Textarea,
} from "@ghxstship/ui";

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

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Stage": return "bg-info-900/30 border-info-800";
      case "Lighting": return "bg-warning-900/30 border-warning-800";
      case "Audio": return "bg-success-900/30 border-success-800";
      case "Video": return "bg-purple-900/30 border-purple-800";
      case "Rigging": return "bg-error-900/30 border-error-800";
      case "Site": return "bg-warning-900/30 border-warning-800";
      default: return "bg-ink-800 border-ink-700";
    }
  };

  return (
    <UISection className="relative min-h-screen overflow-hidden bg-ink-950 text-ink-50">
      <Card className="pointer-events-none absolute inset-0 grid-overlay opacity-40" />
      <Navigation />
      <Container className="py-16">
        <Stack gap={8}>
          <Stack gap={2}>
            <H1>Drawings & CAD Files</H1>
            <Label className="text-ink-400">Technical drawings with markup and version control</Label>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard label="Total Drawings" value={mockDrawings.length} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Categories" value={categories.length - 1} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Active Markups" value={totalMarkups} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Updated Today" value={mockDrawings.filter(d => d.uploadedAt === "2024-11-24").length} className="bg-transparent border-2 border-ink-800" />
          </Grid>

          <Stack direction="horizontal" className="justify-between">
            <Stack direction="horizontal" gap={4}>
              <Input type="search" placeholder="Search drawings..." className="border-ink-700 bg-black text-white w-64" />
              <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="border-ink-700 bg-black text-white">
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </Select>
            </Stack>
            <Stack direction="horizontal" gap={2}>
              <Button variant={viewMode === "grid" ? "solid" : "outline"} size="sm" onClick={() => setViewMode("grid")}>Grid</Button>
              <Button variant={viewMode === "list" ? "solid" : "outline"} size="sm" onClick={() => setViewMode("list")}>List</Button>
              <Button variant="outlineWhite" onClick={() => setShowUploadModal(true)}>Upload Drawing</Button>
            </Stack>
          </Stack>

          {viewMode === "grid" ? (
            <Grid cols={3} gap={4}>
              {filteredDrawings.map((drawing) => (
                <Card key={drawing.id} className={`border-2 ${getCategoryColor(drawing.category)} overflow-hidden`}>
                  <Card className="h-40 bg-ink-800 flex items-center justify-center">
                    <Label className="text-6xl">{getTypeIcon(drawing.type)}</Label>
                  </Card>
                  <Stack className="p-4" gap={3}>
                    <Stack direction="horizontal" className="justify-between">
                      <Body className="font-display text-white">{drawing.name}</Body>
                      <Badge variant="solid">v{drawing.version}</Badge>
                    </Stack>
                    <Stack direction="horizontal" gap={2}>
                      <Badge variant="outline">{drawing.category}</Badge>
                      <Badge variant="outline">{drawing.type}</Badge>
                    </Stack>
                    <Stack direction="horizontal" className="justify-between">
                      <Label size="xs" className="text-ink-500">{drawing.size}</Label>
                      {drawing.markups > 0 && <Label size="xs" className="text-warning-400">{drawing.markups} markups</Label>}
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
                <Card key={drawing.id} className="border-2 border-ink-800 bg-ink-900/50 p-4">
                  <Grid cols={6} gap={4} className="items-center">
                    <Stack direction="horizontal" gap={3}>
                      <Label className="text-2xl">{getTypeIcon(drawing.type)}</Label>
                      <Stack gap={1}>
                        <Label className="text-white">{drawing.name}</Label>
                        <Badge variant="outline">{drawing.category}</Badge>
                      </Stack>
                    </Stack>
                    <Badge variant="outline">{drawing.type}</Badge>
                    <Badge variant="solid">v{drawing.version}</Badge>
                    <Label className="text-ink-400">{drawing.size}</Label>
                    <Stack gap={0}>
                      <Label size="xs" className="text-ink-400">{drawing.uploadedAt}</Label>
                      <Label size="xs" className="text-ink-500">{drawing.uploadedBy}</Label>
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

          <Grid cols={3} gap={4}>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/files")}>All Files</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/projects")}>Projects</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/")}>Dashboard</Button>
          </Grid>
        </Stack>
      </Container>

      <Modal open={!!selectedDrawing} onClose={() => setSelectedDrawing(null)}>
        <ModalHeader><H3>{selectedDrawing?.name}</H3></ModalHeader>
        <ModalBody>
          {selectedDrawing && (
            <Stack gap={4}>
              <Card className="h-48 bg-ink-800 flex items-center justify-center">
                <Label className="text-6xl">{getTypeIcon(selectedDrawing.type)}</Label>
              </Card>
              <Stack direction="horizontal" gap={2}>
                <Badge variant="outline">{selectedDrawing.category}</Badge>
                <Badge variant="outline">{selectedDrawing.type}</Badge>
                <Badge variant="solid">v{selectedDrawing.version}</Badge>
              </Stack>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label className="text-ink-400">Project</Label><Label className="text-white">{selectedDrawing.project}</Label></Stack>
                <Stack gap={1}><Label className="text-ink-400">Size</Label><Label className="text-white">{selectedDrawing.size}</Label></Stack>
              </Grid>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label className="text-ink-400">Uploaded By</Label><Label className="text-white">{selectedDrawing.uploadedBy}</Label></Stack>
                <Stack gap={1}><Label className="text-ink-400">Date</Label><Label className="text-white">{selectedDrawing.uploadedAt}</Label></Stack>
              </Grid>
              {selectedDrawing.markups > 0 && (
                <Stack gap={2}>
                  <Label className="text-ink-400">Active Markups ({selectedDrawing.markups})</Label>
                  <Card className="p-3 border border-warning-800 bg-warning-900/20">
                    <Label className="text-warning-400">View markups and comments in the drawing viewer</Label>
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

      <Modal open={showUploadModal} onClose={() => setShowUploadModal(false)}>
        <ModalHeader><H3>Upload Drawing</H3></ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Card className="p-8 border-2 border-dashed border-ink-700 text-center">
              <Stack gap={2}>
                <Label className="text-4xl">📐</Label>
                <Label className="text-ink-400">Drag and drop CAD files here</Label>
                <Label size="xs" className="text-ink-500">Supports: DWG, VWX, SKP, PDF</Label>
                <Button variant="outline">Browse Files</Button>
              </Stack>
            </Card>
            <Input placeholder="Drawing Name" className="border-ink-700 bg-black text-white" />
            <Grid cols={2} gap={4}>
              <Select className="border-ink-700 bg-black text-white">
                <option value="">Category...</option>
                {categories.slice(1).map(c => <option key={c} value={c}>{c}</option>)}
              </Select>
              <Select className="border-ink-700 bg-black text-white">
                <option value="">Project...</option>
                <option value="summer">Summer Fest 2024</option>
                <option value="corporate">Corporate Gala</option>
              </Select>
            </Grid>
            <Textarea placeholder="Description or notes..." rows={2} className="border-ink-700 bg-black text-white" />
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowUploadModal(false)}>Cancel</Button>
          <Button variant="solid" onClick={() => setShowUploadModal(false)}>Upload</Button>
        </ModalFooter>
      </Modal>
    </UISection>
  );
}
