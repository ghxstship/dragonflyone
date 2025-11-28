"use client";

import { useState, useEffect } from "react";
import { GvtewayAppLayout, GvtewayLoadingLayout, GvtewayEmptyLayout } from "@/components/app-layout";
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
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface Event {
  id: string;
  title: string;
  description: string;
  venue_name: string;
  city: string;
  state: string;
  event_date: string;
  event_time: string;
  genre: string;
  capacity: number;
  image_url: string;
  ticket_types: TicketType[];
}

interface TicketType {
  id: string;
  name: string;
  price: number;
  available_quantity: number;
}

export default function EventDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);

  useEffect(() => {
    fetchEventDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  async function fetchEventDetails() {
    try {
      const { data, error } = await supabase
        .from("events")
        .select(`
          *,
          ticket_types (*)
        `)
        .eq("id", params.id)
        .single();

      if (error) throw error;
      setEvent(data);
    } catch (error) {
      console.error("Error fetching event:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleTicketSelect(ticketTypeId: string) {
    setSelectedTicket(ticketTypeId);
    router.push(`/checkout?event=${params.id}&ticket=${ticketTypeId}`);
  }

  if (loading) {
    return <GvtewayLoadingLayout text="Loading event..." />;
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

  return (
    <GvtewayAppLayout>
      <Stack gap={8}>
          <Card className="relative h-96 overflow-hidden border-2 border-ink-800">
            <Image 
              src={event.image_url || "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200"} 
              alt={event.title} 
              fill
              className="object-cover grayscale" 
            />
          </Card>

          <Grid cols={3} gap={8}>
            <Stack gap={6} className="lg:col-span-2">
              <Stack>
                <Stack className="mb-4">
                  <Link href="/events" className="text-ink-400 hover:text-white">← Back to Events</Link>
                </Stack>
                <H2 className="text-white">{event.title}</H2>
                <Stack direction="horizontal" gap={4} className="mt-4 items-center text-ink-400">
                  <Body>{event.venue_name}</Body>
                  <Body>•</Body>
                  <Body>{event.city}, {event.state}</Body>
                  <Body>•</Body>
                  <Badge>{event.genre}</Badge>
                </Stack>
              </Stack>

              <Card className="border-2 border-ink-800 p-6">
                <H3 className="mb-4 text-white">About</H3>
                <Body className="text-ink-300">{event.description}</Body>
              </Card>

              <Card className="border-2 border-ink-800 p-6">
                <H3 className="mb-4 text-white">Event Info</H3>
                <Stack gap={3}>
                  <Stack>
                    <Label className="text-ink-500 text-body-sm">Capacity</Label>
                    <Body className="text-white">{event.capacity} attendees</Body>
                  </Stack>
                  <Stack>
                    <Label className="text-ink-500 text-body-sm">Genre</Label>
                    <Badge>{event.genre}</Badge>
                  </Stack>
                </Stack>
              </Card>
            </Stack>

            <Stack gap={6}>
              <Card className="border-2 border-ink-800 p-6">
                <H3 className="mb-4 text-white">Event Details</H3>
                <Stack gap={3} className="text-body-sm">
                  <Stack>
                    <Label className="text-ink-500">Date</Label>
                    <Body className="mt-1 text-white">{new Date(event.event_date).toLocaleDateString()}</Body>
                  </Stack>
                  <Stack>
                    <Label className="text-ink-500">Time</Label>
                    <Body className="mt-1 text-white">{event.event_time}</Body>
                  </Stack>
                  <Stack>
                    <Label className="text-ink-500">Venue</Label>
                    <Body className="mt-1 text-white">{event.venue_name}</Body>
                    <Body className="mt-1 text-ink-400">{event.city}, {event.state}</Body>
                  </Stack>
                </Stack>
              </Card>

              <Card className="border-2 border-ink-800 p-6">
                <H3 className="mb-4 text-white">Tickets</H3>
                <Stack gap={4}>
                  {event.ticket_types && event.ticket_types.length > 0 ? (
                    event.ticket_types.map((tier) => (
                      <Card key={tier.id} className="border-2 border-ink-700 p-4">
                        <Stack direction="horizontal" className="items-start justify-between">
                          <Stack>
                            <Label className="text-white">{tier.name}</Label>
                            <Body className="mt-1 font-mono text-h5-md text-white">${tier.price}</Body>
                            <Body className="mt-1 text-mono-xs text-ink-400">{tier.available_quantity} remaining</Body>
                          </Stack>
                          {tier.available_quantity > 0 ? (
                            <Badge variant="solid">Available</Badge>
                          ) : (
                            <Badge variant="outline">Sold Out</Badge>
                          )}
                        </Stack>
                        {tier.available_quantity > 0 && (
                          <Button 
                            variant="solid" 
                            className="mt-4 w-full"
                            onClick={() => handleTicketSelect(tier.id)}
                          >
                            Select Tickets
                          </Button>
                        )}
                      </Card>
                    ))
                  ) : (
                    <Body className="text-ink-400">No tickets available</Body>
                  )}
                </Stack>
              </Card>
            </Stack>
          </Grid>
      </Stack>
    </GvtewayAppLayout>
  );
}
