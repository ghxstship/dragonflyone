"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "../../components/navigation";
import {
  ListPage,
  Badge,
  RecordFormModal,
  DetailDrawer,
  ConfirmDialog,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
  type ListPageBulkAction,
  type FormFieldConfig,
  type DetailSection,
} from "@ghxstship/ui";

interface Certification {
  id: string;
  crew_member_id?: string;
  crew_member_name: string;
  certification_type: string;
  issue_date: string;
  expiry_date: string;
  status: "active" | "expiring_soon" | "expired";
  issuing_authority?: string;
  certificate_number?: string;
}

// Mock data - would come from API
const mockCertifications: Certification[] = [
  { id: "CERT-001", crew_member_name: "James Wilson", certification_type: "OSHA Safety", issue_date: "2024-01-15", expiry_date: "2027-01-15", status: "active" },
  { id: "CERT-002", crew_member_name: "Maria Garcia", certification_type: "Rigging Level 3", issue_date: "2023-06-10", expiry_date: "2025-06-10", status: "active" },
  { id: "CERT-003", crew_member_name: "David Chen", certification_type: "First Aid/CPR", issue_date: "2023-11-20", expiry_date: "2024-11-20", status: "expiring_soon" },
  { id: "CERT-004", crew_member_name: "Sarah Martinez", certification_type: "Forklift Operator", issue_date: "2022-03-15", expiry_date: "2024-03-15", status: "expired" },
  { id: "CERT-005", crew_member_name: "Michael Brown", certification_type: "Electrical Safety", issue_date: "2024-09-01", expiry_date: "2027-09-01", status: "active" },
];

const columns: ListPageColumn<Certification>[] = [
  { key: 'id', label: 'ID', accessor: 'id', sortable: true },
  { key: 'crew_member_name', label: 'Crew Member', accessor: 'crew_member_name', sortable: true },
  { key: 'certification_type', label: 'Certification', accessor: 'certification_type', sortable: true },
  { key: 'issue_date', label: 'Issue Date', accessor: 'issue_date', sortable: true, render: (value) => new Date(String(value)).toLocaleDateString() },
  { key: 'expiry_date', label: 'Expiry Date', accessor: 'expiry_date', sortable: true, render: (value) => new Date(String(value)).toLocaleDateString() },
  { 
    key: 'status', 
    label: 'Status', 
    accessor: 'status', 
    sortable: true,
    render: (value) => (
      <Badge variant={value === 'active' ? 'solid' : 'outline'}>
        {String(value).replace('_', ' ').toUpperCase()}
      </Badge>
    )
  },
];

const filters: ListPageFilter[] = [
  { 
    key: 'status', 
    label: 'Status', 
    options: [
      { value: 'active', label: 'Active' },
      { value: 'expiring_soon', label: 'Expiring Soon' },
      { value: 'expired', label: 'Expired' },
    ]
  },
  {
    key: 'certification_type',
    label: 'Type',
    options: [
      { value: 'osha', label: 'OSHA Safety' },
      { value: 'rigging', label: 'Rigging' },
      { value: 'first_aid', label: 'First Aid/CPR' },
      { value: 'forklift', label: 'Forklift' },
      { value: 'electrical', label: 'Electrical' },
    ]
  },
];

const formFields: FormFieldConfig[] = [
  { name: 'crew_member_id', label: 'Crew Member', type: 'select', required: true, options: [], colSpan: 2 },
  { name: 'certification_type', label: 'Certification Type', type: 'select', required: true, options: [
    { value: 'osha', label: 'OSHA Safety' },
    { value: 'rigging', label: 'Rigging' },
    { value: 'first_aid', label: 'First Aid/CPR' },
    { value: 'forklift', label: 'Forklift Operator' },
    { value: 'electrical', label: 'Electrical Safety' },
  ]},
  { name: 'certificate_number', label: 'Certificate #', type: 'text' },
  { name: 'issue_date', label: 'Issue Date', type: 'date', required: true },
  { name: 'expiry_date', label: 'Expiry Date', type: 'date', required: true },
  { name: 'issuing_authority', label: 'Issuing Authority', type: 'text', colSpan: 2 },
];

export default function CertificationsPage() {
  const router = useRouter();
  const [certifications, setCertifications] = useState<Certification[]>(mockCertifications);
  const [loading, setLoading] = useState(false);
  
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedCert, setSelectedCert] = useState<Certification | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [certToDelete, setCertToDelete] = useState<Certification | null>(null);

  const refetch = useCallback(() => {
    // Would fetch from API
    setCertifications(mockCertifications);
  }, []);

  const rowActions: ListPageAction<Certification>[] = [
    { id: 'view', label: 'View Details', icon: '👁️', onClick: (row) => { setSelectedCert(row); setDrawerOpen(true); } },
    { id: 'renew', label: 'Renew', icon: '🔄', onClick: (row) => router.push(`/certifications/${row.id}/renew`) },
    { id: 'edit', label: 'Edit', icon: '✏️', onClick: (row) => router.push(`/certifications/${row.id}/edit`) },
    { id: 'delete', label: 'Delete', icon: '🗑️', variant: 'danger', onClick: (row) => { setCertToDelete(row); setDeleteConfirmOpen(true); } },
  ];

  const bulkActions: ListPageBulkAction[] = [
    { id: 'remind', label: 'Send Reminders', icon: '🔔' },
    { id: 'export', label: 'Export', icon: '⬇️' },
    { id: 'delete', label: 'Delete', icon: '🗑️', variant: 'danger' },
  ];

  const handleCreate = async (data: Record<string, unknown>) => {
    console.log('Create certification:', data);
    setCreateModalOpen(false);
    refetch();
  };

  const handleDelete = async () => {
    if (certToDelete) {
      setCertifications(prev => prev.filter(c => c.id !== certToDelete.id));
      setDeleteConfirmOpen(false);
      setCertToDelete(null);
    }
  };

  const handleBulkAction = async (actionId: string, selectedIds: string[]) => {
    if (actionId === 'remind') {
      alert('Renewal reminders sent!');
    }
  };

  const stats = [
    { label: 'Total Certs', value: certifications.length },
    { label: 'Active', value: certifications.filter(c => c.status === 'active').length },
    { label: 'Expiring Soon', value: certifications.filter(c => c.status === 'expiring_soon').length },
    { label: 'Expired', value: certifications.filter(c => c.status === 'expired').length },
  ];

  const detailSections: DetailSection[] = selectedCert ? [
    {
      id: 'overview',
      title: 'Certification Details',
      content: (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
          <div><strong>ID:</strong> {selectedCert.id}</div>
          <div><strong>Crew Member:</strong> {selectedCert.crew_member_name}</div>
          <div><strong>Type:</strong> {selectedCert.certification_type}</div>
          <div><strong>Status:</strong> {selectedCert.status.replace('_', ' ')}</div>
          <div><strong>Issue Date:</strong> {new Date(selectedCert.issue_date).toLocaleDateString()}</div>
          <div><strong>Expiry Date:</strong> {new Date(selectedCert.expiry_date).toLocaleDateString()}</div>
        </div>
      ),
    },
  ] : [];

  return (
    <>
      <ListPage<Certification>
        title="Certifications & Licenses"
        subtitle="Track crew certifications, licenses, and renewal dates"
        data={certifications}
        columns={columns}
        rowKey="id"
        loading={loading}
        onRetry={refetch}
        searchPlaceholder="Search certifications..."
        filters={filters}
        rowActions={rowActions}
        bulkActions={bulkActions}
        onBulkAction={handleBulkAction}
        onRowClick={(row) => { setSelectedCert(row); setDrawerOpen(true); }}
        createLabel="Add Certification"
        onCreate={() => setCreateModalOpen(true)}
        onExport={() => console.log('Export certifications')}
        stats={stats}
        emptyMessage="No certifications found"
        emptyAction={{ label: 'Add Certification', onClick: () => setCreateModalOpen(true) }}
        header={<Navigation />}
      />

      <RecordFormModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        mode="create"
        title="Add Certification"
        fields={formFields}
        onSubmit={handleCreate}
        size="lg"
      />

      <DetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        record={selectedCert}
        title={(c) => c.certification_type}
        subtitle={(c) => c.crew_member_name}
        sections={detailSections}
        onEdit={(c) => router.push(`/certifications/${c.id}/edit`)}
        onDelete={(c) => { setCertToDelete(c); setDeleteConfirmOpen(true); setDrawerOpen(false); }}
        actions={[{ id: 'renew', label: 'Renew', icon: '🔄' }]}
        onAction={(actionId, cert) => {
          if (actionId === 'renew') router.push(`/certifications/${cert.id}/renew`);
        }}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Delete Certification"
        message={`Are you sure you want to delete this certification for "${certToDelete?.crew_member_name}"?`}
        variant="danger"
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => { setDeleteConfirmOpen(false); setCertToDelete(null); }}
      />
    </>
  );
}
