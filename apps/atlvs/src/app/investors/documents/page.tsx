'use client';

export const dynamic = 'force-dynamic';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, Download, FileText, Send, CheckCircle, Clock } from 'lucide-react';
import { AtlvsAppLayout } from '../../../components/app-layout';
import { useInvestorDocuments, useInvestors, useInvestmentRounds } from '../../../hooks/useInvestors';
import {
  ListPage,
  Badge,
  DetailDrawer,
  Grid,
  Stack,
  Body,
  Select,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
  type DetailSection,
} from '@ghxstship/ui';

interface InvestorDocument {
  id: string;
  title: string;
  document_type: string;
  file_url: string;
  status: string;
  sent_at?: string;
  signed_at?: string;
  investor_id?: string;
  round_id?: string;
}

const statusColors: Record<string, 'success' | 'warning' | 'error' | 'info' | 'default'> = {
  executed: 'success',
  signed: 'success',
  sent: 'warning',
  draft: 'default',
};

const documentTypeLabels: Record<string, string> = {
  subscription_agreement: 'Subscription Agreement',
  operating_agreement: 'Operating Agreement',
  term_sheet: 'Term Sheet',
  side_letter: 'Side Letter',
  other: 'Other',
};

const columns: ListPageColumn<InvestorDocument>[] = [
  { 
    key: 'title', 
    label: 'Document', 
    accessor: 'title', 
    sortable: true,
    render: (value) => (
      <Stack direction="horizontal" gap={2} className="items-center">
        <FileText className="size-4 text-grey-400" />
        <Body>{String(value)}</Body>
      </Stack>
    )
  },
  { 
    key: 'document_type', 
    label: 'Type', 
    accessor: 'document_type', 
    render: (value) => documentTypeLabels[String(value)] || String(value)
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
  { 
    key: 'sent_at', 
    label: 'Sent', 
    accessor: 'sent_at', 
    sortable: true,
    render: (value) => value ? new Date(String(value)).toLocaleDateString() : '—'
  },
  { 
    key: 'signed_at', 
    label: 'Signed', 
    accessor: 'signed_at', 
    sortable: true,
    render: (value) => value ? new Date(String(value)).toLocaleDateString() : '—'
  },
];

function InvestorDocumentsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const investorId = searchParams.get('investor');
  const roundId = searchParams.get('round');
  
  const { data: documents, isLoading, error, refetch } = useInvestorDocuments(investorId || undefined, roundId || undefined);
  const { data: investors } = useInvestors();
  const { data: rounds } = useInvestmentRounds();
  
  const [selectedInvestorId, setSelectedInvestorId] = useState(investorId || '');
  const [selectedRoundId, setSelectedRoundId] = useState(roundId || '');
  const [selectedDocument, setSelectedDocument] = useState<InvestorDocument | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filters: ListPageFilter[] = [
    { 
      key: 'status', 
      label: 'Status', 
      options: [
        { value: 'draft', label: 'Draft' },
        { value: 'sent', label: 'Sent' },
        { value: 'signed', label: 'Signed' },
        { value: 'executed', label: 'Executed' },
      ]
    },
    { 
      key: 'document_type', 
      label: 'Type', 
      options: [
        { value: 'subscription_agreement', label: 'Subscription Agreement' },
        { value: 'operating_agreement', label: 'Operating Agreement' },
        { value: 'term_sheet', label: 'Term Sheet' },
        { value: 'side_letter', label: 'Side Letter' },
        { value: 'other', label: 'Other' },
      ]
    },
  ];

  const rowActions: ListPageAction<InvestorDocument>[] = [
    { 
      id: 'view', 
      label: 'View Details', 
      icon: <Eye className="size-4" />, 
      onClick: (row) => { setSelectedDocument(row); setDrawerOpen(true); } 
    },
    { 
      id: 'download', 
      label: 'Download', 
      icon: <Download className="size-4" />, 
      onClick: (row) => window.open(row.file_url, '_blank')
    },
    { 
      id: 'send', 
      label: 'Send for Signature', 
      icon: <Send className="size-4" />, 
      onClick: (_row) => {},
      hidden: (row) => row.status !== 'draft'
    },
  ];

  const stats = [
    { label: 'Total Documents', value: documents?.length || 0 },
    { label: 'Executed', value: documents?.filter(d => d.status === 'executed').length || 0 },
    { label: 'Pending Signature', value: documents?.filter(d => d.status === 'sent').length || 0 },
    { label: 'Draft', value: documents?.filter(d => d.status === 'draft').length || 0 },
  ];

  const detailSections: DetailSection[] = selectedDocument ? [
    {
      id: 'overview',
      title: 'Overview',
      content: (
        <Grid cols={2} gap={4}>
          <Stack gap={1}>
            <Body className="text-body-sm text-grey-500">Document Type</Body>
            <Body>{documentTypeLabels[selectedDocument.document_type] || selectedDocument.document_type}</Body>
          </Stack>
          <Stack gap={1}>
            <Body className="text-body-sm text-grey-500">Status</Body>
            <Badge variant={statusColors[selectedDocument.status] || 'default'}>
              {selectedDocument.status.toUpperCase()}
            </Badge>
          </Stack>
        </Grid>
      ),
    },
    {
      id: 'timeline',
      title: 'Timeline',
      content: (
        <Stack gap={3}>
          <Stack direction="horizontal" gap={3} className="items-center">
            <Clock className="size-4 text-grey-400" />
            <Body className="text-body-sm">
              Sent: {selectedDocument.sent_at ? new Date(selectedDocument.sent_at).toLocaleString() : 'Not sent'}
            </Body>
          </Stack>
          <Stack direction="horizontal" gap={3} className="items-center">
            <CheckCircle className="size-4 text-grey-400" />
            <Body className="text-body-sm">
              Signed: {selectedDocument.signed_at ? new Date(selectedDocument.signed_at).toLocaleString() : 'Not signed'}
            </Body>
          </Stack>
        </Stack>
      ),
    },
  ] : [];

  return (
    <AtlvsAppLayout>
      <ListPage<InvestorDocument>
        title="Investor Documents"
        subtitle="Manage subscription agreements and legal documents"
        data={documents || []}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        error={error}
        onRetry={refetch}
        searchPlaceholder="Search documents..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(row) => { setSelectedDocument(row); setDrawerOpen(true); }}
        stats={stats}
        emptyMessage="No documents found"
        breadcrumbs={[
          { label: 'ATLVS', href: '/dashboard' }, 
          { label: 'Investors', href: '/investors' },
          { label: 'Documents' }
        ]}
        headerContent={
          <Stack direction="horizontal" gap={2}>
            <Select
              value={selectedInvestorId}
              onChange={(e) => {
                setSelectedInvestorId(e.target.value);
                const params = new URLSearchParams();
                if (e.target.value) params.set('investor', e.target.value);
                if (selectedRoundId) params.set('round', selectedRoundId);
                router.push(`/investors/documents${params.toString() ? `?${params.toString()}` : ''}`);
              }}
              className="w-48 border-2 border-grey-300 px-3 py-2"
            >
              <option value="">All Investors</option>
              {investors?.map(investor => (
                <option key={investor.id} value={investor.id}>{investor.name}</option>
              ))}
            </Select>
            <Select
              value={selectedRoundId}
              onChange={(e) => {
                setSelectedRoundId(e.target.value);
                const params = new URLSearchParams();
                if (selectedInvestorId) params.set('investor', selectedInvestorId);
                if (e.target.value) params.set('round', e.target.value);
                router.push(`/investors/documents${params.toString() ? `?${params.toString()}` : ''}`);
              }}
              className="w-48 border-2 border-grey-300 px-3 py-2"
            >
              <option value="">All Rounds</option>
              {rounds?.map(round => (
                <option key={round.id} value={round.id}>{round.name}</option>
              ))}
            </Select>
          </Stack>
        }
      />

      <DetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        record={selectedDocument}
        title={(d) => d.title}
        subtitle={(d) => documentTypeLabels[d.document_type] || d.document_type}
        sections={detailSections}
      />
    </AtlvsAppLayout>
  );
}

export default function InvestorDocumentsPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <InvestorDocumentsPageContent />
    </Suspense>
  );
}
