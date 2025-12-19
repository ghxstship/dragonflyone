'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { GvtewayAppLayout, GvtewayLoadingLayout } from '@/components/app-layout';
import {
  H2,
  H3,
  Body,
  Button,
  Card,
  Grid,
  Stack,
  Badge,
  Alert,
  Kicker,
} from '@ghxstship/ui';
import { 
  Utensils, 
  Car, 
  ShoppingBag, 
  Accessibility, 
  Baby, 
  Wifi, 
  CreditCard, 
  Phone,
  MapPin,
  Clock,
  DollarSign,
} from 'lucide-react';

interface EventService {
  id: string;
  name: string;
  category: 'food' | 'parking' | 'merchandise' | 'accessibility' | 'family' | 'wifi' | 'payment' | 'support';
  description: string;
  location?: string;
  hours?: string;
  price_range?: string;
  features?: string[];
}

const categoryIcons: Record<EventService['category'], React.ReactNode> = {
  food: <Utensils className="w-6 h-6" />,
  parking: <Car className="w-6 h-6" />,
  merchandise: <ShoppingBag className="w-6 h-6" />,
  accessibility: <Accessibility className="w-6 h-6" />,
  family: <Baby className="w-6 h-6" />,
  wifi: <Wifi className="w-6 h-6" />,
  payment: <CreditCard className="w-6 h-6" />,
  support: <Phone className="w-6 h-6" />,
};

const categoryColors: Record<EventService['category'], string> = {
  food: 'bg-food-100 text-food-700',
  parking: 'bg-parking-100 text-parking-700',
  merchandise: 'bg-merchandise-100 text-merchandise-700',
  accessibility: 'bg-accessibility-100 text-accessibility-700',
  family: 'bg-family-100 text-family-700',
  wifi: 'bg-wifi-100 text-wifi-700',
  payment: 'bg-payment-100 text-payment-800',
  support: 'bg-support-100 text-support-700',
};

function useEventServices(eventId: string) {
  const [services, setServices] = useState<EventService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchServices() {
      try {
        const response = await fetch(`/api/events/${eventId}/services`);
        if (!response.ok) {
          if (response.status === 404) {
            setServices([]);
            setIsLoading(false);
            return;
          }
          throw new Error('Failed to fetch services');
        }
        const data = await response.json();
        setServices(data.services || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    }
    fetchServices();
  }, [eventId]);

  return { services, isLoading, error };
}

export default function EventServicesPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;

  const { services, isLoading, error } = useEventServices(eventId);
  const [selectedCategory, setSelectedCategory] = useState<EventService['category'] | 'all'>('all');

  if (isLoading) {
    return <GvtewayLoadingLayout />;
  }

  if (error) {
    return (
      <GvtewayAppLayout>
        <Alert variant="error" className="mt-8">
          {error}
        </Alert>
      </GvtewayAppLayout>
    );
  }

  const categories = Array.from(new Set(services.map(s => s.category)));
  const filteredServices = selectedCategory === 'all' 
    ? services 
    : services.filter(s => s.category === selectedCategory);

  return (
    <GvtewayAppLayout>
      <Stack gap={10}>
        <Stack gap={2}>
          <Kicker colorScheme="on-dark">Event Services</Kicker>
          <H2 size="lg" className="text-white">Services & Amenities</H2>
          <Body className="text-on-dark-muted">
            Everything you need to know about services available at this event
          </Body>
        </Stack>

        <Stack direction="horizontal" gap={2} className="flex-wrap">
          <Button
            variant={selectedCategory === 'all' ? 'solid' : 'outline'}
            onClick={() => setSelectedCategory('all')}
          >
            All Services
          </Button>
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'solid' : 'outline'}
              onClick={() => setSelectedCategory(category)}
            >
              <span className="mr-2">{categoryIcons[category]}</span>
              <span className="capitalize">{category}</span>
            </Button>
          ))}
        </Stack>

        {filteredServices.length === 0 ? (
          <Card inverted className="p-12 text-center">
            <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-ink-400" />
            <H2 className="mb-4 text-white">NO SERVICES LISTED</H2>
            <Body className="text-on-dark-muted mb-6">
              Service information for this event is not yet available.
            </Body>
            <Button variant="solid" inverted onClick={() => router.back()}>
              Go Back
            </Button>
          </Card>
        ) : (
          <Grid cols={3} gap={6}>
            {filteredServices.map(service => (
              <Card key={service.id} className="p-6 border-2 border-black hover:shadow-lg transition-shadow">
                <Stack gap={4}>
                  <Stack direction="horizontal" className="justify-between items-start">
                    <span className={`p-3 rounded-card ${categoryColors[service.category]}`}>
                      {categoryIcons[service.category]}
                    </span>
                    <Badge variant="outline" className="capitalize">
                      {service.category}
                    </Badge>
                  </Stack>

                  <Stack gap={2}>
                    <H3>{service.name}</H3>
                    <Body className="text-ink-600">{service.description}</Body>
                  </Stack>

                  <Stack gap={2}>
                    {service.location && (
                      <Stack direction="horizontal" gap={2} className="items-center">
                        <MapPin className="w-4 h-4 text-ink-500" />
                        <Body className="text-mono-sm">{service.location}</Body>
                      </Stack>
                    )}
                    {service.hours && (
                      <Stack direction="horizontal" gap={2} className="items-center">
                        <Clock className="w-4 h-4 text-ink-500" />
                        <Body className="text-mono-sm">{service.hours}</Body>
                      </Stack>
                    )}
                    {service.price_range && (
                      <Stack direction="horizontal" gap={2} className="items-center">
                        <DollarSign className="w-4 h-4 text-ink-500" />
                        <Body className="text-mono-sm">{service.price_range}</Body>
                      </Stack>
                    )}
                  </Stack>

                  {service.features && service.features.length > 0 && (
                    <Stack direction="horizontal" gap={2} className="flex-wrap">
                      {service.features.map((feature, index) => (
                        <Badge key={index} variant="outline" className="text-mono-xs">
                          {feature}
                        </Badge>
                      ))}
                    </Stack>
                  )}

                  <Button 
                    variant="outline" 
                    className="w-full mt-2"
                    onClick={() => router.push(`/events/${eventId}/map`)}
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    View on Map
                  </Button>
                </Stack>
              </Card>
            ))}
          </Grid>
        )}

        <Card className="p-6 bg-ink-900 text-white">
          <Grid cols={3} gap={6}>
            <Stack gap={3}>
              <Phone className="w-8 h-8" />
              <H3 className="text-white">Need Assistance?</H3>
              <Body className="text-ink-300">
                Our support team is available to help you during the event.
              </Body>
              <Button
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-black"
                onClick={() => router.push('/help')}
              >
                Contact Support
              </Button>
            </Stack>
            <Stack gap={3}>
              <Accessibility className="w-8 h-8" />
              <H3 className="text-white">Accessibility</H3>
              <Body className="text-ink-300">
                View accessibility services and accommodations.
              </Body>
              <Button
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-black"
                onClick={() => router.push(`/events/${eventId}/accessibility`)}
              >
                View Accessibility
              </Button>
            </Stack>
            <Stack gap={3}>
              <MapPin className="w-8 h-8" />
              <H3 className="text-white">Venue Map</H3>
              <Body className="text-ink-300">
                Find your way around with our interactive venue map.
              </Body>
              <Button
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-black"
                onClick={() => router.push(`/events/${eventId}/map`)}
              >
                View Map
              </Button>
            </Stack>
          </Grid>
        </Card>
      </Stack>
    </GvtewayAppLayout>
  );
}
