"use client";

/**
 * Artist Portal Page
 * Portal for artists to manage their profile and bookings
 * Uses DetailPage template for consistent layout
 */

import { Music, Calendar, DollarSign, Star, List, Settings } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  Badge, Body, Button, Card, Grid, StatCard, DetailPage, Section, SectionHeader} from "@ghxstship/ui";

interface Booking {
  id: string;
  event: string;
  date: string;
  venue: string;
  status: "confirmed" | "pending" | "completed";
  fee: number;
}

const DEMO_BOOKINGS: Booking[] = [
  { id: "1", event: "Summer Festival 2024", date: "2024-12-20", venue: "Central Park", status: "confirmed", fee: 15000 },
  { id: "2", event: "New Year's Eve Gala", date: "2024-12-31", venue: "Grand Ballroom", status: "pending", fee: 20000 },
  { id: "3", event: "Corporate Event", date: "2024-11-15", venue: "Tech Campus", status: "completed", fee: 10000 },
];

const STATUS_CONFIG = {
  confirmed: { label: "Confirmed", variant: "success" as const },
  pending: { label: "Pending", variant: "warning" as const },
  completed: { label: "Completed", variant: "info" as const },
};

export default function ArtistPortalPage() {

  const { data: bookings = [], isLoading, error, refetch } = useQuery({
    queryKey: ["artist-bookings"],
    queryFn: async () => {
      const response = await fetch("/api/portal/artist/bookings");
      if (!response.ok) return DEMO_BOOKINGS;
      const data = await response.json();
      return data.bookings?.length ? data.bookings : DEMO_BOOKINGS;
    },
  });

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const formatCurrency = (amount: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(amount);

  const totalEarnings = bookings.filter((b: Booking) => b.status === "completed").reduce((sum: number, b: Booking) => sum + b.fee, 0);
  const upcomingBookings = bookings.filter((b: Booking) => b.status !== "completed").length;

  const tabs = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <List className="size-4" />,
      content: (
        <Section>
          <Grid cols={4} gap={4} className="grid-cols-2 md:grid-cols-4 mb-6">
            <StatCard label="Total Bookings" value={bookings.length.toString()} icon={<Calendar className="size-5" />} />
            <StatCard label="Upcoming" value={upcomingBookings.toString()} icon={<Calendar className="size-5" />} />
            <StatCard label="Earnings" value={formatCurrency(totalEarnings)} icon={<DollarSign className="size-5" />} />
            <StatCard label="Rating" value="4.9" icon={<Star className="size-5" />} />
          </Grid>

          <SectionHeader title="Upcoming Bookings" />
          <div className="space-y-4 mt-4">
            {bookings.filter((b: Booking) => b.status !== "completed").map((booking: Booking) => (
              <Card key={booking.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <Body className="font-weight-bold font-weight-medium">{booking.event}</Body>
                    <div className="flex items-center gap-4 mt-2 text-on-dark-muted">
                      <div className="flex items-center gap-1"><Calendar className="size-4" /><Body size="sm">{formatDate(booking.date)}</Body></div>
                      <Body size="sm">{booking.venue}</Body>
                    </div>
                  </div>
                  <div className="text-right">
                    <Body className="font-weight-bold">{formatCurrency(booking.fee)}</Body>
                    <Badge variant={STATUS_CONFIG[booking.status].variant} className="mt-2">{STATUS_CONFIG[booking.status].label}</Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Section>
      ),
    },
    {
      id: "profile",
      label: "Profile",
      icon: <Settings className="size-4" />,
      content: (
        <Section>
          <SectionHeader title="Artist Profile" description="Manage your public profile" />
          <Card className="p-6 mt-4">
            <div className="flex items-center gap-6 mb-6">
              <div className="size-24 bg-primary rounded-avatar flex items-center justify-center">
                <Music className="size-12 text-white" />
              </div>
              <div>
                <Body className="font-weight-bold font-weight-bold">Artist Name</Body>
                <Body className="text-on-dark-muted">Genre: Pop, Electronic</Body>
                <Badge variant="success" className="mt-2">Verified</Badge>
              </div>
            </div>
            <Button variant="outline">Edit Profile</Button>
          </Card>
        </Section>
      ),
    },
  ];

  return (
    <DetailPage
      header={{
        kicker: "Portal",
        title: "Artist Dashboard",
        description: "Manage your bookings and profile",
      }}
      loading={isLoading}
      error={error instanceof Error ? error : null}
      onRetry={refetch}
      tabs={tabs}
    />
  );
}
