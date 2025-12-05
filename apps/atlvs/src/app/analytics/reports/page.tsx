'use client';

import { useState } from 'react';
import {
  SectionHeader,
  Card,
  CardBody,
  Stack,
  StatCard,
  Button,
  Badge,
  Grid,
  Body,
  H3,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@ghxstship/ui';
import {
  FileBarChart,
  Download,
  Calendar,
  Clock,
  Play,
  Pause,
  RefreshCw,
  Filter,
} from 'lucide-react';
import { AtlvsAppLayout } from '../../../components/app-layout';

interface Report {
  id: string;
  name: string;
  type: 'financial' | 'operational' | 'hr' | 'custom';
  schedule: 'daily' | 'weekly' | 'monthly' | 'on-demand';
  lastRun: string;
  nextRun?: string;
  status: 'active' | 'paused' | 'error';
  format: 'pdf' | 'excel' | 'csv';
}

const mockReports: Report[] = [
  {
    id: '1',
    name: 'Monthly Revenue Summary',
    type: 'financial',
    schedule: 'monthly',
    lastRun: '2024-12-01T09:00:00Z',
    nextRun: '2025-01-01T09:00:00Z',
    status: 'active',
    format: 'pdf',
  },
  {
    id: '2',
    name: 'Weekly Production Status',
    type: 'operational',
    schedule: 'weekly',
    lastRun: '2024-12-02T08:00:00Z',
    nextRun: '2024-12-09T08:00:00Z',
    status: 'active',
    format: 'excel',
  },
  {
    id: '3',
    name: 'Daily Crew Utilization',
    type: 'hr',
    schedule: 'daily',
    lastRun: '2024-12-04T06:00:00Z',
    nextRun: '2024-12-05T06:00:00Z',
    status: 'active',
    format: 'csv',
  },
  {
    id: '4',
    name: 'Budget vs Actual Analysis',
    type: 'financial',
    schedule: 'on-demand',
    lastRun: '2024-11-28T14:30:00Z',
    status: 'active',
    format: 'excel',
  },
  {
    id: '5',
    name: 'Vendor Performance Report',
    type: 'operational',
    schedule: 'monthly',
    lastRun: '2024-12-01T10:00:00Z',
    nextRun: '2025-01-01T10:00:00Z',
    status: 'paused',
    format: 'pdf',
  },
];

export default function ReportsPage() {
  const [reports] = useState(mockReports);
  const [filter, setFilter] = useState<string>('all');

  const activeCount = reports.filter(r => r.status === 'active').length;
  const scheduledCount = reports.filter(r => r.schedule !== 'on-demand').length;

  const filteredReports = filter === 'all' 
    ? reports 
    : reports.filter(r => r.type === filter);

  const getTypeBadge = (type: Report['type']) => {
    switch (type) {
      case 'financial':
        return <Badge variant="success">Financial</Badge>;
      case 'operational':
        return <Badge variant="info">Operational</Badge>;
      case 'hr':
        return <Badge variant="warning">HR</Badge>;
      case 'custom':
        return <Badge variant="info">Custom</Badge>;
    }
  };

  const getStatusBadge = (status: Report['status']) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Active</Badge>;
      case 'paused':
        return <Badge variant="warning">Paused</Badge>;
      case 'error':
        return <Badge variant="error">Error</Badge>;
    }
  };

  return (
    <AtlvsAppLayout>
      <Stack gap={8}>
        <SectionHeader
          kicker="Analytics"
          title="Reports"
          description="Manage and schedule automated reports"
          colorScheme="on-dark"
        />

        <Grid cols={4} gap={4}>
          <StatCard
            label="Total Reports"
            value={reports.length.toString()}
            icon={<FileBarChart size={20} />}
            inverted
          />
          <StatCard
            label="Active"
            value={activeCount.toString()}
            icon={<Play size={20} />}
            inverted
          />
          <StatCard
            label="Scheduled"
            value={scheduledCount.toString()}
            icon={<Clock size={20} />}
            inverted
          />
          <StatCard
            label="Run Today"
            value="3"
            icon={<RefreshCw size={20} />}
            inverted
          />
        </Grid>

        <Card inverted>
          <CardBody>
            <Stack gap={4}>
              <Stack direction="horizontal" className="items-center justify-between">
                <H3 className="text-white">All Reports</H3>
                <Stack direction="horizontal" gap={2}>
                  <Button
                    variant={filter === 'all' ? 'solid' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('all')}
                  >
                    All
                  </Button>
                  <Button
                    variant={filter === 'financial' ? 'solid' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('financial')}
                  >
                    Financial
                  </Button>
                  <Button
                    variant={filter === 'operational' ? 'solid' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('operational')}
                  >
                    Operational
                  </Button>
                  <Button
                    variant={filter === 'hr' ? 'solid' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('hr')}
                  >
                    HR
                  </Button>
                  <Button variant="solid" size="sm">
                    <Filter size={14} className="mr-1" />
                    New Report
                  </Button>
                </Stack>
              </Stack>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Schedule</TableHead>
                    <TableHead>Last Run</TableHead>
                    <TableHead>Next Run</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReports.map(report => (
                    <TableRow key={report.id}>
                      <TableCell>
                        <Stack gap={0}>
                          <Body className="text-white">{report.name}</Body>
                          <Body className="text-body-sm text-on-dark-muted">
                            Format: {report.format.toUpperCase()}
                          </Body>
                        </Stack>
                      </TableCell>
                      <TableCell>{getTypeBadge(report.type)}</TableCell>
                      <TableCell>
                        <Stack direction="horizontal" gap={1} className="items-center">
                          <Calendar size={14} className="text-on-dark-muted" />
                          <Body className="text-on-dark-muted capitalize">
                            {report.schedule.replace('-', ' ')}
                          </Body>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Body className="text-on-dark-muted">
                          {new Date(report.lastRun).toLocaleDateString()}
                        </Body>
                      </TableCell>
                      <TableCell>
                        {report.nextRun ? (
                          <Body className="text-on-dark-muted">
                            {new Date(report.nextRun).toLocaleDateString()}
                          </Body>
                        ) : (
                          <Body className="text-on-dark-muted">-</Body>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(report.status)}</TableCell>
                      <TableCell>
                        <Stack direction="horizontal" gap={2}>
                          <Button variant="ghost" size="sm">
                            <Play size={14} />
                          </Button>
                          <Button variant="ghost" size="sm">
                            {report.status === 'active' ? (
                              <Pause size={14} />
                            ) : (
                              <Play size={14} />
                            )}
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download size={14} />
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Stack>
          </CardBody>
        </Card>
      </Stack>
    </AtlvsAppLayout>
  );
}
