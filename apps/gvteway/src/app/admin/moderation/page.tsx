"use client";

import { useState } from "react";
import { Eye, Check, Trash2, ArrowUp, MessageCircle, Star, FileText, Camera, File } from "lucide-react";
import { GvtewayAppLayout } from "@/components/app-layout";
import {
  ListPage,
  Badge,
  DetailDrawer,
  Grid,
  Body,
  Card,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
  type DetailSection,
} from "@ghxstship/ui";

import { useModerationData, type FlaggedContent } from '@/hooks/useModeration';

const getTypeIcon = (type: string) => {
  switch (type) {
    case "Comment": return <MessageCircle className="size-4 inline mr-1" />;
    case "Review": return <Star className="size-4 inline mr-1" />;
    case "Post": return <FileText className="size-4 inline mr-1" />;
    case "Photo": return <Camera className="size-4 inline mr-1" />;
    default: return <File className="size-4 inline mr-1" />;
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
  const [selectedContent, setSelectedContent] = useState<FlaggedContent | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { flaggedContent, isLoading, error, refetch, moderateContent } = useModerationData();

  const pendingCount = flaggedContent.filter(f => f.status === "Pending").length;
  const removedToday = flaggedContent.filter(f => f.status === "Removed").length;
  const autoFlagged = flaggedContent.filter(f => f.reportedBy === "auto-filter").length;

  const handleModerate = async (contentId: string, newStatus: FlaggedContent['status']) => {
    try {
      await moderateContent({ contentId, status: newStatus });
    } catch {
      // Error handled by mutation
    }
  };

  const rowActions: ListPageAction<FlaggedContent>[] = [
    { id: 'view', label: 'Review', icon: <Eye className="size-4" />, onClick: (r) => { setSelectedContent(r); setDrawerOpen(true); } },
    { id: 'approve', label: 'Approve', icon: <Check className="size-4" />, onClick: (r) => handleModerate(r.id, 'Approved') },
    { id: 'remove', label: 'Remove', icon: <Trash2 className="size-4" />, variant: 'danger', onClick: (r) => handleModerate(r.id, 'Removed') },
  ];

  const stats = [
    { label: 'Pending Review', value: pendingCount },
    { label: 'Removed Today', value: removedToday },
    { label: 'Auto-Flagged', value: autoFlagged },
    { label: 'Total Items', value: flaggedContent.length },
  ];

  const detailSections: DetailSection[] = selectedContent ? [
    { id: 'content', title: 'Flagged Content', content: (
      <Card inverted className="mb-4 p-4">
        <Body className="text-white">{selectedContent.content}</Body>
      </Card>
    )},
    { id: 'details', title: 'Details', content: (
      <Grid cols={2} gap={4}>
        <Body size="sm"><strong>Type:</strong> {getTypeIcon(selectedContent.type)} {selectedContent.type}</Body>
        <Body size="sm"><strong>Status:</strong> {selectedContent.status}</Body>
        <Body size="sm"><strong>Author:</strong> {selectedContent.author}</Body>
        <Body size="sm"><strong>Reported By:</strong> {selectedContent.reportedBy}</Body>
        <Body size="sm"><strong>Reason:</strong> {selectedContent.reason}</Body>
        <Body size="sm"><strong>Timestamp:</strong> {selectedContent.timestamp}</Body>
      </Grid>
    )},
  ] : [];

  return (
    <GvtewayAppLayout>
      <ListPage<FlaggedContent>
        title="Content Moderation"
        subtitle="Review flagged content and manage community guidelines"
        data={flaggedContent}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        error={error}
        onRetry={() => refetch()}
        searchPlaceholder="Search content..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => { setSelectedContent(r); setDrawerOpen(true); }}
        stats={stats}
        emptyMessage="No flagged content"
        onBulkAction={async (action, ids) => {
          if (action === 'approve') {
            for (const id of ids) {
              handleModerate(id, 'Approved');
            }
          } else if (action === 'remove') {
            for (const id of ids) {
              handleModerate(id, 'Removed');
            }
          }
        }}
        bulkActions={[
          { id: 'approve', label: 'Approve Selected', variant: 'default' },
          { id: 'remove', label: 'Remove Selected', variant: 'danger' },
        ]}
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
            { id: 'approve', label: 'Approve', icon: <Check className="size-4" /> },
            { id: 'escalate', label: 'Escalate', icon: <ArrowUp className="size-4" /> },
            { id: 'remove', label: 'Remove', icon: <Trash2 className="size-4" /> },
          ]}
          onAction={(id, c) => {
            if (id === 'approve') handleModerate(c.id, 'Approved');
            if (id === 'escalate') handleModerate(c.id, 'Escalated');
            if (id === 'remove') handleModerate(c.id, 'Removed');
            setDrawerOpen(false);
          }}
        />
      )}
    </GvtewayAppLayout>
  );
}
