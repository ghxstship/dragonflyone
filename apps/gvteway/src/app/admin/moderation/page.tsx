"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "../../../components/navigation";
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
} from "@ghxstship/ui";

interface FlaggedContent {
  id: string;
  type: "Comment" | "Review" | "Post" | "Photo";
  content: string;
  author: string;
  reportedBy: string;
  reason: string;
  timestamp: string;
  status: "Pending" | "Approved" | "Removed" | "Escalated";
  [key: string]: unknown;
}

const mockFlagged: FlaggedContent[] = [
  { id: "FLAG-001", type: "Comment", content: "This event was terrible! Total waste of money...", author: "user123", reportedBy: "moderator", reason: "Spam/Inappropriate", timestamp: "2024-11-25 10:30", status: "Pending" },
  { id: "FLAG-002", type: "Review", content: "Best concert ever! 10/10 would recommend to everyone!", author: "musicfan", reportedBy: "auto-filter", reason: "Suspicious activity", timestamp: "2024-11-25 09:15", status: "Pending" },
  { id: "FLAG-003", type: "Post", content: "Selling tickets at half price! DM me now!", author: "ticketseller", reportedBy: "user456", reason: "Unauthorized sales", timestamp: "2024-11-24 18:45", status: "Removed" },
  { id: "FLAG-004", type: "Photo", content: "[Image flagged for review]", author: "partygoer", reportedBy: "auto-filter", reason: "Potentially inappropriate", timestamp: "2024-11-24 16:20", status: "Approved" },
];

const getTypeIcon = (type: string) => {
  switch (type) {
    case "Comment": return "💬";
    case "Review": return "⭐";
    case "Post": return "📝";
    case "Photo": return "📷";
    default: return "📄";
  }
};

const getStatusVariant = (status: string): 'solid' | 'outline' | 'ghost' => {
  switch (status) {
    case "Approved": return 'solid';
    case "Removed": return 'solid';
    case "Pending": return 'outline';
    default: return 'ghost';
  }
};

const columns: ListPageColumn<FlaggedContent>[] = [
  { key: 'type', label: 'Type', accessor: 'type', render: (v) => <span>{getTypeIcon(String(v))} {String(v)}</span> },
  { key: 'content', label: 'Content', accessor: 'content' },
  { key: 'author', label: 'Author', accessor: 'author' },
  { key: 'reason', label: 'Reason', accessor: 'reason', render: (v) => <Badge variant="outline">{String(v)}</Badge> },
  { key: 'reportedBy', label: 'Reported By', accessor: 'reportedBy' },
  { key: 'status', label: 'Status', accessor: 'status', sortable: true, render: (v) => <Badge variant={getStatusVariant(String(v))}>{String(v)}</Badge> },
  { key: 'timestamp', label: 'Time', accessor: 'timestamp', sortable: true },
];

const filters: ListPageFilter[] = [
  { key: 'status', label: 'Status', options: [{ value: 'Pending', label: 'Pending' }, { value: 'Approved', label: 'Approved' }, { value: 'Removed', label: 'Removed' }, { value: 'Escalated', label: 'Escalated' }] },
  { key: 'type', label: 'Type', options: [{ value: 'Comment', label: 'Comment' }, { value: 'Review', label: 'Review' }, { value: 'Post', label: 'Post' }, { value: 'Photo', label: 'Photo' }] },
];

export default function ModerationPage() {
  const router = useRouter();
  const [flaggedContent, setFlaggedContent] = useState<FlaggedContent[]>(mockFlagged);
  const [selectedContent, setSelectedContent] = useState<FlaggedContent | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const pendingCount = flaggedContent.filter(f => f.status === "Pending").length;
  const removedToday = flaggedContent.filter(f => f.status === "Removed").length;
  const autoFlagged = flaggedContent.filter(f => f.reportedBy === "auto-filter").length;

  const rowActions: ListPageAction<FlaggedContent>[] = [
    { id: 'view', label: 'Review', icon: '👁️', onClick: (r) => { setSelectedContent(r); setDrawerOpen(true); } },
    { id: 'approve', label: 'Approve', icon: '✅', onClick: (r) => handleModerate(r.id, 'Approved') },
    { id: 'remove', label: 'Remove', icon: '🗑️', variant: 'danger', onClick: (r) => handleModerate(r.id, 'Removed') },
  ];

  const handleModerate = (contentId: string, newStatus: FlaggedContent['status']) => {
    setFlaggedContent(flaggedContent.map(c => c.id === contentId ? { ...c, status: newStatus } : c));
  };

  const stats = [
    { label: 'Pending Review', value: pendingCount },
    { label: 'Removed Today', value: removedToday },
    { label: 'Auto-Flagged', value: autoFlagged },
    { label: 'Total Items', value: flaggedContent.length },
  ];

  const detailSections: DetailSection[] = selectedContent ? [
    { id: 'content', title: 'Flagged Content', content: (
      <div style={{ padding: '1rem', background: '#f5f5f5', borderRadius: '8px', marginBottom: '1rem' }}>
        <p>{selectedContent.content}</p>
      </div>
    )},
    { id: 'details', title: 'Details', content: (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
        <div><strong>Type:</strong> {getTypeIcon(selectedContent.type)} {selectedContent.type}</div>
        <div><strong>Status:</strong> {selectedContent.status}</div>
        <div><strong>Author:</strong> {selectedContent.author}</div>
        <div><strong>Reported By:</strong> {selectedContent.reportedBy}</div>
        <div><strong>Reason:</strong> {selectedContent.reason}</div>
        <div><strong>Timestamp:</strong> {selectedContent.timestamp}</div>
      </div>
    )},
  ] : [];

  return (
    <>
      <ListPage<FlaggedContent>
        title="Content Moderation"
        subtitle="Review flagged content and manage community guidelines"
        data={flaggedContent}
        columns={columns}
        rowKey="id"
        loading={false}
        searchPlaceholder="Search content..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => { setSelectedContent(r); setDrawerOpen(true); }}
        onExport={() => console.log('Export')}
        stats={stats}
        emptyMessage="No flagged content"
        header={<Navigation />}
      />

      {selectedContent && (
        <DetailDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          record={selectedContent}
          title={(c) => `${getTypeIcon(c.type)} ${c.type}`}
          subtitle={(c) => `Reported by ${c.reportedBy}`}
          sections={detailSections}
          actions={[
            { id: 'approve', label: 'Approve', icon: '✅' },
            { id: 'escalate', label: 'Escalate', icon: '⬆️' },
            { id: 'remove', label: 'Remove', icon: '🗑️' },
          ]}
          onAction={(id, c) => {
            if (id === 'approve') handleModerate(c.id, 'Approved');
            if (id === 'escalate') handleModerate(c.id, 'Escalated');
            if (id === 'remove') handleModerate(c.id, 'Removed');
            setDrawerOpen(false);
          }}
        />
      )}
    </>
  );
}
