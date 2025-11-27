'use client';

import { useState } from 'react';
import { ConsumerNavigationPublic } from '../../../components/navigation';
import { Container, Section, H1, H2, Body, Button, Card, Field, Label, Input, Badge, Alert, Grid, Stack, StatCard } from '@ghxstship/ui';

export default function GvtewayIntegrationsPage() {
  const [eventCode, setEventCode] = useState('');
  const [projectCode, setProjectCode] = useState('');
  const [ticketsSold, setTicketsSold] = useState('');
  const [revenue, setRevenue] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRevenueSync = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/integrations/ticket-revenue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orgSlug: 'ghxstship',
          projectCode,
          eventCode,
          ticketCount: parseInt(ticketsSold),
          grossAmount: parseFloat(revenue),
          currency: 'USD',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to sync revenue');
      }

      setResult(data);
      // Reset form
      setEventCode('');
      setProjectCode('');
      setTicketsSold('');
      setRevenue('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Section className="min-h-screen bg-white">
      <ConsumerNavigationPublic />
      <Container className="py-16">
        <Stack gap={8}>
          <Stack gap={2} className="border-b-2 border-black pb-8">
            <H1>Platform Integrations</H1>
            <Body className="text-grey-600">
              Connect ticket sales, guest data, and event operations with backend systems.
            </Body>
          </Stack>

        <Grid cols={4} gap={6}>
          <StatCard value={38} label="Events Synced" />
          <StatCard value="$124K" label="Revenue Ingested" />
          <StatCard value="2,847" label="Guest Profiles" />
          <StatCard value={12} label="Active Workflows" />
        </Grid>

        <Card className="p-8">
          <Stack gap={6}>
            <Stack gap={2}>
              <H2>Revenue Sync (GVTEWAY → ATLVS)</H2>
              <Body>
                Ingest ticket sales revenue into ATLVS financial system for accounting and reporting.
              </Body>
            </Stack>

            <Stack gap={4}>
              <Grid cols={2} gap={4}>
                <Field>
                  <Label>Event Code</Label>
                  <Input
                    value={eventCode}
                    onChange={(e) => setEventCode(e.target.value)}
                    placeholder="EVT-2024-0001"
                  />
                </Field>

                <Field>
                  <Label>Project Code (COMPVSS)</Label>
                  <Input
                    value={projectCode}
                    onChange={(e) => setProjectCode(e.target.value)}
                    placeholder="PROJ-2024-0001"
                  />
                </Field>
              </Grid>

              <Grid cols={2} gap={4}>
                <Field>
                  <Label>Tickets Sold</Label>
                  <Input
                    type="number"
                    value={ticketsSold}
                    onChange={(e) => setTicketsSold(e.target.value)}
                    placeholder="500"
                  />
                </Field>

                <Field>
                  <Label>Gross Revenue ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={revenue}
                    onChange={(e) => setRevenue(e.target.value)}
                    placeholder="25000.00"
                  />
                </Field>
              </Grid>

              <Button
                onClick={handleRevenueSync}
                disabled={!eventCode || !projectCode || !ticketsSold || !revenue || loading}
                variant="solid"
                className="w-full"
              >
                {loading ? 'Syncing Revenue...' : 'Sync to ATLVS Finance'}
              </Button>
            </Stack>

            {error && (
              <Alert variant="error">
                {error}
              </Alert>
            )}

            {result && (
              <Alert variant="success">
                <Stack gap={2}>
                  <Body className="font-bold">Revenue synced successfully!</Body>
                  <Body>Ingestion ID: {result.ingestionId}</Body>
                  <Body>Ledger entry created in ATLVS</Body>
                </Stack>
              </Alert>
            )}
          </Stack>
        </Card>

        <Card className="p-8">
          <Stack gap={6}>
            <Stack gap={2}>
              <H2>Data Flow Overview</H2>
              <Body>
                Real-time data synchronization between GVTEWAY and other platforms.
              </Body>
            </Stack>

            <Stack gap={4}>
              <Card className="p-4 border border-grey-800">
                <Stack gap={4} direction="horizontal" className="items-center">
                  <Stack gap={1} className="flex-1">
                    <Body className="font-bold">Ticket Sales → Financial Records</Body>
                    <Body className="text-sm text-grey-600">GVTEWAY → ATLVS Ledger</Body>
                  </Stack>
                  <Badge variant="solid">Real-time</Badge>
                </Stack>
              </Card>

              <Card className="p-4 border border-grey-800">
                <Stack gap={4} direction="horizontal" className="items-center">
                  <Stack gap={1} className="flex-1">
                    <Body className="font-bold">Event Updates → Production Schedule</Body>
                    <Body className="text-sm text-grey-600">COMPVSS → GVTEWAY Events</Body>
                  </Stack>
                  <Badge variant="solid">Bi-directional</Badge>
                </Stack>
              </Card>

              <Card className="p-4 border border-grey-800">
                <Stack gap={4} direction="horizontal" className="items-center">
                  <Stack gap={1} className="flex-1">
                    <Body className="font-bold">Guest Profiles → CRM Database</Body>
                    <Body className="text-sm text-grey-600">GVTEWAY → ATLVS Contacts</Body>
                  </Stack>
                  <Badge variant="outline">Nightly Batch</Badge>
                </Stack>
              </Card>

              <Card className="p-4 border border-grey-800">
                <Stack gap={4} direction="horizontal" className="items-center">
                  <Stack gap={1} className="flex-1">
                    <Body className="font-bold">Inventory → Merchandise Stock</Body>
                    <Body className="text-sm text-grey-600">ATLVS Assets → GVTEWAY Store</Body>
                  </Stack>
                  <Badge variant="solid">Real-time</Badge>
                </Stack>
              </Card>
            </Stack>
          </Stack>
        </Card>
      </Stack>
      </Container>
    </Section>
  );
}
