'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { BookOpen, CheckCircle, XCircle, Clock, Play, RotateCcw } from 'lucide-react';
import { CompvssAppLayout } from '../../../components/app-layout';
import { useSOPTrainingRecords, useSOPs, useStartSOPTraining } from '../../../hooks/useSOPs';
import {
  ListPage,
  Badge,
  Stack,
  Body,
  Button,
  Select,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
} from '@ghxstship/ui';

interface SOPTrainingRecord {
  id: string;
  status: string;
  started_at?: string;
  completed_at?: string;
  score?: number;
  attempts: number;
  sop?: { id: string; title: string };
  user?: { id: string; first_name: string; last_name: string; email: string };
}

const statusColors: Record<string, 'success' | 'warning' | 'error' | 'info' | 'default'> = {
  completed: 'success',
  in_progress: 'warning',
  not_started: 'default',
  failed: 'error',
};

const statusIcons: Record<string, React.ReactNode> = {
  completed: <CheckCircle className="size-4" />,
  in_progress: <Clock className="size-4" />,
  not_started: <BookOpen className="size-4" />,
  failed: <XCircle className="size-4" />,
};

const columns: ListPageColumn<SOPTrainingRecord>[] = [
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
    key: 'status', 
    label: 'Status', 
    accessor: 'status', 
    sortable: true,
    render: (value) => (
      <Badge variant={statusColors[String(value)] || 'default'}>
        <Stack direction="horizontal" gap={1} className="items-center">
          {statusIcons[String(value)]}
          {String(value).replace('_', ' ').toUpperCase()}
        </Stack>
      </Badge>
    )
  },
  { 
    key: 'score', 
    label: 'Score', 
    accessor: 'score', 
    sortable: true,
    render: (value) => value !== null && value !== undefined ? `${value}%` : '—'
  },
  { 
    key: 'attempts', 
    label: 'Attempts', 
    accessor: 'attempts', 
    sortable: true,
  },
  { 
    key: 'started_at', 
    label: 'Started', 
    accessor: 'started_at', 
    sortable: true,
    render: (value) => value ? new Date(String(value)).toLocaleDateString() : '—'
  },
  { 
    key: 'completed_at', 
    label: 'Completed', 
    accessor: 'completed_at', 
    sortable: true,
    render: (value) => value ? new Date(String(value)).toLocaleDateString() : '—'
  },
];

export default function SOPTrainingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sopId = searchParams.get('sop');
  
  const { data: trainingRecords, isLoading, error, refetch } = useSOPTrainingRecords(sopId || undefined);
  const { data: sops } = useSOPs();
  const startTrainingMutation = useStartSOPTraining();
  
  const [selectedSopId, setSelectedSopId] = useState(sopId || '');

  const filters: ListPageFilter[] = [
    { 
      key: 'status', 
      label: 'Status', 
      options: [
        { value: 'not_started', label: 'Not Started' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'completed', label: 'Completed' },
        { value: 'failed', label: 'Failed' },
      ]
    },
  ];

  const rowActions: ListPageAction<SOPTrainingRecord>[] = [
    { 
      id: 'start', 
      label: 'Start Training', 
      icon: <Play className="size-4" />, 
      onClick: (row) => router.push(`/sops/${row.sop?.id}?training=true`),
      hidden: (row) => row.status !== 'not_started'
    },
    { 
      id: 'continue', 
      label: 'Continue Training', 
      icon: <Play className="size-4" />, 
      onClick: (row) => router.push(`/sops/${row.sop?.id}?training=true`),
      hidden: (row) => row.status !== 'in_progress'
    },
    { 
      id: 'retry', 
      label: 'Retry Training', 
      icon: <RotateCcw className="size-4" />, 
      onClick: (row) => router.push(`/sops/${row.sop?.id}?training=true`),
      hidden: (row) => row.status !== 'failed'
    },
    { 
      id: 'view', 
      label: 'View Certificate', 
      icon: <CheckCircle className="size-4" />, 
      onClick: (row) => {},
      hidden: (row) => row.status !== 'completed'
    },
  ];

  const stats = [
    { label: 'Total Records', value: trainingRecords?.length || 0 },
    { label: 'Completed', value: trainingRecords?.filter(r => r.status === 'completed').length || 0 },
    { label: 'In Progress', value: trainingRecords?.filter(r => r.status === 'in_progress').length || 0 },
    { label: 'Failed', value: trainingRecords?.filter(r => r.status === 'failed').length || 0 },
  ];

  // Calculate average score
  const completedRecords = trainingRecords?.filter(r => r.status === 'completed' && r.score !== null) || [];
  const avgScore = completedRecords.length > 0 
    ? Math.round(completedRecords.reduce((sum, r) => sum + (r.score || 0), 0) / completedRecords.length)
    : 0;

  return (
    <CompvssAppLayout>
      <ListPage<SOPTrainingRecord>
        title="SOP Training Records"
        subtitle="Track training progress and completion for SOPs"
        data={trainingRecords || []}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        error={error}
        onRetry={refetch}
        searchPlaceholder="Search by user or SOP..."
        filters={filters}
        rowActions={rowActions}
        onExport={() => {}}
        stats={[...stats, { label: 'Avg Score', value: `${avgScore}%` }]}
        emptyMessage="No training records yet"
        breadcrumbs={[
          { label: 'COMPVSS', href: '/dashboard' }, 
          { label: 'SOPs', href: '/sops' },
          { label: 'Training' }
        ]}
        headerContent={
          <Select
            value={selectedSopId}
            onChange={(e) => {
              setSelectedSopId(e.target.value);
              if (e.target.value) {
                router.push(`/sops/training?sop=${e.target.value}`);
              } else {
                router.push('/sops/training');
              }
            }}
            className="w-64 border-2 border-grey-300 px-3 py-2"
          >
            <option value="">All SOPs</option>
            {sops?.filter(s => s.requires_training).map(sop => (
              <option key={sop.id} value={sop.id}>{sop.title}</option>
            ))}
          </Select>
        }
      />
    </CompvssAppLayout>
  );
}
