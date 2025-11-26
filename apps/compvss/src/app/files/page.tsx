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

interface ProjectFile {
  id: string;
  name: string;
  type: "PDF" | "CAD" | "Image" | "Document" | "Spreadsheet";
  size: string;
  project: string;
  uploadedBy: string;
  uploadedAt: string;
  version: number;
  status: "Current" | "Archived";
}

interface FileVersion {
  version: number;
  uploadedBy: string;
  uploadedAt: string;
  changes: string;
}

const mockFiles: ProjectFile[] = [
  { id: "FILE-001", name: "Stage_Layout_v3.dwg", type: "CAD", size: "4.2 MB", project: "Summer Fest 2024", uploadedBy: "John Smith", uploadedAt: "2024-11-24", version: 3, status: "Current" },
  { id: "FILE-002", name: "Audio_Plot.pdf", type: "PDF", size: "1.8 MB", project: "Summer Fest 2024", uploadedBy: "Sarah Johnson", uploadedAt: "2024-11-23", version: 2, status: "Current" },
  { id: "FILE-003", name: "Lighting_Design.pdf", type: "PDF", size: "3.5 MB", project: "Summer Fest 2024", uploadedBy: "Mike Davis", uploadedAt: "2024-11-22", version: 4, status: "Current" },
  { id: "FILE-004", name: "Budget_Tracker.xlsx", type: "Spreadsheet", size: "256 KB", project: "Corporate Gala", uploadedBy: "Emily Chen", uploadedAt: "2024-11-24", version: 8, status: "Current" },
  { id: "FILE-005", name: "Site_Photos.zip", type: "Image", size: "45 MB", project: "Summer Fest 2024", uploadedBy: "John Smith", uploadedAt: "2024-11-20", version: 1, status: "Current" },
];

const mockVersions: FileVersion[] = [
  { version: 3, uploadedBy: "John Smith", uploadedAt: "2024-11-24 14:30", changes: "Updated stage dimensions per client feedback" },
  { version: 2, uploadedBy: "John Smith", uploadedAt: "2024-11-22 10:15", changes: "Added rigging points" },
  { version: 1, uploadedBy: "Sarah Johnson", uploadedAt: "2024-11-20 09:00", changes: "Initial upload" },
];

export default function FileSharingPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const totalFiles = mockFiles.length;
  const totalSize = "54.8 MB";

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "PDF": return "📄";
      case "CAD": return "📐";
      case "Image": return "🖼️";
      case "Document": return "📝";
      case "Spreadsheet": return "📊";
      default: return "📁";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "PDF": return "text-error-400";
      case "CAD": return "text-info-400";
      case "Image": return "text-success-400";
      case "Document": return "text-warning-400";
      case "Spreadsheet": return "text-purple-400";
      default: return "text-ink-400";
    }
  };

  return (
    <UISection className="relative min-h-screen overflow-hidden bg-ink-950 text-ink-50">
      <Card className="pointer-events-none absolute inset-0 grid-overlay opacity-40" />
      <Navigation />
      <Container className="py-16">
        <Stack gap={8}>
          <Stack gap={2}>
            <H1>File Sharing</H1>
            <Label className="text-ink-400">Project files with version control and cloud storage</Label>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard label="Total Files" value={totalFiles} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Total Size" value={totalSize} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Projects" value={new Set(mockFiles.map(f => f.project)).size} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Updated Today" value={mockFiles.filter(f => f.uploadedAt === "2024-11-24").length} className="bg-transparent border-2 border-ink-800" />
          </Grid>

          <Stack direction="horizontal" className="justify-between">
            <Stack direction="horizontal" gap={4}>
              <Input type="search" placeholder="Search files..." className="border-ink-700 bg-black text-white w-64" />
              <Select className="border-ink-700 bg-black text-white">
                <option value="">All Projects</option>
                <option value="summer">Summer Fest 2024</option>
                <option value="corporate">Corporate Gala</option>
              </Select>
            </Stack>
            <Button variant="outlineWhite" onClick={() => setShowUploadModal(true)}>Upload File</Button>
          </Stack>

          <Table className="border-2 border-ink-800">
            <TableHeader>
              <TableRow className="bg-ink-900">
                <TableHead className="text-ink-400">Name</TableHead>
                <TableHead className="text-ink-400">Type</TableHead>
                <TableHead className="text-ink-400">Project</TableHead>
                <TableHead className="text-ink-400">Size</TableHead>
                <TableHead className="text-ink-400">Version</TableHead>
                <TableHead className="text-ink-400">Uploaded</TableHead>
                <TableHead className="text-ink-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockFiles.map((file) => (
                <TableRow key={file.id} className="border-ink-800">
                  <TableCell>
                    <Stack direction="horizontal" gap={2}>
                      <Label className={`text-xl ${getTypeColor(file.type)}`}>{getTypeIcon(file.type)}</Label>
                      <Label className="text-white">{file.name}</Label>
                    </Stack>
                  </TableCell>
                  <TableCell><Badge variant="outline">{file.type}</Badge></TableCell>
                  <TableCell><Label className="text-ink-300">{file.project}</Label></TableCell>
                  <TableCell><Label className="font-mono text-ink-400">{file.size}</Label></TableCell>
                  <TableCell><Badge variant="solid">v{file.version}</Badge></TableCell>
                  <TableCell>
                    <Stack gap={0}>
                      <Label size="xs" className="text-ink-300">{file.uploadedAt}</Label>
                      <Label size="xs" className="text-ink-500">{file.uploadedBy}</Label>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Stack direction="horizontal" gap={2}>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedFile(file)}>Details</Button>
                      <Button variant="outline" size="sm">Download</Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Grid cols={3} gap={4}>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/projects")}>Projects</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/documents")}>Documents</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/")}>Dashboard</Button>
          </Grid>
        </Stack>
      </Container>

      <Modal open={!!selectedFile} onClose={() => setSelectedFile(null)}>
        <ModalHeader><H3>{selectedFile?.name}</H3></ModalHeader>
        <ModalBody>
          {selectedFile && (
            <Stack gap={4}>
              <Stack direction="horizontal" gap={2}>
                <Label className={`text-2xl ${getTypeColor(selectedFile.type)}`}>{getTypeIcon(selectedFile.type)}</Label>
                <Badge variant="outline">{selectedFile.type}</Badge>
                <Badge variant="solid">v{selectedFile.version}</Badge>
              </Stack>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label className="text-ink-400">Project</Label><Label className="text-white">{selectedFile.project}</Label></Stack>
                <Stack gap={1}><Label className="text-ink-400">Size</Label><Label className="font-mono text-white">{selectedFile.size}</Label></Stack>
              </Grid>
              <Stack gap={1}><Label className="text-ink-400">Uploaded By</Label><Label className="text-white">{selectedFile.uploadedBy}</Label></Stack>
              <Stack gap={2}>
                <Label className="text-ink-400">Version History</Label>
                <Stack gap={2}>
                  {mockVersions.map((v) => (
                    <Card key={v.version} className="p-3 border border-ink-700">
                      <Stack direction="horizontal" className="justify-between items-start">
                        <Stack gap={1}>
                          <Stack direction="horizontal" gap={2}>
                            <Badge variant={v.version === selectedFile.version ? "solid" : "outline"}>v{v.version}</Badge>
                            <Label size="xs" className="text-ink-500">{v.uploadedAt}</Label>
                          </Stack>
                          <Label size="xs" className="text-ink-300">{v.changes}</Label>
                        </Stack>
                        <Button variant="ghost" size="sm">Download</Button>
                      </Stack>
                    </Card>
                  ))}
                </Stack>
              </Stack>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedFile(null)}>Close</Button>
          <Button variant="outline">Upload New Version</Button>
          <Button variant="solid">Download Current</Button>
        </ModalFooter>
      </Modal>

      <Modal open={showUploadModal} onClose={() => setShowUploadModal(false)}>
        <ModalHeader><H3>Upload File</H3></ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Card className="p-8 border-2 border-dashed border-ink-700 text-center">
              <Stack gap={2}>
                <Label className="text-4xl">📁</Label>
                <Label className="text-ink-400">Drag and drop files here or click to browse</Label>
                <Button variant="outline">Browse Files</Button>
              </Stack>
            </Card>
            <Select className="border-ink-700 bg-black text-white">
              <option value="">Select Project...</option>
              <option value="summer">Summer Fest 2024</option>
              <option value="corporate">Corporate Gala</option>
            </Select>
            <Input placeholder="Version notes (optional)" className="border-ink-700 bg-black text-white" />
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
