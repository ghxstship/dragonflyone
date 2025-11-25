'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '../../components/navigation';
import {
  ListPage,
  Badge,
  RecordFormModal,
  DetailDrawer,
  ConfirmDialog,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
  type FormFieldConfig,
  type DetailSection,
} from '@ghxstship/ui';

interface Document {
  id: string;
  name: string;
  type: string;
  folder: string;
  version: string;
  size: string;
  uploadedBy: string;
  uploadedAt: string;
  status: string;
}

const mockDocuments: Document[] = [
  { id: '1', name: 'Ultra Music Festival - Master Contract 2025', type: 'Contract', folder: 'Contracts', version: '3.2', size: '2.4 MB', uploadedBy: 'Sarah Johnson', uploadedAt: '2024-11-20', status: 'active' },
  { id: '2', name: 'General Liability Insurance Policy', type: 'Insurance', folder: 'Compliance', version: '1.0', size: '1.1 MB', uploadedBy: 'Mike Peters', uploadedAt: '2024-11-15', status: 'active' },
  { id: '3', name: 'Q4 2024 Financial Statements', type: 'Financial', folder: 'Finance', version: '2.1', size: '856 KB', uploadedBy: 'John Doe', uploadedAt: '2024-11-18', status: 'active' },
];

const columns: ListPageColumn<Document>[] = [
  { key: 'name', label: 'Document', accessor: 'name', sortable: true },
  { key: 'type', label: 'Type', accessor: 'type', render: (v) => <Badge variant="outline">{String(v)}</Badge> },
  { key: 'folder', label: 'Folder', accessor: 'folder' },
  { key: 'version', label: 'Version', accessor: (r) => `v${r.version}` },
  { key: 'size', label: 'Size', accessor: 'size' },
  { key: 'uploadedAt', label: 'Uploaded', accessor: (r) => new Date(r.uploadedAt).toLocaleDateString(), sortable: true },
  { key: 'status', label: 'Status', accessor: 'status', render: (v) => <Badge variant={v === 'active' ? 'solid' : 'ghost'}>{String(v)}</Badge> },
];

const filters: ListPageFilter[] = [
  { key: 'type', label: 'Type', options: [{ value: 'Contract', label: 'Contract' }, { value: 'Insurance', label: 'Insurance' }, { value: 'Financial', label: 'Financial' }, { value: 'Legal', label: 'Legal' }] },
  { key: 'folder', label: 'Folder', options: [{ value: 'Contracts', label: 'Contracts' }, { value: 'Compliance', label: 'Compliance' }, { value: 'Finance', label: 'Finance' }, { value: 'HR', label: 'HR' }, { value: 'Legal', label: 'Legal' }] },
  { key: 'status', label: 'Status', options: [{ value: 'active', label: 'Active' }, { value: 'archived', label: 'Archived' }, { value: 'draft', label: 'Draft' }] },
];

const formFields: FormFieldConfig[] = [
  { name: 'name', label: 'Document Name', type: 'text', required: true },
  { name: 'type', label: 'Type', type: 'select', required: true, options: [{ value: 'Contract', label: 'Contract' }, { value: 'Insurance', label: 'Insurance' }, { value: 'Financial', label: 'Financial' }, { value: 'Legal', label: 'Legal' }] },
  { name: 'folder', label: 'Folder', type: 'select', required: true, options: [{ value: 'Contracts', label: 'Contracts' }, { value: 'Compliance', label: 'Compliance' }, { value: 'Finance', label: 'Finance' }, { value: 'HR', label: 'HR' }] },
  { name: 'file', label: 'File', type: 'file', required: true },
];

export default function DocumentsPage() {
  const router = useRouter();
  const [documents] = useState<Document[]>(mockDocuments);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState<Document | null>(null);

  const rowActions: ListPageAction<Document>[] = [
    { id: 'view', label: 'View Details', icon: '👁️', onClick: (r) => { setSelectedDoc(r); setDrawerOpen(true); } },
    { id: 'download', label: 'Download', icon: '⬇️', onClick: (r) => window.open(`/api/documents/${r.id}/download`, '_blank') },
    { id: 'edit', label: 'Edit', icon: '✏️', onClick: (r) => router.push(`/documents/${r.id}/edit`) },
    { id: 'delete', label: 'Delete', icon: '🗑️', variant: 'danger', onClick: (r) => { setDocToDelete(r); setDeleteConfirmOpen(true); } },
  ];

  const handleCreate = async (data: Record<string, unknown>) => {
    console.log('Upload document:', data);
    setCreateModalOpen(false);
  };

  const handleDelete = async () => {
    if (docToDelete) {
      console.log('Delete:', docToDelete.id);
      setDeleteConfirmOpen(false);
      setDocToDelete(null);
    }
  };

  const stats = [
    { label: 'Total Documents', value: documents.length },
    { label: 'Storage Used', value: '4.3 GB' },
    { label: 'Active Versions', value: 89 },
    { label: 'Pending Approval', value: 12 },
  ];

  const detailSections: DetailSection[] = selectedDoc ? [
    { id: 'overview', title: 'Document Details', content: (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
        <div><strong>Name:</strong> {selectedDoc.name}</div>
        <div><strong>Type:</strong> {selectedDoc.type}</div>
        <div><strong>Folder:</strong> {selectedDoc.folder}</div>
        <div><strong>Version:</strong> v{selectedDoc.version}</div>
        <div><strong>Size:</strong> {selectedDoc.size}</div>
        <div><strong>Status:</strong> {selectedDoc.status}</div>
        <div><strong>Uploaded By:</strong> {selectedDoc.uploadedBy}</div>
        <div><strong>Uploaded:</strong> {new Date(selectedDoc.uploadedAt).toLocaleDateString()}</div>
      </div>
    )},
  ] : [];

  return (
    <>
      <ListPage<Document>
        title="Document Management"
        subtitle="Centralized document storage with version control"
        data={documents}
        columns={columns}
        rowKey="id"
        loading={false}
        searchPlaceholder="Search documents..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => { setSelectedDoc(r); setDrawerOpen(true); }}
        createLabel="Upload Document"
        onCreate={() => setCreateModalOpen(true)}
        onExport={() => console.log('Export')}
        stats={stats}
        emptyMessage="No documents found"
        emptyAction={{ label: 'Upload Document', onClick: () => setCreateModalOpen(true) }}
        header={<Navigation />}
      />
      <RecordFormModal open={createModalOpen} onClose={() => setCreateModalOpen(false)} mode="create" title="Upload Document" fields={formFields} onSubmit={handleCreate} size="lg" />
      <DetailDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} record={selectedDoc} title={(d) => d.name} subtitle={(d) => `${d.type} • ${d.folder}`} sections={detailSections} onEdit={(d) => router.push(`/documents/${d.id}/edit`)} onDelete={(d) => { setDocToDelete(d); setDeleteConfirmOpen(true); setDrawerOpen(false); }} actions={[{ id: 'download', label: 'Download', icon: '⬇️' }]} onAction={(id, d) => id === 'download' && window.open(`/api/documents/${d.id}/download`, '_blank')} />
      <ConfirmDialog open={deleteConfirmOpen} title="Delete Document" message={`Delete "${docToDelete?.name}"?`} variant="danger" confirmLabel="Delete" onConfirm={handleDelete} onCancel={() => { setDeleteConfirmOpen(false); setDocToDelete(null); }} />
    </>
  );
}
