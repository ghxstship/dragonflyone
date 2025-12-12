'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GvtewayAppLayout, GvtewayLoadingLayout } from '@/components/app-layout';
import {
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
  Alert,
  Kicker,
} from '@ghxstship/ui';
import { useTicketTrackingData, type TicketDelivery } from '@/hooks/useTicketTracking';

export default function TicketTrackingPage() {
  const router = useRouter();
  const [trackingCode, setTrackingCode] = useState('');
  const [searchResult, setSearchResult] = useState<TicketDelivery | null>(null);
  const [localSearchError, setLocalSearchError] = useState<string | null>(null);

  const {
    deliveries,
    isLoading: loading,
    error,
    searchTracking,
  } = useTicketTrackingData();

  const handleTrackingSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalSearchError(null);
    setSearchResult(null);

    if (!trackingCode.trim()) return;

    try {
      const result = await searchTracking(trackingCode);
      setSearchResult(result);
    } catch (err) {
      setLocalSearchError(err instanceof Error ? err.message : 'Failed to search');
    }
  };

  const getDeliveryMethodLabel = (method: string) => {
    switch (method) {
      case 'email': return 'Email Delivery';
      case 'mobile': return 'Mobile Ticket';
      case 'physical': return 'Physical Mail';
      case 'will_call': return 'Will Call';
      default: return method;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'processing':
        return <Badge variant="warning">Processing</Badge>;
      case 'sent':
        return <Badge variant="info">Sent</Badge>;
      case 'delivered':
        return <Badge variant="success">Delivered</Badge>;
      case 'ready':
        return <Badge variant="info">Ready for Pickup</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const renderDeliverySteps = (steps: DeliveryStep[]) => (
    <Stack gap={0} className="relative">
      {steps.map((step, index) => (
        <Stack key={index} direction="horizontal" gap={4} className="relative pb-6 last:pb-0">
          <Stack className="items-center">
            <Stack
              className={`w-8 h-8 rounded-avatar flex items-center justify-center ${
                step.status === 'completed' ? 'bg-success-500' :
                step.status === 'current' ? 'bg-info-500' : 'bg-ink-300'
              }`}
            >
              {step.status === 'completed' ? (
                <Body className="text-white">✓</Body>
              ) : step.status === 'current' ? (
                <Stack className="w-3 h-3 bg-white rounded-avatar" />
              ) : (
                <Stack className="w-3 h-3 bg-ink-400 rounded-avatar" />
              )}
            </Stack>
            {index < steps.length - 1 && (
              <Stack
                className={`w-0.5 flex-1 min-h-10 ${
                  step.status === 'completed' ? 'bg-success-500' : 'bg-ink-300'
                }`}
              />
            )}
          </Stack>
          <Stack className="flex-1 pb-4">
            <Body className={`font-weight-medium ${step.status === 'pending' ? 'text-ink-600' : ''}`}>
              {step.title}
            </Body>
            <Body size="sm" className={step.status === 'pending' ? 'text-ink-600' : 'text-ink-600'}>
              {step.description}
            </Body>
            {step.timestamp && (
              <Body className="text-mono-xs text-ink-500 mt-1">{step.timestamp}</Body>
            )}
          </Stack>
        </Stack>
      ))}
    </Stack>
  );

  if (loading) {
    return <GvtewayLoadingLayout text="Loading deliveries..." />;
  }

  return (
    <GvtewayAppLayout>
          <Stack gap={10}>
            {/* Page Header */}
            <Stack gap={2}>
              <Kicker colorScheme="on-dark">Delivery</Kicker>
              <H2 size="lg" className="text-white">Ticket Delivery Tracking</H2>
              <Body className="text-on-dark-muted">Track the delivery status of your tickets</Body>
            </Stack>

        <Card className="p-6 mb-8">
          <H3 className="mb-4">TRACK A DELIVERY</H3>
          <Stack direction="horizontal" gap={4}>
            <Field label="" className="flex-1">
              <Input
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value)}
                placeholder="Enter order number or tracking code..."
              />
            </Field>
            <Button variant="solid" onClick={handleTrackingSearch}>
              Track
            </Button>
          </Stack>

          {(error || localSearchError) && (
            <Alert variant="error" className="mt-4">
              {error instanceof Error ? error.message : localSearchError || String(error)}
            </Alert>
          )}

          {searchResult && (
            <Card className="mt-6 p-6 border-2 border-black">
              <Stack direction="horizontal" className="justify-between items-start mb-6">
                <Stack>
                  <H3>{searchResult.event_title}</H3>
                  <Body className="text-ink-600">{searchResult.event_date}</Body>
                </Stack>
                {getStatusBadge(searchResult.delivery_status)}
              </Stack>

              <Grid cols={2} gap={6}>
                <Stack gap={4}>
                  <Stack>
                    <Label className="text-ink-500">Delivery Method</Label>
                    <Body>{getDeliveryMethodLabel(searchResult.delivery_method)}</Body>
                  </Stack>
                  {searchResult.tracking_number && (
                    <Stack>
                      <Label className="text-ink-500">Tracking Number</Label>
                      <Body className="font-mono">{searchResult.tracking_number}</Body>
                    </Stack>
                  )}
                  {searchResult.estimated_delivery && (
                    <Stack>
                      <Label className="text-ink-500">Estimated Delivery</Label>
                      <Body>{searchResult.estimated_delivery}</Body>
                    </Stack>
                  )}
                </Stack>
                <Stack>
                  {renderDeliverySteps(searchResult.steps)}
                </Stack>
              </Grid>
            </Card>
          )}
        </Card>

        <H2 className="mb-6">YOUR DELIVERIES</H2>

        {deliveries.length > 0 ? (
          <Stack gap={4}>
            {deliveries.map(delivery => (
              <Card key={delivery.id} className="p-6">
                <Stack direction="horizontal" className="justify-between items-start">
                  <Stack gap={2} className="flex-1">
                    <Stack direction="horizontal" gap={3} className="items-center">
                      <H3>{delivery.event_title}</H3>
                      {getStatusBadge(delivery.delivery_status)}
                    </Stack>
                    <Body className="text-ink-600">{delivery.event_date}</Body>
                    <Stack direction="horizontal" gap={4} className="mt-2">
                      <Stack>
                        <Label className="text-ink-500 text-mono-xs">Method</Label>
                        <Body size="sm" className="">{getDeliveryMethodLabel(delivery.delivery_method)}</Body>
                      </Stack>
                      {delivery.tracking_number && (
                        <Stack>
                          <Label className="text-ink-500 text-mono-xs">Tracking</Label>
                          <Body size="sm" className=" font-mono">{delivery.tracking_number}</Body>
                        </Stack>
                      )}
                      {delivery.estimated_delivery && (
                        <Stack>
                          <Label className="text-ink-500 text-mono-xs">Est. Delivery</Label>
                          <Body size="sm" className="">{delivery.estimated_delivery}</Body>
                        </Stack>
                      )}
                    </Stack>
                  </Stack>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setTrackingCode(delivery.order_id);
                      setSearchResult(delivery);
                    }}
                  >
                    View Details
                  </Button>
                </Stack>
              </Card>
            ))}
          </Stack>
        ) : (
          <Card className="p-12 text-center">
            <H3 className="mb-4">NO DELIVERIES</H3>
            <Body className="text-ink-600 mb-6">
              You don&apos;t have any ticket deliveries to track.
            </Body>
            <Button variant="solid" onClick={() => router.push('/browse')}>
              Browse Events
            </Button>
          </Card>
        )}
          </Stack>
    </GvtewayAppLayout>
  );
}
