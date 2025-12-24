'use client';

import { useState } from 'react';
import {
  SectionHeader,
  Card,
  CardBody,
  Stack,
  Grid,
  Badge,
  Button,
  Body,
  H3,
  StatCard,
  Skeleton,
} from '@ghxstship/ui';
import { Bell, FileText, TrendingUp, Calendar, Download, Eye, AlertCircle } from 'lucide-react';
import { AtlvsAppLayout } from '../../../../components/app-layout';
import { useInvestorUpdates, type InvestorUpdate } from '@ghxstship/config';

interface DisplayUpdate {
  id: string;
  title: string;
  type: 'quarterly' | 'annual' | 'announcement' | 'document';
  date: string;
  summary: string;
  isRead: boolean;
  hasAttachment: boolean;
}

const DEMO_UPDATES: DisplayUpdate[] = [
  {
    id: '1',
    title: 'Q4 2024 Investor Update',
    type: 'quarterly',
    date: '2025-01-15',
    summary: 'Strong Q4 performance with 45% YoY revenue growth. New venue partnerships secured in 3 major markets.',
    isRead: true,
    hasAttachment: true,
  },
  {
    id: '2',
    title: '2024 Annual Report',
    type: 'annual',
    date: '2025-02-01',
    summary: 'Comprehensive annual report covering financial performance, strategic initiatives, and 2025 outlook.',
    isRead: false,
    hasAttachment: true,
  },
  {
    id: '3',
    title: 'Series B Funding Announcement',
    type: 'announcement',
    date: '2024-11-20',
    summary: 'Successfully closed $15M Series B round led by Venture Partners. Funds will accelerate product development.',
    isRead: true,
    hasAttachment: false,
  },
];

const typeVariants: Record<string, 'info' | 'success' | 'warning' | 'error'> = {
  quarterly: 'info',
  annual: 'success',
  announcement: 'warning',
  document: 'info',
};

const typeLabels: Record<string, string> = {
  quarterly: 'Quarterly Update',
  annual: 'Annual Report',
  announcement: 'Announcement',
  document: 'Document',
};

export default function InvestorUpdatesPage() {
  const { updates: apiUpdates, isLoading, error, refetch, markAsRead: markReadApi } = useInvestorUpdates();
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [localReadState, setLocalReadState] = useState<Record<string, boolean>>({});

  // Map API updates to display format or fall back to demo data
  const updates: DisplayUpdate[] = apiUpdates.length > 0
    ? apiUpdates.map((u: InvestorUpdate) => ({
        id: u.id,
        title: u.title,
        type: u.type,
        date: u.date,
        summary: u.summary,
        isRead: localReadState[u.id] ?? u.is_read,
        hasAttachment: u.has_attachment,
      }))
    : DEMO_UPDATES;

  const filteredUpdates = updates.filter((u) => {
    return typeFilter === 'all' || u.type === typeFilter;
  });

  const unreadCount = updates.filter((u) => !u.isRead).length;
  const quarterlyCount = updates.filter((u) => u.type === 'quarterly').length;
  const announcementCount = updates.filter((u) => u.type === 'announcement').length;

  const markAsRead = (id: string) => {
    setLocalReadState(prev => ({ ...prev, [id]: true }));
    if (apiUpdates.length > 0) {
      markReadApi(id);
    }
  };

  const handleDownload = (update: DisplayUpdate) => {
    const blob = new Blob([`${update.title}\n\nDate: ${update.date}\n\n${update.summary}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${update.title.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <AtlvsAppLayout>
        <Stack gap={8}>
          <SectionHeader kicker="Investor Portal" title="Company Updates" description="Stay informed with the latest company news and reports" colorScheme="on-dark" />
          <Grid cols={4} gap={4} className="sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} inverted className="p-6">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-8 w-24" />
              </Card>
            ))}
          </Grid>
        </Stack>
      </AtlvsAppLayout>
    );
  }

  if (error) {
    return (
      <AtlvsAppLayout>
        <Stack gap={8}>
          <SectionHeader kicker="Investor Portal" title="Company Updates" description="Stay informed with the latest company news and reports" colorScheme="on-dark" />
          <Card inverted className="p-8 text-center">
            <Stack gap={4} className="items-center">
              <AlertCircle size={48} className="text-error" />
              <H3 className="text-white">Failed to Load Updates</H3>
              <Body className="text-grey-300">{error.message}</Body>
              <Button variant="solid" onClick={() => refetch()}>
                Try Again
              </Button>
            </Stack>
          </Card>
        </Stack>
      </AtlvsAppLayout>
    );
  }

  return (
    <AtlvsAppLayout>
      <Stack gap={8}>
        <SectionHeader
          kicker="Investor Portal"
          title="Company Updates"
          description="Stay informed with the latest company news and reports"
          colorScheme="on-dark"
        />

        <Grid cols={4} gap={4} className="sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Updates" value={updates.length.toString()} icon={<FileText size={20} />} inverted />
          <StatCard label="Unread" value={unreadCount.toString()} icon={<Bell size={20} />} inverted />
          <StatCard label="Quarterly Reports" value={quarterlyCount.toString()} icon={<TrendingUp size={20} />} inverted />
          <StatCard label="Announcements" value={announcementCount.toString()} icon={<Calendar size={20} />} inverted />
        </Grid>

        <Card variant="elevated" inverted>
          <CardBody>
            <Stack gap={4}>
              <Stack direction="horizontal" className="items-center justify-between">
                <H3 className="text-white">All Updates</H3>
                <Stack direction="horizontal" gap={2}>
                  <Button
                    variant={typeFilter === 'all' ? 'solid' : 'outline'}
                    size="sm"
                    onClick={() => setTypeFilter('all')}
                  >
                    All
                  </Button>
                  <Button
                    variant={typeFilter === 'quarterly' ? 'solid' : 'outline'}
                    size="sm"
                    onClick={() => setTypeFilter('quarterly')}
                  >
                    Quarterly
                  </Button>
                  <Button
                    variant={typeFilter === 'annual' ? 'solid' : 'outline'}
                    size="sm"
                    onClick={() => setTypeFilter('annual')}
                  >
                    Annual
                  </Button>
                  <Button
                    variant={typeFilter === 'announcement' ? 'solid' : 'outline'}
                    size="sm"
                    onClick={() => setTypeFilter('announcement')}
                  >
                    Announcements
                  </Button>
                </Stack>
              </Stack>

              <Stack gap={3}>
                {filteredUpdates.map((update) => (
                  <Stack
                    key={update.id}
                    className={`rounded border-2 p-4 ${update.isRead ? 'border-ink-700' : 'border-primary-500 bg-primary-500/10'}`}
                  >
                    <Stack direction="horizontal" className="items-start justify-between">
                      <Stack gap={1}>
                        <Stack direction="horizontal" gap={2} className="items-center">
                          {!update.isRead && <div className="h-2 w-2 rounded-avatar bg-primary-500" />}
                          <Body className="font-weight-semibold text-white">{update.title}</Body>
                        </Stack>
                        <Stack direction="horizontal" gap={2}>
                          <Badge variant={typeVariants[update.type]}>{typeLabels[update.type]}</Badge>
                          <Body size="sm" className=" text-on-dark-muted">
                            {new Date(update.date).toLocaleDateString()}
                          </Body>
                        </Stack>
                      </Stack>
                      <Stack direction="horizontal" gap={2}>
                        {!update.isRead && (
                          <Button variant="ghost" size="sm" onClick={() => markAsRead(update.id)}>
                            <Eye size={14} className="mr-1" />
                            Mark Read
                          </Button>
                        )}
                        {update.hasAttachment && (
                          <Button variant="outline" size="sm" onClick={() => handleDownload(update)}>
                            <Download size={14} className="mr-1" />
                            Download
                          </Button>
                        )}
                      </Stack>
                    </Stack>
                    <Body className="mt-3 text-on-dark-muted">{update.summary}</Body>
                  </Stack>
                ))}
                {filteredUpdates.length === 0 && (
                  <Body className="text-center text-on-dark-muted py-8">No updates found</Body>
                )}
              </Stack>
            </Stack>
          </CardBody>
        </Card>
      </Stack>
    </AtlvsAppLayout>
  );
}
