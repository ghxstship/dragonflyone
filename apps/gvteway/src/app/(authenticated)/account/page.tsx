"use client";

/**
 * GVTEWAY Account Dashboard Page
 * User account overview with tickets, orders, and preferences
 * Uses DetailPage template for consistent layout
 */

import { useRouter } from "next/navigation";
import {
  Badge,
  Body,
  Button,
  Card,
  Grid,
  StatCard,
  DetailPage,
  Section,
  SectionHeader,
Box} from "@ghxstship/ui";
import {
  Ticket,
  Calendar,
  Heart,
  Settings,
  ChevronRight,
  User,
  ShoppingBag,
} from "lucide-react";
import Link from "next/link";
import { useOrders } from "@/hooks/useOrders";

export default function AccountPage() {
  const router = useRouter();
  const { data: ordersData, isLoading, error, refetch } = useOrders();

  const upcomingEvents = (ordersData || [])
    .filter((order) => order.status === "confirmed" && order.gvteway_events)
    .map((order) => ({
      id: order.id,
      name: order.gvteway_events?.title || "Event",
      date: order.gvteway_events?.event_date
        ? new Date(order.gvteway_events.event_date).toLocaleDateString()
        : "TBD",
      venue: "Venue TBD",
      ticketCount: order.ticket_count || 1,
    }))
    .slice(0, 3);

  const tabs = [
    {
      id: "overview",
      label: "Overview",
      icon: <User className="size-4" />,
      content: (
        <>
          <Grid cols={4} gap={4} className="grid-cols-2 lg:grid-cols-4 mb-6">
            <StatCard label="Upcoming Events" value={upcomingEvents.length.toString()} />
            <StatCard label="Total Tickets" value={upcomingEvents.reduce((sum, e) => sum + e.ticketCount, 0).toString()} />
            <StatCard label="Saved Events" value="5" />
            <StatCard label="Rewards Points" value="1,250" />
          </Grid>

          <Grid cols={2} gap={6} className="grid-cols-1 lg:grid-cols-2">
            <Section border>
              <SectionHeader title="Upcoming Events" />
              {upcomingEvents.length === 0 ? (
                <Body className="text-on-dark-muted py-4">No upcoming events. Browse events to find your next experience!</Body>
              ) : (
                <Box className="space-y-3">
                  {upcomingEvents.map((event) => (
                    <Card key={event.id} className="p-4">
                      <Box className="flex items-center justify-between">
                        <Box>
                          <Body className="font-weight-medium text-white">{event.name}</Body>
                          <Body size="sm" className="text-on-dark-muted">{event.date} - {event.venue}</Body>
                        </Box>
                        <Box className="flex items-center gap-2">
                          <Badge variant="info">{event.ticketCount} tickets</Badge>
                          <Button variant="outline" size="sm" onClick={() => router.push(`/account/tickets`)}>View</Button>
                        </Box>
                      </Box>
                    </Card>
                  ))}
                </Box>
              )}
              <Link href="/account/tickets" className="block mt-4">
                <Button variant="ghost" size="sm" icon={<ChevronRight className="size-4" />} iconPosition="right">
                  View All Tickets
                </Button>
              </Link>
            </Section>

            <Box className="space-y-6">
              <Section border>
                <SectionHeader title="Quick Actions" />
                <Grid cols={2} gap={3} className="grid-cols-1 sm:grid-cols-2">
                  <Button variant="outline" className="w-full justify-start" icon={<Ticket className="size-4" />} iconPosition="left" onClick={() => router.push("/account/tickets")}>
                    My Tickets
                  </Button>
                  <Button variant="outline" className="w-full justify-start" icon={<ShoppingBag className="size-4" />} iconPosition="left" onClick={() => router.push("/account/orders")}>
                    Order History
                  </Button>
                  <Button variant="outline" className="w-full justify-start" icon={<Settings className="size-4" />} iconPosition="left" onClick={() => router.push("/settings")}>
                    Settings
                  </Button>
                  <Button variant="outline" className="w-full justify-start" icon={<Heart className="size-4" />} iconPosition="left" onClick={() => router.push("/saved")}>
                    Saved Events
                  </Button>
                </Grid>
              </Section>

              <Section border>
                <SectionHeader title="Recent Activity" />
                <Box className="space-y-2">
                  <Box className="flex items-center justify-between">
                    <Body className="text-white">Purchased 2 tickets</Body>
                    <Body size="sm" className="text-on-dark-muted">2 days ago</Body>
                  </Box>
                  <Box className="flex items-center justify-between">
                    <Body className="text-white">Saved New Years Eve Concert</Body>
                    <Body size="sm" className="text-on-dark-muted">5 days ago</Body>
                  </Box>
                  <Box className="flex items-center justify-between">
                    <Body className="text-white">Updated payment method</Body>
                    <Body size="sm" className="text-on-dark-muted">1 week ago</Body>
                  </Box>
                </Box>
              </Section>
            </Box>
          </Grid>
        </>
      ),
    },
    {
      id: "tickets",
      label: "My Tickets",
      icon: <Ticket className="size-4" />,
      content: (
        <Section>
          <SectionHeader title="Your Tickets" description="View and manage your event tickets" />
          <Box className="text-center py-12">
            <Ticket className="size-12 text-on-dark-disabled mx-auto mb-4" />
            <Body className="text-on-dark-muted mb-4">View all your tickets in one place</Body>
            <Button variant="solid" onClick={() => router.push("/account/tickets")}>
              View All Tickets
            </Button>
          </Box>
        </Section>
      ),
    },
    {
      id: "orders",
      label: "Orders",
      icon: <Calendar className="size-4" />,
      content: (
        <Section>
          <SectionHeader title="Order History" description="View your past orders and purchases" />
          <Box className="text-center py-12">
            <ShoppingBag className="size-12 text-on-dark-disabled mx-auto mb-4" />
            <Body className="text-on-dark-muted mb-4">View your complete order history</Body>
            <Button variant="solid" onClick={() => router.push("/account/orders")}>
              View All Orders
            </Button>
          </Box>
        </Section>
      ),
    },
  ];

  return (
    <DetailPage
      header={{
        kicker: "Account",
        title: "My Dashboard",
        description: "Manage your tickets, orders, and preferences",
      }}
      loading={isLoading}
      error={error instanceof Error ? error : null}
      onRetry={refetch}
      tabs={tabs}
    />
  );
}
