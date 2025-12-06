'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle } from 'lucide-react';
import { CompvssAppLayout } from '../../../components/app-layout';
import { useSOPAcknowledgments, useSOPs } from '../../../hooks/useSOPs';
import {
  ListPage,
  Stack,
  Body,
  Select,
  type ListPageColumn,
  type ListPageFilter,
} from '@ghxstship/ui';
import { createExportHandler } from '@ghxstship/config';

interface SOPAcknowledgment {
  id: string;
  acknowledged_at: string;
  sop?: { id: string; title: string };
  user?: { id: string; first_name: string; last_name: string; email: string };
}

const columns: ListPageColumn<SOPAcknowledgment>[] = [
  { 
    key: 'user', 
    label: 'User', 
    accessor: (row) => row.user ? `${row.user.first_name} ${row.user.last_name}` : '—',
    sortable: true,
    render: (_, row) => row.user ? (
      <Stack gap={0}>
        <Body className="font-weight-semibold">{row.user.first_name} {row.user.last_name}</Body>
        <Body className="text-body-sm text-grey-500">{row.user.email}</Body>
      </Stack>
    ) : '—'
  },
  { 
    key: 'sop', 
    label: 'SOP', 
    accessor: (row) => row.sop?.title || '—',
    sortable: true,
  },
  { 
    key: 'acknowledged_at', 
    label: 'Acknowledged', 
    accessor: 'acknowledged_at', 
    sortable: true,
    render: (value) => value ? (
      <Stack direction="horizontal" gap={2} className="items-center">
        <CheckCircle className="size-4 text-success" />
        <Body>{new Date(String(value)).toLocaleString()}</Body>
      </Stack>
    ) : '—'
  },
];

export default function SOPAcknowledgmentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sopId = searchParams.get('sop');
  
  const { data: acknowledgments, isLoading, error, refetch } = useSOPAcknowledgments(sopId || undefined);
  const { data: sops } = useSOPs();
  
  const [selectedSopId, setSelectedSopId] = useState(sopId || '');

  const filters: ListPageFilter[] = [
    { 
      key: 'sop_id', 
      label: 'SOP', 
      options: sops?.map(s => ({ value: s.id, label: s.title })) || []
    },
  ];

  const stats = [
    { label: 'Total Acknowledgments', value: acknowledgments?.length || 0 },
    { label: 'Today', value: acknowledgments?.filter(a => {
      const today = new Date().toDateString();
      return new Date(a.acknowledged_at).toDateString() === today;
    }).length || 0 },
    { label: 'This Week', value: acknowledgments?.filter(a => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(a.acknowledged_at) >= weekAgo;
    }).length || 0 },
  ];

  return (
    <CompvssAppLayout>
      <ListPage<SOPAcknowledgment>
        title="SOP Acknowledgments"
        subtitle="Track who has acknowledged each SOP"
        data={acknowledgments || []}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        error={error}
        onRetry={refetch}
        searchPlaceholder="Search by user or SOP..."
        filters={filters}
        entityType="sop-acknowledgments"
        onExport={createExportHandler({
          filename: "sop-acknowledgments",
          getData: () => (acknowledgments || []).map(a => ({
            id: a.id,
            acknowledged_at: a.acknowledged_at,
            sop_title: a.sop?.title || '',
            user_name: a.user ? `${a.user.first_name} ${a.user.last_name}` : '',
            user_email: a.user?.email || '',
          })),
        })}
        stats={stats}
        emptyMessage="No acknowledgments recorded yet"
        onBulkAction={async (action, ids) => {
          if (action === 'delete') {
            await fetch('/api/sops/acknowledgments/bulk', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ids }),
            });
            refetch();
          }
        }}
        bulkActions={[
          { id: 'delete', label: 'Delete Selected', variant: 'danger' },
        ]}
        header={
          <Select
            value={selectedSopId}
            onChange={(e) => {
              setSelectedSopId(e.target.value);
              if (e.target.value) {
                router.push(`/sops/acknowledgments?sop=${e.target.value}`);
              } else {
                router.push('/sops/acknowledgments');
              }
            }}
            className="w-64 border-2 border-grey-300 px-3 py-2"
          >
            <option value="">All SOPs</option>
            {sops?.map(sop => (
              <option key={sop.id} value={sop.id}>{sop.title}</option>
            ))}
          </Select>
        }
      />
    </CompvssAppLayout>
  );
}
