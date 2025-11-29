'use client';

import { useState } from 'react';
import { AtlvsAppLayout } from '../../components/app-layout';
import {
  Container,
  H2,
  H3,
  Body,
  Button,
  Card,
  Field,
  Label,
  Input,
  Alert,
  Stack,
  Grid,
  StatCard,
  EnterprisePageHeader,
  MainContent,
} from '@ghxstship/ui';

interface IntegrationResult {
  created?: boolean;
  alreadyExists?: boolean;
  projectId?: string;
}

/**
 * Integrations Page - Bold Contemporary Pop Art Adventure
 * Hard offset shadows, 2px+ borders, bounce animations
 */
export default function IntegrationsPage() {
  const [dealId, setDealId] = useState('');
  const [orgSlug, setOrgSlug] = useState('ghxstship');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<IntegrationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDealHandoff = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/integrations/deal-to-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dealId,
          orgSlug,
          autoCreateProject: true,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create project');
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AtlvsAppLayout>
      <EnterprisePageHeader
        title="Cross-Platform Integrations"
        subtitle="Manage data synchronization between ATLVS, COMPVSS, and GVTEWAY platforms"
        breadcrumbs={[{ label: 'ATLVS', href: '/dashboard' }, { label: 'Integrations' }]}
        views={[{ id: 'default', label: 'Default', icon: 'grid' }]}
        activeView="default"
        showFavorite
        showSettings
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={10}>

        <Card className="p-8 border-2 border-ink-800 bg-transparent">
          <H2 className="text-white">Deal → Project Handoff (ATLVS → COMPVSS)</H2>
          <Body className="mt-2 mb-6 text-ink-400">
            Automatically create a COMPVSS project when a deal is marked as won.
          </Body>

          <Stack gap={4}>
            <Field>
              <Label>Deal ID</Label>
              <Input
                id="dealId"
                value={dealId}
                onChange={(e) => setDealId(e.target.value)}
                placeholder="Enter deal UUID"
              />
            </Field>

            <Field>
              <Label>Organization Slug</Label>
              <Input
                id="orgSlug"
                value={orgSlug}
                onChange={(e) => setOrgSlug(e.target.value)}
                placeholder="ghxstship"
              />
            </Field>

            <Button
              onClick={handleDealHandoff}
              disabled={!dealId || !orgSlug || loading}
              variant="solid"
              className="w-full"
            >
              {loading ? 'Creating Project...' : 'Create Project from Deal'}
            </Button>
          </Stack>

          {error && (
            <Alert variant="error" className="mt-4">
              {error}
            </Alert>
          )}

          {result && (
            <Alert variant="success" className="mt-4">
              <Stack gap={2}>
                <Body className="font-bold">Success!</Body>
                {result.created && <Body>New project created: {result.projectId}</Body>}
                {result.alreadyExists && <Body>Project already exists: {result.projectId}</Body>}
              </Stack>
            </Alert>
          )}
        </Card>

        <Card className="p-8 border-2 border-ink-800 bg-transparent">
          <H2 className="text-white">Integration Status Dashboard</H2>
          <Body className="mt-2 mb-6 text-ink-400">
            Monitor active sync jobs and integration health.
          </Body>

          <Grid cols={3} gap={4}>
            <StatCard
              value={12}
              label="ATLVS → COMPVSS"
              className="border-ink-700 bg-transparent"
            />
            <StatCard
              value={8}
              label="COMPVSS → GVTEWAY"
              className="border-ink-700 bg-transparent"
            />
            <StatCard
              value={24}
              label="GVTEWAY → ATLVS"
              className="border-ink-700 bg-transparent"
            />
          </Grid>
        </Card>

        <Card className="p-8 border-2 border-ink-800 bg-transparent">
          <H2 className="text-white">Workflow Templates</H2>
          <Body className="mt-2 mb-6 text-ink-400">
            Pre-configured integration workflows for common scenarios.
          </Body>

          <Stack gap={4}>
            <Card className="border-l-4 border-white pl-4 py-2 bg-transparent border-y-0 border-r-0">
              <H3 className="text-white">New Event Launch</H3>
              <Body className="text-body-sm text-ink-400">
                Deal (ATLVS) → Project (COMPVSS) → Event (GVTEWAY) → Revenue Tracking (ATLVS)
              </Body>
            </Card>

            <Card className="border-l-4 border-ink-600 pl-4 py-2 bg-transparent border-y-0 border-r-0">
              <H3 className="text-white">Asset Deployment</H3>
              <Body className="text-body-sm text-ink-400">
                Asset (ATLVS) → Project Assignment (COMPVSS) → Venue Setup (GVTEWAY)
              </Body>
            </Card>

            <Card className="border-l-4 border-ink-600 pl-4 py-2 bg-transparent border-y-0 border-r-0">
              <H3 className="text-white">Crew Onboarding</H3>
              <Body className="text-body-sm text-ink-400">
                Employee (ATLVS) → Crew Assignment (COMPVSS) → Access Credentials (GVTEWAY)
              </Body>
            </Card>

            <Card className="border-l-4 border-ink-600 pl-4 py-2 bg-transparent border-y-0 border-r-0">
              <H3 className="text-white">Financial Reconciliation</H3>
              <Body className="text-body-sm text-ink-400">
                Ticket Sales (GVTEWAY) → Project Budget (COMPVSS) → General Ledger (ATLVS)
              </Body>
            </Card>
          </Stack>
        </Card>
          </Stack>
        </Container>
      </MainContent>
    </AtlvsAppLayout>
  );
}
