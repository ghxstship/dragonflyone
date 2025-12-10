'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Reply, Link } from 'lucide-react';
import { AtlvsAppLayout } from '../../../components/app-layout';
import {
  ListPage, Badge, DetailDrawer, Grid, Body,
  type ListPageColumn, type ListPageFilter, type ListPageAction, type DetailSection, } from '@ghxstship/ui';
import { getBadgeVariant, createExportHandler, createImportHandler, getImportTemplates } from '@ghxstship/config';

interface EmailThread {
  id: string;
  subject: string;
  from: string;
  to: string;
  date: string;
  preview: string;
  linkedContact?: string;
  linkedDeal?: string;
  status: 'Unread' | 'Read' | 'Replied';
  [key: string]: unknown;
}

const mockData: EmailThread[] = [
  { id: 'EM-001', subject: 'Re: Summer Festival Proposal', from: 'client@festival.com', to: 'john.smith@company.com', date: '2024-11-25 10:30', preview: 'Thanks for sending over the proposal. We have reviewed it and have a few questions...', linkedContact: 'Festival Productions', linkedDeal: 'Summer Fest 2025', status: 'Unread' },
  { id: 'EM-002', subject: 'Equipment Quote Request', from: 'vendor@audiohouse.com', to: 'john.smith@company.com', date: '2024-11-25 09:15', preview: 'Please find attached our quote for the L-Acoustics system rental...', linkedContact: 'Audio House Inc', status: 'Read' },
  { id: 'EM-003', subject: 'Contract Review - Corporate Gala', from: 'legal@techcorp.com', to: 'sales@company.com', date: '2024-11-24 16:45', preview: 'Our legal team has completed the review. Please see the attached redlines...', linkedContact: 'Tech Corp', linkedDeal: 'Corporate Gala 2024', status: 'Replied' },
  { id: 'EM-004', subject: 'Meeting Confirmation', from: 'assistant@venue.com', to: 'john.smith@company.com', date: '2024-11-24 14:20', preview: 'This confirms your site visit scheduled for November 28th at 2:00 PM...', linkedContact: 'Grand Arena', status: 'Read' },
];

const getStatusVariant = getBadgeVariant;

const columns: ListPageColumn<EmailThread>[] = [
  { key: 'from', label: 'From', accessor: 'from', sortable: true },
  { key: 'subject', label: 'Subject', accessor: 'subject', sortable: true },
  { key: 'date', label: 'Date', accessor: 'date', sortable: true },
  { key: 'linkedContact', label: 'Contact', accessor: (r) => r.linkedContact || '—', render: (v) => v !== '—' ? <Badge variant="outline">{String(v)}</Badge> : <span>—</span> },
  { key: 'linkedDeal', label: 'Deal', accessor: (r) => r.linkedDeal || '—', render: (v) => v !== '—' ? <Badge variant="solid">{String(v)}</Badge> : <span>—</span> },
  { key: 'status', label: 'Status', accessor: 'status', sortable: true, render: (v) => <Badge variant={getStatusVariant(String(v))}>{String(v)}</Badge> },
];

const filters: ListPageFilter[] = [
  { key: 'status', label: 'Status', options: [{ value: 'Unread', label: 'Unread' }, { value: 'Read', label: 'Read' }, { value: 'Replied', label: 'Replied' }] },
];

export default function EmailIntegrationPage() {
  const router = useRouter();
  const [data] = useState<EmailThread[]>(mockData);
  const [selected, setSelected] = useState<EmailThread | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const unreadCount = data.filter(e => e.status === 'Unread').length;
  const linkedCount = data.filter(e => e.linkedContact || e.linkedDeal).length;

  const rowActions: ListPageAction<EmailThread>[] = [
    { id: 'view', label: 'View Email', icon: <Eye className="size-4" />, onClick: (r) => { setSelected(r); setDrawerOpen(true); } },
    { id: 'reply', label: 'Reply', icon: <Reply className="size-4" />, onClick: (r) => window.location.href = `mailto:${r.from}?subject=Re: ${r.subject}` },
    { id: 'link', label: 'Link to Contact', icon: <Link className="size-4" />, onClick: (r) => router.push(`/crm/email-integration/${r.id}/link`) },
  ];

  const stats = [
    { label: 'Connected Accounts', value: 2 },
    { label: 'Unread Emails', value: unreadCount },
    { label: 'Auto-Logged', value: linkedCount },
    { label: "Today's Emails", value: data.length },
  ];

  const detailSections: DetailSection[] = selected ? [
    { id: 'overview', title: 'Email Details', content: (
      <Grid cols={2} gap={4}>
        <Body size="sm"><strong>From:</strong> {selected.from}</Body>
        <Body size="sm"><strong>To:</strong> {selected.to}</Body>
        <Body size="sm"><strong>Date:</strong> {selected.date}</Body>
        <Body size="sm"><strong>Status:</strong> {selected.status}</Body>
        <Body size="sm" className="col-span-2"><strong>Subject:</strong> {selected.subject}</Body>
        <Body size="sm" className="col-span-2"><strong>Preview:</strong> {selected.preview}</Body>
        {selected.linkedContact && <Body size="sm"><strong>Contact:</strong> {selected.linkedContact}</Body>}
        {selected.linkedDeal && <Body size="sm"><strong>Deal:</strong> {selected.linkedDeal}</Body>}
      </Grid>
    )},
  ] : [];

  // Import handler for CSV/JSON files

  const handleImport = createImportHandler<Omit<EmailThread, 'id'>>({

    entityType: 'emails',

    requiredFields: ['emails', 'from', 'subject'],

    onImport: async (records) => {

      for (const record of records) {

        await fetch('/api/emails', {

          method: 'POST',

          headers: { 'Content-Type': 'application/json' },

          body: JSON.stringify({ organization_id: 'default-org', ...record }),

        });

      }

      refetch();

    },

  });


  // Import templates for field mapping

  const importTemplates = getImportTemplates('emails');


  return (
    <AtlvsAppLayout>
      <ListPage<EmailThread>
        title="Email Integration"
        subtitle="Connect email accounts and auto-log communications to CRM"
        data={data}
        columns={columns}
        rowKey="id"
        loading={false}
        searchPlaceholder="Search emails..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => { setSelected(r); setDrawerOpen(true); }}
        entityType="emails"

        onImport={handleImport}

        importTemplates={importTemplates}

        importSampleFields={['emails', 'from', 'subject', 'date', 'linkedContact', 'linkedDeal', 'status']}
        onExport={createExportHandler({
          filename: "emails",
          getData: () => data.map(e => ({
            id: e.id,
            subject: e.subject,
            from: e.from,
            date: e.date,
            status: e.status,
            linkedContact: e.linkedContact || '',
            linkedDeal: e.linkedDeal || '',
          })),
        })}
        exportFormats={["csv", "json"]}
        stats={stats}
        emptyMessage="No emails found"
        onBulkAction={async (action, ids) => {
          if (action === 'delete') {
            await fetch('/api/crm/emails/bulk', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ids }),
            });
          } else if (action === 'archive') {
            await fetch('/api/crm/emails/bulk-archive', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ids }),
            });
          }
        }}
        bulkActions={[
          { id: 'archive', label: 'Archive Selected', variant: 'default' },
          { id: 'delete', label: 'Delete Selected', variant: 'danger' },
        ]}
        showFavorite
        showSettings
      />
      {selected && (
        <DetailDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          record={selected}
          title={(r) => r.subject}
          subtitle={(r) => `From: ${r.from} • ${r.date}`}
          sections={detailSections}
          actions={[{ id: 'reply', label: 'Reply', icon: <Reply className="size-4" /> }, { id: 'link', label: 'Link to Contact', icon: <Link className="size-4" /> }]}
          onAction={(id, r) => {
            if (id === 'reply') window.location.href = `mailto:${r.from}?subject=Re: ${r.subject}`;
            if (id === 'link') router.push(`/crm/email-integration/${r.id}/link`);
            setDrawerOpen(false);
          }}
        />
      )}
    </AtlvsAppLayout>
  );
}
