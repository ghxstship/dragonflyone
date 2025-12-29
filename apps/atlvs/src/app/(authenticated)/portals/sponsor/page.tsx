'use client';

/**
 * Sponsor Portal Dashboard
 * Self-service portal for sponsors to manage activations and view reports
 */

import { useRouter } from 'next/navigation';
import { 
  Megaphone, 
  BarChart3,
  Eye,
  Calendar,
  Download,
  ChevronRight,
  Users,
  TrendingUp,
} from 'lucide-react';
import {
  DetailPage,
  Badge,
  Body,
  Button,
  Card,
  Grid,
  Stack,
  StatCard,
  Text,
} from '@ghxstship/ui';
import { useQuery } from '@tanstack/react-query';

interface SponsorStats {
  activeActivations: number;
  totalImpressions: number;
  totalReach: number;
  upcomingEvents: number;
}

interface Activation {
  id: string;
  name: string;
  event_name: string;
  type: 'booth' | 'banner' | 'digital' | 'experience' | 'naming';
  status: 'active' | 'upcoming' | 'completed';
  impressions: number;
  start_date: string;
}

interface Report {
  id: string;
  title: string;
  event_name: string;
  date: string;
  download_url: string;
}

const STATUS_COLORS: Record<string, 'success' | 'warning' | 'info' | 'outline'> = {
  active: 'success',
  upcoming: 'warning',
  completed: 'info',
};

const DEMO_STATS: SponsorStats = {
  activeActivations: 5,
  totalImpressions: 2500000,
  totalReach: 850000,
  upcomingEvents: 3,
};

const DEMO_ACTIVATIONS: Activation[] = [
  { id: '1', name: 'Main Stage Naming Rights', event_name: 'Summer Festival 2024', type: 'naming', status: 'active', impressions: 1200000, start_date: '2024-07-15' },
  { id: '2', name: 'VIP Lounge Experience', event_name: 'Concert Series', type: 'experience', status: 'active', impressions: 450000, start_date: '2024-08-01' },
  { id: '3', name: 'Digital Billboard Campaign', event_name: 'Winter Gala', type: 'digital', status: 'upcoming', impressions: 0, start_date: '2024-12-15' },
];

const DEMO_REPORTS: Report[] = [
  { id: '1', title: 'Summer Festival 2024 - Sponsorship ROI Report', event_name: 'Summer Festival 2024', date: '2024-08-01', download_url: '#' },
  { id: '2', title: 'Q3 2024 Brand Exposure Summary', event_name: 'Multiple Events', date: '2024-10-15', download_url: '#' },
  { id: '3', title: 'Concert Series - Activation Performance', event_name: 'Concert Series', date: '2024-09-15', download_url: '#' },
];

export default function SponsorPortalPage() {
  const router = useRouter();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['sponsor-portal'],
    queryFn: async () => {
      const response = await fetch('/api/portals/sponsor');
      if (!response.ok) {
        return { stats: DEMO_STATS, activations: DEMO_ACTIVATIONS, reports: DEMO_REPORTS };
      }
      const result = await response.json();
      return {
        stats: result.stats || DEMO_STATS,
        activations: result.activations || DEMO_ACTIVATIONS,
        reports: result.reports || DEMO_REPORTS,
      };
    },
  });

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const { stats, activations, reports } = data || { stats: DEMO_STATS, activations: DEMO_ACTIVATIONS, reports: DEMO_REPORTS };

  return (
    <DetailPage
      header={{
        kicker: "Portals",
        title: "Sponsor Portal",
        description: "Manage your activations and view performance reports",
      }}
      backButton={{ label: "Back to Portals", href: "/portals" }}
      isLoading={isLoading}
      error={error instanceof Error ? error : null}
      onRetry={() => refetch()}
    >
      <Stack gap={8}>
        {/* Stats */}
        <Grid cols={4} gap={4}>
          <StatCard
            label="Active Activations"
            value={stats.activeActivations.toString()}
            icon={<Megaphone className="h-5 w-5" />}
          />
          <StatCard
            label="Total Impressions"
            value={formatNumber(stats.totalImpressions)}
            icon={<Eye className="h-5 w-5" />}
          />
          <StatCard
            label="Total Reach"
            value={formatNumber(stats.totalReach)}
            icon={<Users className="h-5 w-5" />}
          />
          <StatCard
            label="Upcoming Events"
            value={stats.upcomingEvents.toString()}
            icon={<Calendar className="h-5 w-5" />}
          />
        </Grid>

        {/* Quick Actions */}
        <Card className="p-6">
          <Stack gap={4}>
            <Text className="text-h4-desktop font-weight-semibold">Quick Actions</Text>
            <Grid cols={4} gap={3}>
              <Button 
                variant="outline" 
                className="justify-start"
                onClick={() => router.push('/portals/sponsor/activations')}
              >
                <Megaphone className="h-4 w-4 mr-2" />
                View Activations
              </Button>
              <Button 
                variant="outline" 
                className="justify-start"
                onClick={() => router.push('/portals/sponsor/analytics')}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </Button>
              <Button 
                variant="outline" 
                className="justify-start"
                onClick={() => router.push('/portals/sponsor/events')}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Upcoming Events
              </Button>
              <Button 
                variant="outline" 
                className="justify-start"
                onClick={() => router.push('/portals/sponsor/reports')}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                View Reports
              </Button>
            </Grid>
          </Stack>
        </Card>

        <Grid cols={2} gap={6}>
          {/* Activations */}
          <Card className="p-6">
            <Stack gap={4}>
              <Stack direction="horizontal" className="items-center justify-between">
                <Text className="text-h4-desktop font-weight-semibold">Your Activations</Text>
                <Button variant="ghost" size="sm" onClick={() => router.push('/portals/sponsor/activations')}>
                  View All
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Stack>
              {activations.length === 0 ? (
                <Body className="text-muted-foreground">No activations yet</Body>
              ) : (
                <Stack gap={3}>
                  {activations.slice(0, 5).map((activation: Activation) => (
                    <Stack 
                      key={activation.id} 
                      direction="horizontal" 
                      className="items-center justify-between py-3 border-b border-border last:border-0"
                    >
                      <Stack gap={1}>
                        <Text className="font-weight-medium">{activation.name}</Text>
                        <Body size="sm" className="text-muted-foreground">{activation.event_name}</Body>
                      </Stack>
                      <Stack gap={1} className="items-end">
                        <Badge variant={STATUS_COLORS[activation.status] || 'outline'}>
                          {activation.status}
                        </Badge>
                        {activation.impressions > 0 && (
                          <Body size="sm" className="text-muted-foreground">
                            {formatNumber(activation.impressions)} impressions
                          </Body>
                        )}
                      </Stack>
                    </Stack>
                  ))}
                </Stack>
              )}
            </Stack>
          </Card>

          {/* Reports */}
          <Card className="p-6">
            <Stack gap={4}>
              <Stack direction="horizontal" className="items-center justify-between">
                <Text className="text-h4-desktop font-weight-semibold">Performance Reports</Text>
                <Button variant="ghost" size="sm" onClick={() => router.push('/portals/sponsor/reports')}>
                  View All
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Stack>
              {reports.length === 0 ? (
                <Body className="text-muted-foreground">No reports available</Body>
              ) : (
                <Stack gap={3}>
                  {reports.slice(0, 5).map((report: Report) => (
                    <Stack 
                      key={report.id} 
                      direction="horizontal" 
                      className="items-center justify-between py-3 border-b border-border last:border-0"
                    >
                      <Stack gap={1}>
                        <Text className="font-weight-medium">{report.title}</Text>
                        <Body size="sm" className="text-muted-foreground">
                          {formatDate(report.date)}
                        </Body>
                      </Stack>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </Stack>
                  ))}
                </Stack>
              )}
            </Stack>
          </Card>
        </Grid>
      </Stack>
    </DetailPage>
  );
}
