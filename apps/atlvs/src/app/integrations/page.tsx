'use client';

import { useState } from 'react';
import { Container, H1, H2, H3, Body, Button, Card, Field, Label, Input, Select, Badge, Alert, Stack, Grid, StatCard } from '@ghxstship/ui';

export default function IntegrationsPage() {
  const [dealId, setDealId] = useState('');
  const [orgSlug, setOrgSlug] = useState('ghxstship');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
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
    <Container size="xl" className="py-12">
      <Stack gap={8}>
        <Stack gap={4}>
          <H1>ATLVS Cross-Platform Integrations</H1>
          <Body className="text-gray-400">
            Manage data synchronization between ATLVS, COMPVSS, and GVTEWAY platforms.
          </Body>
        </Stack>

        <Card className="p-8">
          <H2>Deal → Project Handoff (ATLVS → COMPVSS)</H2>
          <Body className="mt-2 mb-6 text-gray-400">
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

        <Card className="p-8">
          <H2>Integration Status Dashboard</H2>
          <Body className="mt-2 mb-6 text-gray-400">
            Monitor active sync jobs and integration health.
          </Body>

          <Grid cols={3} gap={4}>
            <StatCard
              value={12}
              label="ATLVS → COMPVSS"
              className="border-grey-700"
            />
            <StatCard
              value={8}
              label="COMPVSS → GVTEWAY"
              className="border-grey-700"
            />
            <StatCard
              value={24}
              label="GVTEWAY → ATLVS"
              className="border-grey-700"
            />
          </Grid>
        </Card>

        <Card className="p-8">
          <H2>Workflow Templates</H2>
          <Body className="mt-2 mb-6 text-gray-400">
            Pre-configured integration workflows for common scenarios.
          </Body>

          <Stack gap={4}>
            <Card className="border-l-4 border-white pl-4 py-2 bg-transparent">
              <H3>New Event Launch</H3>
              <Body className="text-sm text-gray-400">
                Deal (ATLVS) → Project (COMPVSS) → Event (GVTEWAY) → Revenue Tracking (ATLVS)
              </Body>
            </Card>

            <Card className="border-l-4 border-gray-300 pl-4 py-2 bg-transparent">
              <H3>Asset Deployment</H3>
              <Body className="text-sm text-gray-400">
                Asset (ATLVS) → Project Assignment (COMPVSS) → Venue Setup (GVTEWAY)
              </Body>
            </Card>

            <Card className="border-l-4 border-gray-300 pl-4 py-2 bg-transparent">
              <H3>Crew Onboarding</H3>
              <Body className="text-sm text-gray-400">
                Employee (ATLVS) → Crew Assignment (COMPVSS) → Access Credentials (GVTEWAY)
              </Body>
            </Card>

            <Card className="border-l-4 border-gray-300 pl-4 py-2 bg-transparent">
              <H3>Financial Reconciliation</H3>
              <Body className="text-sm text-gray-400">
                Ticket Sales (GVTEWAY) → Project Budget (COMPVSS) → General Ledger (ATLVS)
              </Body>
            </Card>
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
}
