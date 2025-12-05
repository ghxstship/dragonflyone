"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Eye, RefreshCw, Pencil, Trash2, Bell, Download } from "lucide-react";
import { CompvssAppLayout } from "../../components/app-layout";
import {
  ListPage,
  Badge,
  RecordFormModal,
  DetailDrawer,
  ConfirmDialog,
  Grid,
  Stack,
  Body,
  EnterprisePageHeader,
  MainContent,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
  type ListPageBulkAction,
  type FormFieldConfig,
  type DetailSection,
} from "@ghxstship/ui";
import { createExportHandler } from "@ghxstship/config";

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
  const [loading] = useState(false);
  
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
    { id: 'view', label: 'View Details', icon: <Eye className="size-4" />, onClick: (row) => { setSelectedCert(row); setDrawerOpen(true); } },
    { id: 'renew', label: 'Renew', icon: <RefreshCw className="size-4" />, onClick: (row) => router.push(`/certifications/${row.id}/renew`) },
    { id: 'edit', label: 'Edit', icon: <Pencil className="size-4" />, onClick: (row) => router.push(`/certifications/${row.id}/edit`) },
    { id: 'delete', label: 'Delete', icon: <Trash2 className="size-4" />, variant: 'danger', onClick: (row) => { setCertToDelete(row); setDeleteConfirmOpen(true); } },
  ];

  const bulkActions: ListPageBulkAction[] = [
    { id: 'remind', label: 'Send Reminders', icon: <Bell className="size-4" /> },
    { id: 'export', label: 'Export', icon: <Download className="size-4" /> },
    { id: 'delete', label: 'Delete', icon: <Trash2 className="size-4" />, variant: 'danger' },
  ];

  const handleCreate = async (data: Record<string, unknown>) => {
    const newCert: Certification = {
      id: `CERT-${String(certifications.length + 1).padStart(3, '0')}`,
      crew_member_id: String(data.crew_member_id || ''),
      crew_member_name: String(data.crew_member_name || ''),
      certification_type: String(data.certification_type || ''),
      issue_date: String(data.issue_date || new Date().toISOString().split('T')[0]),
      expiry_date: String(data.expiry_date || ''),
      status: 'active',
    };
    setCertifications(prev => [...prev, newCert]);
    setCreateModalOpen(false);
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
      const selected = certifications.filter(c => selectedIds.includes(c.id));
      selected.forEach(cert => {
        fetch('/api/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'renewal_reminder', certificationId: cert.id }),
        });
      });
    } else if (actionId === 'export') {
      const selected = certifications.filter(c => selectedIds.includes(c.id));
      const csv = [
        ['ID', 'Crew Member', 'Type', 'Issue Date', 'Expiry Date', 'Status'].join(','),
        ...selected.map(c => [c.id, c.crew_member_name, c.certification_type, c.issue_date, c.expiry_date, c.status].join(','))
      ].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'certifications-export.csv';
      a.click();
      URL.revokeObjectURL(url);
    } else if (actionId === 'delete') {
      setCertifications(prev => prev.filter(c => !selectedIds.includes(c.id)));
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
        <Grid cols={2} gap={4}>
          <Stack gap={1}><Body className="font-display">ID</Body><Body>{selectedCert.id}</Body></Stack>
          <Stack gap={1}><Body className="font-display">Crew Member</Body><Body>{selectedCert.crew_member_name}</Body></Stack>
          <Stack gap={1}><Body className="font-display">Type</Body><Body>{selectedCert.certification_type}</Body></Stack>
          <Stack gap={1}><Body className="font-display">Status</Body><Body>{selectedCert.status.replace('_', ' ')}</Body></Stack>
          <Stack gap={1}><Body className="font-display">Issue Date</Body><Body>{new Date(selectedCert.issue_date).toLocaleDateString()}</Body></Stack>
          <Stack gap={1}><Body className="font-display">Expiry Date</Body><Body>{new Date(selectedCert.expiry_date).toLocaleDateString()}</Body></Stack>
        </Grid>
      ),
    },
  ] : [];

  return (
    <CompvssAppLayout>
      <EnterprisePageHeader
        title="Certifications & Licenses"
        subtitle="Track crew certifications, licenses, and renewal dates"
        views={[
          { id: 'list', label: 'List', icon: 'list' },
          { id: 'grid', label: 'Grid', icon: 'grid' },
        ]}
        activeView="list"
        primaryAction={{ label: 'Add Certification', onClick: () => setCreateModalOpen(true) }}
        showFavorite
        showSettings
      />
      <MainContent padding="lg">
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
          entityType="certifications"
          onExport={createExportHandler({
            filename: "certifications",
            getData: () => certifications.map(c => ({
              id: c.id,
              crew_member_name: c.crew_member_name,
              certification_type: c.certification_type,
              issue_date: c.issue_date,
              expiry_date: c.expiry_date,
              status: c.status,
              issuing_authority: c.issuing_authority || '',
              certificate_number: c.certificate_number || '',
            })),
          })}
          stats={stats}
          emptyMessage="No certifications found"
          emptyAction={{ label: 'Add Certification', onClick: () => setCreateModalOpen(true) }}
        />
      </MainContent>

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
    </CompvssAppLayout>
  );
}
