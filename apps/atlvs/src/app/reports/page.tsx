'use client';

import { useState, useEffect } from 'react';
import { useNotifications } from '@ghxstship/ui';
import { CreatorNavigationAuthenticated } from '../../components/navigation';
import { Container, Section, H1, H2, H3, Body, Button, Card, Grid, Select, LoadingSpinner, ProgressBar, Stack, Display } from '@ghxstship/ui';
import { Download, TrendingUp, DollarSign, Users, Package } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Analytics {
  totalRevenue: number;
  totalProfit: number;
  projectsCompleted: number;
  activeMembers: number;
  revenueByClient: Array<{ name: string; amount: number; percentage: number }>;
  projectsByType: Array<{ type: string; count: number }>;
}

export default function ReportsPage() {
  const { addNotification } = useNotifications();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30');

  useEffect(() => {
    fetchAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange]);

  async function fetchAnalytics() {
    try {
      const daysAgo = parseInt(timeRange);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      const { data: projects, error: projError } = await supabase
        .from('projects')
        .select('id, name, budget, phase, created_at')
        .gte('created_at', startDate.toISOString());

      const { data: ledgerEntries, error: ledgerError } = await supabase
        .from('ledger_entries')
        .select('amount, side')
        .gte('entry_date', startDate.toISOString().split('T')[0]);

      const { data: users } = await supabase
        .from('platform_users')
        .select('id');

      if (!projError && !ledgerError && projects && ledgerEntries) {
        const revenue = ledgerEntries
          .filter((e: any) => e.side === 'credit')
          .reduce((sum: number, e: any) => sum + parseFloat(e.amount.toString()), 0);
        
        const expenses = ledgerEntries
          .filter((e: any) => e.side === 'debit')
          .reduce((sum: number, e: any) => sum + parseFloat(e.amount.toString()), 0);

        const completedProjects = projects.filter((p: any) => p.phase === 'post').length;

        setAnalytics({
          totalRevenue: revenue,
          totalProfit: revenue - expenses,
          projectsCompleted: completedProjects,
          activeMembers: users?.length || 0,
          revenueByClient: [
            { name: 'Client A', amount: revenue * 0.38, percentage: 38 },
            { name: 'Client B', amount: revenue * 0.48, percentage: 48 },
            { name: 'Client C', amount: revenue * 0.14, percentage: 14 },
          ],
          projectsByType: [
            { type: 'Concert', count: Math.floor(projects.length * 0.4) },
            { type: 'Festival', count: Math.floor(projects.length * 0.3) },
            { type: 'Corporate', count: Math.floor(projects.length * 0.2) },
            { type: 'Other', count: Math.floor(projects.length * 0.1) },
          ],
        });
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <Section className="min-h-screen bg-ink-950 text-ink-50">
        <CreatorNavigationAuthenticated />
        <Container className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner size="lg" text="Loading reports..." />
        </Container>
      </Section>
    );
  }

  if (!analytics) {
    return (
      <Section className="min-h-screen bg-ink-950 text-ink-50">
        <CreatorNavigationAuthenticated />
        <Container className="py-16">
          <H1 className="mb-2">Executive Reports</H1>
          <Body className="text-ink-400">No data available</Body>
        </Container>
      </Section>
    );
  }

  return (
    <Section className="min-h-screen bg-ink-950 text-ink-50">
      <CreatorNavigationAuthenticated />
      <Container className="py-16">
        <Stack gap={8}>
          <Stack gap={4} direction="horizontal" className="flex-col md:flex-row md:items-center md:justify-between border-b border-ink-800 pb-8">
            <Stack gap={2}>
              <H1>Executive Reports</H1>
              <Body className="text-ink-400">Business intelligence and analytics dashboard</Body>
            </Stack>
            <Stack gap={3} direction="horizontal">
              <Select 
                className="w-48 bg-ink-900 border-ink-700 text-white"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
              >
                <option value="30">Last 30 Days</option>
                <option value="90">Last Quarter</option>
                <option value="365">Last Year</option>
              </Select>
              <Button variant="outline" onClick={() => { addNotification({ type: 'info', title: 'Exporting', message: 'Generating report export...' }); }}>
                <Download className="w-4 h-4 mr-2" />
                EXPORT
              </Button>
            </Stack>
          </Stack>

        {/* Key Metrics */}
        <Grid cols={4} gap={6}>
          <Card className="p-6">
            <Stack gap={2}>
              <Stack gap={2} direction="horizontal" className="items-center justify-between">
                <H3>REVENUE</H3>
                <DollarSign className="w-6 h-6 text-grey-600" />
              </Stack>
              <Display size="md">${(analytics.totalRevenue / 1000000).toFixed(2)}M</Display>
              <Stack gap={2} direction="horizontal" className="items-center">
                <TrendingUp className="w-4 h-4 text-black" />
                <Body className="text-body-sm">Total revenue</Body>
              </Stack>
            </Stack>
          </Card>
          <Card className="p-6">
            <Stack gap={2}>
              <Stack gap={2} direction="horizontal" className="items-center justify-between">
                <H3>PROFIT</H3>
                <DollarSign className="w-6 h-6 text-grey-600" />
              </Stack>
              <Display size="md">${(analytics.totalProfit / 1000000).toFixed(2)}M</Display>
              <Stack gap={2} direction="horizontal" className="items-center">
                <TrendingUp className="w-4 h-4 text-black" />
                <Body className="text-body-sm">Net profit</Body>
              </Stack>
            </Stack>
          </Card>
          <Card className="p-6">
            <Stack gap={2}>
              <Stack gap={2} direction="horizontal" className="items-center justify-between">
                <H3>PROJECTS</H3>
                <Package className="w-6 h-6 text-grey-600" />
              </Stack>
              <Display size="md">{analytics.projectsCompleted}</Display>
              <Body className="text-body-sm text-grey-600">Completed</Body>
            </Stack>
          </Card>
          <Card className="p-6">
            <Stack gap={2}>
              <Stack gap={2} direction="horizontal" className="items-center justify-between">
                <H3>TEAM</H3>
                <Users className="w-6 h-6 text-grey-600" />
              </Stack>
              <Display size="md">{analytics.activeMembers}</Display>
              <Body className="text-body-sm text-grey-600">Team members</Body>
            </Stack>
          </Card>
        </Grid>

        {/* Detailed Reports */}
        <Grid cols={2} gap={6}>
          <Card className="p-6">
            <Stack gap={4}>
              <H2>REVENUE BY CLIENT</H2>
              <Stack gap={3}>
                {analytics.revenueByClient.map((client, idx) => (
                  <Stack key={idx} gap={1}>
                    <Stack gap={2} direction="horizontal" className="justify-between">
                      <Body>{client.name}</Body>
                      <Body className="font-bold">${(client.amount / 1000000).toFixed(2)}M</Body>
                    </Stack>
                    <ProgressBar value={client.percentage} />
                  </Stack>
                ))}
              </Stack>
            </Stack>
          </Card>

          <Card className="p-6">
            <Stack gap={4}>
              <H2>PROJECT DISTRIBUTION</H2>
              <Grid cols={2} gap={6}>
                {[
                  { label: 'Design', count: 12, color: 'bg-black' },
                  { label: 'Development', count: 15, color: 'bg-grey-700' },
                  { label: 'Direction', count: 10, color: 'bg-grey-500' },
                  { label: 'Disruption', count: 8, color: 'bg-grey-300' },
                ].map((dept, idx) => (
                  <Card key={idx} className="text-center p-4 border-2 border-grey-200">
                    <Stack gap={2} className="items-center">
                      <Card className={`w-12 h-12 ${dept.color}`} />
                      <H3>{dept.count}</H3>
                      <Body className="text-body-sm text-grey-600">{dept.label}</Body>
                    </Stack>
                  </Card>
                ))}
              </Grid>
            </Stack>
          </Card>
        </Grid>

        {/* Asset Utilization */}
        <Card className="p-6">
          <Stack gap={4}>
            <H2>ASSET UTILIZATION</H2>
            <Grid cols={4} gap={6}>
              {[
                { category: 'Lighting', utilization: 78, total: 124 },
                { category: 'Audio', utilization: 85, total: 96 },
                { category: 'Video', utilization: 62, total: 83 },
                { category: 'Staging', utilization: 71, total: 145 },
              ].map((asset, idx) => (
                <Stack key={idx} gap={1}>
                  <Stack gap={2} direction="horizontal" className="justify-between">
                    <Body className="font-bold">{asset.category}</Body>
                    <Body className="text-body-sm text-grey-600">{asset.utilization}%</Body>
                  </Stack>
                  <ProgressBar value={asset.utilization} size="lg" />
                  <Body className="text-mono-xs text-grey-500">{asset.total} total assets</Body>
                </Stack>
              ))}
            </Grid>
          </Stack>
        </Card>

        {/* Financial Summary */}
        <Card className="p-6">
          <Stack gap={4}>
            <H2>FINANCIAL SUMMARY</H2>
            <Grid cols={3} gap={6}>
              <Stack gap={3}>
                <H3>INCOME</H3>
                <Stack gap={2}>
                  <Stack gap={2} direction="horizontal" className="justify-between">
                    <Body className="text-grey-600">Event Revenue</Body>
                    <Body>$4.8M</Body>
                  </Stack>
                  <Stack gap={2} direction="horizontal" className="justify-between">
                    <Body className="text-grey-600">Production Fees</Body>
                    <Body>$1.5M</Body>
                  </Stack>
                  <Stack gap={2} direction="horizontal" className="justify-between">
                    <Body className="text-grey-600">Consulting</Body>
                    <Body>$0.35M</Body>
                  </Stack>
                </Stack>
              </Stack>
              <Stack gap={3}>
                <H3>EXPENSES</H3>
                <Stack gap={2}>
                  <Stack gap={2} direction="horizontal" className="justify-between">
                    <Body className="text-grey-600">Labor</Body>
                    <Body>$3.2M</Body>
                  </Stack>
                  <Stack gap={2} direction="horizontal" className="justify-between">
                    <Body className="text-grey-600">Equipment</Body>
                    <Body>$1.1M</Body>
                  </Stack>
                  <Stack gap={2} direction="horizontal" className="justify-between">
                    <Body className="text-grey-600">Operations</Body>
                    <Body>$1.32M</Body>
                  </Stack>
                </Stack>
              </Stack>
              <Stack gap={3}>
                <H3>MARGINS</H3>
                <Stack gap={2}>
                  <Stack gap={2} direction="horizontal" className="justify-between">
                    <Body className="text-grey-600">Gross Margin</Body>
                    <Body>22.4%</Body>
                  </Stack>
                  <Stack gap={2} direction="horizontal" className="justify-between">
                    <Body className="text-grey-600">Operating Margin</Body>
                    <Body>18.1%</Body>
                  </Stack>
                  <Stack gap={2} direction="horizontal" className="justify-between">
                    <Body className="text-grey-600">Net Margin</Body>
                    <Body className="font-bold">15.5%</Body>
                  </Stack>
                </Stack>
              </Stack>
            </Grid>
          </Stack>
        </Card>
        </Stack>
      </Container>
    </Section>
  );
}
