"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, Button, Body, Box, Grid, Badge, Spinner, EmptyState, RecordFormModal, type FormFieldConfig, useNotifications } from "@ghxstship/ui";
import { MapPin, Plus, Map, Layers, AlertCircle } from "lucide-react";
import { useVenues, useCreateVenue } from "../../../../hooks/useVenues";
import { useProduction } from "../../../../hooks/useProductions";
import { atlvsDemoProductions } from "../../../../data/atlvs";

interface Venue {
  id: string;
  name: string;
  type: string;
  capacity: number;
  status: string;
}

const demoVenues: Venue[] = [
  { id: "1", name: "Main Stage", type: "Stage", capacity: 5000, status: "confirmed" },
  { id: "2", name: "VIP Lounge", type: "Hospitality", capacity: 200, status: "confirmed" },
  { id: "3", name: "Backstage Area", type: "Operations", capacity: 100, status: "confirmed" },
  { id: "4", name: "Vendor Village", type: "Commercial", capacity: 1000, status: "pending" },
];

const venueFields: FormFieldConfig[] = [
  { name: 'name', label: 'Venue Name', type: 'text', required: true },
  { name: 'type', label: 'Type', type: 'select', required: true, options: [
    { value: 'Stage', label: 'Stage' },
    { value: 'Hospitality', label: 'Hospitality' },
    { value: 'Operations', label: 'Operations' },
    { value: 'Commercial', label: 'Commercial' },
  ]},
  { name: 'capacity', label: 'Capacity', type: 'number', required: true },
  { name: 'address', label: 'Address', type: 'text' },
];

export default function ProductionVenuesPage() {
  const params = useParams();
  const router = useRouter();
  const { addNotification } = useNotifications();
  const productionId = params?.productionId as string;
  
  const { data: apiProduction } = useProduction(productionId);
  const demoProduction = atlvsDemoProductions.find((p) => p.id === productionId);
  const productionName = apiProduction?.title || demoProduction?.name || "Production";

  const { data: apiVenues, isLoading, error, refetch } = useVenues({ productionId });
  const createVenueMutation = useCreateVenue();
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Use API data if available, otherwise demo data
  const venues: Venue[] = apiVenues && apiVenues.length > 0 
    ? apiVenues.map(v => ({
        id: v.id,
        name: v.name,
        type: v.venue_type || 'Stage',
        capacity: v.capacity || 0,
        status: v.status || 'pending',
      }))
    : demoVenues;

  const statusColors: Record<string, "success" | "warning" | "error" | "info" | "solid"> = {
    confirmed: "success", pending: "warning", cancelled: "error",
  };

  const handleCreateVenue = async (data: Record<string, unknown>) => {
    try {
      await createVenueMutation.mutateAsync({
        name: data.name as string,
        venue_type: (data.type as 'indoor' | 'outdoor' | 'hybrid') || 'indoor',
        capacity: data.capacity as number,
        address: data.address as string | undefined,
        production_id: productionId,
        status: 'prospective',
      });
      setCreateModalOpen(false);
      addNotification({
        type: 'success',
        title: 'Venue Created',
        message: `Venue "${data.name}" has been created.`,
      });
      refetch();
    } catch (err) {
      addNotification({
        type: 'error',
        title: 'Failed to Create Venue',
        message: err instanceof Error ? err.message : 'An unexpected error occurred',
      });
    }
  };

  if (isLoading) {
    return (
      <Stack className="flex min-h-[400px] items-center justify-center">
        <Spinner size="lg" />
        <Body className="text-on-dark-muted">Loading venues...</Body>
      </Stack>
    );
  }

  if (error && venues.length === 0) {
    return (
      <EmptyState
        icon={<AlertCircle size={48} />}
        title="Failed to load venues"
        description={error.message}
        action={{ label: "Retry", onClick: () => refetch() }}
      />
    );
  }

  return (
    <Stack gap={8}>
      <Stack gap={4}>
        <SectionHeader
          kicker={productionName}
          title="Venues"
          description="Manage locations, zones, and venue maps"
          colorScheme="on-dark"
        />
        <Stack direction="horizontal" gap={2}>
          <Button variant="solid" size="sm" onClick={() => setCreateModalOpen(true)}>
            <Plus size={16} className="mr-2" />
            Add Venue
          </Button>
          <Button variant="outline" size="sm" onClick={() => router.push(`/p/${productionId}/venues/zones`)}>
            <Layers size={16} className="mr-2" />
            Zones
          </Button>
          <Button variant="outline" size="sm" onClick={() => router.push(`/p/${productionId}/venues/maps`)}>
            <Map size={16} className="mr-2" />
            Maps
          </Button>
        </Stack>
      </Stack>

      <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
        {venues.map((venue) => (
          <Card key={venue.id} variant="elevated" inverted className="cursor-pointer transition-all hover:border-primary">
            <CardBody>
              <Stack gap={4}>
                <Stack direction="horizontal" gap={4} className="items-center justify-between">
                  <Stack direction="horizontal" gap={3} className="items-center">
                    <Box className="flex size-10 items-center justify-center rounded bg-ink-800">
                      <MapPin size={20} className="text-primary" />
                    </Box>
                    <Stack gap={1}>
                      <Body className="font-weight-bold text-white">{venue.name}</Body>
                      <Body size="sm" className=" text-on-dark-muted">{venue.type} · Capacity: {venue.capacity}</Body>
                    </Stack>
                  </Stack>
                  <Badge variant={statusColors[venue.status]}>{venue.status.toUpperCase()}</Badge>
                </Stack>
              </Stack>
            </CardBody>
          </Card>
        ))}
      </Grid>

      <RecordFormModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        mode="create"
        title="Add Venue"
        fields={venueFields}
        onSubmit={handleCreateVenue}
        size="md"
      />
    </Stack>
  );
}
