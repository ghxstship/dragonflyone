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
} from '@ghxstship/ui';
import { Bell, FileText, TrendingUp, Calendar, Download, Eye } from 'lucide-react';
import { AtlvsAppLayout } from '../../../../components/app-layout';

interface Update {
  id: string;
  title: string;
  type: 'quarterly' | 'annual' | 'announcement' | 'document';
  date: string;
  summary: string;
  isRead: boolean;
  hasAttachment: boolean;
}

const DEMO_UPDATES: Update[] = [
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
  {
    id: '4',
    title: 'Q3 2024 Investor Update',
    type: 'quarterly',
    date: '2024-10-15',
    summary: 'Record-breaking summer festival season. Platform processed over $50M in ticket sales.',
    isRead: true,
    hasAttachment: true,
  },
  {
    id: '5',
    title: 'Board Meeting Minutes - October 2024',
    type: 'document',
    date: '2024-10-25',
    summary: 'Minutes from the October board meeting covering strategic planning and budget approval.',
    isRead: true,
    hasAttachment: true,
  },
  {
    id: '6',
    title: 'New CTO Appointment',
    type: 'announcement',
    date: '2024-09-05',
    summary: 'Welcoming Jane Smith as our new Chief Technology Officer, bringing 15 years of enterprise experience.',
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
  const [updates, setUpdates] = useState<Update[]>(DEMO_UPDATES);
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredUpdates = updates.filter((u) => {
    return typeFilter === 'all' || u.type === typeFilter;
  });

  const unreadCount = updates.filter((u) => !u.isRead).length;
  const quarterlyCount = updates.filter((u) => u.type === 'quarterly').length;
  const announcementCount = updates.filter((u) => u.type === 'announcement').length;

  const markAsRead = (id: string) => {
    setUpdates(updates.map((u) => (u.id === id ? { ...u, isRead: true } : u)));
  };

  const handleDownload = (update: Update) => {
    const blob = new Blob([`${update.title}\n\nDate: ${update.date}\n\n${update.summary}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${update.title.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

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
