"use client";

import { useState } from "react";
import { Eye, Download, Trash2, FileText, Ruler, FileEdit, Sheet, Folder, ImageIcon } from "lucide-react";
import {
  Badge,
  Body,
  Button,
  Card,
  ConfirmDialog,
  DetailDrawer,
  Grid,
  ListPage,
  RecordFormModal,
  Stack,
  Text,
  type DetailSection,
  type FormFieldConfig,
  type ListPageAction,
  type ListPageBulkAction,
  type ListPageColumn,
  type ListPageFilter,
} from '@ghxstship/ui';
import { createExportHandler } from "@ghxstship/config";
import {
  useProjectFiles,
  useFileVersions,
  type ProjectFile,
} from "../../../hooks/useFiles";
// Layout provided by route group

export default function FileSharingPage() {
  const { data: files = [], isLoading, error, refetch } = useProjectFiles();
  const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(null);
  const { data: fileVersions = [] } = useFileVersions(selectedFile?.id || '');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "PDF": return <FileText className="size-4" />;
      case "CAD": return <Ruler className="size-4" />;
      case "Image": return <ImageIcon className="size-4" />;
      case "Document": return <FileEdit className="size-4" />;
      case "Spreadsheet": return <Sheet className="size-4" />;
      default: return <Folder className="size-4" />;
    }
  };

  const columns: ListPageColumn<ProjectFile>[] = [
    { 
      key: 'name', 
      label: 'Name', 
      accessor: 'name', 
      sortable: true,
      render: (value, row) => (
        <Stack direction="horizontal" gap={2} className="items-center">
          {getTypeIcon(row.type)}
          <Text>{String(value)}</Text>
        </Stack>
      )
    },
    { 
      key: 'type', 
      label: 'Type', 
      accessor: 'type', 
      sortable: true,
      render: (value) => <Badge variant="outline">{String(value)}</Badge>
    },
    { key: 'project', label: 'Project', accessor: 'project', sortable: true },
    { key: 'size', label: 'Size', accessor: 'size', sortable: true },
    { 
      key: 'version', 
      label: 'Version', 
      accessor: 'version',
      render: (value) => <Badge variant="solid">v{String(value)}</Badge>
    },
    { key: 'uploadedAt', label: 'Uploaded', accessor: 'uploadedAt', sortable: true },
    { key: 'uploadedBy', label: 'Uploaded By', accessor: 'uploadedBy' },
  ];

  const filters: ListPageFilter[] = [
    { 
      key: 'type', 
      label: 'Type', 
      options: [
        { value: 'PDF', label: 'PDF' },
        { value: 'CAD', label: 'CAD' },
        { value: 'Image', label: 'Image' },
        { value: 'Document', label: 'Document' },
        { value: 'Spreadsheet', label: 'Spreadsheet' },
      ]
    },
    { 
      key: 'project', 
      label: 'Project', 
      options: [...new Set(files.map(f => f.project))].map(p => ({ value: p, label: p }))
    },
  ];

  const formFields: FormFieldConfig[] = [
    { name: 'name', label: 'File Name', type: 'text', required: true },
    { name: 'type', label: 'File Type', type: 'select', required: true, options: [
      { value: 'PDF', label: 'PDF' },
      { value: 'CAD', label: 'CAD' },
      { value: 'Image', label: 'Image' },
      { value: 'Document', label: 'Document' },
      { value: 'Spreadsheet', label: 'Spreadsheet' },
    ]},
    { name: 'project', label: 'Project', type: 'text', required: true },
    { name: 'notes', label: 'Version Notes', type: 'textarea' },
  ];

  const rowActions: ListPageAction<ProjectFile>[] = [
    { id: 'view', label: 'View Details', icon: <Eye className="size-4" />, onClick: (row) => { setSelectedFile(row); setDrawerOpen(true); } },
    { id: 'download', label: 'Download', icon: <Download className="size-4" />, onClick: () => {} },
    { id: 'delete', label: 'Delete', icon: <Trash2 className="size-4" />, variant: 'danger', onClick: (row) => { setSelectedFile(row); setDeleteConfirmOpen(true); } },
  ];

  const bulkActions: ListPageBulkAction[] = [
    { id: 'download', label: 'Download Selected', icon: <Download className="size-4" /> },
    { id: 'delete', label: 'Delete', icon: <Trash2 className="size-4" />, variant: 'danger' },
  ];

  const handleCreate = async () => {
    setCreateModalOpen(false);
    refetch();
  };

  const handleDelete = async () => {
    setDeleteConfirmOpen(false);
    setSelectedFile(null);
    refetch();
  };

  const totalSize = files.reduce((sum, f) => sum + parseFloat(f.size) || 0, 0).toFixed(1) + " MB";

  const stats = [
    { label: 'Total Files', value: files.length },
    { label: 'Total Size', value: totalSize },
    { label: 'Projects', value: new Set(files.map(f => f.project)).size },
    { label: 'Updated Today', value: files.filter(f => f.uploadedAt === new Date().toISOString().split('T')[0]).length },
  ];

  const detailSections: DetailSection[] = selectedFile ? [
    {
      id: 'overview',
      title: 'File Details',
      content: (
        <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
          <Body size="sm"><strong>Name:</strong> {selectedFile.name}</Body>
          <Body size="sm"><strong>Type:</strong> {selectedFile.type}</Body>
          <Body size="sm"><strong>Project:</strong> {selectedFile.project}</Body>
          <Body size="sm"><strong>Size:</strong> {selectedFile.size}</Body>
          <Body size="sm"><strong>Version:</strong> v{selectedFile.version}</Body>
          <Body size="sm"><strong>Uploaded By:</strong> {selectedFile.uploadedBy}</Body>
        </Grid>
      ),
    },
    {
      id: 'versions',
      title: 'Version History',
      content: (
        <Stack gap={2}>
          {fileVersions.map((v) => (
            <Card key={v.version} className="p-3">
              <Stack direction="horizontal" className="items-start justify-between">
                <Stack gap={1}>
                  <Stack direction="horizontal" gap={2}>
                    <Badge variant={v.version === selectedFile.version ? "solid" : "outline"}>v{v.version}</Badge>
                    <Body size="sm">{v.uploadedAt}</Body>
                  </Stack>
                  <Body size="sm">{v.changes}</Body>
                </Stack>
                <Button variant="ghost" size="sm">Download</Button>
              </Stack>
            </Card>
          ))}
        </Stack>
      ),
    },
  ] : [];

  return (
    <>
      <ListPage<ProjectFile>
        title="File Sharing"
        subtitle="Project files with version control and cloud storage"
        data={files}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        error={error}
        onRetry={refetch}
        searchPlaceholder="Search files..."
        filters={filters}
        rowActions={rowActions}
        bulkActions={bulkActions}
        onBulkAction={async (actionId, selectedIds) => {
          if (actionId === 'download') {
            const selected = files.filter(f => selectedIds.includes(f.id));
            selected.forEach(f => {
              // Trigger download for each file
              const link = document.createElement('a');
              link.href = `/api/files/${f.id}/download`;
              link.download = f.name;
              link.click();
            });
          }
        }}
        onRowClick={(row) => { setSelectedFile(row); setDrawerOpen(true); }}
        createLabel="Upload File"
        onCreate={() => setCreateModalOpen(true)}
        entityType="files"
        onExport={createExportHandler({
          filename: "files",
          getData: () => files.map(f => ({
            name: f.name,
            type: f.type,
            project: f.project,
            size: f.size,
            version: f.version,
            uploadedAt: f.uploadedAt,
            uploadedBy: f.uploadedBy,
          })),
        })}
        stats={stats}
        emptyMessage="No files found"
        emptyAction={{ label: 'Upload File', onClick: () => setCreateModalOpen(true) }}
      />

      <RecordFormModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        mode="create"
        title="Upload File"
        fields={formFields}
        onSubmit={handleCreate}
        size="lg"
      />

      <DetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        record={selectedFile}
        title={(f) => f.name}
        subtitle={(f) => `${f.type} • ${f.project}`}
        sections={detailSections}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Delete File"
        message="Are you sure you want to delete this file?"
        variant="danger"
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => { setDeleteConfirmOpen(false); setSelectedFile(null); }}
      />
    </>
  );
}
