'use client';


import { useRouter } from 'next/navigation';
import { Key, Webhook, FileText, Activity, Shield, Clock } from 'lucide-react';
import { AtlvsAppLayout } from '../../components/app-layout';
import { useApiStats, useApiKeys, useWebhooks } from '../../hooks/useApiManagement';
import { useProductionContextSafe } from '@ghxstship/config';
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

export default function ApiManagementPage() {
  const router = useRouter();
  const { currentProductionId } = useProductionContextSafe();
  const productionId = currentProductionId || '';
  const { data: stats } = useApiStats(productionId);
  const { data: apiKeys } = useApiKeys({ productionId: productionId });
  const { data: webhooks } = useWebhooks({ productionId: productionId });

  return (
    <AtlvsAppLayout>
      <Section className="min-h-screen bg-grey-100 py-8">
        <Container>
          <Stack gap={6}>
            {/* Header */}
            <Stack direction="horizontal" gap={4} className="items-center justify-between">
              <Stack gap={1}>
                <H2>API Management</H2>
                <Body className="text-grey-600">Manage API keys, webhooks, and integrations</Body>
              </Stack>
              <Stack direction="horizontal" gap={2}>
                <Button
                  onClick={() => router.push('/api-management/keys')}
                  className="flex items-center gap-2 border-2 border-grey-300 bg-white px-4 py-2"
                >
                  <Key className="size-4" />
                  API Keys
                </Button>
                <Button
                  onClick={() => router.push('/api-management/webhooks')}
                  className="flex items-center gap-2 border-2 border-grey-300 bg-white px-4 py-2"
                >
                  <Webhook className="size-4" />
                  Webhooks
                </Button>
              </Stack>
            </Stack>

            {/* Stats */}
            <Grid cols={4} gap={4}>
              <StatCard
                label="Active API Keys"
                value={stats?.activeKeys || 0}
                icon={<Key className="size-5" />}
              />
              <StatCard
                label="Active Webhooks"
                value={stats?.activeWebhooks || 0}
                icon={<Webhook className="size-5" />}
              />
              <StatCard
                label="Success Rate"
                value={`${stats?.successRate || 0}%`}
                icon={<Activity className="size-5" />}
                trend={stats?.successRate && stats.successRate >= 95 ? 'up' : 'down'}
              />
              <StatCard
                label="Avg Response Time"
                value={`${stats?.avgResponseTime || 0}ms`}
                icon={<Clock className="size-5" />}
              />
            </Grid>

            <Grid cols={2} gap={6}>
              {/* API Keys Overview */}
              <Card className="border-2 border-grey-200 p-6">
                <Stack gap={4}>
                  <Stack direction="horizontal" gap={4} className="items-center justify-between">
                    <Stack direction="horizontal" gap={2} className="items-center">
                      <Key className="size-5 text-grey-500" />
                      <H3>API Keys</H3>
                    </Stack>
                    <Button
                      onClick={() => router.push('/api-management/keys')}
                      className="border-2 border-grey-300 bg-white px-4 py-2"
                    >
                      Manage
                    </Button>
                  </Stack>
                  <Stack gap={2}>
                    {apiKeys?.slice(0, 3).map(key => (
                      <Card key={key.id} className="border-2 border-grey-200 p-3">
                        <Stack direction="horizontal" gap={4} className="items-center justify-between">
                          <Stack gap={1}>
                            <Body className="font-weight-semibold">{key.name}</Body>
                            <Body size="sm" className=" text-grey-500">{key.key_prefix}...</Body>
                          </Stack>
                          <Badge variant={key.is_active ? 'success' : 'error'}>
                            {key.is_active ? 'ACTIVE' : 'REVOKED'}
                          </Badge>
                        </Stack>
                      </Card>
                    ))}
                    {(!apiKeys || apiKeys.length === 0) && (
                      <Box className="rounded-card border-2 border-dashed border-grey-300 p-4 text-center">
                        <Body className="text-grey-500">No API keys created yet.</Body>
                      </Box>
                    )}
                  </Stack>
                </Stack>
              </Card>

              {/* Webhooks Overview */}
              <Card className="border-2 border-grey-200 p-6">
                <Stack gap={4}>
                  <Stack direction="horizontal" gap={4} className="items-center justify-between">
                    <Stack direction="horizontal" gap={2} className="items-center">
                      <Webhook className="size-5 text-grey-500" />
                      <H3>Webhooks</H3>
                    </Stack>
                    <Button
                      onClick={() => router.push('/api-management/webhooks')}
                      className="border-2 border-grey-300 bg-white px-4 py-2"
                    >
                      Manage
                    </Button>
                  </Stack>
                  <Stack gap={2}>
                    {webhooks?.slice(0, 3).map(webhook => (
                      <Card key={webhook.id} className="border-2 border-grey-200 p-3">
                        <Stack direction="horizontal" gap={4} className="items-center justify-between">
                          <Stack gap={1}>
                            <Body className="font-weight-semibold">{webhook.name}</Body>
                            <Body size="sm" className=" text-grey-500">{webhook.events.length} events</Body>
                          </Stack>
                          <Stack direction="horizontal" gap={2}>
                            {webhook.failure_count > 0 && (
                              <Badge variant="warning">{webhook.failure_count} failures</Badge>
                            )}
                            <Badge variant={webhook.is_active ? 'success' : 'error'}>
                              {webhook.is_active ? 'ACTIVE' : 'DISABLED'}
                            </Badge>
                          </Stack>
                        </Stack>
                      </Card>
                    ))}
                    {(!webhooks || webhooks.length === 0) && (
                      <Box className="rounded-card border-2 border-dashed border-grey-300 p-4 text-center">
                        <Body className="text-grey-500">No webhooks configured yet.</Body>
                      </Box>
                    )}
                  </Stack>
                </Stack>
              </Card>
            </Grid>

            {/* Quick Actions */}
            <Card className="border-2 border-grey-200 p-6">
              <Stack gap={4}>
                <H3>Quick Actions</H3>
                <Grid cols={4} gap={4}>
                  <Button
                    onClick={() => router.push('/api-management/keys')}
                    className="flex items-center justify-center gap-2 border-2 border-grey-300 bg-white p-4"
                  >
                    <Key className="size-4" />
                    Create API Key
                  </Button>
                  <Button
                    onClick={() => router.push('/api-management/webhooks')}
                    className="flex items-center justify-center gap-2 border-2 border-grey-300 bg-white p-4"
                  >
                    <Webhook className="size-4" />
                    Add Webhook
                  </Button>
                  <Button
                    onClick={() => router.push('/api-management/logs')}
                    className="flex items-center justify-center gap-2 border-2 border-grey-300 bg-white p-4"
                  >
                    <FileText className="size-4" />
                    View Logs
                  </Button>
                  <Button
                    onClick={() => {}}
                    className="flex items-center justify-center gap-2 border-2 border-grey-300 bg-white p-4"
                  >
                    <Shield className="size-4" />
                    Security Settings
                  </Button>
                </Grid>
              </Stack>
            </Card>

            {/* API Documentation Link */}
            <Card className="border-2 border-grey-200 p-6">
              <Stack direction="horizontal" gap={4} className="items-center justify-between">
                <Stack gap={1}>
                  <H3>API Documentation</H3>
                  <Body className="text-grey-600">
                    View the complete API reference and integration guides.
                  </Body>
                </Stack>
                <Button
                  onClick={() => {}}
                  className="border-2 border-grey-300 bg-white px-4 py-2"
                >
                  View Documentation
                </Button>
              </Stack>
            </Card>
          </Stack>
        </Container>
      </Section>
    </AtlvsAppLayout>
  );
}
