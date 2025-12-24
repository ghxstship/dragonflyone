'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Reply, Link } from 'lucide-react';
// Layout provided by route group
import {
  Badge,
  Body,
  DetailDrawer,
  Grid,
  ListPage,
  Text,
  type DetailSection,
  type ListPageAction,
  type ListPageColumn,
  type ListPageFilter,
} from '@ghxstship/ui';
import { getBadgeVariant, createExportHandler, createImportHandler, getImportTemplates, useCrmEmails, type CrmEmailThread } from '@ghxstship/config';

import { DEMO_EMAIL_THREADS } from '../../../../lib/demo-data';

type EmailThread = CrmEmailThread & { [key: string]: unknown };

const getStatusVariant = getBadgeVariant;

const columns: ListPageColumn<EmailThread>[] = [
  { key: 'from', label: 'From', accessor: 'from', sortable: true },
  { key: 'subject', label: 'Subject', accessor: 'subject', sortable: true },
  { key: 'date', label: 'Date', accessor: 'date', sortable: true },
  { key: 'linkedContact', label: 'Contact', accessor: (r) => r.linkedContact || '—', render: (v) => v !== '—' ? <Badge variant="outline">{String(v)}</Badge> : <Text>—</Text> },
  { key: 'linkedDeal', label: 'Deal', accessor: (r) => r.linkedDeal || '—', render: (v) => v !== '—' ? <Badge variant="solid">{String(v)}</Badge> : <Text>—</Text> },
  { key: 'status', label: 'Status', accessor: 'status', sortable: true, render: (v) => <Badge variant={getStatusVariant(String(v))}>{String(v)}</Badge> },
];

const filters: ListPageFilter[] = [
  { key: 'status', label: 'Status', options: [{ value: 'Unread', label: 'Unread' }, { value: 'Read', label: 'Read' }, { value: 'Replied', label: 'Replied' }] },
];

export default function EmailIntegrationPage() {
  const router = useRouter();
  const { emails: apiEmails, summary, isLoading, error, deleteEmailsAsync, archiveEmailsAsync, refetch } = useCrmEmails();
  const [selected, setSelected] = useState<EmailThread | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Use API data or fall back to demo data
  const data: EmailThread[] = apiEmails.length > 0 ? (apiEmails as EmailThread[]) : (DEMO_EMAIL_THREADS as EmailThread[]);

  const unreadCount = summary?.unread || data.filter(e => e.status === 'Unread').length;
  const linkedCount = summary?.linked || data.filter(e => e.linkedContact || e.linkedDeal).length;

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
      <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
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

      // Data refreshed after import

    },

  });


  // Import templates for field mapping

  const importTemplates = getImportTemplates('emails');


  return (
    <>
      <ListPage<EmailThread>
        title="Email Integration"
        subtitle="Connect email accounts and auto-log communications to CRM"
        data={data}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        error={error as Error | undefined}
        onRetry={() => refetch()}
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
            await deleteEmailsAsync(ids);
            refetch();
          } else if (action === 'archive') {
            await archiveEmailsAsync(ids);
            refetch();
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
    </>
  );
}
