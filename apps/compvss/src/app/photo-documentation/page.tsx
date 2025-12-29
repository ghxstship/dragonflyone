"use client";

import { useState } from "react";
import { Camera, Eye, CheckCircle } from "lucide-react";
// Layout provided by route group
import {
  ListPage,
  H3,
  Body,
  Grid,
  Stack,
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
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
} from "@ghxstship/ui";
import { createExportHandler } from "@ghxstship/config";
import { usePhotoSets, type PhotoSet } from '../../hooks/usePhotoDocumentation';

const phases = ["Load-In", "Build", "Tech Rehearsal", "Show", "Strike", "Load-Out"];

export default function PhotoDocumentationPage() {
  const { data: photoSets = [], refetch } = usePhotoSets();
  const [selectedSet, setSelectedSet] = useState<PhotoSet | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const totalPhotos = photoSets.reduce((sum, s) => sum + s.photoCount, 0);
  const pendingApproval = photoSets.filter(s => !s.approved).length;

  const columns: ListPageColumn<PhotoSet>[] = [
    {
      key: 'projectName',
      label: 'Project',
      accessor: 'projectName',
      sortable: true,
      render: (_, s) => (
        <Stack gap={1}>
          <Body className="font-display">{s.projectName}</Body>
          {s.description && <Body size="sm" className="text-muted-foreground">{s.description}</Body>}
        </Stack>
      ),
    },
    {
      key: 'phase',
      label: 'Phase',
      accessor: 'phase',
      sortable: true,
      render: (_, s) => <Badge variant="outline">{s.phase}</Badge>,
    },
    { key: 'photoCount', label: 'Photos', accessor: 'photoCount', sortable: true },
    { key: 'capturedBy', label: 'Captured By', accessor: 'capturedBy' },
    {
      key: 'capturedAt',
      label: 'Date',
      accessor: 'capturedAt',
      sortable: true,
      render: (_, s) => <Body size="sm">{new Date(s.capturedAt).toLocaleDateString()}</Body>,
    },
    {
      key: 'approved',
      label: 'Status',
      accessor: (s) => s.approved ? 'Approved' : 'Pending',
      render: (_, s) => <Badge variant={s.approved ? 'solid' : 'outline'}>{s.approved ? 'Approved' : 'Pending'}</Badge>,
    },
  ];

  const filters: ListPageFilter[] = [
    {
      key: 'phase',
      label: 'Phase',
      options: phases.map(p => ({ value: p, label: p })),
    },
    {
      key: 'approved',
      label: 'Status',
      options: [
        { value: 'true', label: 'Approved' },
        { value: 'false', label: 'Pending' },
      ],
    },
  ];

  const rowActions: ListPageAction<PhotoSet>[] = [
    { id: 'view', label: 'View', icon: <Eye className="h-4 w-4" />, onClick: (s) => setSelectedSet(s) },
    { id: 'approve', label: 'Approve', icon: <CheckCircle className="h-4 w-4" />, onClick: () => {}, hidden: (s) => s.approved },
  ];

  const stats = [
    { label: 'Photo Sets', value: photoSets.length },
    { label: 'Total Photos', value: totalPhotos },
    { label: 'Pending Approval', value: pendingApproval },
    { label: 'Projects Documented', value: new Set(photoSets.map(s => s.projectId)).size },
  ];

  return (
    <>
      <ListPage<PhotoSet>
        title="Photo Documentation"
        subtitle="Phase-by-phase photo and video documentation for all projects"
        data={photoSets}
        columns={columns}
        rowKey="id"
        loading={false}
        onRetry={refetch}
        searchPlaceholder="Search photo sets..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(s) => setSelectedSet(s)}
        createLabel="Upload Photos"
        onCreate={() => setShowUploadModal(true)}
        entityType="photo-documentation"
        onExport={createExportHandler({
          filename: "photo-sets",
          getData: () => photoSets.map((s: PhotoSet) => ({
            projectName: s.projectName,
            phase: s.phase,
            photoCount: s.photoCount,
            capturedBy: s.capturedBy,
            capturedAt: s.capturedAt,
            approved: s.approved ? 'Yes' : 'No',
          })),
        })}
        stats={stats}
        emptyMessage="No photo sets found"
        emptyAction={{ label: 'Upload Photos', onClick: () => setShowUploadModal(true) }}
        showFavorite
        showSettings
      />

      <Modal open={!!selectedSet} onClose={() => setSelectedSet(null)}>
        <ModalHeader><H3>Photo Set Details</H3></ModalHeader>
        <ModalBody>
          {selectedSet && (
            <Stack gap={4}>
              <Stack direction="horizontal" className="items-start justify-between">
                <Stack gap={1}>
                  <Body className="font-display">{selectedSet.projectName}</Body>
                  <Badge variant="outline">{selectedSet.phase}</Badge>
                </Stack>
                {!selectedSet.approved && <Badge variant="solid">Pending Approval</Badge>}
              </Stack>
              {selectedSet.description && <Body>{selectedSet.description}</Body>}
              <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
                <Stack gap={1}>
                  <Body size="sm" className="">Photos</Body>
                  <Body>{selectedSet.photoCount}</Body>
                </Stack>
                <Stack gap={1}>
                  <Body size="sm" className="">Captured By</Body>
                  <Body>{selectedSet.capturedBy}</Body>
                </Stack>
              </Grid>
              <Stack gap={1}>
                <Body size="sm" className="">Date</Body>
                <Body>{new Date(selectedSet.capturedAt).toLocaleString()}</Body>
              </Stack>
              <Stack gap={2}>
                <Body size="sm" className="">Tags</Body>
                <Stack direction="horizontal" gap={2}>{selectedSet.tags.map(tag => <Badge key={tag} variant="outline">{tag}</Badge>)}</Stack>
              </Stack>
              <Card className="p-4">
                <Grid cols={4} gap={2} className="sm:grid-cols-2 lg:grid-cols-4">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                    <Card key={i} className="flex aspect-square items-center justify-center">
                      <Camera className="size-6" />
                    </Card>
                  ))}
                </Grid>
                <Body className="mt-2 text-center">+{selectedSet.photoCount - 8} more</Body>
              </Card>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedSet(null)}>Close</Button>
          {selectedSet && !selectedSet.approved && <Button variant="solid">Approve Set</Button>}
          <Button variant="outline">Download All</Button>
        </ModalFooter>
      </Modal>

      <Modal open={showUploadModal} onClose={() => setShowUploadModal(false)}>
        <ModalHeader><H3>Upload Photos</H3></ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Select>
              <option value="">Select Project...</option>
              <option value="PROJ-089">Summer Fest 2024</option>
              <option value="PROJ-090">Corporate Gala</option>
            </Select>
            <Select>
              <option value="">Select Phase...</option>
              {phases.map(p => <option key={p} value={p}>{p}</option>)}
            </Select>
            <Textarea placeholder="Description..." rows={2} />
            <Input placeholder="Tags (comma separated)" />
            <Card className="cursor-pointer border-2 border-dashed p-8 text-center">
              <Stack gap={2}>
                <Camera className="size-8" />
                <Body>Drop photos here or click to upload</Body>
                <Body size="sm" className="">Supports JPG, PNG, HEIC up to 50MB each</Body>
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
