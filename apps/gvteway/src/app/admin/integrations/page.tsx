'use client';

import { useState } from 'react';
import { GvtewayAppLayout } from '@/components/app-layout';
import {
  H2, Body, Button, Card, Field, Label, Input, Badge, Alert, Grid, Stack, StatCard,
  Kicker,
} from '@ghxstship/ui';

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
    <GvtewayAppLayout>
          <Stack gap={10}>
            {/* Page Header */}
            <Stack gap={2}>
              <Kicker colorScheme="on-dark">Admin</Kicker>
              <H2 size="lg" className="text-white">Platform Integrations</H2>
              <Body className="text-on-dark-muted">Connect ticket sales, guest data, and event operations with backend systems.</Body>
            </Stack>

            <Grid cols={4} gap={6}>
              <StatCard value="38" label="Events Synced" inverted />
              <StatCard value="$124K" label="Revenue Ingested" inverted />
              <StatCard value="2,847" label="Guest Profiles" inverted />
              <StatCard value="12" label="Active Workflows" inverted />
            </Grid>

            <Card inverted variant="elevated" className="p-8">
              <Stack gap={6}>
                <Stack gap={2}>
                  <H2 className="text-white">Revenue Sync (GVTEWAY → ATLVS)</H2>
                  <Body className="text-on-dark-muted">
                    Ingest ticket sales revenue into ATLVS financial system for accounting and reporting.
                  </Body>
                </Stack>

                <Stack gap={4}>
                  <Grid cols={2} gap={4}>
                    <Field>
                      <Label size="xs" className="text-on-dark-muted">Event Code</Label>
                      <Input
                        value={eventCode}
                        onChange={(e) => setEventCode(e.target.value)}
                        placeholder="EVT-2024-0001"
                        inverted
                      />
                    </Field>

                    <Field>
                      <Label size="xs" className="text-on-dark-muted">Project Code (COMPVSS)</Label>
                      <Input
                        value={projectCode}
                        onChange={(e) => setProjectCode(e.target.value)}
                        placeholder="PROJ-2024-0001"
                        inverted
                      />
                    </Field>
                  </Grid>

                  <Grid cols={2} gap={4}>
                    <Field>
                      <Label size="xs" className="text-on-dark-muted">Tickets Sold</Label>
                      <Input
                        type="number"
                        value={ticketsSold}
                        onChange={(e) => setTicketsSold(e.target.value)}
                        placeholder="500"
                        inverted
                      />
                    </Field>

                    <Field>
                      <Label size="xs" className="text-on-dark-muted">Gross Revenue ($)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={revenue}
                        onChange={(e) => setRevenue(e.target.value)}
                        placeholder="25000.00"
                        inverted
                      />
                    </Field>
                  </Grid>

                  <Button
                    onClick={handleRevenueSync}
                    disabled={!eventCode || !projectCode || !ticketsSold || !revenue || loading}
                    variant="solid"
                    inverted
                    fullWidth
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
                      <Body className="font-display">Revenue synced successfully!</Body>
                      <Body size="sm">Ingestion ID: {result.ingestionId}</Body>
                      <Body size="sm">Ledger entry created in ATLVS</Body>
                    </Stack>
                  </Alert>
                )}
              </Stack>
            </Card>

            <Card inverted className="p-8">
              <Stack gap={6}>
                <Stack gap={2}>
                  <H2 className="text-white">Data Flow Overview</H2>
                  <Body className="text-on-dark-muted">
                    Real-time data synchronization between GVTEWAY and other platforms.
                  </Body>
                </Stack>

                <Stack gap={4}>
                  <Card inverted interactive>
                    <Stack gap={4} direction="horizontal" className="items-center">
                      <Stack gap={1} className="flex-1">
                        <Body className="font-display text-white">Ticket Sales → Financial Records</Body>
                        <Label size="xs" className="text-on-dark-muted">GVTEWAY → ATLVS Ledger</Label>
                      </Stack>
                      <Badge variant="solid">Real-time</Badge>
                    </Stack>
                  </Card>

                  <Card inverted interactive>
                    <Stack gap={4} direction="horizontal" className="items-center">
                      <Stack gap={1} className="flex-1">
                        <Body className="font-display text-white">Event Updates → Production Schedule</Body>
                        <Label size="xs" className="text-on-dark-muted">COMPVSS → GVTEWAY Events</Label>
                      </Stack>
                      <Badge variant="solid">Bi-directional</Badge>
                    </Stack>
                  </Card>

                  <Card inverted interactive>
                    <Stack gap={4} direction="horizontal" className="items-center">
                      <Stack gap={1} className="flex-1">
                        <Body className="font-display text-white">Guest Profiles → CRM Database</Body>
                        <Label size="xs" className="text-on-dark-muted">GVTEWAY → ATLVS Contacts</Label>
                      </Stack>
                      <Badge variant="outline">Nightly Batch</Badge>
                    </Stack>
                  </Card>

                  <Card inverted interactive>
                    <Stack gap={4} direction="horizontal" className="items-center">
                      <Stack gap={1} className="flex-1">
                        <Body className="font-display text-white">Inventory → Merchandise Stock</Body>
                        <Label size="xs" className="text-on-dark-muted">ATLVS Assets → GVTEWAY Store</Label>
                      </Stack>
                      <Badge variant="solid">Real-time</Badge>
                    </Stack>
                  </Card>
                </Stack>
              </Stack>
            </Card>
          </Stack>
    </GvtewayAppLayout>
  );
}
