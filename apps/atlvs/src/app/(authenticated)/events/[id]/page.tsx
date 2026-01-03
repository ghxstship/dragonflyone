"use client";

/**
 * Event Detail Page
 * 
 * SSOT-compliant: Uses entity registry for status colors.
 */

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Pencil, Users, ExternalLink, Trash2, FileText, Clock,
} from "lucide-react";
import { 
  useAuthContext, 
  ATLVS_ADMIN_ROLES,
  EVENT_STATUS_COLORS,
} from "@ghxstship/config";
import {
  Badge, Body, Button, Card, DetailPage, Grid, StatCard, Section, SectionHeader, ConfirmDialog, useToast, Box,
  type DetailPageTab,
} from "@ghxstship/ui";
import { useEvent, useDeleteEvent } from "@/hooks/useEvents";

const STATUS_COLORS = EVENT_STATUS_COLORS;

const EVENT_TYPE_LABELS: Record<string, string> = {
  concert: "Concert",
  festival: "Festival",
  corporate: "Corporate Event",
  theater: "Theater",
  sports: "Sports Event",
  conference: "Conference",
  other: "Other",
};

export default function EventDetailPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params?.id as string;
  const toast = useToast();

  const { hasRole } = useAuthContext();
  const canEdit = ATLVS_ADMIN_ROLES.some((role) => hasRole(role));

  const { data: event, isLoading, error, refetch } = useEvent(eventId);
  const deleteMutation = useDeleteEvent();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return "TBD";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const handleDelete = async () => {
    if (!event) return;
    try {
      await deleteMutation.mutateAsync(event.id);
      toast.success("Event Deleted", `${event.name} has been deleted.`);
      router.push("/events");
    } catch (err) {
      toast.error("Failed to Delete", err instanceof Error ? err.message : "An error occurred",);
    }
  };

  const ticketsSold = event?.tickets_sold || 0;
  const capacity = event?.capacity || 0;
  const occupancyRate = capacity > 0 ? Math.round((ticketsSold / capacity) * 100) : 0;

  // Define tabs for the detail page
  const tabs: DetailPageTab[] = [
    {
      id: "overview",
      label: "Overview",
      content: event ? (
        <>
          {/* Stats */}
          <Grid cols={4} gap={4} className="grid-cols-2 lg:grid-cols-4 mb-6">
            <StatCard label="Date" value={formatDate(event.start_date)} />
            <StatCard label="Capacity" value={capacity > 0 ? capacity.toLocaleString() : "Unlimited"} />
            <StatCard label="Tickets Sold" value={ticketsSold.toLocaleString()} />
            <StatCard label="Occupancy" value={capacity > 0 ? `${occupancyRate}%` : "N/A"} />
          </Grid>

          {/* Event Details */}
          <Section border className="mb-6">
            <SectionHeader title="Event Details" />
            <Grid cols={2} gap={4} className="grid-cols-1 md:grid-cols-2">
              <Card inverted className="p-4">
                <Body size="xs" className="text-text-muted mb-1">Date & Time</Body>
                <Body className="text-white">
                  {formatDate(event.start_date)}
                  {event.start_time && ` at ${event.start_time}`}
                </Body>
              </Card>
              <Card inverted className="p-4">
                <Body size="xs" className="text-text-muted mb-1">End</Body>
                <Body className="text-white">
                  {event.end_date ? formatDate(event.end_date) : formatDate(event.start_date)}
                  {event.end_time && ` at ${event.end_time}`}
                </Body>
              </Card>
              <Card inverted className="p-4">
                <Body size="xs" className="text-text-muted mb-1">Category</Body>
                <Body className="text-white">{event.category || "Not specified"}</Body>
              </Card>
              <Card inverted className="p-4">
                <Body size="xs" className="text-text-muted mb-1">Price Range</Body>
                <Body className="text-white">
                  {event.min_price !== undefined && event.max_price !== undefined
                    ? `${formatCurrency(event.min_price)} - ${formatCurrency(event.max_price)}`
                    : event.min_price !== undefined
                    ? `From ${formatCurrency(event.min_price)}`
                    : "Not specified"}
                </Body>
              </Card>
            </Grid>
          </Section>

          {/* Venue Information */}
          <Section border className="mb-6">
            <SectionHeader title="Venue Information" />
            <Grid cols={2} gap={4} className="grid-cols-1 md:grid-cols-2">
              <Card inverted className="p-4">
                <Body size="xs" className="text-text-muted mb-1">Venue</Body>
                <Body className="text-white">{event.venue_name || "TBD"}</Body>
              </Card>
              <Card inverted className="p-4">
                <Body size="xs" className="text-text-muted mb-1">Location</Body>
                <Body className="text-white">
                  {[event.venue_city, event.venue_state, event.venue_country]
                    .filter(Boolean)
                    .join(", ") || "Not specified"}
                </Body>
              </Card>
              {event.venue_address && (
                <Card inverted className="p-4 md:col-span-2">
                  <Body size="xs" className="text-text-muted mb-1">Address</Body>
                  <Body className="text-white">{event.venue_address}</Body>
                </Card>
              )}
            </Grid>
          </Section>

          {/* Description */}
          {event.description && (
            <Section border className="mb-6">
              <SectionHeader title="Description" />
              <Card inverted className="p-4">
                <Body className="text-white whitespace-pre-wrap">{event.description}</Body>
              </Card>
            </Section>
          )}

          {/* Tags */}
          {event.tags && event.tags.length > 0 && (
            <Section border className="mb-6">
              <SectionHeader title="Tags" />
              <Box className="flex flex-wrap gap-2">
                {event.tags.map((tag: string, i: number) => (
                  <Badge key={i} variant="outline">{tag}</Badge>
                ))}
              </Box>
            </Section>
          )}

          {/* Production Link */}
          <Section border>
            <SectionHeader title="Production" />
            <Card inverted className="p-4">
              <Body className="text-text-muted mb-4">
                Access the full production context including schedules, crew assignments, and run-of-show.
              </Body>
              <Button
                variant="outline"
                inverted
                onClick={() => router.push(`/p/${eventId}`)}
                icon={<ExternalLink className="size-4" />}
                iconPosition="left"
              >
                Go to Production
              </Button>
            </Card>
          </Section>
        </>
      ) : null,
    },
    {
      id: "schedule",
      label: "Schedule",
      icon: <Clock className="size-4" />,
      content: (
        <Section border>
          <SectionHeader title="Event Schedule" />
          <Card inverted className="p-6">
            <Body className="text-text-muted">Schedule details will be displayed here.</Body>
          </Card>
        </Section>
      ),
    },
    {
      id: "team",
      label: "Team",
      icon: <Users className="size-4" />,
      content: (
        <Section border>
          <SectionHeader title="Event Team" />
          <Card inverted className="p-6">
            <Body className="text-text-muted">Team assignments will be displayed here.</Body>
          </Card>
        </Section>
      ),
    },
    {
      id: "documents",
      label: "Documents",
      icon: <FileText className="size-4" />,
      content: (
        <Section border>
          <SectionHeader title="Event Documents" />
          <Card inverted className="p-6">
            <Body className="text-text-muted">Documents will be displayed here.</Body>
          </Card>
        </Section>
      ),
    },
  ];

  return (
    <>
      <DetailPage
        header={{
          kicker: event?.event_type ? EVENT_TYPE_LABELS[event.event_type] : "Event",
          title: event?.name || "Event Details",
          description: event?.venue_name || undefined,
          badge: event?.status ? (
            <Badge variant={STATUS_COLORS[event.status] || "outline"}>
              {event.status.replace("_", " ")}
            </Badge>
          ) : undefined,
        }}
        backButton={{ label: "Back to Events", href: "/events" }}
        loading={isLoading}
        error={error instanceof Error ? error : null}
        onRetry={refetch}
        notFound={!isLoading && !error && !event}
        notFoundMessage="The event you're looking for doesn't exist or has been removed."
        tabs={tabs}
        actions={
          canEdit ? (
            <>
              <Button
                variant="outline"
                inverted
                onClick={() => router.push(`/p/${eventId}`)}
                icon={<ExternalLink className="size-4" />}
                iconPosition="left"
              >
                Production
              </Button>
              <Button
                variant="solid"
                onClick={() => router.push(`/events/${eventId}/edit`)}
                icon={<Pencil className="size-4" />}
                iconPosition="left"
              >
                Edit
              </Button>
              <Button
                variant="outline"
                inverted
                onClick={() => setDeleteConfirmOpen(true)}
                icon={<Trash2 className="size-4" />}
                iconPosition="left"
                className="border-error text-error hover:bg-error hover:text-white"
              >
                Delete
              </Button>
            </>
          ) : undefined
        }
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Delete Event"
        message={`Are you sure you want to delete "${event?.name}"? This action cannot be undone.`}
        variant="danger"
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirmOpen(false)}
      />
    </>
  );
}
