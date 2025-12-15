"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CompvssAppLayout } from "../../components/app-layout";
import { Ruler, Wrench, Building, Scale, FileText, Folder, PenTool } from "lucide-react";
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
  Card,
  Badge,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Textarea,
  EnterprisePageHeader,
  MainContent,
} from "@ghxstship/ui";

import {
  useDrawings,
  type Drawing,
} from "../../hooks/useDrawings";

const categories = ["All", "Stage", "Lighting", "Audio", "Video", "Rigging", "Site"];

export default function DrawingsPage() {
  const router = useRouter();
  const { data: drawings = [] } = useDrawings();
  const [selectedDrawing, setSelectedDrawing] = useState<Drawing | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filteredDrawings = categoryFilter === "All" ? drawings : drawings.filter(d => d.category === categoryFilter);
  const totalMarkups = drawings.reduce((s, d) => s + d.markups, 0);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Vectorworks": return <Ruler className="size-5" />;
      case "AutoCAD": return <Wrench className="size-5" />;
      case "SketchUp": return <Building className="size-5" />;
      case "CAD": return <Scale className="size-5" />;
      case "PDF": return <FileText className="size-5" />;
      default: return <Folder className="size-5" />;
    }
  };

  return (
    <CompvssAppLayout>
      <EnterprisePageHeader
        title="Drawings & CAD Files"
        subtitle="Technical drawings with markup and version control"


        primaryAction={{ label: 'Upload Drawing', onClick: () => setShowUploadModal(true) }}
        showFavorite
        showSettings
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={10}>
            <Grid cols={4} gap={6}>
              <StatCard value={drawings.length.toString()} label="Total Drawings" />
              <StatCard value={(categories.length - 1).toString()} label="Categories" />
              <StatCard value={totalMarkups.toString()} label="Active Markups" />
              <StatCard value={drawings.filter(d => d.uploadedAt === new Date().toISOString().split('T')[0]).length.toString()} label="Updated Today" />
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
                        <Body size="sm" className="">{drawing.size}</Body>
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
                      <Body size="sm" className="">{drawing.size}</Body>
                      <Stack gap={0}>
                        <Body size="sm" className="">{drawing.uploadedAt}</Body>
                        <Body size="sm" className="">{drawing.uploadedBy}</Body>
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
      </MainContent>

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
                    <Body size="sm" className="">View markups and comments in the drawing viewer</Body>
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
                <PenTool className="size-12" />
                <Body>Drag and drop CAD files here</Body>
                <Body size="sm" className="">Supports: DWG, VWX, SKP, PDF</Body>
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
    </CompvssAppLayout>
  );
}
