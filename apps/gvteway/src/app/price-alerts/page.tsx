'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Section,
  Display,
  H2,
  H3,
  Body,
  Label,
  Button,
  Card,
  Field,
  Input,
  Grid,
  Stack,
  Badge,
  Switch,
  Alert,
  LoadingSpinner,
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
    return (
      <Section className="min-h-screen bg-white flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </Section>
    );
  }

  return (
    <Section className="min-h-screen bg-white">
      <Container>
        <Section className="border-b-2 border-black py-8 mb-8">
          <Stack direction="horizontal" className="justify-between items-center">
            <Stack>
              <Display>PRICE ALERTS</Display>
              <Body className="mt-2 text-gray-600">
                Get notified when ticket prices drop to your target
              </Body>
            </Stack>
            <Button variant="solid" onClick={() => router.push('/browse')}>
              Browse Events
            </Button>
          </Stack>
        </Section>

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

        <Grid cols={4} gap={4} className="mb-8">
          <Card className="p-4">
            <Label className="text-gray-500">Total Alerts</Label>
            <H2>{alerts.length}</H2>
          </Card>
          <Card className="p-4">
            <Label className="text-gray-500">Active</Label>
            <H2>{activeAlerts.length}</H2>
          </Card>
          <Card className="p-4">
            <Label className="text-gray-500">Triggered</Label>
            <H2>{triggeredAlerts.length}</H2>
          </Card>
          <Card className="p-4">
            <Label className="text-gray-500">Paused</Label>
            <H2>{inactiveAlerts.length}</H2>
          </Card>
        </Grid>

        {triggeredAlerts.length > 0 && (
          <Section className="mb-8">
            <H2 className="mb-4">PRICE DROPS!</H2>
            <Stack gap={4}>
              {triggeredAlerts.map(alert => (
                <Card key={alert.id} className="p-6 border-2 border-green-500 bg-green-50">
                  <Stack direction="horizontal" className="justify-between items-start">
                    <Stack gap={2}>
                      <Stack direction="horizontal" gap={2} className="items-center">
                        <H3>{alert.event_title}</H3>
                        <Badge>Price Dropped!</Badge>
                      </Stack>
                      <Body className="text-gray-600">
                        {alert.event_date} • {alert.event_venue}
                      </Body>
                      <Stack direction="horizontal" gap={4} className="mt-2">
                        <Stack>
                          <Label className="text-gray-500">Your Target</Label>
                          <Body className="font-bold">${alert.target_price}</Body>
                        </Stack>
                        <Stack>
                          <Label className="text-gray-500">Current Price</Label>
                          <Body className="font-bold text-green-600">${alert.current_price}</Body>
                        </Stack>
                        <Stack>
                          <Label className="text-gray-500">You Save</Label>
                          <Body className="font-bold text-green-600">
                            ${(alert.target_price - alert.current_price).toFixed(2)}
                          </Body>
                        </Stack>
                      </Stack>
                    </Stack>
                    <Stack direction="horizontal" gap={2}>
                      <Button variant="solid" onClick={() => handleViewEvent(alert.event_id)}>
                        Buy Now
                      </Button>
                      <Button variant="outline" onClick={() => handleDeleteAlert(alert.id)}>
                        Dismiss
                      </Button>
                    </Stack>
                  </Stack>
                </Card>
              ))}
            </Stack>
          </Section>
        )}

        {activeAlerts.length > 0 && (
          <Section className="mb-8">
            <H2 className="mb-4">ACTIVE ALERTS</H2>
            <Stack gap={4}>
              {activeAlerts.map(alert => (
                <Card key={alert.id} className="p-6">
                  <Stack direction="horizontal" className="justify-between items-start">
                    <Stack gap={2}>
                      <H3>{alert.event_title}</H3>
                      <Body className="text-gray-600">
                        {alert.event_date} • {alert.event_venue}
                      </Body>
                      {alert.ticket_type && (
                        <Badge variant="outline">{alert.ticket_type}</Badge>
                      )}
                      <Stack direction="horizontal" gap={4} className="mt-2">
                        <Stack>
                          <Label className="text-gray-500">Target Price</Label>
                          <Body className="font-bold">${alert.target_price}</Body>
                        </Stack>
                        <Stack>
                          <Label className="text-gray-500">Current Price</Label>
                          <Body className="font-bold">${alert.current_price}</Body>
                        </Stack>
                        <Stack>
                          <Label className="text-gray-500">Difference</Label>
                          <Body className={`font-bold ${
                            alert.current_price <= alert.target_price 
                              ? 'text-green-600' 
                              : 'text-red-600'
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
          </Section>
        )}

        {inactiveAlerts.length > 0 && (
          <Section className="mb-8">
            <H2 className="mb-4">PAUSED ALERTS</H2>
            <Stack gap={4}>
              {inactiveAlerts.map(alert => (
                <Card key={alert.id} className="p-6 opacity-60">
                  <Stack direction="horizontal" className="justify-between items-start">
                    <Stack gap={2}>
                      <H3>{alert.event_title}</H3>
                      <Body className="text-gray-600">
                        {alert.event_date} • {alert.event_venue}
                      </Body>
                      <Stack direction="horizontal" gap={4} className="mt-2">
                        <Stack>
                          <Label className="text-gray-500">Target Price</Label>
                          <Body>${alert.target_price}</Body>
                        </Stack>
                        <Stack>
                          <Label className="text-gray-500">Current Price</Label>
                          <Body>${alert.current_price}</Body>
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
          </Section>
        )}

        {alerts.length === 0 && (
          <Card className="p-12 text-center">
            <H3 className="mb-4">NO PRICE ALERTS</H3>
            <Body className="text-gray-600 mb-6">
              Set up price alerts on events you are interested in to get notified when prices drop.
            </Body>
            <Button variant="solid" onClick={() => router.push('/browse')}>
              Browse Events
            </Button>
          </Card>
        )}

        <Card className="p-6 bg-gray-50 mt-8">
          <H3 className="mb-4">HOW PRICE ALERTS WORK</H3>
          <Grid cols={3} gap={6}>
            <Stack gap={2}>
              <Stack className="w-10 h-10 bg-black text-white rounded-full items-center justify-center">
                <Body>1</Body>
              </Stack>
              <Body className="font-medium">Set Your Target</Body>
              <Body className="text-sm text-gray-600">
                Choose the price you want to pay for tickets to an event.
              </Body>
            </Stack>
            <Stack gap={2}>
              <Stack className="w-10 h-10 bg-black text-white rounded-full items-center justify-center">
                <Body>2</Body>
              </Stack>
              <Body className="font-medium">We Monitor Prices</Body>
              <Body className="text-sm text-gray-600">
                We check prices regularly and track any changes.
              </Body>
            </Stack>
            <Stack gap={2}>
              <Stack className="w-10 h-10 bg-black text-white rounded-full items-center justify-center">
                <Body>3</Body>
              </Stack>
              <Body className="font-medium">Get Notified</Body>
              <Body className="text-sm text-gray-600">
                Receive an alert when the price drops to your target or below.
              </Body>
            </Stack>
          </Grid>
        </Card>
      </Container>
    </Section>
  );
}
