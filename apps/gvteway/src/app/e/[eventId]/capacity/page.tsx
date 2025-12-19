'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  H2,
  H3,
  Body,
  Card,
  Stack,
  Grid,
  Badge,
  Alert,
  Button,
  Input,
  Field,
  Kicker,
  Spinner,
} from '@ghxstship/ui';
import {
  Users,
  Ticket,
  TrendingUp,
  RefreshCw,
  Save,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import { useEvent, useUpdateEvent } from '@/hooks/useEvents';
import { useEventBoxOfficeData, type TicketTier } from '@/hooks/useEventOperations';

export default function EventCapacityPage() {
  const params = useParams();
  const eventId = params.eventId as string;

  const { data: event, isLoading: eventLoading, error: eventError } = useEvent(eventId);
  const { tiers, isLoading: boxOfficeLoading, refetch } = useEventBoxOfficeData(eventId);
  const updateMutation = useUpdateEvent();

  const [totalCapacity, setTotalCapacity] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (event?.capacity) {
      setTotalCapacity(event.capacity.toString());
    }
  }, [event]);

  const isLoading = eventLoading || boxOfficeLoading;

  // Calculate totals from ticket tiers
  const tierTotals = tiers?.reduce(
    (acc: { capacity: number; sold: number; available: number }, tier: TicketTier) => ({
      capacity: acc.capacity + tier.capacity,
      sold: acc.sold + tier.sold,
      available: acc.available + tier.available,
    }),
    { capacity: 0, sold: 0, available: 0 }
  ) || { capacity: 0, sold: 0, available: 0 };

  const utilizationPercentage = tierTotals.capacity > 0
    ? Math.round((tierTotals.sold / tierTotals.capacity) * 100)
    : 0;

  const handleUpdateCapacity = async () => {
    setLocalError(null);
    setSuccessMessage(null);

    const newCapacity = parseInt(totalCapacity);
    if (isNaN(newCapacity) || newCapacity < 0) {
      setLocalError('Please enter a valid capacity number');
      return;
    }

    if (newCapacity < tierTotals.sold) {
      setLocalError(`Capacity cannot be less than tickets already sold (${tierTotals.sold})`);
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: eventId,
        capacity: newCapacity,
      });
      setSuccessMessage('Event capacity updated successfully!');
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Failed to update capacity');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Spinner size="lg" className="mx-auto mb-4" />
          <Body className="text-muted">Loading capacity data...</Body>
        </div>
      </div>
    );
  }

  if (eventError) {
    return (
      <Alert variant="error">
        <Body>Failed to load event: {eventError instanceof Error ? eventError.message : 'Unknown error'}</Body>
      </Alert>
    );
  }

  return (
    <Stack gap={10}>
      <div className="flex items-center justify-between">
        <Stack gap={2}>
          <Kicker colorScheme="on-dark">Capacity Management</Kicker>
          <H2 size="lg" className="text-white">{event?.name || 'Event'} Capacity</H2>
          <Body className="text-on-dark-muted">Manage event capacity and ticket allocations</Body>
        </Stack>

        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {localError && (
        <Alert variant="error">
          {localError}
        </Alert>
      )}

      {successMessage && (
        <Alert variant="success">
          {successMessage}
        </Alert>
      )}

      {/* Overview Stats */}
      <Grid cols={4}>
        <Card className="p-6">
          <Stack gap={2}>
            <div className="flex items-center gap-2 text-primary">
              <Users className="w-5 h-5" />
              <Body className="text-muted">Total Capacity</Body>
            </div>
            <H2 size="lg">{event?.capacity?.toLocaleString() || tierTotals.capacity.toLocaleString()}</H2>
          </Stack>
        </Card>

        <Card className="p-6">
          <Stack gap={2}>
            <div className="flex items-center gap-2 text-success">
              <Ticket className="w-5 h-5" />
              <Body className="text-muted">Tickets Sold</Body>
            </div>
            <H2 size="lg">{tierTotals.sold.toLocaleString()}</H2>
          </Stack>
        </Card>

        <Card className="p-6">
          <Stack gap={2}>
            <div className="flex items-center gap-2 text-warning">
              <AlertTriangle className="w-5 h-5" />
              <Body className="text-muted">Available</Body>
            </div>
            <H2 size="lg">{tierTotals.available.toLocaleString()}</H2>
          </Stack>
        </Card>

        <Card className="p-6">
          <Stack gap={2}>
            <div className="flex items-center gap-2 text-secondary">
              <TrendingUp className="w-5 h-5" />
              <Body className="text-muted">Utilization</Body>
            </div>
            <div className="flex items-center gap-2">
              <H2 size="lg">{utilizationPercentage}%</H2>
              <Badge variant={utilizationPercentage >= 90 ? 'error' : utilizationPercentage >= 70 ? 'warning' : 'success'}>
                {utilizationPercentage >= 90 ? 'Near Capacity' : utilizationPercentage >= 70 ? 'Filling Up' : 'Available'}
              </Badge>
            </div>
          </Stack>
        </Card>
      </Grid>

      {/* Update Total Capacity */}
      <Card className="p-6">
        <Stack gap={6}>
          <H3>Update Event Capacity</H3>
          <Body className="text-muted">
            Set the maximum number of attendees for this event. This cannot be less than tickets already sold.
          </Body>

          <Grid cols={2}>
            <Field label="Total Event Capacity">
              <Input
                type="number"
                value={totalCapacity}
                onChange={(e) => setTotalCapacity(e.target.value)}
                placeholder="Enter total capacity"
                min={tierTotals.sold}
              />
            </Field>

            <div className="flex items-end">
              <Button
                variant="solid"
                onClick={handleUpdateCapacity}
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Update Capacity
                  </>
                )}
              </Button>
            </div>
          </Grid>
        </Stack>
      </Card>

      {/* Capacity by Ticket Tier */}
      <Stack gap={4}>
        <H3>Capacity by Ticket Tier</H3>
        <Card className="p-6">
          <Stack gap={4}>
            {tiers && tiers.length > 0 ? (
              tiers.map((tier: TicketTier) => {
                const tierPercentage = tier.capacity > 0
                  ? Math.round((tier.sold / tier.capacity) * 100)
                  : 0;

                return (
                  <div key={tier.name} className="flex items-center justify-between p-4 border-2 rounded-card">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Body className="font-weight-semibold">{tier.name}</Body>
                        <Badge variant="outline">${tier.price}</Badge>
                        {tierPercentage >= 90 && (
                          <Badge variant="error">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Low Stock
                          </Badge>
                        )}
                      </div>
                      <div className="w-full bg-muted rounded-avatar h-3">
                        <div
                          className={`h-3 rounded-avatar transition-all ${
                            tierPercentage >= 90
                              ? 'bg-error'
                              : tierPercentage >= 70
                              ? 'bg-warning'
                              : 'bg-success'
                          }`}
                          style={{ width: `${tierPercentage}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-right ml-6 min-w-[180px]">
                      <div className="flex items-center justify-end gap-2">
                        <Body className="font-weight-semibold">{tier.sold}</Body>
                        <Body className="text-muted">/</Body>
                        <Body>{tier.capacity}</Body>
                        {tier.sold === tier.capacity && (
                          <CheckCircle className="w-4 h-4 text-success" />
                        )}
                      </div>
                      <Body className="text-muted text-body-sm">
                        {tier.available} remaining
                      </Body>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <Ticket className="w-12 h-12 mx-auto mb-4 text-muted" />
                <Body className="text-muted">No ticket tiers configured</Body>
                <Body className="text-muted text-body-sm">Add ticket types in the Ticketing section</Body>
              </div>
            )}
          </Stack>
        </Card>
      </Stack>

      {/* Capacity Alerts */}
      {utilizationPercentage >= 80 && (
        <Alert variant="warning">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            <Body className="font-weight-semibold">High Capacity Warning</Body>
          </div>
          <Body className="text-body-sm mt-1">
            This event is at {utilizationPercentage}% capacity. Consider increasing capacity or closing sales soon.
          </Body>
        </Alert>
      )}
    </Stack>
  );
}
