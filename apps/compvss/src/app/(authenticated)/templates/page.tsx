"use client";

import { useState } from "react";
// Layout provided by route group
import { FileText, Eye, Download } from "lucide-react";
import {
  ListPage, H3, Body, Grid, Stack, Input, Select, Button, Card, Badge, Modal, ModalHeader, ModalBody, ModalFooter, Textarea} from "@ghxstship/ui";
import { createExportHandler, getSubcategoryNames } from "@ghxstship/config";
import {
  useTemplates,
  type Template,
} from '@/hooks/useTemplates';

const categories = getSubcategoryNames('PROF');

export default function TemplatesPage() {
  const { data: templates = [], isLoading, error, refetch } = useTemplates();
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const totalDownloads = templates.reduce((sum, t) => sum + t.downloads, 0);

  const columns: ListPageColumn<Template>[] = [
    {
      key: 'name',
      label: 'Template',
      accessor: 'name',
      sortable: true,
      render: (_, t) => (
        <Stack gap={1}>
          <Body className="font-display">{t.name}</Body>
          <Stack direction="horizontal" gap={2}>
            <Badge variant="outline">{t.category}</Badge>
            <Badge variant="outline">{t.fileType}</Badge>
          </Stack>
        </Stack>
      ),
    },
    { key: 'description', label: 'Description', accessor: 'description' },
    {
      key: 'version',
      label: 'Version',
      accessor: 'version',
      render: (_, t) => <Body>v{t.version}</Body>,
    },
    { key: 'downloads', label: 'Downloads', accessor: 'downloads', sortable: true },
    { key: 'size', label: 'Size', accessor: 'size' },
    { key: 'lastUpdated', label: 'Updated', accessor: 'lastUpdated', sortable: true },
  ];

  const filters: ListPageFilter[] = [
    {
      key: 'category',
      label: 'Category',
      options: categories.map(cat => ({ value: cat, label: cat })),
    },
    {
      key: 'fileType',
      label: 'File Type',
      options: [
        { value: 'PDF', label: 'PDF' },
        { value: 'DOCX', label: 'DOCX' },
        { value: 'XLSX', label: 'XLSX' },
      ],
    },
  ];

  const rowActions: ListPageAction<Template>[] = [
    { id: 'preview', label: 'Preview', icon: <Eye className="h-4 w-4" />, onClick: (t) => setSelectedTemplate(t) },
    { id: 'download', label: 'Download', icon: <Download className="h-4 w-4" />, onClick: () => {} },
  ];

  const stats = [
    { label: 'Templates', value: templates.length },
    { label: 'Categories', value: categories.length },
    { label: 'Total Downloads', value: totalDownloads.toLocaleString() },
    { label: 'Last Updated', value: 'Today' },
  ];

  return (
    <>
      <ListPage<Template>
        title="Template Library"
        subtitle="Contracts, checklists, forms, riders, and standard operating procedures"
        data={templates}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        error={error instanceof Error ? error : undefined}
        onRetry={refetch}
        searchPlaceholder="Search templates..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(t) => setSelectedTemplate(t)}
        createLabel="Upload Template"
        onCreate={() => setShowUploadModal(true)}
        entityType="templates"
        onExport={createExportHandler({
          filename: "templates",
          getData: () => templates.map((t: Template) => ({
            name: t.name,
            category: t.category,
            fileType: t.fileType,
            version: t.version,
            downloads: t.downloads,
            size: t.size,
            lastUpdated: t.lastUpdated,
          })),
        })}
        stats={stats}
        emptyMessage="No templates found"
        emptyAction={{ label: 'Upload Template', onClick: () => setShowUploadModal(true) }}
        showFavorite
        showSettings
      />

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
    </>
  );
}
