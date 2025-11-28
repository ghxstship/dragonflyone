'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ConsumerNavigationPublic } from '@/components/navigation';
import {
  Container,
  Section,
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
  LoadingSpinner,
  PageLayout,
  Footer,
  FooterColumn,
  FooterLink,
  Display,
  Kicker,
} from '@ghxstship/ui';

interface DeliveryStep {
  status: 'completed' | 'current' | 'pending';
  title: string;
  description: string;
  timestamp?: string;
}

interface TicketDelivery {
  id: string;
  order_id: string;
  event_title: string;
  event_date: string;
  delivery_method: 'email' | 'mobile' | 'physical' | 'will_call';
  delivery_status: 'processing' | 'sent' | 'delivered' | 'ready';
  tracking_number?: string;
  carrier?: string;
  estimated_delivery?: string;
  delivered_at?: string;
  recipient_email?: string;
  recipient_name?: string;
  steps: DeliveryStep[];
}

export default function TicketTrackingPage() {
  const router = useRouter();
  const [deliveries, setDeliveries] = useState<TicketDelivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [trackingCode, setTrackingCode] = useState('');
  const [searchResult, setSearchResult] = useState<TicketDelivery | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  const fetchDeliveries = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/tickets/deliveries');
      if (response.ok) {
        const data = await response.json();
        setDeliveries(data.deliveries || []);
      }
    } catch (err) {
      console.error('Failed to fetch deliveries');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDeliveries();
  }, [fetchDeliveries]);

  const handleTrackingSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError(null);
    setSearchResult(null);

    if (!trackingCode.trim()) return;

    try {
      const response = await fetch(`/api/tickets/track?code=${encodeURIComponent(trackingCode)}`);
      if (response.ok) {
        const data = await response.json();
        if (data.delivery) {
          setSearchResult(data.delivery);
        } else {
          setSearchError('No delivery found with that tracking code');
        }
      } else {
        setSearchError('Invalid tracking code');
      }
    } catch (err) {
      setSearchError('Failed to search');
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
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step.status === 'completed' ? 'bg-success-500' :
                step.status === 'current' ? 'bg-info-500' : 'bg-ink-300'
              }`}
            >
              {step.status === 'completed' ? (
                <Body className="text-white text-body-sm">✓</Body>
              ) : step.status === 'current' ? (
                <Stack className="w-3 h-3 bg-white rounded-full" />
              ) : (
                <Stack className="w-3 h-3 bg-ink-400 rounded-full" />
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
            <Body className={`font-medium ${step.status === 'pending' ? 'text-ink-600' : ''}`}>
              {step.title}
            </Body>
            <Body className={`text-body-sm ${step.status === 'pending' ? 'text-ink-600' : 'text-ink-600'}`}>
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
    return (
      <PageLayout
        background="black"
        header={<ConsumerNavigationPublic />}
        footer={
          <Footer
            logo={<Display size="md">GVTEWAY</Display>}
            copyright="© 2024 GHXSTSHIP INDUSTRIES."
          >
            <FooterColumn title="Tickets">
              <FooterLink href="/tickets/tracking">Tracking</FooterLink>
            </FooterColumn>
          </Footer>
        }
      >
        <Section background="black" className="relative min-h-screen overflow-hidden py-16">
          <div
            className="pointer-events-none absolute inset-0 opacity-5"
            style={{
              backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
              backgroundSize: "40px 40px",
            }}
          />
          <Container className="relative z-10 flex min-h-[60vh] items-center justify-center">
            <LoadingSpinner size="lg" text="Loading deliveries..." />
          </Container>
        </Section>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      background="black"
      header={<ConsumerNavigationPublic />}
      footer={
        <Footer
          logo={<Display size="md">GVTEWAY</Display>}
          copyright="© 2024 GHXSTSHIP INDUSTRIES. ALL RIGHTS RESERVED."
        >
          <FooterColumn title="Tickets">
            <FooterLink href="/tickets">My Tickets</FooterLink>
            <FooterLink href="/tickets/tracking">Tracking</FooterLink>
          </FooterColumn>
          <FooterColumn title="Legal">
            <FooterLink href="/legal/privacy">Privacy</FooterLink>
            <FooterLink href="/legal/terms">Terms</FooterLink>
          </FooterColumn>
        </Footer>
      }
    >
      <Section background="black" className="relative min-h-screen overflow-hidden py-16">
        <div
          className="pointer-events-none absolute inset-0 opacity-5"
          style={{
            backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
        <Container className="relative z-10">
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

          {searchError && (
            <Alert variant="error" className="mt-4">
              {searchError}
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
                        <Body className="text-body-sm">{getDeliveryMethodLabel(delivery.delivery_method)}</Body>
                      </Stack>
                      {delivery.tracking_number && (
                        <Stack>
                          <Label className="text-ink-500 text-mono-xs">Tracking</Label>
                          <Body className="text-body-sm font-mono">{delivery.tracking_number}</Body>
                        </Stack>
                      )}
                      {delivery.estimated_delivery && (
                        <Stack>
                          <Label className="text-ink-500 text-mono-xs">Est. Delivery</Label>
                          <Body className="text-body-sm">{delivery.estimated_delivery}</Body>
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
        </Container>
      </Section>
    </PageLayout>
  );
}
