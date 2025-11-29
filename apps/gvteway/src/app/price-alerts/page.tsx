'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { GvtewayAppLayout, GvtewayLoadingLayout } from '@/components/app-layout';
import {
  H2,
  H3,
  Body,
  Label,
  Button,
  Card,
  Grid,
  Stack,
  Badge,
  Switch,
  Alert,
  Kicker,
} from '@ghxstship/ui';

interface PriceAlert {
  id: string;
  event_id: string;
  event_title: string;
  event_date: string;
  event_venue: string;
  target_price: number;
  current_price: number;
  ticket_type?: string;
  is_active: boolean;
  triggered: boolean;
  triggered_at?: string;
  created_at: string;
}

export default function PriceAlertsPage() {
  const router = useRouter();
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/price-alerts');
      if (response.ok) {
        const data = await response.json();
        setAlerts(data.alerts || []);
      }
    } catch (err) {
      setError('Failed to load price alerts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const handleToggleAlert = async (alert: PriceAlert) => {
    try {
      const response = await fetch(`/api/price-alerts/${alert.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !alert.is_active }),
      });

      if (response.ok) {
        fetchAlerts();
      }
    } catch (err) {
      setError('Failed to update alert');
    }
  };

  const handleDeleteAlert = async (id: string) => {
    if (!confirm('Are you sure you want to delete this price alert?')) return;

    try {
      const response = await fetch(`/api/price-alerts/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSuccess('Alert deleted');
        fetchAlerts();
      }
    } catch (err) {
      setError('Failed to delete alert');
    }
  };

  const handleViewEvent = (eventId: string) => {
    router.push(`/events/${eventId}`);
  };

  const activeAlerts = alerts.filter(a => a.is_active && !a.triggered);
  const triggeredAlerts = alerts.filter(a => a.triggered);
  const inactiveAlerts = alerts.filter(a => !a.is_active && !a.triggered);

  if (loading) {
    return <GvtewayLoadingLayout text="Loading price alerts..." />;
  }

  return (
    <GvtewayAppLayout>
          <Stack gap={10}>
            {/* Page Header */}
            <Stack direction="horizontal" className="items-center justify-between">
              <Stack gap={2}>
                <Kicker colorScheme="on-dark">Alerts</Kicker>
                <H2 size="lg" className="text-white">Price Alerts</H2>
                <Body className="text-on-dark-muted">Get notified when ticket prices drop to your target</Body>
              </Stack>
              <Button variant="solid" inverted onClick={() => router.push('/browse')}>
                Browse Events
              </Button>
            </Stack>

        {error && (
          <Alert variant="error" className="mb-6">
            {error}
          </Alert>
        )}

        {success && (
          <Alert variant="success" className="mb-6">
            {success}
          </Alert>
        )}

            <Grid cols={4} gap={4}>
              <Card inverted>
                <Label className="text-on-dark-muted">Total Alerts</Label>
                <H2 className="text-white">{alerts.length}</H2>
              </Card>
              <Card inverted>
                <Label className="text-on-dark-muted">Active</Label>
                <H2 className="text-white">{activeAlerts.length}</H2>
              </Card>
              <Card inverted>
                <Label className="text-on-dark-muted">Triggered</Label>
                <H2 className="text-white">{triggeredAlerts.length}</H2>
              </Card>
              <Card inverted>
                <Label className="text-on-dark-muted">Paused</Label>
                <H2 className="text-white">{inactiveAlerts.length}</H2>
              </Card>
            </Grid>

        {triggeredAlerts.length > 0 && (
          <Stack gap={4}>
            <H2 className="text-white">Price Drops!</H2>
            <Stack gap={4}>
              {triggeredAlerts.map(alert => (
                <Card key={alert.id} inverted variant="elevated" className="p-6 ring-2 ring-success-500">
                  <Stack direction="horizontal" className="items-start justify-between">
                    <Stack gap={2}>
                      <Stack direction="horizontal" gap={2} className="items-center">
                        <H3 className="text-white">{alert.event_title}</H3>
                        <Badge variant="solid">Price Dropped!</Badge>
                      </Stack>
                      <Body className="text-on-dark-muted">
                        {alert.event_date} • {alert.event_venue}
                      </Body>
                      <Stack direction="horizontal" gap={4} className="mt-2">
                        <Stack>
                          <Label className="text-on-dark-disabled">Your Target</Label>
                          <Body className="font-display text-white">${alert.target_price}</Body>
                        </Stack>
                        <Stack>
                          <Label className="text-on-dark-disabled">Current Price</Label>
                          <Body className="font-display text-success-400">${alert.current_price}</Body>
                        </Stack>
                        <Stack>
                          <Label className="text-on-dark-disabled">You Save</Label>
                          <Body className="font-display text-success-400">
                            ${(alert.target_price - alert.current_price).toFixed(2)}
                          </Body>
                        </Stack>
                      </Stack>
                    </Stack>
                    <Stack direction="horizontal" gap={2}>
                      <Button variant="solid" inverted onClick={() => handleViewEvent(alert.event_id)}>
                        Buy Now
                      </Button>
                      <Button variant="outlineInk" onClick={() => handleDeleteAlert(alert.id)}>
                        Dismiss
                      </Button>
                    </Stack>
                  </Stack>
                </Card>
              ))}
            </Stack>
          </Stack>
        )}

        {activeAlerts.length > 0 && (
          <Stack gap={4}>
            <H2 className="text-white">Active Alerts</H2>
            <Stack gap={4}>
              {activeAlerts.map(alert => (
                <Card key={alert.id} inverted className="p-6">
                  <Stack direction="horizontal" className="items-start justify-between">
                    <Stack gap={2}>
                      <H3 className="text-white">{alert.event_title}</H3>
                      <Body className="text-on-dark-muted">
                        {alert.event_date} • {alert.event_venue}
                      </Body>
                      {alert.ticket_type && (
                        <Badge variant="outline">{alert.ticket_type}</Badge>
                      )}
                      <Stack direction="horizontal" gap={4} className="mt-2">
                        <Stack>
                          <Label className="text-on-dark-disabled">Target Price</Label>
                          <Body className="font-display text-white">${alert.target_price}</Body>
                        </Stack>
                        <Stack>
                          <Label className="text-on-dark-disabled">Current Price</Label>
                          <Body className="font-display text-white">${alert.current_price}</Body>
                        </Stack>
                        <Stack>
                          <Label className="text-on-dark-disabled">Difference</Label>
                          <Body className={`font-display ${
                            alert.current_price <= alert.target_price 
                              ? 'text-success-400' 
                              : 'text-error-400'
                          }`}>
                            {alert.current_price <= alert.target_price ? '-' : '+'}
                            ${Math.abs(alert.current_price - alert.target_price).toFixed(2)}
                          </Body>
                        </Stack>
                      </Stack>
                    </Stack>
                    <Stack direction="horizontal" gap={2} className="items-center">
                      <Switch
                        checked={alert.is_active}
                        onChange={() => handleToggleAlert(alert)}
                      />
                      <Button variant="ghost" onClick={() => handleViewEvent(alert.event_id)}>
                        View Event
                      </Button>
                      <Button variant="ghost" onClick={() => handleDeleteAlert(alert.id)}>
                        Delete
                      </Button>
                    </Stack>
                  </Stack>
                </Card>
              ))}
            </Stack>
          </Stack>
        )}

        {inactiveAlerts.length > 0 && (
          <Stack gap={4}>
            <H2 className="text-white">Paused Alerts</H2>
            <Stack gap={4}>
              {inactiveAlerts.map(alert => (
                <Card key={alert.id} inverted className="p-6 opacity-60">
                  <Stack direction="horizontal" className="items-start justify-between">
                    <Stack gap={2}>
                      <H3 className="text-white">{alert.event_title}</H3>
                      <Body className="text-on-dark-muted">
                        {alert.event_date} • {alert.event_venue}
                      </Body>
                      <Stack direction="horizontal" gap={4} className="mt-2">
                        <Stack>
                          <Label className="text-on-dark-disabled">Target Price</Label>
                          <Body className="text-white">${alert.target_price}</Body>
                        </Stack>
                        <Stack>
                          <Label className="text-on-dark-disabled">Current Price</Label>
                          <Body className="text-white">${alert.current_price}</Body>
                        </Stack>
                      </Stack>
                    </Stack>
                    <Stack direction="horizontal" gap={2} className="items-center">
                      <Switch
                        checked={alert.is_active}
                        onChange={() => handleToggleAlert(alert)}
                      />
                      <Button variant="ghost" onClick={() => handleDeleteAlert(alert.id)}>
                        Delete
                      </Button>
                    </Stack>
                  </Stack>
                </Card>
              ))}
            </Stack>
          </Stack>
        )}

        {alerts.length === 0 && (
          <Card inverted className="p-12 text-center">
            <H3 className="mb-4 text-white">No Price Alerts</H3>
            <Body className="mb-6 text-on-dark-muted">
              Set up price alerts on events you are interested in to get notified when prices drop.
            </Body>
            <Button variant="solid" inverted onClick={() => router.push('/browse')}>
              Browse Events
            </Button>
          </Card>
        )}

        <Card inverted variant="elevated" className="p-6">
          <H3 className="mb-4 text-white">How Price Alerts Work</H3>
          <Grid cols={3} gap={6}>
            <Stack gap={2}>
              <Stack className="flex size-10 items-center justify-center rounded-avatar bg-white text-black">
                <Body className="font-display">1</Body>
              </Stack>
              <Body className="font-display text-white">Set Your Target</Body>
              <Body size="sm" className="text-on-dark-muted">
                Choose the price you want to pay for tickets to an event.
              </Body>
            </Stack>
            <Stack gap={2}>
              <Stack className="flex size-10 items-center justify-center rounded-avatar bg-white text-black">
                <Body className="font-display">2</Body>
              </Stack>
              <Body className="font-display text-white">We Monitor Prices</Body>
              <Body size="sm" className="text-on-dark-muted">
                We check prices regularly and track any changes.
              </Body>
            </Stack>
            <Stack gap={2}>
              <Stack className="flex size-10 items-center justify-center rounded-avatar bg-white text-black">
                <Body className="font-display">3</Body>
              </Stack>
              <Body className="font-display text-white">Get Notified</Body>
              <Body size="sm" className="text-on-dark-muted">
                Receive an alert when the price drops to your target or below.
              </Body>
            </Stack>
          </Grid>
        </Card>
          </Stack>
    </GvtewayAppLayout>
  );
}
