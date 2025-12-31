"use client";

/**
 * Place Detail Page
 * 
 * SSOT-compliant: Uses entity registry for status colors.
 */

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Pencil, MapPin, Calendar, FileText, Trash2,
} from "lucide-react";
import { 
  useAuthContext, 
  ATLVS_ADMIN_ROLES,
  PLACES_STATUS_COLORS,
} from "@ghxstship/config";
import {
  Badge, Body, Button, Card, DetailPage, Grid, StatCard, Section, SectionHeader, ConfirmDialog, useToast, Box,
  type DetailPageTab,
} from "@ghxstship/ui";
import { usePlaceQuery, useDeletePlace } from "@/hooks/usePlacesQuery";

const STATUS_COLORS = PLACES_STATUS_COLORS;

const TYPE_LABELS: Record<string, string> = {
  venue: "Venue",
  space: "Space",
  warehouse: "Warehouse",
  stage: "Stage",
  zone: "Zone",
  room: "Room",
  site: "Site",
  office: "Office",
  other: "Other",
  all: "All",
};

export default function PlaceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const placeId = params?.id as string;
  const toast = useToast();

  const { hasRole } = useAuthContext();
  const canEdit = ATLVS_ADMIN_ROLES.some((role) => hasRole(role));

  const { data: place, isLoading, error, refetch } = usePlaceQuery(placeId);
  const deleteMutation = useDeletePlace();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const handleDelete = async () => {
    if (!place) return;
    try {
      await deleteMutation.mutateAsync(place.id);
      toast.success("Place Deleted", `${place.name} has been deleted.`);
      router.push("/places");
    } catch (err) {
      toast.error("Failed to Delete", err instanceof Error ? err.message : "An error occurred",);
    }
  };

  // Define tabs for the detail page
  const tabs: DetailPageTab[] = [
    {
      id: "overview",
      label: "Overview",
      content: place ? (
        <>
          {/* Stats */}
          <Grid cols={4} gap={4} className="grid-cols-2 lg:grid-cols-4 mb-6">
            <StatCard label="Type" value={TYPE_LABELS[place.place_type] || place.place_type} />
            <StatCard label="Capacity" value={place.capacity?.toString() || "N/A"} />
            <StatCard label="Square Footage" value={place.square_footage ? `${place.square_footage.toLocaleString()} sq ft` : "N/A"} />
            <StatCard label="Timezone" value={place.timezone || "N/A"} />
          </Grid>

          {/* Place Details */}
          <Section border className="mb-6">
            <SectionHeader title="Place Details" />
            <Grid cols={2} gap={4} className="grid-cols-1 md:grid-cols-2">
              <Card inverted className="p-4">
                <Body size="xs" className="text-on-dark-muted mb-1">Code</Body>
                <Body className="text-white">{place.code || "Not assigned"}</Body>
              </Card>
              <Card inverted className="p-4">
                <Body size="xs" className="text-on-dark-muted mb-1">Status</Body>
                <Body className="text-white">{place.status}</Body>
              </Card>
              <Card inverted className="p-4">
                <Body size="xs" className="text-on-dark-muted mb-1">Capacity</Body>
                <Body className="text-white">{place.capacity?.toString() || "Not specified"}</Body>
              </Card>
              <Card inverted className="p-4">
                <Body size="xs" className="text-on-dark-muted mb-1">Square Footage</Body>
                <Body className="text-white">{place.square_footage ? `${place.square_footage.toLocaleString()} sq ft` : "Not specified"}</Body>
              </Card>
            </Grid>
          </Section>

          {/* Location Coordinates */}
          {(place.latitude || place.longitude) && (
            <Section border className="mb-6">
              <SectionHeader title="Location Coordinates" />
              <Grid cols={2} gap={4} className="grid-cols-1 md:grid-cols-2">
                <Card inverted className="p-4">
                  <Body size="xs" className="text-on-dark-muted mb-1">Latitude</Body>
                  <Body className="text-white">{place.latitude?.toString() || "Not set"}</Body>
                </Card>
                <Card inverted className="p-4">
                  <Body size="xs" className="text-on-dark-muted mb-1">Longitude</Body>
                  <Body className="text-white">{place.longitude?.toString() || "Not set"}</Body>
                </Card>
              </Grid>
            </Section>
          )}

          {/* Parent Location */}
          {place.parent_place && (
            <Section border className="mb-6">
              <SectionHeader title="Parent Location" />
              <Card inverted className="p-4">
                <Body size="xs" className="text-on-dark-muted mb-1">Parent Place</Body>
                <Body className="text-white">{place.parent_place.name}</Body>
              </Card>
            </Section>
          )}

          {/* Tags */}
          {place.tags && place.tags.length > 0 && (
            <Section border className="mb-6">
              <SectionHeader title="Tags" />
              <Box className="flex flex-wrap gap-2">
                {place.tags.map((tag: string, index: number) => (
                  <Badge key={index} variant="outline">{tag}</Badge>
                ))}
              </Box>
            </Section>
          )}

          {/* Description */}
          {place.description && (
            <Section border className="mb-6">
              <SectionHeader title="Description" />
              <Card inverted className="p-4">
                <Body className="text-white whitespace-pre-wrap">{place.description}</Body>
              </Card>
            </Section>
          )}

          {/* Notes */}
          {place.notes && (
            <Section border>
              <SectionHeader title="Notes" />
              <Card inverted className="p-4">
                <Body className="text-white whitespace-pre-wrap">{place.notes}</Body>
              </Card>
            </Section>
          )}
        </>
      ) : null,
    },
    {
      id: "events",
      label: "Events",
      icon: <Calendar className="size-4" />,
      content: (
        <Section border>
          <SectionHeader title="Events at this Place" />
          <Card inverted className="p-6">
            <Body className="text-on-dark-muted">Events hosted at this location will be displayed here.</Body>
          </Card>
        </Section>
      ),
    },
    {
      id: "map",
      label: "Map",
      icon: <MapPin className="size-4" />,
      content: (
        <Section border>
          <SectionHeader title="Location Map" />
          <Card inverted className="p-6">
            <Body className="text-on-dark-muted">Interactive map will be displayed here.</Body>
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
          <SectionHeader title="Documents" />
          <Card inverted className="p-6">
            <Body className="text-on-dark-muted">Documents will be displayed here.</Body>
          </Card>
        </Section>
      ),
    },
  ];

  return (
    <>
      <DetailPage
        header={{
          kicker: place?.place_type ? TYPE_LABELS[place.place_type] : "Place",
          title: place?.name || "Place Details",
          description: place?.code || undefined,
          badge: place?.status ? (
            <Badge variant={STATUS_COLORS[place.status] || "outline"}>
              {place.status}
            </Badge>
          ) : undefined,
        }}
        backButton={{ label: "Back to Places", href: "/places" }}
        loading={isLoading}
        error={error instanceof Error ? error : null}
        onRetry={refetch}
        notFound={!isLoading && !error && !place}
        notFoundMessage="The place you're looking for doesn't exist or has been removed."
        tabs={tabs}
        actions={
          canEdit ? (
            <>
              <Button
                variant="solid"
                onClick={() => router.push(`/places/${placeId}/edit`)}
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
        title="Delete Place"
        message={`Are you sure you want to delete "${place?.name}"? This action cannot be undone.`}
        variant="danger"
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirmOpen(false)}
      />
    </>
  );
}
