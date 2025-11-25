"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "../../components/navigation";
import {
  H1,
  H2,
  Body,
  StatCard,
  Select,
  Button,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  LoadingSpinner,
  EmptyState,
  Container,
  Grid,
  Stack,
  Card,
  Section,
  useNotifications,
} from "@ghxstship/ui";

interface TravelBooking {
  id: string;
  booking_reference: string;
  crew_member_id: string;
  crew_member_name: string;
  project_id: string;
  project_name: string;
  travel_type: string;
  departure_date: string;
  return_date?: string;
  origin: string;
  destination: string;
  carrier?: string;
  flight_number?: string;
  hotel_name?: string;
  confirmation_number?: string;
  cost: number;
  status: string;
  notes?: string;
}

interface AccommodationBooking {
  id: string;
  crew_member_name: string;
  project_name: string;
  hotel_name: string;
  check_in: string;
  check_out: string;
  room_type: string;
  cost_per_night: number;
  total_cost: number;
  status: string;
}

interface TravelSummary {
  total_bookings: number;
  upcoming_flights: number;
  active_accommodations: number;
  total_travel_cost: number;
  total_accommodation_cost: number;
  crew_traveling: number;
}

export default function TravelPage() {
  const router = useRouter();
  const { addNotification } = useNotifications();
  const [bookings, setBookings] = useState<TravelBooking[]>([]);
  const [accommodations, setAccommodations] = useState<AccommodationBooking[]>([]);
  const [summary, setSummary] = useState<TravelSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"flights" | "hotels">("flights");

  const fetchTravelData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/travel");
      if (!response.ok) throw new Error("Failed to fetch travel data");
      
      const data = await response.json();
      setBookings(data.bookings || []);
      setAccommodations(data.accommodations || []);
      setSummary(data.summary || null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTravelData();
  }, [fetchTravelData]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getStatusVariant = (status: string): "solid" | "outline" | "ghost" => {
    switch (status?.toLowerCase()) {
      case "confirmed":
      case "checked_in":
        return "solid";
      case "pending":
      case "booked":
        return "outline";
      case "cancelled":
        return "ghost";
      default:
        return "ghost";
    }
  };

  if (loading) {
    return (
      <Section className="relative min-h-screen bg-black text-white">
        <Navigation />
        <Container className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner size="lg" text="Loading travel data..." />
        </Container>
      </Section>
    );
  }

  if (error) {
    return (
      <Section className="relative min-h-screen bg-black text-white">
        <Navigation />
        <Container className="py-16">
          <EmptyState
            title="Error Loading Travel Data"
            description={error}
            action={{ label: "Retry", onClick: fetchTravelData }}
          />
        </Container>
      </Section>
    );
  }

  return (
    <Section className="relative min-h-screen bg-black text-white">
      <Navigation />
      <Container className="py-16">
        <Stack gap={8}>
          <Stack gap={2}>
            <H1>Travel Coordination</H1>
            <Body className="text-grey-400">
              Manage crew flights, accommodations, and travel logistics
            </Body>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard
              value={summary?.crew_traveling || 0}
              label="Crew Traveling"
              className="bg-black text-white border-grey-800"
            />
            <StatCard
              value={summary?.upcoming_flights || 0}
              label="Upcoming Flights"
              className="bg-black text-white border-grey-800"
            />
            <StatCard
              value={summary?.active_accommodations || 0}
              label="Active Hotels"
              className="bg-black text-white border-grey-800"
            />
            <StatCard
              value={formatCurrency((summary?.total_travel_cost || 0) + (summary?.total_accommodation_cost || 0))}
              label="Total Cost"
              className="bg-black text-white border-grey-800"
            />
          </Grid>

          <Card className="p-6 bg-black border-grey-800">
            <Stack gap={4}>
              <H2>Upcoming Departures</H2>
              <Grid cols={3} gap={4}>
                <Card className="p-4 bg-grey-900 border-grey-700">
                  <Stack gap={2}>
                    <Body className="text-grey-400 text-sm uppercase tracking-wider">Today</Body>
                    <Body className="text-2xl font-bold">3</Body>
                    <Body className="text-sm text-grey-400">crew departing</Body>
                  </Stack>
                </Card>
                <Card className="p-4 bg-grey-900 border-grey-700">
                  <Stack gap={2}>
                    <Body className="text-grey-400 text-sm uppercase tracking-wider">This Week</Body>
                    <Body className="text-2xl font-bold">12</Body>
                    <Body className="text-sm text-grey-400">crew departing</Body>
                  </Stack>
                </Card>
                <Card className="p-4 bg-grey-900 border-grey-700">
                  <Stack gap={2}>
                    <Body className="text-grey-400 text-sm uppercase tracking-wider">Returns</Body>
                    <Body className="text-2xl font-bold">8</Body>
                    <Body className="text-sm text-grey-400">crew returning</Body>
                  </Stack>
                </Card>
              </Grid>
            </Stack>
          </Card>

          <Stack gap={4} direction="horizontal">
            <Button 
              variant={activeTab === "flights" ? "solid" : "ghost"}
              onClick={() => setActiveTab("flights")}
            >
              Flights & Transport
            </Button>
            <Button 
              variant={activeTab === "hotels" ? "solid" : "ghost"}
              onClick={() => setActiveTab("hotels")}
            >
              Accommodations
            </Button>
          </Stack>

          {activeTab === "flights" && (
            <>
              {bookings.length === 0 ? (
                <EmptyState
                  title="No Travel Bookings"
                  description="Book travel for your crew"
                  action={{ label: "Book Travel", onClick: () => {} }}
                />
              ) : (
                <Table variant="bordered" className="bg-black">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reference</TableHead>
                      <TableHead>Crew Member</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Route</TableHead>
                      <TableHead>Departure</TableHead>
                      <TableHead>Carrier</TableHead>
                      <TableHead>Cost</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((booking) => (
                      <TableRow key={booking.id} className="bg-black text-white hover:bg-grey-900">
                        <TableCell className="font-mono text-white">
                          {booking.booking_reference}
                        </TableCell>
                        <TableCell className="text-white">
                          {booking.crew_member_name}
                        </TableCell>
                        <TableCell className="text-grey-400">
                          {booking.project_name}
                        </TableCell>
                        <TableCell className="text-grey-400">
                          {booking.origin} → {booking.destination}
                        </TableCell>
                        <TableCell className="font-mono text-grey-400">
                          {formatDate(booking.departure_date)}
                        </TableCell>
                        <TableCell className="text-grey-400">
                          {booking.carrier || "—"}
                        </TableCell>
                        <TableCell className="font-mono text-white">
                          {formatCurrency(booking.cost)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(booking.status)}>
                            {booking.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </>
          )}

          {activeTab === "hotels" && (
            <>
              {accommodations.length === 0 ? (
                <EmptyState
                  title="No Accommodations"
                  description="Book accommodations for your crew"
                  action={{ label: "Book Hotel", onClick: () => {} }}
                />
              ) : (
                <Table variant="bordered" className="bg-black">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Crew Member</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Hotel</TableHead>
                      <TableHead>Check-in</TableHead>
                      <TableHead>Check-out</TableHead>
                      <TableHead>Room Type</TableHead>
                      <TableHead>Total Cost</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accommodations.map((acc) => (
                      <TableRow key={acc.id} className="bg-black text-white hover:bg-grey-900">
                        <TableCell className="text-white">
                          {acc.crew_member_name}
                        </TableCell>
                        <TableCell className="text-grey-400">
                          {acc.project_name}
                        </TableCell>
                        <TableCell className="text-white">
                          {acc.hotel_name}
                        </TableCell>
                        <TableCell className="font-mono text-grey-400">
                          {formatDate(acc.check_in)}
                        </TableCell>
                        <TableCell className="font-mono text-grey-400">
                          {formatDate(acc.check_out)}
                        </TableCell>
                        <TableCell className="text-grey-400">
                          {acc.room_type}
                        </TableCell>
                        <TableCell className="font-mono text-white">
                          {formatCurrency(acc.total_cost)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(acc.status)}>
                            {acc.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </>
          )}

          <Stack gap={3} direction="horizontal">
            <Button variant="outlineWhite" onClick={() => router.push(activeTab === "flights" ? '/travel/flights/new' : '/travel/hotels/new')}>
              {activeTab === "flights" ? "Book Flight" : "Book Hotel"}
            </Button>
            <Button variant="ghost" className="text-grey-400 hover:text-white" onClick={() => router.push('/travel/import')}>
              Import Itinerary
            </Button>
            <Button variant="ghost" className="text-grey-400 hover:text-white" onClick={() => router.push('/travel/export')}>
              Export Manifest
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Section>
  );
}
