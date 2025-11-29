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
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  PageLayout,
  SectionHeader,
  EnterprisePageHeader,
  MainContent,} from "@ghxstship/ui";

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

  return (
    <PageLayout background="white" header={<CreatorNavigationAuthenticated />}>
      <Section className="min-h-screen py-16">
        <Container>
          <Stack gap={10}>
            {/* Page Header */}
            <EnterprisePageHeader
        title="File Sharing"
        subtitle="Project files with version control and cloud storage"
        breadcrumbs={[{ label: 'COMPVSS', href: '/dashboard' }, { label: 'Files' }]}
        views={[
          { id: 'default', label: 'Default', icon: 'grid' },
        ]}
        activeView="default"
        showFavorite
        showSettings
      />

            {/* Stats Grid */}
            <Grid cols={4} gap={6}>
              <StatCard value={totalFiles.toString()} label="Total Files" />
              <StatCard value={totalSize} label="Total Size" />
              <StatCard value={new Set(mockFiles.map(f => f.project)).size.toString()} label="Projects" />
              <StatCard value={mockFiles.filter(f => f.uploadedAt === "2024-11-24").length.toString()} label="Updated Today" />
            </Grid>

            {/* Filters */}
            <Stack direction="horizontal" className="justify-between">
              <Stack direction="horizontal" gap={4}>
                <Input type="search" placeholder="Search files..." className="w-64" />
                <Select>
                  <option value="">All Projects</option>
                  <option value="summer">Summer Fest 2024</option>
                  <option value="corporate">Corporate Gala</option>
                </Select>
              </Stack>
              <Button variant="solid" onClick={() => setShowUploadModal(true)}>Upload File</Button>
            </Stack>

            {/* Files Table */}
            <Card className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Version</TableHead>
                    <TableHead>Uploaded</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockFiles.map((file) => (
                    <TableRow key={file.id}>
                      <TableCell>
                        <Stack direction="horizontal" gap={2}>
                          <Body className="text-h6-md">{getTypeIcon(file.type)}</Body>
                          <Body>{file.name}</Body>
                        </Stack>
                      </TableCell>
                      <TableCell><Badge variant="outline">{file.type}</Badge></TableCell>
                      <TableCell><Body className="text-body-sm">{file.project}</Body></TableCell>
                      <TableCell><Body className="text-body-sm">{file.size}</Body></TableCell>
                      <TableCell><Badge variant="solid">v{file.version}</Badge></TableCell>
                      <TableCell>
                        <Stack gap={0}>
                          <Body className="text-body-sm">{file.uploadedAt}</Body>
                          <Body className="text-body-sm">{file.uploadedBy}</Body>
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
            </Card>

            {/* Quick Links */}
            <Grid cols={3} gap={4}>
              <Button variant="outline" onClick={() => router.push("/projects")}>Projects</Button>
              <Button variant="outline" onClick={() => router.push("/documents")}>Documents</Button>
              <Button variant="outline" onClick={() => router.push("/dashboard")}>Dashboard</Button>
            </Grid>
          </Stack>
        </Container>
      </Section>

      {/* File Details Modal */}
      <Modal open={!!selectedFile} onClose={() => setSelectedFile(null)}>
        <ModalHeader><H3>{selectedFile?.name}</H3></ModalHeader>
        <ModalBody>
          {selectedFile && (
            <Stack gap={4}>
              <Stack direction="horizontal" gap={2}>
                <Body className="text-h5-md">{getTypeIcon(selectedFile.type)}</Body>
                <Badge variant="outline">{selectedFile.type}</Badge>
                <Badge variant="solid">v{selectedFile.version}</Badge>
              </Stack>
              <Grid cols={2} gap={4}>
                <Stack gap={1}>
                  <Body className="font-display">Project</Body>
                  <Body>{selectedFile.project}</Body>
                </Stack>
                <Stack gap={1}>
                  <Body className="font-display">Size</Body>
                  <Body>{selectedFile.size}</Body>
                </Stack>
              </Grid>
              <Stack gap={1}>
                <Body className="font-display">Uploaded By</Body>
                <Body>{selectedFile.uploadedBy}</Body>
              </Stack>
              <Stack gap={2}>
                <Body className="font-display">Version History</Body>
                <Stack gap={2}>
                  {mockVersions.map((v) => (
                    <Card key={v.version} className="p-3">
                      <Stack direction="horizontal" className="items-start justify-between">
                        <Stack gap={1}>
                          <Stack direction="horizontal" gap={2}>
                            <Badge variant={v.version === selectedFile.version ? "solid" : "outline"}>v{v.version}</Badge>
                            <Body className="text-body-sm">{v.uploadedAt}</Body>
                          </Stack>
                          <Body className="text-body-sm">{v.changes}</Body>
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

      {/* Upload Modal */}
      <Modal open={showUploadModal} onClose={() => setShowUploadModal(false)}>
        <ModalHeader><H3>Upload File</H3></ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Card className="border-2 border-dashed p-8 text-center">
              <Stack gap={2}>
                <Body className="text-h3-md">📁</Body>
                <Body>Drag and drop files here or click to browse</Body>
                <Button variant="outline">Browse Files</Button>
              </Stack>
            </Card>
            <Select>
              <option value="">Select Project...</option>
              <option value="summer">Summer Fest 2024</option>
              <option value="corporate">Corporate Gala</option>
            </Select>
            <Input placeholder="Version notes (optional)" />
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
