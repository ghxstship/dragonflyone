'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
  Grid,
  Stack,
  Badge,
  Alert,
  LoadingSpinner,
} from '@ghxstship/ui';
import { useSeating } from '@/hooks/useSeating';

interface Seat {
  id: string;
  section: string;
  row: string;
  number: string;
  status: 'available' | 'reserved' | 'sold';
  ticket_type_id: string;
  x_position?: number;
  y_position?: number;
}

export default function SeatingPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;
  const { seating, loading, error, fetchSeating } = useSeating(eventId);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [event, setEvent] = useState<{ title: string; date: string; venue: string } | null>(null);

  useEffect(() => {
    fetchSeating();
    fetchEventDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  const fetchEventDetails = async () => {
    try {
      const response = await fetch(`/api/events/${eventId}`);
      if (response.ok) {
        const data = await response.json();
        setEvent(data.event);
      }
    } catch (err) {
      console.error('Failed to fetch event details');
    }
  };

  const handleSeatClick = (seatId: string, status: string) => {
    if (status !== 'available') return;
    
    setSelectedSeats(prev => 
      prev.includes(seatId) 
        ? prev.filter(id => id !== seatId)
        : [...prev, seatId]
    );
  };

  const handleProceedToCheckout = () => {
    if (selectedSeats.length === 0) return;
    const seatParams = selectedSeats.join(',');
    router.push(`/checkout?eventId=${eventId}&seats=${seatParams}`);
  };

  const getSeatColor = (status: string, isSelected: boolean) => {
    if (isSelected) return 'bg-black text-white';
    switch (status) {
      case 'available': return 'bg-white border-2 border-black hover:bg-grey-100 cursor-pointer';
      case 'reserved': return 'bg-grey-300 cursor-not-allowed';
      case 'sold': return 'bg-grey-600 text-white cursor-not-allowed';
      default: return 'bg-grey-200';
    }
  };

  const groupedSeats = seating?.seats?.reduce((acc, seat) => {
    if (!acc[seat.section]) {
      acc[seat.section] = {};
    }
    if (!acc[seat.section][seat.row]) {
      acc[seat.section][seat.row] = [];
    }
    acc[seat.section][seat.row].push(seat);
    return acc;
  }, {} as Record<string, Record<string, Seat[]>>) || {};

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
          <Display>SELECT YOUR SEATS</Display>
          {event && (
            <Body className="mt-2 text-grey-600">
              {event.title} • {event.venue}
            </Body>
          )}
        </Section>

        {error && (
          <Alert variant="error" className="mb-6">
            {error}
          </Alert>
        )}

        <Grid cols={3} gap={8}>
          <Stack className="col-span-2" gap={6}>
            <Card className="p-6">
              <Stack gap={4} className="items-center mb-8">
                <Stack className="w-full max-w-md h-8 bg-black rounded-t-lg items-center justify-center">
                  <Label className="text-white text-sm">STAGE</Label>
                </Stack>
              </Stack>

              {seating && Object.keys(groupedSeats).length > 0 ? (
                <Stack gap={8}>
                  {Object.entries(groupedSeats).map(([section, rows]) => (
                    <Stack key={section} gap={4}>
                      <H3 className="text-center">{section}</H3>
                      <Stack gap={2}>
                        {Object.entries(rows)
                          .sort(([a], [b]) => a.localeCompare(b))
                          .map(([row, seats]) => (
                            <Stack key={row} direction="horizontal" gap={2} className="items-center justify-center">
                              <Label className="w-8 text-right">{row}</Label>
                              <Stack direction="horizontal" gap={1}>
                                {seats
                                  .sort((a, b) => parseInt(a.number) - parseInt(b.number))
                                  .map(seat => (
                                    <Button
                                      key={seat.id}
                                      onClick={() => handleSeatClick(seat.id, seat.status)}
                                      className={`w-8 h-8 text-xs font-mono transition-colors ${getSeatColor(seat.status, selectedSeats.includes(seat.id))}`}
                                      disabled={seat.status !== 'available'}
                                      title={`${section} Row ${row} Seat ${seat.number}`}
                                      variant="ghost"
                                      size="sm"
                                    >
                                      {seat.number}
                                    </Button>
                                  ))}
                              </Stack>
                              <Label className="w-8">{row}</Label>
                            </Stack>
                          ))}
                      </Stack>
                    </Stack>
                  ))}
                </Stack>
              ) : (
                <Stack className="items-center py-12">
                  <Body className="text-grey-500">No seating chart available for this event.</Body>
                  <Body className="text-grey-400 text-sm">This may be a general admission event.</Body>
                </Stack>
              )}

              <Stack direction="horizontal" gap={6} className="mt-8 justify-center">
                <Stack direction="horizontal" gap={2} className="items-center">
                  <Stack className="w-6 h-6 bg-white border-2 border-black" />
                  <Label>Available</Label>
                </Stack>
                <Stack direction="horizontal" gap={2} className="items-center">
                  <Stack className="w-6 h-6 bg-black" />
                  <Label>Selected</Label>
                </Stack>
                <Stack direction="horizontal" gap={2} className="items-center">
                  <Stack className="w-6 h-6 bg-grey-300" />
                  <Label>Reserved</Label>
                </Stack>
                <Stack direction="horizontal" gap={2} className="items-center">
                  <Stack className="w-6 h-6 bg-grey-600" />
                  <Label>Sold</Label>
                </Stack>
              </Stack>
            </Card>
          </Stack>

          <Stack gap={4}>
            <Card className="p-6">
              <H2 className="mb-4">YOUR SELECTION</H2>
              
              {selectedSeats.length > 0 ? (
                <Stack gap={4}>
                  <Stack gap={2}>
                    {selectedSeats.map(seatId => {
                      const seat = seating?.seats?.find(s => s.id === seatId);
                      return seat ? (
                        <Stack key={seatId} direction="horizontal" className="justify-between items-center py-2 border-b border-grey-200">
                          <Body>{seat.section} - Row {seat.row}, Seat {seat.number}</Body>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSeatClick(seatId, 'available')}
                          >
                            Remove
                          </Button>
                        </Stack>
                      ) : null;
                    })}
                  </Stack>

                  <Stack className="border-t-2 border-black pt-4">
                    <Stack direction="horizontal" className="justify-between">
                      <Body className="font-bold">Total Seats</Body>
                      <Body className="font-bold">{selectedSeats.length}</Body>
                    </Stack>
                  </Stack>

                  <Button
                    variant="solid"
                    className="w-full"
                    onClick={handleProceedToCheckout}
                  >
                    PROCEED TO CHECKOUT
                  </Button>
                </Stack>
              ) : (
                <Body className="text-grey-500">
                  Click on available seats to select them.
                </Body>
              )}
            </Card>

            <Card className="p-6">
              <H3 className="mb-4">NEED HELP?</H3>
              <Stack gap={2}>
                <Body className="text-sm text-grey-600">
                  Having trouble selecting seats? Contact our support team.
                </Body>
                <Button variant="outline" className="w-full" onClick={() => router.push('/help')}>
                  Contact Support
                </Button>
              </Stack>
            </Card>
          </Stack>
        </Grid>
      </Container>
    </Section>
  );
}
