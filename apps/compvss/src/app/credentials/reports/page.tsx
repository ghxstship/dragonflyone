'use client';

import { useRouter } from 'next/navigation';
import { Download, BarChart3, Users, Shield, Clock, TrendingUp } from 'lucide-react';
import { CompvssAppLayout } from '../../../components/app-layout';
import { useCredentialStats, useCredentials, useCredentialTypes } from '../../../hooks/useCredentials';
import {
  Container,
  Section,
  Stack,
  Grid,
  Card,
  H2,
  H3,
  Body,
  Button,
  Badge,
  Box,
  StatCard,
} from '@ghxstship/ui';

export default function CredentialReportsPage() {
  const router = useRouter();
  const { data: stats } = useCredentialStats();
  const { data: credentials } = useCredentials();
  const { data: credentialTypes } = useCredentialTypes();

  // Calculate type distribution
  const typeDistribution = credentialTypes?.map(type => {
    const count = credentials?.filter(c => c.credential_type_id === type.id).length || 0;
    return { ...type, count };
  }).sort((a, b) => b.count - a.count) || [];

  // Calculate status distribution
  const statusDistribution = [
    { status: 'Active', count: stats?.active || 0, color: '#22c55e' },
    { status: 'Pending', count: stats?.pending || 0, color: '#f59e0b' },
    { status: 'Suspended', count: stats?.suspended || 0, color: '#eab308' },
    { status: 'Revoked', count: stats?.revoked || 0, color: '#ef4444' },
    { status: 'Expired', count: stats?.expired || 0, color: '#6b7280' },
  ];

  // Recent activity (mock for now)
  const recentActivity = [
    { action: 'Credential Issued', badge: 'AA-0042', time: '2 minutes ago' },
    { action: 'Credential Scanned', badge: 'VIP-0015', time: '5 minutes ago' },
    { action: 'Credential Revoked', badge: 'ST-0089', time: '15 minutes ago' },
    { action: 'Credential Issued', badge: 'AA-0041', time: '1 hour ago' },
    { action: 'Zone Access Updated', badge: 'VIP Type', time: '2 hours ago' },
  ];

  return (
    <CompvssAppLayout>
      <Section className="min-h-screen bg-grey-100 py-8">
        <Container>
          <Stack gap={6}>
            {/* Header */}
            <Stack direction="horizontal" gap={4} className="items-center justify-between">
              <Stack gap={1}>
                <H2>Credential Reports</H2>
                <Body className="text-grey-600">Analytics and insights for credential management</Body>
              </Stack>
              <Button
                onClick={() => {}}
                className="flex items-center gap-2 border-2 border-grey-300 bg-white px-4 py-2"
              >
                <Download className="size-4" />
                Export Report
              </Button>
            </Stack>

            {/* Stats Grid */}
            <Grid cols={4} gap={4}>
              <StatCard
                label="Total Credentials"
                value={stats?.total || 0}
                icon={<Users className="size-5" />}
                trend="up"
                trendValue="+12%"
              />
              <StatCard
                label="Active"
                value={stats?.active || 0}
                icon={<Shield className="size-5" />}
                trend="up"
                trendValue="+8%"
              />
              <StatCard
                label="Pending Approval"
                value={stats?.pending || 0}
                icon={<Clock className="size-5" />}
              />
              <StatCard
                label="Revoked Today"
                value={stats?.revoked || 0}
                icon={<TrendingUp className="size-5" />}
              />
            </Grid>

            <Grid cols={3} gap={6}>
              {/* Type Distribution */}
              <Card className="col-span-2 border-2 border-grey-200 p-6">
                <Stack gap={4}>
                  <H3>Credentials by Type</H3>
                  <Stack gap={3}>
                    {typeDistribution.map(type => (
                      <Box key={type.id} className="flex items-center gap-4">
                        <Badge style={{ backgroundColor: type.color, color: '#fff', minWidth: '60px', textAlign: 'center' }}>
                          {type.code}
                        </Badge>
                        <Box className="flex-1">
                          <Box className="mb-1 flex items-center justify-between">
                            <Body className="text-body-sm">{type.name}</Body>
                            <Body className="text-body-sm text-grey-500">{type.count}</Body>
                          </Box>
                          <Box className="h-2 overflow-hidden rounded-avatar bg-grey-200">
                            <Box 
                              className="h-full rounded-avatar" 
                              style={{ 
                                backgroundColor: type.color, 
                                width: `${(type.count / (stats?.total || 1)) * 100}%` 
                              }} 
                            />
                          </Box>
                        </Box>
                      </Box>
                    ))}
                  </Stack>
                </Stack>
              </Card>

              {/* Status Distribution */}
              <Card className="border-2 border-grey-200 p-6">
                <Stack gap={4}>
                  <H3>Status Breakdown</H3>
                  <Stack gap={3}>
                    {statusDistribution.map(item => (
                      <Box key={item.status} className="flex items-center justify-between">
                        <Stack direction="horizontal" gap={2} className="items-center">
                          <Box 
                            className="size-3 rounded-avatar" 
                            style={{ backgroundColor: item.color }} 
                          />
                          <Body>{item.status}</Body>
                        </Stack>
                        <Body className="font-weight-semibold">{item.count}</Body>
                      </Box>
                    ))}
                  </Stack>
                </Stack>
              </Card>
            </Grid>

            <Grid cols={2} gap={6}>
              {/* Recent Activity */}
              <Card className="border-2 border-grey-200 p-6">
                <Stack gap={4}>
                  <H3>Recent Activity</H3>
                  <Stack gap={3}>
                    {recentActivity.map((activity, index) => (
                      <Box 
                        key={index} 
                        className="flex items-center justify-between border-b border-grey-100 pb-3 last:border-b-0 last:pb-0"
                      >
                        <Stack gap={0}>
                          <Body className="font-weight-medium">{activity.action}</Body>
                          <Body className="font-mono text-body-sm text-grey-500">{activity.badge}</Body>
                        </Stack>
                        <Body className="text-body-sm text-grey-400">{activity.time}</Body>
                      </Box>
                    ))}
                  </Stack>
                </Stack>
              </Card>

              {/* Quick Actions */}
              <Card className="border-2 border-grey-200 p-6">
                <Stack gap={4}>
                  <H3>Quick Actions</H3>
                  <Grid cols={2} gap={3}>
                    <Button
                      onClick={() => router.push('/credentials/issue')}
                      className="flex items-center justify-center gap-2 border-2 border-grey-300 bg-white p-4"
                    >
                      <Users className="size-4" />
                      Issue Credential
                    </Button>
                    <Button
                      onClick={() => router.push('/credentials/scan')}
                      className="flex items-center justify-center gap-2 border-2 border-grey-300 bg-white p-4"
                    >
                      <BarChart3 className="size-4" />
                      Scan Credential
                    </Button>
                    <Button
                      onClick={() => router.push('/credentials/types')}
                      className="flex items-center justify-center gap-2 border-2 border-grey-300 bg-white p-4"
                    >
                      <Shield className="size-4" />
                      Manage Types
                    </Button>
                    <Button
                      onClick={() => router.push('/credentials/zones')}
                      className="flex items-center justify-center gap-2 border-2 border-grey-300 bg-white p-4"
                    >
                      <TrendingUp className="size-4" />
                      Zone Access
                    </Button>
                  </Grid>
                </Stack>
              </Card>
            </Grid>
          </Stack>
        </Container>
      </Section>
    </CompvssAppLayout>
  );
}
