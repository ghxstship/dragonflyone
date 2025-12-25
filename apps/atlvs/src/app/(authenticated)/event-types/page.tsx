'use client';

import {
  Badge,
  Body,
  Box,
  Button,
  Card,
  Container,
  EmptyState,
  EnterprisePageHeader,
  Form,
  Grid,
  H3,
  Input,
  Label,
  MainContent,
  Modal,
  Skeleton,
  Stack,
  Text,
  Textarea,
} from '@ghxstship/ui';

import { useState } from 'react';
import { Calendar, Edit2, Trash2, Search, Clock, Users, CheckCircle, XCircle } from 'lucide-react';
import { useEventTypes, useCreateEventType, useUpdateEventType, useDeleteEventType } from '@/hooks/useEventTypes';

const COLOR_OPTIONS = [
  { value: '#3B82F6', label: 'Blue' },
  { value: '#10B981', label: 'Green' },
  { value: '#F59E0B', label: 'Amber' },
  { value: '#EF4444', label: 'Red' },
  { value: '#8B5CF6', label: 'Purple' },
  { value: '#EC4899', label: 'Pink' },
  { value: '#06B6D4', label: 'Cyan' },
  { value: '#F97316', label: 'Orange' },
];

interface FormData {
  name: string;
  description: string;
  color: string;
  default_duration_hours: number;
  requires_approval: boolean;
  min_lead_time_days: number;
  max_capacity: string;
  default_setup_time_minutes: number;
  default_teardown_time_minutes: number;
  is_active: boolean;
}

const initialFormData: FormData = {
  name: '',
  description: '',
  color: '#3B82F6',
  default_duration_hours: 4,
  requires_approval: false,
  min_lead_time_days: 0,
  max_capacity: '',
  default_setup_time_minutes: 60,
  default_teardown_time_minutes: 60,
  is_active: true,
};

export default function EventTypesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);

  const { data, isLoading, error } = useEventTypes(undefined, showInactive ? undefined : true);
  const createMutation = useCreateEventType();
  const updateMutation = useUpdateEventType();
  const deleteMutation = useDeleteEventType();

  const eventTypes = data?.event_types || [];
  const filteredEventTypes = eventTypes.filter((et) =>
    et.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    et.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenCreate = () => {
    setFormData(initialFormData);
    setEditingId(null);
    setShowModal(true);
  };

  const handleOpenEdit = (eventType: typeof eventTypes[0]) => {
    setFormData({
      name: eventType.name,
      description: eventType.description || '',
      color: eventType.color,
      default_duration_hours: eventType.default_duration_hours,
      requires_approval: eventType.requires_approval,
      min_lead_time_days: eventType.min_lead_time_days,
      max_capacity: eventType.max_capacity?.toString() || '',
      default_setup_time_minutes: eventType.default_setup_time_minutes,
      default_teardown_time_minutes: eventType.default_teardown_time_minutes,
      is_active: eventType.is_active,
    });
    setEditingId(eventType.id);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      name: formData.name,
      description: formData.description || undefined,
      color: formData.color,
      default_duration_hours: formData.default_duration_hours,
      requires_approval: formData.requires_approval,
      min_lead_time_days: formData.min_lead_time_days,
      max_capacity: formData.max_capacity ? parseInt(formData.max_capacity) : undefined,
      default_setup_time_minutes: formData.default_setup_time_minutes,
      default_teardown_time_minutes: formData.default_teardown_time_minutes,
      is_active: formData.is_active,
    };

    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, input: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      setShowModal(false);
      setFormData(initialFormData);
      setEditingId(null);
    } catch (err) {
      // Error handled by mutation
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Delete event type "${name}"? If it has bookings, it will be deactivated instead.`)) {
      await deleteMutation.mutateAsync(id);
    }
  };

  if (isLoading) {
    return (
      <>
        <EnterprisePageHeader title="Event Types" subtitle="Loading..." />
        <MainContent padding="lg">
          <Container>
            <Grid cols={3} gap={4}>
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-48" />)}
            </Grid>
          </Container>
        </MainContent>
      </>
    );
  }

  if (error) {
    return (
      <>
        <EnterprisePageHeader title="Event Types" subtitle="Error" />
        <MainContent padding="lg">
          <Container>
            <EmptyState
              title="Failed to load event types"
              description="Please try again."
              action={{ label: 'Retry', onClick: () => window.location.reload() }}
            />
          </Container>
        </MainContent>
      </>
    );
  }

  return (
    <>
      <EnterprisePageHeader
        title="Event Types"
        subtitle="Manage event categories and default settings"
        primaryAction={{ label: 'New Event Type', onClick: handleOpenCreate }}
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={6}>
            <Stack direction="horizontal" gap={4} className="items-center">
              <Box className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search event types..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </Box>
              <Label className="flex items-center gap-2 cursor-pointer">
                <Input
                  type="checkbox"
                  checked={showInactive}
                  onChange={(e) => setShowInactive(e.target.checked)}
                  className="w-4 h-4"
                />
                <Text size="sm" className="text-muted-foreground">Show inactive</Text>
              </Label>
            </Stack>

            {filteredEventTypes.length === 0 ? (
              <EmptyState
                title="No event types found"
                description="Create your first event type to categorize your bookings."
                icon={<Calendar className="h-12 w-12" />}
                action={{ label: 'Create Event Type', onClick: handleOpenCreate }}
              />
            ) : (
              <Grid cols={3} gap={4}>
                {filteredEventTypes.map((eventType) => (
                  <Card key={eventType.id} className={`overflow-hidden ${!eventType.is_active ? 'opacity-60' : ''}`}>
                    <Box className="h-2" style={{ backgroundColor: eventType.color }} />
                    <Box className="p-4">
                      <Stack direction="horizontal" className="justify-between items-start mb-3">
                        <Stack direction="horizontal" gap={3} className="items-center">
                          <Box
                            className="w-10 h-10 rounded-card flex items-center justify-center"
                            style={{ backgroundColor: `${eventType.color}20` }}
                          >
                            <Calendar className="h-5 w-5" style={{ color: eventType.color }} />
                          </Box>
                          <Box>
                            <H3>{eventType.name}</H3>
                            {eventType.is_active ? (
                              <Stack direction="horizontal" gap={1} className="items-center text-success">
                                <CheckCircle className="h-3 w-3" />
                                <Text size="xs">Active</Text>
                              </Stack>
                            ) : (
                              <Stack direction="horizontal" gap={1} className="items-center text-muted-foreground">
                                <XCircle className="h-3 w-3" />
                                <Text size="xs">Inactive</Text>
                              </Stack>
                            )}
                          </Box>
                        </Stack>
                        <Stack direction="horizontal" gap={1}>
                          <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(eventType)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(eventType.id, eventType.name)}
                            disabled={deleteMutation.isPending}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </Stack>
                      </Stack>

                      {eventType.description && (
                        <Body size="sm" className="text-muted-foreground mb-3 line-clamp-2">
                          {eventType.description}
                        </Body>
                      )}

                      <Grid cols={2} gap={2} className="pt-3 border-t border-border">
                        <Stack direction="horizontal" gap={2} className="items-center text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <Text size="xs">{eventType.default_duration_hours}h default</Text>
                        </Stack>
                        {eventType.max_capacity && (
                          <Stack direction="horizontal" gap={2} className="items-center text-muted-foreground">
                            <Users className="h-3 w-3" />
                            <Text size="xs">Max {eventType.max_capacity}</Text>
                          </Stack>
                        )}
                        <Text size="xs" className="text-muted-foreground">Setup: {eventType.default_setup_time_minutes}m</Text>
                        <Text size="xs" className="text-muted-foreground">Teardown: {eventType.default_teardown_time_minutes}m</Text>
                      </Grid>

                      <Stack direction="horizontal" className="justify-between items-center mt-3 pt-3 border-t border-border">
                        <Text size="xs" className="text-muted-foreground">{eventType.usage_count || 0} bookings</Text>
                        {eventType.requires_approval && (
                          <Badge className="bg-warning/20 text-warning">Requires Approval</Badge>
                        )}
                      </Stack>
                    </Box>
                  </Card>
                ))}
              </Grid>
            )}

            <Modal
              open={showModal}
              onClose={() => {
                setShowModal(false);
                setFormData(initialFormData);
                setEditingId(null);
              }}
              title={editingId ? 'Edit Event Type' : 'New Event Type'}
            >
              <Form onSubmit={handleSubmit}>
                <Stack gap={4}>
                  <Box>
                    <Label className="block mb-1">Name *</Label>
                    <Input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      placeholder="e.g., Wedding Reception"
                    />
                  </Box>

                  <Box>
                    <Label className="block mb-1">Description</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={2}
                      placeholder="Brief description of this event type"
                    />
                  </Box>

                  <Box>
                    <Label className="block mb-1">Color</Label>
                    <Stack direction="horizontal" gap={2}>
                      {COLOR_OPTIONS.map((color) => (
                        <Button
                          key={color.value}
                          type="button"
                          variant="ghost"
                          onClick={() => setFormData({ ...formData, color: color.value })}
                          className={`w-8 h-8 rounded-button border-2 ${formData.color === color.value ? 'scale-110 border-foreground' : 'border-transparent'}`}
                          style={{ backgroundColor: color.value }}
                          title={color.label}
                        />
                      ))}
                    </Stack>
                  </Box>

                  <Grid cols={2} gap={4}>
                    <Box>
                      <Label className="block mb-1">Default Duration (hours)</Label>
                      <Input
                        type="number"
                        min="1"
                        value={formData.default_duration_hours}
                        onChange={(e) => setFormData({ ...formData, default_duration_hours: parseInt(e.target.value) || 1 })}
                      />
                    </Box>
                    <Box>
                      <Label className="block mb-1">Max Capacity</Label>
                      <Input
                        type="number"
                        min="1"
                        value={formData.max_capacity}
                        onChange={(e) => setFormData({ ...formData, max_capacity: e.target.value })}
                        placeholder="Optional"
                      />
                    </Box>
                  </Grid>

                  <Grid cols={2} gap={4}>
                    <Box>
                      <Label className="block mb-1">Setup Time (minutes)</Label>
                      <Input
                        type="number"
                        min="0"
                        value={formData.default_setup_time_minutes}
                        onChange={(e) => setFormData({ ...formData, default_setup_time_minutes: parseInt(e.target.value) || 0 })}
                      />
                    </Box>
                    <Box>
                      <Label className="block mb-1">Teardown Time (minutes)</Label>
                      <Input
                        type="number"
                        min="0"
                        value={formData.default_teardown_time_minutes}
                        onChange={(e) => setFormData({ ...formData, default_teardown_time_minutes: parseInt(e.target.value) || 0 })}
                      />
                    </Box>
                  </Grid>

                  <Box>
                    <Label className="block mb-1">Min Lead Time (days)</Label>
                    <Input
                      type="number"
                      min="0"
                      value={formData.min_lead_time_days}
                      onChange={(e) => setFormData({ ...formData, min_lead_time_days: parseInt(e.target.value) || 0 })}
                    />
                  </Box>

                  <Stack direction="horizontal" gap={6}>
                    <Label className="flex items-center gap-2 cursor-pointer">
                      <Input
                        type="checkbox"
                        checked={formData.requires_approval}
                        onChange={(e) => setFormData({ ...formData, requires_approval: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <Text size="sm">Requires approval</Text>
                    </Label>
                    <Label className="flex items-center gap-2 cursor-pointer">
                      <Input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <Text size="sm">Active</Text>
                    </Label>
                  </Stack>

                  <Stack direction="horizontal" gap={3} className="justify-end pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowModal(false);
                        setFormData(initialFormData);
                        setEditingId(null);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createMutation.isPending || updateMutation.isPending}
                    >
                      {createMutation.isPending || updateMutation.isPending ? 'Saving...' : editingId ? 'Update' : 'Create'}
                    </Button>
                  </Stack>
                </Stack>
              </Form>
            </Modal>
          </Stack>
        </Container>
      </MainContent>
    </>
  );
}
