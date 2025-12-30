"use client";

/**
 * Venue Detail Page
 * Shows detailed information about a specific venue
 * Uses normalized DetailPage template from @ghxstship/ui
 */

import { useParams, useRouter } from "next/navigation";
import {
  Heart,
  MapPin,
  Calendar,
  Users,
  HelpCircle,
} from "lucide-react";
import {
  Badge,
  Body,
  Button,
  Card,
  DetailPage,
  Grid,
  StatCard,
  Section,
  SectionHeader,
  ProjectCard,
  type DetailPageTab,
} from "@ghxstship/ui";
import Image from "next/image";
import { useVenueDetailData } from "@/hooks/useVenueDetail";

export default function VenuePage() {
  const params = useParams();
  const router = useRouter();
  const venueId = params.id as string;

  const {
    venue,
    events,
    isFollowing,
    isLoading,
    toggleFollow,
    isToggling: followLoading,
    error,
  } = useVenueDetailData(venueId);

  const handleFollow = async () => {
    await toggleFollow(!isFollowing);
  };

  const handleGetDirections = () => {
    if (venue) {
      window.open(
        `https://maps.google.com/?q=${encodeURIComponent(venue.address + ", " + venue.city + ", " + venue.state)}`,
        "_blank"
      );
    }
  };

  // Define tabs for the detail page
  const tabs: DetailPageTab[] = [
    {
      id: "overview",
      label: "Overview",
      content: venue ? (
        <>
          {/* Hero Image */}
          {venue.image && (
            <div className="relative h-64 md:h-80 rounded-card overflow-hidden mb-6">
              <Image
                src={venue.image}
                alt={venue.name}
                fill
                className="object-cover"
              />
            </div>
          )}

          {/* Stats */}
          <Grid cols={3} gap={4} className="grid-cols-1 md:grid-cols-3 mb-6">
            <StatCard label="Capacity" value={venue.capacity?.toLocaleString() || "N/A"} />
            <StatCard label="Upcoming Events" value={events.length.toString()} />
            <StatCard label="Location" value={`${venue.city}, ${venue.state}`} />
          </Grid>

          {/* About */}
          {venue.description && (
            <Section border className="mb-6">
              <SectionHeader title="About" />
              <Card inverted className="p-4">
                <Body className="text-white">{venue.description}</Body>
              </Card>
            </Section>
          )}

          {/* Address */}
          <Section border>
            <SectionHeader title="Location" />
            <Card inverted className="p-4">
              <Body className="text-white">
                {venue.address}, {venue.city}, {venue.state}
              </Body>
              <Button
                variant="outline"
                inverted
                className="mt-4"
                onClick={handleGetDirections}
                icon={<MapPin className="size-4" />}
                iconPosition="left"
              >
                Get Directions
              </Button>
            </Card>
          </Section>
        </>
      ) : null,
    },
    {
      id: "events",
      label: "Events",
      icon: <Calendar className="size-4" />,
      content: (
        <Section border>
          <SectionHeader title="Upcoming Events" />
          {events.length > 0 ? (
            <Grid cols={2} gap={4} className="grid-cols-1 md:grid-cols-2">
              {events.map((event: { id: string; title: string; date: string; image?: string }) => (
                <ProjectCard
                  key={event.id}
                  title={event.title}
                  image={event.image || ""}
                  metadata={event.date}
                  onClick={() => router.push(`/events/${event.id}`)}
                />
              ))}
            </Grid>
          ) : (
            <Card inverted className="p-6">
              <Body className="text-on-dark-muted">No upcoming events at this venue.</Body>
            </Card>
          )}
        </Section>
      ),
    },
    {
      id: "amenities",
      label: "Amenities",
      icon: <Users className="size-4" />,
      content: venue?.amenities && venue.amenities.length > 0 ? (
        <Section border>
          <SectionHeader title="Venue Amenities" />
          <Grid cols={2} gap={4} className="grid-cols-1 md:grid-cols-2">
            {venue.amenities.map((amenity: string, index: number) => (
              <Card key={index} inverted className="p-4">
                <Body className="text-white">{amenity}</Body>
              </Card>
            ))}
          </Grid>
        </Section>
      ) : (
        <Section border>
          <SectionHeader title="Venue Amenities" />
          <Card inverted className="p-6">
            <Body className="text-on-dark-muted">No amenities information available.</Body>
          </Card>
        </Section>
      ),
    },
    {
      id: "info",
      label: "Info",
      icon: <HelpCircle className="size-4" />,
      content: (
        <>
          {/* Accessibility */}
          {venue?.accessibility_info && (
            <Section border className="mb-6">
              <SectionHeader title="Accessibility" />
              <Card inverted className="p-4">
                <Body className="text-white">{venue.accessibility_info}</Body>
              </Card>
            </Section>
          )}

          {/* Parking */}
          {venue?.parking_info && (
            <Section border className="mb-6">
              <SectionHeader title="Parking" />
              <Card inverted className="p-4">
                <Body className="text-white">{venue.parking_info}</Body>
              </Card>
            </Section>
          )}

          {/* Public Transit */}
          {venue?.public_transit && (
            <Section border className="mb-6">
              <SectionHeader title="Public Transit" />
              <Card inverted className="p-4">
                <Body className="text-white">{venue.public_transit}</Body>
              </Card>
            </Section>
          )}

          {/* Support */}
          <Section border>
            <SectionHeader title="Need Help?" />
            <Card inverted className="p-4">
              <Body className="text-on-dark-secondary mb-4">
                Have questions about this venue? Contact our support team.
              </Body>
              <Button variant="outline" inverted onClick={() => router.push("/help")}>
                Contact Support
              </Button>
            </Card>
          </Section>
        </>
      ),
    },
  ];

  return (
    <DetailPage
      header={{
        kicker: "Venue",
        title: venue?.name?.toUpperCase() || "Venue Details",
        description: venue ? `${venue.address}, ${venue.city}, ${venue.state}` : undefined,
        badge: venue?.capacity ? (
          <Badge variant="outline">Capacity: {venue.capacity.toLocaleString()}</Badge>
        ) : undefined,
      }}
      backButton={{ label: "Back to Venues", href: "/venues" }}
      loading={isLoading}
      error={error instanceof Error ? error : null}
      notFound={!isLoading && !error && !venue}
      notFoundMessage="The venue you're looking for doesn't exist or has been removed."
      tabs={tabs}
      actions={
        <>
          <Button
            variant={isFollowing ? "outline" : "solid"}
            onClick={handleFollow}
            disabled={followLoading}
            icon={<Heart className={`size-4 ${isFollowing ? "fill-current" : ""}`} />}
            iconPosition="left"
          >
            {followLoading ? "Loading..." : isFollowing ? "Following" : "Follow"}
          </Button>
          <Button
            variant="outline"
            inverted
            onClick={handleGetDirections}
            icon={<MapPin className="size-4" />}
            iconPosition="left"
          >
            Directions
          </Button>
        </>
      }
    />
  );
}
