"use client";

import { useState } from "react";
import { useRouter } from 'next/navigation';
// Layout provided by route group
import { Ruler, Wrench, Building, Scale, FileText, Folder, PenTool, Eye, Download } from "lucide-react";
import {
  ListPage, H3, Body, Grid, Stack, Input, Select, Button, Card, Badge, Modal, ModalHeader, ModalBody, ModalFooter, Textarea,
  type ListPageColumn, type ListPageFilter, type ListPageAction} from "@ghxstship/ui";

import {
  useDrawings,
  type Drawing,
} from "@/hooks/useDrawings";

import { getSubcategoryNames, createExportHandler } from "@ghxstship/config";

const categories = getSubcategoryNames('TECH').concat(['Site']);

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

export default function DrawingsPage() {
  const router = useRouter();
  const { data: drawings = [], isLoading, error, refetch } = useDrawings();
  const [selectedDrawing, setSelectedDrawing] = useState<Drawing | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const totalMarkups = drawings.reduce((s, d) => s + d.markups, 0);

  const columns: ListPageColumn<Drawing>[] = [
    {
      key: 'name',
      label: 'Drawing Name',
      accessor: 'name',
      sortable: true,
      render: (_value: unknown, d) => (
        <Stack direction="horizontal" gap={3}>
          {getTypeIcon(d.type)}
          <Body className="font-display">{d.name}</Body>
        </Stack>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      accessor: 'category',
      sortable: true,
      render: (_value: unknown, d) => <Badge variant="outline">{d.category}</Badge>,
    },
    {
      key: 'type',
      label: 'Type',
      accessor: 'type',
      sortable: true,
      render: (_value: unknown, d) => <Badge variant="outline">{d.type}</Badge>,
    },
    {
      key: 'version',
      label: 'Version',
      accessor: 'version',
      render: (_value: unknown, d) => <Badge variant="solid">v{d.version}</Badge>,
    },
    { key: 'size', label: 'Size', accessor: 'size' },
    {
      key: 'markups',
      label: 'Markups',
      accessor: 'markups',
      sortable: true,
      render: (_value: unknown, d) => d.markups > 0 ? <Badge variant="outline">{d.markups}</Badge> : <Body size="sm">—</Body>,
    },
    { key: 'uploadedBy', label: 'Uploaded By', accessor: 'uploadedBy' },
    { key: 'uploadedAt', label: 'Date', accessor: 'uploadedAt', sortable: true },
  ];

  const filters: ListPageFilter[] = [
    {
      key: 'category',
      label: 'Category',
      options: categories.map(c => ({ value: c, label: c })),
    },
    {
      key: 'type',
      label: 'Type',
      options: [
        { value: 'Vectorworks', label: 'Vectorworks' },
        { value: 'AutoCAD', label: 'AutoCAD' },
        { value: 'SketchUp', label: 'SketchUp' },
        { value: 'CAD', label: 'CAD' },
        { value: 'PDF', label: 'PDF' },
      ],
    },
  ];

  const rowActions: ListPageAction<Drawing>[] = [
    { id: 'view', label: 'View', icon: <Eye className="h-4 w-4" />, onClick: (d) => setSelectedDrawing(d) },
    { id: 'download', label: 'Download', icon: <Download className="h-4 w-4" />, onClick: () => {} },
  ];

  const stats = [
    { label: 'Total Drawings', value: drawings.length },
    { label: 'Categories', value: categories.length },
    { label: 'Active Markups', value: totalMarkups },
    { label: 'Updated Today', value: drawings.filter(d => d.uploadedAt === new Date().toISOString().split('T')[0]).length },
  ];

  return (
    <>
      <ListPage<Drawing>
        title="Drawings & CAD Files"
        subtitle="Technical drawings with markup and version control"
        data={drawings}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        error={error instanceof Error ? error : undefined}
        onRetry={refetch}
        searchPlaceholder="Search drawings..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(d) => setSelectedDrawing(d)}
        createLabel="Upload Drawing"
        onCreate={() => setShowUploadModal(true)}
        entityType="drawings"
        onExport={createExportHandler({
          filename: "drawings",
          getData: () => drawings.map((d: Drawing) => ({
            name: d.name,
            category: d.category,
            type: d.type,
            version: d.version,
            size: d.size,
            markups: d.markups,
            uploadedBy: d.uploadedBy,
            uploadedAt: d.uploadedAt,
          })),
        })}
        stats={stats}
        emptyMessage="No drawings found"
        emptyAction={{ label: 'Upload Drawing', onClick: () => setShowUploadModal(true) }}
        enableCapabilityDetection
        onScanAction={(capability, route) => router.push(route)}
        capabilityBasePath=""
        showFavorite
        showSettings
      />

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
              <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
                <Stack gap={1}>
                  <Body className="font-display">Project</Body>
                  <Body>{selectedDrawing.project}</Body>
                </Stack>
                <Stack gap={1}>
                  <Body className="font-display">Size</Body>
                  <Body>{selectedDrawing.size}</Body>
                </Stack>
              </Grid>
              <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
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
            <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
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
    </>
  );
}
