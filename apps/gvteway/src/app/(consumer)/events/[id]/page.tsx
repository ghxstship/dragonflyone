"use client";

import { useState } from "react";
import { GvtewayLoadingLayout, GvtewayEmptyLayout } from "@/components/app-layout";
import {
  H2,
  H3,
  Body,
  Label,
  Button,
  Badge,
  Card,
  Grid,
  Stack,
  Link,
} from "@ghxstship/ui";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

interface TicketType {
  id: string;
  name: string;
  price: number;
  quantity_total: number;
  quantity_sold: number;
  is_active: boolean;
}

interface EventWithTickets {
  id: string;
  name: string;
  description: string;
  venue_name: string;
  venue_city: string;
  venue_state: string;
  start_date: string;
  start_time: string;
  category: string;
  capacity: number;
  image_url: string;
  ticket_types: TicketType[];
}

// Custom hook for fetching single event with ticket types
function useEventWithTickets(id: string) {
  return useQuery({
    queryKey: ['events', id, 'with-tickets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('legend_events')
        .select(`
          *,
          ticket_types (*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as EventWithTickets;
    },
    enabled: !!id,
  });
}

export default function EventDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  
  const { data: event, isLoading, error } = useEventWithTickets(params.id);

  function handleTicketSelect(ticketTypeId: string) {
    setSelectedTicket(ticketTypeId);
    router.push(`/checkout?event=${params.id}&ticket=${ticketTypeId}`);
  }

  if (isLoading) {
    return <GvtewayLoadingLayout text="Loading event..." />;
  }

  if (error) {
    return (
      <GvtewayEmptyLayout
        title="Error Loading Event"
        description="There was a problem loading this event. Please try again."
        action={<Button variant="solid" onClick={() => router.push('/events')}>Browse Events</Button>}
      />
    );
  }

  if (!event) {
    return (
      <GvtewayEmptyLayout
        title="Event Not Found"
        description="The event you're looking for doesn't exist or has been removed."
        action={<Button variant="solid" onClick={() => router.push('/events')}>Browse Events</Button>}
      />
    );
  }
  
  // Transform data for display compatibility
  const displayEvent = {
    ...event,
    title: event.name,
    venue: event.venue_name,
    city: event.venue_city,
    state: event.venue_state,
    event_date: event.start_date,
    event_time: event.start_time,
    genre: event.category,
  };

  // Calculate available quantity for each ticket type
  const getAvailableQuantity = (tier: TicketType) => {
    return tier.quantity_total - (tier.quantity_sold || 0);
  };

  return (
    <>
      <Stack gap={8}>
          <Card className="relative h-96 overflow-hidden border-2 border-ink-800">
            <Image 
              src={displayEvent.image_url || "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200"} 
              alt={displayEvent.title} 
              fill
              className="object-cover grayscale" 
            />
          </Card>

          <Grid cols={3} gap={8} className="sm:grid-cols-2 lg:grid-cols-3">
            <Stack gap={6} className="lg:col-span-2">
              <Stack>
                <Stack className="mb-4">
                  <Link href="/events" className="text-ink-400 hover:text-white">← Back to Events</Link>
                </Stack>
                <H2 className="text-white">{displayEvent.title}</H2>
                <Stack direction="horizontal" gap={4} className="mt-4 items-center text-ink-400">
                  <Body>{displayEvent.venue}</Body>
                  <Body>•</Body>
                  <Body>{displayEvent.city}, {displayEvent.state}</Body>
                  <Body>•</Body>
                  <Badge>{displayEvent.genre}</Badge>
                </Stack>
              </Stack>

              <Card className="border-2 border-ink-800 p-6">
                <H3 className="mb-4 text-white">About</H3>
                <Body className="text-ink-300">{displayEvent.description}</Body>
              </Card>

              <Card className="border-2 border-ink-800 p-6">
                <H3 className="mb-4 text-white">Event Info</H3>
                <Stack gap={3}>
                  <Stack>
                    <Label className="text-ink-500">Capacity</Label>
                    <Body className="text-white">{displayEvent.capacity} attendees</Body>
                  </Stack>
                  <Stack>
                    <Label className="text-ink-500">Genre</Label>
                    <Badge>{displayEvent.genre}</Badge>
                  </Stack>
                </Stack>
              </Card>
            </Stack>

            <Stack gap={6}>
              <Card className="border-2 border-ink-800 p-6">
                <H3 className="mb-4 text-white">Event Details</H3>
                <Stack gap={3} className="">
                  <Stack>
                    <Label className="text-ink-500">Date</Label>
                    <Body className="mt-1 text-white">{new Date(displayEvent.event_date).toLocaleDateString()}</Body>
                  </Stack>
                  <Stack>
                    <Label className="text-ink-500">Time</Label>
                    <Body className="mt-1 text-white">{displayEvent.event_time || 'TBA'}</Body>
                  </Stack>
                  <Stack>
                    <Label className="text-ink-500">Venue</Label>
                    <Body className="mt-1 text-white">{displayEvent.venue}</Body>
                    <Body className="mt-1 text-ink-400">{displayEvent.city}, {displayEvent.state}</Body>
                  </Stack>
                </Stack>
              </Card>

              <Card className="border-2 border-ink-800 p-6">
                <H3 className="mb-4 text-white">Tickets</H3>
                <Stack gap={4}>
                  {event.ticket_types && event.ticket_types.length > 0 ? (
                    event.ticket_types.filter(t => t.is_active !== false).map((tier) => {
                      const availableQty = getAvailableQuantity(tier);
                      return (
                        <Card key={tier.id} className={`border-2 p-4 ${selectedTicket === tier.id ? 'border-primary ring-2 ring-primary' : 'border-ink-700'}`}>
                          <Stack direction="horizontal" className="items-start justify-between">
                            <Stack>
                              <Label className="text-white">{tier.name}</Label>
                              <Body className="mt-1 font-mono text-h5-md text-white">${tier.price}</Body>
                              <Body className="mt-1 text-mono-xs text-ink-400">{availableQty} remaining</Body>
                            </Stack>
                            {availableQty > 0 ? (
                              <Badge variant="solid">Available</Badge>
                            ) : (
                              <Badge variant="outline">Sold Out</Badge>
                            )}
                          </Stack>
                          {availableQty > 0 && (
                            <Button 
                              variant="solid" 
                              className="mt-4 w-full"
                              onClick={() => handleTicketSelect(tier.id)}
                            >
                              Select Tickets
                            </Button>
                          )}
                        </Card>
                      );
                    })
                  ) : (
                    <Body className="text-ink-400">No tickets available</Body>
                  )}
                </Stack>
              </Card>
            </Stack>
          </Grid>
      </Stack>
    </>
  );
}
