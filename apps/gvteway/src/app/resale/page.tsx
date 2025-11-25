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
  Input,
  Field,
  useNotifications,
} from "@ghxstship/ui";

interface ResaleListing {
  id: string;
  ticket_id: string;
  event_id: string;
  event_name: string;
  event_date: string;
  venue_name: string;
  ticket_type: string;
  section?: string;
  row?: string;
  seat?: string;
  original_price: number;
  asking_price: number;
  seller_id: string;
  seller_name: string;
  status: string;
  listed_at: string;
  expires_at?: string;
}

interface ResaleSummary {
  total_listings: number;
  my_listings: number;
  total_value: number;
  sold_count: number;
  pending_count: number;
}

export default function ResalePage() {
  const router = useRouter();
  const { addNotification } = useNotifications();
  const [listings, setListings] = useState<ResaleListing[]>([]);
  const [myListings, setMyListings] = useState<ResaleListing[]>([]);
  const [summary, setSummary] = useState<ResaleSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"browse" | "my-listings">("browse");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchListings = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);

      const response = await fetch(`/api/resale?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch listings");
      
      const data = await response.json();
      setListings(data.listings || []);
      setMyListings(data.my_listings || []);
      setSummary(data.summary || null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusVariant = (status: string): "solid" | "outline" | "ghost" => {
    switch (status?.toLowerCase()) {
      case "sold":
        return "solid";
      case "active":
      case "listed":
        return "outline";
      case "expired":
      case "cancelled":
        return "ghost";
      default:
        return "ghost";
    }
  };

  const handleBuyTicket = async (listingId: string) => {
    router.push(`/checkout?listing=${listingId}`);
  };

  const handleCancelListing = async (listingId: string) => {
    try {
      const response = await fetch(`/api/resale/${listingId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        addNotification({ type: "success", title: "Success", message: "Listing cancelled" });
        fetchListings();
      }
    } catch (err) {
      addNotification({ type: "error", title: "Error", message: "Failed to cancel listing" });
    }
  };

  if (loading) {
    return (
      <Section className="relative min-h-screen bg-black text-white">
        <Navigation />
        <Container className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner size="lg" text="Loading resale marketplace..." />
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
            title="Error Loading Marketplace"
            description={error}
            action={{ label: "Retry", onClick: fetchListings }}
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
            <H1>Ticket Resale</H1>
            <Body className="text-grey-400">
              Buy and sell tickets safely through our verified marketplace
            </Body>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard
              value={summary?.total_listings || 0}
              label="Active Listings"
              className="bg-black text-white border-grey-800"
            />
            <StatCard
              value={summary?.my_listings || 0}
              label="My Listings"
              className="bg-black text-white border-grey-800"
            />
            <StatCard
              value={summary?.sold_count || 0}
              label="Sold This Month"
              className="bg-black text-white border-grey-800"
            />
            <StatCard
              value={formatCurrency(summary?.total_value || 0)}
              label="Market Value"
              className="bg-black text-white border-grey-800"
            />
          </Grid>

          <Card className="p-6 bg-black border-grey-800">
            <Stack gap={4}>
              <H2>Seller Protection</H2>
              <Grid cols={3} gap={4}>
                <Stack gap={2}>
                  <Body className="text-2xl">🔒</Body>
                  <Body className="font-medium">Secure Transfers</Body>
                  <Body className="text-grey-400 text-sm">
                    Tickets are only transferred after payment is confirmed
                  </Body>
                </Stack>
                <Stack gap={2}>
                  <Body className="text-2xl">💰</Body>
                  <Body className="font-medium">Guaranteed Payment</Body>
                  <Body className="text-grey-400 text-sm">
                    Get paid within 5 business days of the event
                  </Body>
                </Stack>
                <Stack gap={2}>
                  <Body className="text-2xl">✓</Body>
                  <Body className="font-medium">Verified Tickets</Body>
                  <Body className="text-grey-400 text-sm">
                    All tickets are verified authentic before listing
                  </Body>
                </Stack>
              </Grid>
            </Stack>
          </Card>

          <Stack gap={4} direction="horizontal">
            <Button 
              variant={activeTab === "browse" ? "solid" : "ghost"}
              onClick={() => setActiveTab("browse")}
            >
              Browse Listings
            </Button>
            <Button 
              variant={activeTab === "my-listings" ? "solid" : "ghost"}
              onClick={() => setActiveTab("my-listings")}
            >
              My Listings
            </Button>
          </Stack>

          {activeTab === "browse" && (
            <>
              <Field>
                <Input
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-black text-white border-grey-700"
                />
              </Field>

              {listings.length === 0 ? (
                <EmptyState
                  title="No Listings Found"
                  description="Check back later for available tickets"
                />
              ) : (
                <Table variant="bordered" className="bg-black">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Ticket Type</TableHead>
                      <TableHead>Section/Seat</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {listings.map((listing) => (
                      <TableRow key={listing.id} className="bg-black text-white hover:bg-grey-900">
                        <TableCell>
                          <Stack gap={1}>
                            <Body className="text-white font-medium">{listing.event_name}</Body>
                            <Body className="text-grey-500 text-sm">{listing.venue_name}</Body>
                          </Stack>
                        </TableCell>
                        <TableCell className="font-mono text-grey-400">
                          {formatDate(listing.event_date)}
                        </TableCell>
                        <TableCell className="text-grey-400">
                          {listing.ticket_type}
                        </TableCell>
                        <TableCell className="text-grey-400">
                          {listing.section ? `${listing.section} / Row ${listing.row} / Seat ${listing.seat}` : "GA"}
                        </TableCell>
                        <TableCell>
                          <Stack gap={1}>
                            <Body className="font-mono text-white font-bold">
                              {formatCurrency(listing.asking_price)}
                            </Body>
                            <Body className="text-grey-500 text-xs line-through">
                              {formatCurrency(listing.original_price)}
                            </Body>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleBuyTicket(listing.id)}
                          >
                            Buy Now
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </>
          )}

          {activeTab === "my-listings" && (
            <>
              {myListings.length === 0 ? (
                <EmptyState
                  title="No Active Listings"
                  description="List a ticket for resale"
                  action={{ label: "List a Ticket", onClick: () => router.push("/tickets") }}
                />
              ) : (
                <Table variant="bordered" className="bg-black">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event</TableHead>
                      <TableHead>Ticket Type</TableHead>
                      <TableHead>Asking Price</TableHead>
                      <TableHead>Listed</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {myListings.map((listing) => (
                      <TableRow key={listing.id} className="bg-black text-white hover:bg-grey-900">
                        <TableCell>
                          <Stack gap={1}>
                            <Body className="text-white font-medium">{listing.event_name}</Body>
                            <Body className="text-grey-500 text-sm">{formatDate(listing.event_date)}</Body>
                          </Stack>
                        </TableCell>
                        <TableCell className="text-grey-400">
                          {listing.ticket_type}
                        </TableCell>
                        <TableCell className="font-mono text-white">
                          {formatCurrency(listing.asking_price)}
                        </TableCell>
                        <TableCell className="font-mono text-grey-400">
                          {formatDate(listing.listed_at)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(listing.status)}>
                            {listing.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {listing.status === "active" && (
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => handleCancelListing(listing.id)}
                            >
                              Cancel
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </>
          )}

          <Stack gap={3} direction="horizontal">
            <Button variant="outlineWhite" onClick={() => router.push("/tickets")}>
              List a Ticket
            </Button>
            <Button variant="ghost" className="text-grey-400 hover:text-white" onClick={() => router.push('/resale/pricing-guide')}>
              Pricing Guide
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Section>
  );
}
