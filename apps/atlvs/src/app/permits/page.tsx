'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Pencil, FileText, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { AtlvsAppLayout } from '../../components/app-layout';
import { usePermits, usePermitStats, type Permit } from '../../hooks/useCompliance';
import {
  ListPage,
  Badge,
  RecordFormModal,
  DetailDrawer,
  Grid,
  Stack,
  Body,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
  type FormFieldConfig,
  type DetailSection,
} from '@ghxstship/ui';

const statusColors: Record<string, 'success' | 'warning' | 'error' | 'info' | 'default'> = {
  approved: 'success',
  submitted: 'warning',
  pending: 'info',
  denied: 'error',
  expired: 'error',
};

const permitTypeLabels: Record<string, string> = {
  event: 'Event Permit',
  noise: 'Noise Permit',
  fire: 'Fire Permit',
  health: 'Health Permit',
  alcohol: 'Alcohol License',
  street_closure: 'Street Closure',
  building: 'Building Permit',
  other: 'Other',
};

const columns: ListPageColumn<Permit>[] = [
  { 
    key: 'name', 
    label: 'Permit', 
    accessor: 'name', 
    sortable: true,
  },
  { 
    key: 'permit_type', 
    label: 'Type', 
    accessor: 'permit_type', 
    render: (value) => permitTypeLabels[String(value)] || String(value)
  },
  { 
    key: 'issuing_authority', 
    label: 'Authority', 
    accessor: 'issuing_authority', 
  },
  { 
    key: 'permit_number', 
    label: 'Permit #', 
    accessor: 'permit_number', 
    render: (value) => value || '—'
  },
  { 
    key: 'expiration_date', 
    label: 'Expires', 
    accessor: 'expiration_date', 
    sortable: true,
    render: (value) => {
      if (!value) return '—';
      const date = new Date(String(value));
      const now = new Date();
      const isExpired = date < now;
      const isExpiringSoon = date > now && date < new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      return (
        <Stack direction="horizontal" gap={2} className="items-center">
          {isExpired && <AlertTriangle className="size-4 text-error" />}
          {isExpiringSoon && <Clock className="size-4 text-warning" />}
          <Body className={isExpired ? 'text-error' : isExpiringSoon ? 'text-warning' : ''}>
            {date.toLocaleDateString()}
          </Body>
        </Stack>
      );
    }
  },
  { 
    key: 'status', 
    label: 'Status', 
    accessor: 'status', 
    sortable: true,
    render: (value) => (
      <Badge variant={statusColors[String(value)] || 'default'}>
        {String(value).toUpperCase()}
      </Badge>
    )
  },
];

const formFields: FormFieldConfig[] = [
  { name: 'name', label: 'Permit Name', type: 'text', required: true, placeholder: 'e.g., Special Event Permit', colSpan: 2 },
  { name: 'permit_type', label: 'Permit Type', type: 'select', required: true, options: Object.entries(permitTypeLabels).map(([value, label]) => ({ value, label })) },
  { name: 'status', label: 'Status', type: 'select', required: true, options: [
    { value: 'pending', label: 'Pending' },
    { value: 'submitted', label: 'Submitted' },
    { value: 'approved', label: 'Approved' },
    { value: 'denied', label: 'Denied' },
    { value: 'expired', label: 'Expired' },
  ]},
  { name: 'issuing_authority', label: 'Issuing Authority', type: 'text', required: true, placeholder: 'e.g., City of Los Angeles' },
  { name: 'permit_number', label: 'Permit Number', type: 'text', placeholder: 'e.g., EVT-2024-001' },
  { name: 'application_date', label: 'Application Date', type: 'date' },
  { name: 'approval_date', label: 'Approval Date', type: 'date' },
  { name: 'expiration_date', label: 'Expiration Date', type: 'date' },
  { name: 'cost', label: 'Cost', type: 'number', placeholder: '0.00' },
  { name: 'document_url', label: 'Document URL', type: 'text', placeholder: 'https://...' },
  { name: 'description', label: 'Description', type: 'textarea', colSpan: 2, placeholder: 'Permit details...' },
  { name: 'notes', label: 'Notes', type: 'textarea', colSpan: 2, placeholder: 'Additional notes...' },
];

export default function PermitsPage() {
  const router = useRouter();
  const { data: permits, isLoading, error, refetch } = usePermits();
  const { data: stats } = usePermitStats();
  
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedPermit, setSelectedPermit] = useState<Permit | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filters: ListPageFilter[] = [
    { 
      key: 'status', 
      label: 'Status', 
      options: [
        { value: 'pending', label: 'Pending' },
        { value: 'submitted', label: 'Submitted' },
        { value: 'approved', label: 'Approved' },
        { value: 'denied', label: 'Denied' },
        { value: 'expired', label: 'Expired' },
      ]
    },
    { 
      key: 'permit_type', 
      label: 'Type', 
      options: Object.entries(permitTypeLabels).map(([value, label]) => ({ value, label }))
    },
  ];

  const rowActions: ListPageAction<Permit>[] = [
    { 
      id: 'view', 
      label: 'View Details', 
      icon: <Eye className="size-4" />, 
      onClick: (row) => router.push(`/permits/${row.id}`) 
    },
    { 
      id: 'edit', 
      label: 'Edit', 
      icon: <Pencil className="size-4" />, 
      onClick: (row) => { setSelectedPermit(row); setDrawerOpen(true); } 
    },
    { 
      id: 'document', 
      label: 'View Document', 
      icon: <FileText className="size-4" />, 
      onClick: (row) => row.document_url && window.open(row.document_url, '_blank'),
      hidden: (row) => !row.document_url
    },
  ];

  const handleCreate = async (_data: Record<string, unknown>) => {
    Logger.info("Create action triggered");
    setCreateModalOpen(false);
    refetch();
  };

  const pageStats = [
    { label: 'Total Permits', value: stats?.total || 0 },
    { label: 'Approved', value: stats?.approved || 0 },
    { label: 'Pending', value: stats?.pending || 0 },
    { label: 'Expiring Soon', value: stats?.expiringSoon || 0 },
  ];

  const detailSections: DetailSection[] = selectedPermit ? [
    {
      id: 'overview',
      title: 'Overview',
      content: (
        <Grid cols={2} gap={4}>
          <Stack gap={1}>
            <Body className="text-body-sm text-grey-500">Type</Body>
            <Body>{permitTypeLabels[selectedPermit.permit_type] || selectedPermit.permit_type}</Body>
          </Stack>
          <Stack gap={1}>
            <Body className="text-body-sm text-grey-500">Status</Body>
            <Badge variant={statusColors[selectedPermit.status] || 'default'}>
              {selectedPermit.status.toUpperCase()}
            </Badge>
          </Stack>
          <Stack gap={1}>
            <Body className="text-body-sm text-grey-500">Authority</Body>
            <Body>{selectedPermit.issuing_authority}</Body>
          </Stack>
          <Stack gap={1}>
            <Body className="text-body-sm text-grey-500">Permit Number</Body>
            <Body>{selectedPermit.permit_number || '—'}</Body>
          </Stack>
        </Grid>
      ),
    },
    {
      id: 'dates',
      title: 'Dates',
      content: (
        <Grid cols={2} gap={4}>
          <Stack gap={1}>
            <Body className="text-body-sm text-grey-500">Application Date</Body>
            <Body>{selectedPermit.application_date ? new Date(selectedPermit.application_date).toLocaleDateString() : '—'}</Body>
          </Stack>
          <Stack gap={1}>
            <Body className="text-body-sm text-grey-500">Expiration Date</Body>
            <Body>{selectedPermit.expiration_date ? new Date(selectedPermit.expiration_date).toLocaleDateString() : '—'}</Body>
          </Stack>
        </Grid>
      ),
    },
  ] : [];

  return (
    <AtlvsAppLayout>
      <ListPage<Permit>
        title="Permits"
        subtitle="Manage event permits and licenses"
        data={permits || []}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        error={error}
        onRetry={refetch}
        searchPlaceholder="Search permits..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(row) => router.push(`/permits/${row.id}`)}
        createLabel="New Permit"
        onCreate={() => setCreateModalOpen(true)}
        stats={pageStats}
        emptyMessage="No permits yet"
        emptyAction={{ label: 'Add First Permit', onClick: () => setCreateModalOpen(true) }}
        breadcrumbs={[{ label: 'ATLVS', href: '/dashboard' }, { label: 'Permits' }]}
        quickActions={[
          { id: 'insurance', label: 'Insurance', icon: <FileText className="size-4" />, onClick: () => router.push('/insurance') },
          { id: 'compliance', label: 'Compliance', icon: <CheckCircle className="size-4" />, onClick: () => router.push('/compliance') },
        ]}
      />

      <RecordFormModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        mode="create"
        title="Add Permit"
        fields={formFields}
        onSubmit={handleCreate}
        size="lg"
        defaultValues={{ status: 'pending', permit_type: 'event' }}
      />

      <DetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        record={selectedPermit}
        title={(p) => p.name}
        subtitle={(p) => permitTypeLabels[p.permit_type] || p.permit_type}
        sections={detailSections}
        onEdit={(p) => router.push(`/permits/${p.id}`)}
      />
    </AtlvsAppLayout>
  );
}
