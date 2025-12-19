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
import { TrendingUp, Eye, Users, Download, BarChart3, Calendar } from 'lucide-react';
import { AtlvsAppLayout } from '../../../../components/app-layout';

interface Report {
  id: string;
  name: string;
  event: string;
  period: string;
  generatedAt: string;
  impressions: number;
  engagements: number;
  roi: number;
  status: 'draft' | 'final';
}

const DEMO_REPORTS: Report[] = [
  {
    id: '1',
    name: 'Summer Music Festival 2024 - Final Report',
    event: 'Summer Music Festival 2024',
    period: 'Jun 15-17, 2024',
    generatedAt: '2024-07-01',
    impressions: 2500000,
    engagements: 125000,
    roi: 3.2,
    status: 'final',
  },
  {
    id: '2',
    name: 'Tech Conference 2024 - Final Report',
    event: 'Tech Conference 2024',
    period: 'May 20-22, 2024',
    generatedAt: '2024-06-05',
    impressions: 850000,
    engagements: 42000,
    roi: 2.8,
    status: 'final',
  },
  {
    id: '3',
    name: 'Food & Wine Expo - Final Report',
    event: 'Food & Wine Expo',
    period: 'Mar 10-12, 2024',
    generatedAt: '2024-03-25',
    impressions: 450000,
    engagements: 85000,
    roi: 4.1,
    status: 'final',
  },
  {
    id: '4',
    name: 'Gaming Convention 2025 - Interim Report',
    event: 'Gaming Convention 2025',
    period: 'Apr 5-7, 2025',
    generatedAt: '2025-04-06',
    impressions: 280000,
    engagements: 12000,
    roi: 0,
    status: 'draft',
  },
];

export default function MyReportsPage() {
  const [reports] = useState<Report[]>(DEMO_REPORTS);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredReports = reports.filter((r) => {
    return statusFilter === 'all' || r.status === statusFilter;
  });

  const totalImpressions = reports.reduce((sum, r) => sum + r.impressions, 0);
  const totalEngagements = reports.reduce((sum, r) => sum + r.engagements, 0);
  const avgRoi = reports.filter((r) => r.roi > 0).reduce((sum, r, _, arr) => sum + r.roi / arr.length, 0);

  const handleDownload = (reportId: string) => {
    const report = reports.find((r) => r.id === reportId);
    if (report) {
      const blob = new Blob([`Report: ${report.name}\nImpressions: ${report.impressions}\nEngagements: ${report.engagements}\nROI: ${report.roi}x`], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report.name.replace(/\s+/g, '_')}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <AtlvsAppLayout>
      <Stack gap={8}>
        <SectionHeader
          kicker="Sponsor Portal"
          title="Performance Reports"
          description="View and download your sponsorship performance reports"
          colorScheme="on-dark"
        />

        <Grid cols={4} gap={4} className="sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Reports" value={reports.length.toString()} icon={<BarChart3 size={20} />} inverted />
          <StatCard label="Total Impressions" value={`${(totalImpressions / 1000000).toFixed(1)}M`} icon={<Eye size={20} />} inverted />
          <StatCard label="Total Engagements" value={`${(totalEngagements / 1000).toFixed(0)}K`} icon={<Users size={20} />} inverted />
          <StatCard label="Avg ROI" value={`${avgRoi.toFixed(1)}x`} icon={<TrendingUp size={20} />} inverted />
        </Grid>

        <Card variant="elevated" inverted>
          <CardBody>
            <Stack gap={4}>
              <Stack direction="horizontal" className="items-center justify-between">
                <H3 className="text-white">All Reports</H3>
                <Stack direction="horizontal" gap={2}>
                  <Button
                    variant={statusFilter === 'all' ? 'solid' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter('all')}
                  >
                    All
                  </Button>
                  <Button
                    variant={statusFilter === 'final' ? 'solid' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter('final')}
                  >
                    Final
                  </Button>
                  <Button
                    variant={statusFilter === 'draft' ? 'solid' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter('draft')}
                  >
                    Draft
                  </Button>
                </Stack>
              </Stack>

              <Stack gap={3}>
                {filteredReports.map((report) => (
                  <Stack key={report.id} className="rounded border-2 border-ink-700 p-4">
                    <Stack direction="horizontal" className="items-start justify-between">
                      <Stack gap={1}>
                        <Body className="font-weight-semibold text-white">{report.name}</Body>
                        <Stack direction="horizontal" gap={2} className="items-center">
                          <Calendar size={14} className="text-grey-400" />
                          <Body size="sm" className=" text-on-dark-muted">{report.period}</Body>
                        </Stack>
                      </Stack>
                      <Stack direction="horizontal" gap={2} className="items-center">
                        <Badge variant={report.status === 'final' ? 'success' : 'warning'}>
                          {report.status === 'final' ? 'Final' : 'Draft'}
                        </Badge>
                        <Button variant="outline" size="sm" onClick={() => handleDownload(report.id)}>
                          <Download size={14} className="mr-2" />
                          Download
                        </Button>
                      </Stack>
                    </Stack>
                    <Stack direction="horizontal" className="mt-3 justify-between border-t border-ink-700 pt-3">
                      <Stack gap={0}>
                        <Body size="sm" className=" text-on-dark-muted">Impressions</Body>
                        <Body className="font-weight-semibold text-white">{(report.impressions / 1000000).toFixed(2)}M</Body>
                      </Stack>
                      <Stack gap={0}>
                        <Body size="sm" className=" text-on-dark-muted">Engagements</Body>
                        <Body className="font-weight-semibold text-white">{(report.engagements / 1000).toFixed(1)}K</Body>
                      </Stack>
                      <Stack gap={0}>
                        <Body size="sm" className=" text-on-dark-muted">ROI</Body>
                        <Body className="font-weight-semibold text-white">{report.roi > 0 ? `${report.roi}x` : 'Pending'}</Body>
                      </Stack>
                      <Stack gap={0}>
                        <Body size="sm" className=" text-on-dark-muted">Generated</Body>
                        <Body className="text-white">{new Date(report.generatedAt).toLocaleDateString()}</Body>
                      </Stack>
                    </Stack>
                  </Stack>
                ))}
                {filteredReports.length === 0 && (
                  <Body className="text-center text-on-dark-muted py-8">No reports found</Body>
                )}
              </Stack>
            </Stack>
          </CardBody>
        </Card>
      </Stack>
    </AtlvsAppLayout>
  );
}
