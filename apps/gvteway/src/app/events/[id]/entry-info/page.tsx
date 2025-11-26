'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Navigation } from '../../../../components/navigation';
import {
  Container,
  Section,
  H1,
  H2,
  H3,
  Body,
  Label,
  Button,
  Card,
  Grid,
  Stack,
  Badge,
  Alert,
  LoadingSpinner,
} from '@ghxstship/ui';

interface EntryInfo {
  event_id: string;
  event_title: string;
  event_date: string;
  event_time: string;
  venue_name: string;
  venue_address: string;
  venue_city: string;
  doors_open: string;
  show_starts: string;
  entry_gates: { name: string; location: string; recommended_for?: string }[];
  prohibited_items: string[];
  allowed_items: string[];
  bag_policy: string;
  age_restriction?: string;
  dress_code?: string;
  parking_info: {
    available: boolean;
    lots: { name: string; address: string; price?: string }[];
    tips?: string;
  };
  transit_info: {
    subway?: string;
    bus?: string;
    rideshare_dropoff?: string;
  };
  tips: string[];
  faq: { question: string; answer: string }[];
}

export default function EntryInfoPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;

  const [info, setInfo] = useState<EntryInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInfo = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/events/${eventId}/entry-info`);
      if (response.ok) {
        const data = await response.json();
        setInfo(data.info);
      } else {
        setError('Entry information not available');
      }
    } catch (err) {
      setError('Failed to load entry information');
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchInfo();
  }, [fetchInfo]);

  if (loading) {
    return (
      <Section className="min-h-screen bg-white">
        <Navigation />
        <Container className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner size="lg" text="Loading entry information..." />
        </Container>
      </Section>
    );
  }

  if (!info) {
    return (
      <Section className="min-h-screen bg-white">
        <Navigation />
        <Container className="py-16">
          <Card className="p-12 text-center">
            <H2 className="mb-4">INFORMATION NOT AVAILABLE</H2>
            <Body className="text-grey-600 mb-6">
              Entry information for this event is not yet available.
            </Body>
            <Button variant="solid" onClick={() => router.back()}>
              Go Back
            </Button>
          </Card>
        </Container>
      </Section>
    );
  }

  return (
    <Section className="min-h-screen bg-white">
      <Navigation />
      <Container className="py-16">
        <Stack gap={8}>
        <Stack gap={2} className="border-b-2 border-black pb-8">
          <Body className="text-grey-500">{info.event_date}</Body>
          <H1>{info.event_title}</H1>
          <Body className="text-grey-600">
            {info.venue_name} • {info.venue_city}
          </Body>
        </Stack>

        {error && (
          <Alert variant="error" className="mb-6">
            {error}
          </Alert>
        )}

        <Grid cols={3} gap={8}>
          <Stack className="col-span-2" gap={6}>
            <Card className="p-6">
              <H2 className="mb-6">TIMING</H2>
              <Grid cols={2} gap={6}>
                <Stack className="p-4 bg-grey-50 rounded">
                  <Label className="text-grey-500">Doors Open</Label>
                  <H3>{info.doors_open}</H3>
                </Stack>
                <Stack className="p-4 bg-grey-50 rounded">
                  <Label className="text-grey-500">Show Starts</Label>
                  <H3>{info.show_starts}</H3>
                </Stack>
              </Grid>
              <Body className="mt-4 text-grey-600">
                We recommend arriving at least 30 minutes before doors open to allow time for parking and entry.
              </Body>
            </Card>

            <Card className="p-6">
              <H2 className="mb-6">ENTRY GATES</H2>
              <Stack gap={4}>
                {info.entry_gates.map((gate, index) => (
                  <Stack key={index} className="p-4 border border-grey-200 rounded">
                    <Stack direction="horizontal" className="justify-between items-start">
                      <Stack>
                        <Body className="font-bold">{gate.name}</Body>
                        <Body className="text-grey-600">{gate.location}</Body>
                      </Stack>
                      {gate.recommended_for && (
                        <Badge variant="outline">{gate.recommended_for}</Badge>
                      )}
                    </Stack>
                  </Stack>
                ))}
              </Stack>
            </Card>

            <Card className="p-6">
              <H2 className="mb-6">BAG POLICY</H2>
              <Body>{info.bag_policy}</Body>
              
              <Grid cols={2} gap={6} className="mt-6">
                <Stack>
                  <H3 className="mb-3 text-success-600">ALLOWED ITEMS</H3>
                  <Stack gap={2}>
                    {info.allowed_items.map((item, index) => (
                      <Stack key={index} direction="horizontal" gap={2} className="items-center">
                        <Body className="text-success-600">✓</Body>
                        <Body>{item}</Body>
                      </Stack>
                    ))}
                  </Stack>
                </Stack>
                <Stack>
                  <H3 className="mb-3 text-error-600">PROHIBITED ITEMS</H3>
                  <Stack gap={2}>
                    {info.prohibited_items.map((item, index) => (
                      <Stack key={index} direction="horizontal" gap={2} className="items-center">
                        <Body className="text-error-600">✕</Body>
                        <Body>{item}</Body>
                      </Stack>
                    ))}
                  </Stack>
                </Stack>
              </Grid>
            </Card>

            {info.parking_info.available && (
              <Card className="p-6">
                <H2 className="mb-6">PARKING</H2>
                <Stack gap={4}>
                  {info.parking_info.lots.map((lot, index) => (
                    <Stack key={index} className="p-4 border border-grey-200 rounded">
                      <Stack direction="horizontal" className="justify-between">
                        <Stack>
                          <Body className="font-bold">{lot.name}</Body>
                          <Body className="text-grey-600 text-sm">{lot.address}</Body>
                        </Stack>
                        {lot.price && <Badge>{lot.price}</Badge>}
                      </Stack>
                    </Stack>
                  ))}
                </Stack>
                {info.parking_info.tips && (
                  <Body className="mt-4 text-grey-600 text-sm">
                    💡 {info.parking_info.tips}
                  </Body>
                )}
              </Card>
            )}

            <Card className="p-6">
              <H2 className="mb-6">GETTING THERE</H2>
              <Stack gap={4}>
                {info.transit_info.subway && (
                  <Stack className="p-4 bg-grey-50 rounded">
                    <Label className="text-grey-500">Subway</Label>
                    <Body>{info.transit_info.subway}</Body>
                  </Stack>
                )}
                {info.transit_info.bus && (
                  <Stack className="p-4 bg-grey-50 rounded">
                    <Label className="text-grey-500">Bus</Label>
                    <Body>{info.transit_info.bus}</Body>
                  </Stack>
                )}
                {info.transit_info.rideshare_dropoff && (
                  <Stack className="p-4 bg-grey-50 rounded">
                    <Label className="text-grey-500">Rideshare Drop-off</Label>
                    <Body>{info.transit_info.rideshare_dropoff}</Body>
                  </Stack>
                )}
              </Stack>
            </Card>

            {info.faq.length > 0 && (
              <Card className="p-6">
                <H2 className="mb-6">FAQ</H2>
                <Stack gap={4}>
                  {info.faq.map((item, index) => (
                    <Stack key={index} className="pb-4 border-b border-grey-200 last:border-0">
                      <Body className="font-bold mb-2">{item.question}</Body>
                      <Body className="text-grey-600">{item.answer}</Body>
                    </Stack>
                  ))}
                </Stack>
              </Card>
            )}
          </Stack>

          <Stack gap={6}>
            <Card className="p-6 bg-black text-white sticky top-6">
              <H3 className="text-white mb-4">VENUE ADDRESS</H3>
              <Body className="text-white">{info.venue_name}</Body>
              <Body className="text-grey-300">{info.venue_address}</Body>
              <Body className="text-grey-300">{info.venue_city}</Body>
              <Button
                variant="outline"
                className="mt-4 w-full border-white text-white hover:bg-white hover:text-black"
                onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(info.venue_address + ', ' + info.venue_city)}`, '_blank')}
              >
                Get Directions
              </Button>
            </Card>

            {(info.age_restriction || info.dress_code) && (
              <Card className="p-6">
                <H3 className="mb-4">REQUIREMENTS</H3>
                <Stack gap={3}>
                  {info.age_restriction && (
                    <Stack>
                      <Label className="text-grey-500">Age Restriction</Label>
                      <Body>{info.age_restriction}</Body>
                    </Stack>
                  )}
                  {info.dress_code && (
                    <Stack>
                      <Label className="text-grey-500">Dress Code</Label>
                      <Body>{info.dress_code}</Body>
                    </Stack>
                  )}
                </Stack>
              </Card>
            )}

            {info.tips.length > 0 && (
              <Card className="p-6 bg-warning-50">
                <H3 className="mb-4">PRO TIPS</H3>
                <Stack gap={3}>
                  {info.tips.map((tip, index) => (
                    <Stack key={index} direction="horizontal" gap={2}>
                      <Body>💡</Body>
                      <Body className="text-sm">{tip}</Body>
                    </Stack>
                  ))}
                </Stack>
              </Card>
            )}

            <Button
              variant="solid"
              className="w-full"
              onClick={() => router.push(`/tickets?event=${eventId}`)}
            >
              View My Tickets
            </Button>
          </Stack>
        </Grid>
        </Stack>
      </Container>
    </Section>
  );
}
