'use client';

/**
 * Investor Portal Dashboard
 * Self-service portal for investors to view summaries and reports
 */

import { useRouter } from 'next/navigation';
import { 
  TrendingUp, DollarSign, PieChart, Calendar, Download, ChevronRight, BarChart3} from 'lucide-react';
import {
  DetailPage, Badge, Body, Button, Card, Grid, Stack, StatCard, Text} from '@ghxstship/ui';
import { useQuery } from '@tanstack/react-query';

interface InvestorStats {
  totalInvested: number;
  currentValue: number;
  totalReturn: number;
  returnPercentage: number;
  activeProjects: number;
}

interface Investment {
  id: string;
  project_name: string;
  amount: number;
  current_value: number;
  return_percentage: number;
  status: 'active' | 'completed' | 'pending';
}

interface Report {
  id: string;
  title: string;
  type: 'quarterly' | 'annual' | 'project';
  date: string;
  download_url: string;
}

const DEMO_STATS: InvestorStats = {
  totalInvested: 500000,
  currentValue: 625000,
  totalReturn: 125000,
  returnPercentage: 25,
  activeProjects: 4,
};

const DEMO_INVESTMENTS: Investment[] = [
  { id: '1', project_name: 'Summer Festival 2024', amount: 150000, current_value: 187500, return_percentage: 25, status: 'active' },
  { id: '2', project_name: 'Concert Series', amount: 200000, current_value: 260000, return_percentage: 30, status: 'active' },
  { id: '3', project_name: 'Winter Gala 2023', amount: 100000, current_value: 115000, return_percentage: 15, status: 'completed' },
];

const DEMO_REPORTS: Report[] = [
  { id: '1', title: 'Q3 2024 Performance Report', type: 'quarterly', date: '2024-10-15', download_url: '#' },
  { id: '2', title: 'Annual Report 2023', type: 'annual', date: '2024-01-31', download_url: '#' },
  { id: '3', title: 'Summer Festival ROI Analysis', type: 'project', date: '2024-09-01', download_url: '#' },
];

export default function InvestorPortalPage() {
  const router = useRouter();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['investor-portal'],
    queryFn: async () => {
      const response = await fetch('/api/portals/investor');
      if (!response.ok) {
        return { stats: DEMO_STATS, investments: DEMO_INVESTMENTS, reports: DEMO_REPORTS };
      }
      const result = await response.json();
      return {
        stats: result.stats || DEMO_STATS,
        investments: result.investments || DEMO_INVESTMENTS,
        reports: result.reports || DEMO_REPORTS,
      };
    },
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const { stats, investments, reports } = data || { stats: DEMO_STATS, investments: DEMO_INVESTMENTS, reports: DEMO_REPORTS };

  return (
    <DetailPage
      header={{
        kicker: "Portals",
        title: "Investor Portal",
        description: "View your investment summary and reports",
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
            label="Total Invested"
            value={formatCurrency(stats.totalInvested)}
            icon={<DollarSign className="h-5 w-5" />}
          />
          <StatCard
            label="Current Value"
            value={formatCurrency(stats.currentValue)}
            icon={<TrendingUp className="h-5 w-5" />}
          />
          <StatCard
            label="Total Return"
            value={formatCurrency(stats.totalReturn)}
            icon={<BarChart3 className="h-5 w-5" />}
            trend={stats.returnPercentage >= 0 ? "up" : "down"}
            trendValue={`${stats.returnPercentage >= 0 ? '+' : ''}${stats.returnPercentage}%`}
          />
          <StatCard
            label="Active Projects"
            value={stats.activeProjects.toString()}
            icon={<PieChart className="h-5 w-5" />}
          />
        </Grid>
        {/* Performance Summary */}
        <Card className="p-6">
          <Stack gap={4}>
            <Stack direction="horizontal" className="items-center justify-between">
              <Text className="text-h4-desktop font-weight-semibold">Portfolio Performance</Text>
              <Badge variant={stats.returnPercentage >= 0 ? 'success' : 'error'}>
                {stats.returnPercentage >= 0 ? '+' : ''}{stats.returnPercentage}% ROI
              </Badge>
            </Stack>
            <Grid cols={3} gap={4}>
              <Stack gap={2} className="p-4 bg-muted rounded-card">
                <Body size="sm" className="text-muted-foreground">Total Invested</Body>
                <Text className="text-display-sm font-weight-bold">{formatCurrency(stats.totalInvested)}</Text>
              </Stack>
              <Stack gap={2} className="p-4 bg-muted rounded-card">
                <Body size="sm" className="text-muted-foreground">Current Value</Body>
                <Text className="text-display-sm font-weight-bold">{formatCurrency(stats.currentValue)}</Text>
              </Stack>
              <Stack gap={2} className="p-4 bg-success/10 rounded-card">
                <Body size="sm" className="text-success">Total Return</Body>
                <Text className="text-display-sm font-weight-bold text-success">+{formatCurrency(stats.totalReturn)}</Text>
              </Stack>
            </Grid>
          </Stack>
        </Card>

        <Grid cols={2} gap={6}>
          {/* Investments */}
          <Card className="p-6">
            <Stack gap={4}>
              <Stack direction="horizontal" className="items-center justify-between">
                <Text className="text-h4-desktop font-weight-semibold">Your Investments</Text>
                <Button variant="ghost" size="sm" onClick={() => router.push('/portals/investor/investments')}>
                  View All
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Stack>
              {investments.length === 0 ? (
                <Body className="text-muted-foreground">No investments yet</Body>
              ) : (
                <Stack gap={3}>
                  {investments.slice(0, 5).map((investment: Investment) => (
                    <Stack 
                      key={investment.id} 
                      direction="horizontal" 
                      className="items-center justify-between py-3 border-b border-border last:border-0"
                    >
                      <Stack gap={1}>
                        <Text className="font-weight-medium">{investment.project_name}</Text>
                        <Body size="sm" className="text-muted-foreground">
                          Invested: {formatCurrency(investment.amount)}
                        </Body>
                      </Stack>
                      <Stack gap={1} className="items-end">
                        <Text className="font-weight-medium">{formatCurrency(investment.current_value)}</Text>
                        <Badge variant={investment.return_percentage >= 0 ? 'success' : 'error'}>
                          {investment.return_percentage >= 0 ? '+' : ''}{investment.return_percentage}%
                        </Badge>
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
                <Text className="text-h4-desktop font-weight-semibold">Reports & Documents</Text>
                <Button variant="ghost" size="sm" onClick={() => router.push('/portals/investor/reports')}>
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
                        <Stack direction="horizontal" gap={2} className="items-center">
                          <Badge variant="outline">{report.type}</Badge>
                          <Body size="sm" className="text-muted-foreground">
                            <Calendar className="h-3 w-3 inline mr-1" />
                            {formatDate(report.date)}
                          </Body>
                        </Stack>
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
