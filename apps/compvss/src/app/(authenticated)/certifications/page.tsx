"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, RefreshCw, Pencil, Trash2, Bell, Download } from "lucide-react";
// Layout provided by route group
import {
  ListPage,
  Badge,
  RecordFormModal,
  DetailDrawer,
  ConfirmDialog,
  Grid,
  Stack,
  Body,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
  type ListPageBulkAction,
  type FormFieldConfig,
  type DetailSection,
} from "@ghxstship/ui";
import { createExportHandler, createImportHandler, getImportTemplates, useAuthContext, PlatformRole } from "@ghxstship/config";

const ADMIN_ROLES = [
  PlatformRole.COMPVSS_ADMIN,
  PlatformRole.LEGEND_SUPER_ADMIN,
  PlatformRole.LEGEND_ADMIN,
  PlatformRole.LEGEND_DEVELOPER,
];

import {
  useCertifications,
  useAddCertification,
  useDeleteCertification,
} from "@/hooks/useCertifications";

interface Certification {
  id: string;
  crew_member_id: string;
  crew_member_name: string;
  certification_type: string;
  issue_date: string;
  expiry_date: string;
  status: 'active' | 'expiring_soon' | 'expired';
  issuing_authority?: string;
  certificate_number?: string;
}

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
  const { hasRole } = useAuthContext();
  
  // RBAC: Check if user has admin access
  const canManageCerts = ADMIN_ROLES.some(role => hasRole(role));
  
  const { data: apiCerts = [], isLoading: loading, refetch } = useCertifications();
  const addCertMutation = useAddCertification();
  const deleteCertMutation = useDeleteCertification();
  
  // Map API data to local interface
  const certifications: Certification[] = apiCerts.map(c => ({
    id: c.id,
    crew_member_id: c.crew_member_id,
    crew_member_name: c.certification_type_id || 'Unknown',
    certification_type: c.certification_type_id || '',
    issue_date: c.issued_date || '',
    expiry_date: c.expiration_date || '',
    status: c.status as Certification['status'],
    issuing_authority: undefined,
    certificate_number: c.certificate_number || undefined,
  }));
  
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedCert, setSelectedCert] = useState<Certification | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [certToDelete, setCertToDelete] = useState<Certification | null>(null);

  const rowActions: ListPageAction<Certification>[] = [
    { id: 'view', label: 'View Details', icon: <Eye className="size-4" />, onClick: (row) => { setSelectedCert(row); setDrawerOpen(true); } },
    ...(canManageCerts ? [
      { id: 'renew', label: 'Renew', icon: <RefreshCw className="size-4" />, onClick: (row: Certification) => router.push(`/certifications/${row.id}/renew`) },
      { id: 'edit', label: 'Edit', icon: <Pencil className="size-4" />, onClick: (row: Certification) => router.push(`/certifications/${row.id}/edit`) },
      { id: 'delete', label: 'Delete', icon: <Trash2 className="size-4" />, variant: 'danger' as const, onClick: (row: Certification) => { setCertToDelete(row); setDeleteConfirmOpen(true); } },
    ] : []),
  ];

  const bulkActions: ListPageBulkAction[] = [
    { id: 'remind', label: 'Send Reminders', icon: <Bell className="size-4" /> },
    { id: 'export', label: 'Export', icon: <Download className="size-4" /> },
    { id: 'delete', label: 'Delete', icon: <Trash2 className="size-4" />, variant: 'danger' },
  ];

  const handleCreate = async (data: Record<string, unknown>) => {
    await addCertMutation.mutateAsync({
      crew_member_id: String(data.crew_member_id || ''),
      certification_type_id: String(data.certification_type || ''),
      issued_date: String(data.issue_date || new Date().toISOString().split('T')[0]),
      expiration_date: String(data.expiry_date || ''),
      status: 'active',
      certificate_number: data.certificate_number ? String(data.certificate_number) : undefined,
    });
    refetch();
    setCreateModalOpen(false);
  };

  const handleDelete = async () => {
    if (certToDelete) {
      await deleteCertMutation.mutateAsync(certToDelete.id);
      refetch();
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
      for (const id of selectedIds) {
        await deleteCertMutation.mutateAsync(id);
      }
      refetch();
    }
  };

  // Import handler for CSV/JSON files
  const handleImport = createImportHandler<Omit<Certification, 'id'>>({
    entityType: 'certifications',
    requiredFields: ['crew_member_name', 'certification_type', 'expiry_date'],
    onImport: async (records) => {
      for (const record of records) {
        await addCertMutation.mutateAsync({
          crew_member_id: String(record.crew_member_id || ''),
          certification_type_id: String(record.certification_type || ''),
          issued_date: String(record.issue_date || ''),
          expiration_date: String(record.expiry_date || ''),
          status: (record.status as string) || 'active',
        });
      }
      refetch();
    },
  });

  const importTemplates = getImportTemplates('certifications').length > 0 
    ? getImportTemplates('certifications') 
    : [{ id: 'default', name: 'Certification Import', mapping: { crew_member_name: 'crew_member_name', certification_type: 'certification_type', issue_date: 'issue_date', expiry_date: 'expiry_date', status: 'status' } }];

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
        <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
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
        onCreate={canManageCerts ? () => setCreateModalOpen(true) : undefined}
        entityType="certifications"
        onImport={handleImport}
        importTemplates={importTemplates}
        importSampleFields={['crew_member_name', 'certification_type', 'issue_date', 'expiry_date', 'status']}
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
        emptyAction={canManageCerts ? { label: 'Add Certification', onClick: () => setCreateModalOpen(true) } : undefined}
        showFavorite
        showSettings
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
        actions={[{ id: 'renew', label: 'Renew', icon: <RefreshCw className="size-4" /> }]}
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
