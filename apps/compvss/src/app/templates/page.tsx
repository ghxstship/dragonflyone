"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CompvssAppLayout } from "../../components/app-layout";
import { FileText } from "lucide-react";
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
  useTemplates,
  type Template,
} from '../../hooks/useTemplates';

import { getSubcategoryNames } from "@ghxstship/config";

const categories = getSubcategoryNames('PROF');

export default function TemplatesPage() {
  const router = useRouter();
  const { data: templates = [], isLoading, error } = useTemplates();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  if (isLoading) {
    return (
      <CompvssAppLayout>
        <MainContent padding="lg">
          <Container className="flex min-h-[60vh] items-center justify-center">
            <Stack gap={4} className="items-center">
              <div className="h-8 w-8 animate-spin rounded-avatar border-4 border-primary border-t-transparent" />
              <Body>Loading templates...</Body>
            </Stack>
          </Container>
        </MainContent>
      </CompvssAppLayout>
    );
  }

  if (error) {
    return (
      <CompvssAppLayout>
        <MainContent padding="lg">
          <Container>
            <Card className="p-6 border-destructive bg-destructive/10">
              <Stack gap={4} className="items-center text-center">
                <Body className="text-destructive font-display">Failed to load templates</Body>
                <Body className="text-destructive">{error instanceof Error ? error.message : 'An error occurred'}</Body>
                <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
              </Stack>
            </Card>
          </Container>
        </MainContent>
      </CompvssAppLayout>
    );
  }

  const filteredTemplates = templates.filter(t => {
    const matchesCategory = selectedCategory === "All" || t.category === selectedCategory;
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const totalDownloads = templates.reduce((sum, t) => sum + t.downloads, 0);

  return (
    <CompvssAppLayout>
      <EnterprisePageHeader
        title="Template Library"
        subtitle="Contracts, checklists, forms, riders, and standard operating procedures"


        primaryAction={{ label: 'Upload Template', onClick: () => setShowUploadModal(true) }}
        showFavorite
        showSettings
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={10}>

            <Grid cols={4} gap={6} className="sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Templates" value={templates.length.toString()} />
              <StatCard label="Categories" value={categories.length.toString()} />
              <StatCard label="Total Downloads" value={totalDownloads.toLocaleString()} />
              <StatCard label="Last Updated" value="Today" />
            </Grid>

            <Grid cols={6} gap={2} className="sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
              {categories.map((cat) => {
                const count = templates.filter(t => t.category === cat).length;
                return (
                  <Card key={cat} onClick={() => setSelectedCategory(selectedCategory === cat ? "All" : cat)}>
                    <Stack gap={1} className="text-center">
                      <Body>{cat}</Body>
                      <Body size="sm" className="">{count}</Body>
                    </Stack>
                  </Card>
                );
              })}
            </Grid>

            <Grid cols={3} gap={4} className="sm:grid-cols-2 lg:grid-cols-3">
              <Input type="search" placeholder="Search templates..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="col-span-2" />
              <Button variant="solid" onClick={() => setShowUploadModal(true)}>Upload Template</Button>
            </Grid>

            <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
              {filteredTemplates.map((template) => (
                <Card key={template.id}>
                  <Stack gap={3}>
                    <Stack direction="horizontal" className="justify-between items-start">
                      <Stack gap={1}>
                        <Body className="font-display">{template.name}</Body>
                        <Badge variant="outline">{template.category}</Badge>
                      </Stack>
                      <Badge variant="outline">{template.fileType}</Badge>
                    </Stack>
                    <Body size="sm" className="">{template.description}</Body>
                    <Stack direction="horizontal" gap={2} className="flex-wrap">
                      {template.tags.slice(0, 3).map(tag => <Badge key={tag} variant="outline">{tag}</Badge>)}
                    </Stack>
                    <Grid cols={3} gap={2} className="sm:grid-cols-2 lg:grid-cols-3">
                      <Stack gap={0}>
                        <Body size="sm" className="">Version</Body>
                        <Body>v{template.version}</Body>
                      </Stack>
                      <Stack gap={0}>
                        <Body size="sm" className="">Downloads</Body>
                        <Body>{template.downloads}</Body>
                      </Stack>
                      <Stack gap={0}>
                        <Body size="sm" className="">Size</Body>
                        <Body>{template.size}</Body>
                      </Stack>
                    </Grid>
                    <Stack direction="horizontal" gap={2}>
                      <Button variant="outline" size="sm" onClick={() => setSelectedTemplate(template)}>Preview</Button>
                      <Button variant="solid" size="sm">Download</Button>
                    </Stack>
                  </Stack>
                </Card>
              ))}
            </Grid>

            <Grid cols={3} gap={4} className="sm:grid-cols-2 lg:grid-cols-3">
              <Button variant="outline">Request Template</Button>
              <Button variant="outline">Version History</Button>
              <Button variant="outline" onClick={() => router.push("/knowledge")}>Knowledge Base</Button>
            </Grid>
          </Stack>
        </Container>
      </MainContent>

      <Modal open={!!selectedTemplate} onClose={() => setSelectedTemplate(null)}>
        <ModalHeader><H3>Template Details</H3></ModalHeader>
        <ModalBody>
          {selectedTemplate && (
            <Stack gap={4}>
              <Body className="font-display">{selectedTemplate.name}</Body>
              <Stack direction="horizontal" gap={2}>
                <Badge variant="outline">{selectedTemplate.category}</Badge>
                <Badge variant="outline">{selectedTemplate.fileType}</Badge>
                <Badge variant="outline">v{selectedTemplate.version}</Badge>
              </Stack>
              <Body>{selectedTemplate.description}</Body>
              <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
                <Stack gap={1}><Body size="sm" className="">Last Updated</Body><Body>{selectedTemplate.lastUpdated}</Body></Stack>
                <Stack gap={1}><Body size="sm" className="">Updated By</Body><Body>{selectedTemplate.updatedBy}</Body></Stack>
              </Grid>
              <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
                <Stack gap={1}><Body size="sm" className="">Downloads</Body><Body>{selectedTemplate.downloads}</Body></Stack>
                <Stack gap={1}><Body size="sm" className="">File Size</Body><Body>{selectedTemplate.size}</Body></Stack>
              </Grid>
              <Stack gap={2}>
                <Body size="sm" className="">Tags</Body>
                <Stack direction="horizontal" gap={2}>{selectedTemplate.tags.map(tag => <Badge key={tag} variant="outline">{tag}</Badge>)}</Stack>
              </Stack>
              <Card>
                <Body size="sm" className="">Document preview would display here</Body>
              </Card>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedTemplate(null)}>Close</Button>
          <Button variant="outline">Edit Template</Button>
          <Button variant="solid">Download</Button>
        </ModalFooter>
      </Modal>

      <Modal open={showUploadModal} onClose={() => setShowUploadModal(false)}>
        <ModalHeader><H3>Upload Template</H3></ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Input placeholder="Template Name" />
            <Select>
              <option value="">Category...</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </Select>
            <Textarea placeholder="Description..." rows={2} />
            <Input placeholder="Tags (comma separated)" />
            <Input placeholder="Version (e.g., 1.0)" />
            <Card>
              <Stack gap={2} className="text-center">
                <FileText className="size-8 mx-auto" />
                <Body>Drop file here or click to upload</Body>
                <Body size="sm" className="">Supports PDF, DOCX, XLSX up to 25MB</Body>
              </Stack>
            </Card>
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
