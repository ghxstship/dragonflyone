'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  Select,
  Grid,
  Stack,
  Badge,
  LoadingSpinner,
} from '@ghxstship/ui';
import Image from 'next/image';

interface TourDate {
  id: string;
  event_id: string;
  date: string;
  city: string;
  state: string;
  venue: string;
  price_min: number;
  tickets_available: number;
  status: 'on_sale' | 'presale' | 'sold_out' | 'announced';
}

interface Tour {
  id: string;
  artist_id: string;
  artist_name: string;
  artist_image?: string;
  tour_name: string;
  dates: TourDate[];
  total_dates: number;
}

export default function ToursContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const artistQuery = searchParams.get('artist') || '';

  const [searchTerm, setSearchTerm] = useState(artistQuery);
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState('');
  const [availableCities, setAvailableCities] = useState<string[]>([]);

  const fetchTours = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        ...(searchTerm && { artist: searchTerm }),
        ...(selectedCity && { city: selectedCity }),
      });

      const response = await fetch(`/api/tours?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setTours(data.tours || []);

        // Extract unique cities
        const cities = new Set<string>();
        data.tours?.forEach((tour: Tour) => {
          tour.dates.forEach(date => {
            cities.add(`${date.city}, ${date.state}`);
          });
        });
        setAvailableCities(Array.from(cities).sort());
      }
    } catch (err) {
      console.error('Failed to fetch tours');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedCity]);

  useEffect(() => {
    fetchTours();
  }, [fetchTours]);

  const handleEventClick = (eventId: string) => {
    router.push(`/events/${eventId}`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'on_sale':
        return <Badge className="bg-success-500 text-white">On Sale</Badge>;
      case 'presale':
        return <Badge className="bg-info-500 text-white">Presale</Badge>;
      case 'sold_out':
        return <Badge className="bg-error-500 text-white">Sold Out</Badge>;
      case 'announced':
        return <Badge variant="outline">Announced</Badge>;
      default:
        return null;
    }
  };

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
          <Display>TOURS & MULTI-CITY EVENTS</Display>
          <Body className="mt-2 text-grey-600">
            Find your favorite artists on tour across multiple cities
          </Body>
        </Section>

        <Card className="p-6 mb-8">
          <Grid cols={3} gap={4}>
            <Field label="Search Artist or Tour">
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Artist name or tour..."
              />
            </Field>

            <Field label="Filter by City">
              <Select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
              >
                <option value="">All Cities</option>
                {availableCities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </Select>
            </Field>

            <Stack className="justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCity('');
                }}
              >
                Clear Filters
              </Button>
            </Stack>
          </Grid>
        </Card>

        {tours.length > 0 ? (
          <Stack gap={8}>
            {tours.map(tour => (
              <Card key={tour.id} className="overflow-hidden">
                <Stack direction="horizontal" className="border-b-2 border-black">
                  {tour.artist_image && (
                    <Stack className="w-48 h-48 bg-grey-100 flex-shrink-0 relative">
                      <Image
                        src={tour.artist_image}
                        alt={tour.artist_name}
                        fill
                        className="object-cover"
                      />
                    </Stack>
                  )}
                  <Stack className="p-6 flex-1">
                    <H2>{tour.tour_name}</H2>
                    <Body className="text-grey-600 mt-1">{tour.artist_name}</Body>
                    <Stack direction="horizontal" gap={4} className="mt-4">
                      <Badge>{tour.total_dates} dates</Badge>
                      <Badge variant="outline">
                        {tour.dates.filter(d => d.status === 'on_sale').length} on sale
                      </Badge>
                    </Stack>
                  </Stack>
                </Stack>

                <Stack className="p-6">
                  <Stack gap={2}>
                    {tour.dates
                      .filter(date => !selectedCity || `${date.city}, ${date.state}` === selectedCity)
                      .map(date => (
                        <Stack
                          key={date.id}
                          direction="horizontal"
                          className="justify-between items-center py-3 border-b border-grey-100 last:border-0"
                        >
                          <Stack direction="horizontal" gap={6} className="items-center">
                            <Stack className="w-24">
                              <Body className="font-bold">
                                {new Date(date.date).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </Body>
                              <Body className="text-sm text-grey-500">
                                {new Date(date.date).toLocaleDateString('en-US', {
                                  weekday: 'short',
                                })}
                              </Body>
                            </Stack>
                            <Stack>
                              <Body className="font-medium">{date.city}, {date.state}</Body>
                              <Body className="text-sm text-grey-500">{date.venue}</Body>
                            </Stack>
                          </Stack>

                          <Stack direction="horizontal" gap={4} className="items-center">
                            {getStatusBadge(date.status)}
                            {date.status !== 'sold_out' && date.price_min > 0 && (
                              <Body className="font-bold">From ${date.price_min}</Body>
                            )}
                            <Button
                              variant={date.status === 'sold_out' ? 'outline' : 'solid'}
                              disabled={date.status === 'sold_out'}
                              onClick={() => handleEventClick(date.event_id)}
                            >
                              {date.status === 'sold_out' ? 'Sold Out' : 'Get Tickets'}
                            </Button>
                          </Stack>
                        </Stack>
                      ))}
                  </Stack>
                </Stack>
              </Card>
            ))}
          </Stack>
        ) : (
          <Card className="p-12 text-center">
            <H3 className="mb-4">NO TOURS FOUND</H3>
            <Body className="text-grey-600 mb-6">
              {searchTerm
                ? `No tours found for "${searchTerm}". Try a different search.`
                : 'Search for an artist to see their tour dates.'}
            </Body>
            <Button variant="outline" onClick={() => router.push('/browse')}>
              Browse All Events
            </Button>
          </Card>
        )}
      </Container>
    </Section>
  );
}
