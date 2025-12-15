"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CompvssAppLayout } from "../../components/app-layout";
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
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  EnterprisePageHeader,
  MainContent,
} from "@ghxstship/ui";

import {
  useProjectFiles,
  useFileVersions,
  type ProjectFile,
} from "../../hooks/useFiles";

export default function FileSharingPage() {
  const router = useRouter();
  const { data: files = [] } = useProjectFiles();
  const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(null);
  const { data: fileVersions = [] } = useFileVersions(selectedFile?.id || '');
  const [showUploadModal, setShowUploadModal] = useState(false);

  const totalFiles = files.length;
  const totalSize = files.reduce((sum, f) => sum + parseFloat(f.size) || 0, 0).toFixed(1) + " MB";

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
    <CompvssAppLayout>
      <EnterprisePageHeader
        title="File Sharing"
        subtitle="Project files with version control and cloud storage"


        primaryAction={{ label: 'Upload File', onClick: () => setShowUploadModal(true) }}
        showFavorite
        showSettings
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={10}>

            {/* Stats Grid */}
            <Grid cols={4} gap={6}>
              <StatCard value={totalFiles.toString()} label="Total Files" />
              <StatCard value={totalSize} label="Total Size" />
              <StatCard value={new Set(files.map(f => f.project)).size.toString()} label="Projects" />
              <StatCard value={files.filter(f => f.uploadedAt === new Date().toISOString().split('T')[0]).length.toString()} label="Updated Today" />
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
              <Table variant="dark">
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
                  {files.map((file) => (
                    <TableRow key={file.id}>
                      <TableCell>
                        <Stack direction="horizontal" gap={2}>
                          <Body className="text-h6-md">{getTypeIcon(file.type)}</Body>
                          <Body>{file.name}</Body>
                        </Stack>
                      </TableCell>
                      <TableCell><Badge variant="outline">{file.type}</Badge></TableCell>
                      <TableCell><Body size="sm" className="">{file.project}</Body></TableCell>
                      <TableCell><Body size="sm" className="">{file.size}</Body></TableCell>
                      <TableCell><Badge variant="solid">v{file.version}</Badge></TableCell>
                      <TableCell>
                        <Stack gap={0}>
                          <Body size="sm" className="">{file.uploadedAt}</Body>
                          <Body size="sm" className="">{file.uploadedBy}</Body>
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
      </MainContent>

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
                  {fileVersions.map((v) => (
                    <Card key={v.version} className="p-3">
                      <Stack direction="horizontal" className="items-start justify-between">
                        <Stack gap={1}>
                          <Stack direction="horizontal" gap={2}>
                            <Badge variant={v.version === selectedFile.version ? "solid" : "outline"}>v{v.version}</Badge>
                            <Body size="sm" className="">{v.uploadedAt}</Body>
                          </Stack>
                          <Body size="sm" className="">{v.changes}</Body>
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
    </CompvssAppLayout>
  );
}
