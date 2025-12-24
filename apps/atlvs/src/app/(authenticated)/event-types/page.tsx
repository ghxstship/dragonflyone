'use client';

import {
  Body,
  Button,
  Form,
  H1,
  H3,
  Input,
  Label,
  Text,
  Textarea,
} from '@ghxstship/ui';

import { useState } from 'react';
import { Plus, Calendar, Edit2, Trash2, Search, Clock, Users, CheckCircle, XCircle } from 'lucide-react';
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
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded-card w-1/3" />
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-muted rounded-card" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-destructive/10 border-2 border-destructive rounded-card p-4 text-destructive">
          Failed to load event types. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <H1 className="text-h2-md font-weight-bold text-foreground">Event Types</H1>
          <Body className="text-body-sm text-muted-foreground mt-1">
            Manage event categories and default settings
          </Body>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button border-2 border-primary font-weight-medium text-body-sm hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Event Type
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search event types..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>
        <Label className="flex items-center gap-2 cursor-pointer">
          <Input
            type="checkbox"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
            className="w-4 h-4 border-2 border-border rounded"
          />
          <Text className="text-body-sm text-muted-foreground">Show inactive</Text>
        </Label>
      </div>

      {filteredEventTypes.length === 0 && (
        <div className="text-center py-12 bg-muted/30 rounded-card border-2 border-dashed border-border">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <H3 className="text-h4-md font-weight-medium text-foreground mb-2">
            No event types found
          </H3>
          <Body className="text-body-sm text-muted-foreground mb-4">
            Create your first event type to categorize your bookings.
          </Body>
          <Button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button border-2 border-primary font-weight-medium text-body-sm"
          >
            <Plus className="h-4 w-4" />
            Create Event Type
          </Button>
        </div>
      )}

      {filteredEventTypes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEventTypes.map((eventType) => (
            <div
              key={eventType.id}
              className={`bg-background border-2 rounded-card overflow-hidden ${
                eventType.is_active ? 'border-border' : 'border-muted opacity-60'
              }`}
            >
              <div
                className="h-2"
                style={{ backgroundColor: eventType.color }}
              />
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-card flex items-center justify-center"
                      style={{ backgroundColor: `${eventType.color}20` }}
                    >
                      <Calendar className="h-5 w-5" style={{ color: eventType.color }} />
                    </div>
                    <div>
                      <H3 className="text-body-md font-weight-semibold text-foreground">
                        {eventType.name}
                      </H3>
                      <div className="flex items-center gap-2">
                        {eventType.is_active ? (
                          <Text className="flex items-center gap-1 text-body-xs text-success">
                            <CheckCircle className="h-3 w-3" />
                            Active
                          </Text>
                        ) : (
                          <Text className="flex items-center gap-1 text-body-xs text-muted-foreground">
                            <XCircle className="h-3 w-3" />
                            Inactive
                          </Text>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      onClick={() => handleOpenEdit(eventType)}
                      className="p-1.5 hover:bg-muted rounded-button transition-colors"
                    >
                      <Edit2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button
                      onClick={() => handleDelete(eventType.id, eventType.name)}
                      disabled={deleteMutation.isPending}
                      className="p-1.5 hover:bg-destructive/10 rounded-button transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>

                {eventType.description && (
                  <Body className="text-body-sm text-muted-foreground mb-3 line-clamp-2">
                    {eventType.description}
                  </Body>
                )}

                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-border">
                  <div className="flex items-center gap-2 text-body-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {eventType.default_duration_hours}h default
                  </div>
                  {eventType.max_capacity && (
                    <div className="flex items-center gap-2 text-body-xs text-muted-foreground">
                      <Users className="h-3 w-3" />
                      Max {eventType.max_capacity}
                    </div>
                  )}
                  <div className="text-body-xs text-muted-foreground">
                    Setup: {eventType.default_setup_time_minutes}m
                  </div>
                  <div className="text-body-xs text-muted-foreground">
                    Teardown: {eventType.default_teardown_time_minutes}m
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                  <Text className="text-body-xs text-muted-foreground">
                    {eventType.usage_count || 0} bookings
                  </Text>
                  {eventType.requires_approval && (
                    <Text className="px-2 py-0.5 bg-warning/20 text-warning text-body-xs rounded">
                      Requires Approval
                    </Text>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background border-2 border-border rounded-card p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <H3 className="text-h4-md font-weight-semibold text-foreground mb-4">
              {editingId ? 'Edit Event Type' : 'New Event Type'}
            </H3>
            <Form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="block text-body-sm font-weight-medium text-foreground mb-1">
                  Name *
                </Label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="e.g., Wedding Reception"
                  className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <Label className="block text-body-sm font-weight-medium text-foreground mb-1">
                  Description
                </Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  placeholder="Brief description of this event type"
                  className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary resize-none"
                />
              </div>

              <div>
                <Label className="block text-body-sm font-weight-medium text-foreground mb-1">
                  Color
                </Label>
                <div className="flex items-center gap-2">
                  {COLOR_OPTIONS.map((color) => (
                    <Button
                      key={color.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: color.value })}
                      className={`w-8 h-8 rounded-button border-2 transition-transform ${
                        formData.color === color.value ? 'scale-110 border-foreground' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.label}
                    />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="block text-body-sm font-weight-medium text-foreground mb-1">
                    Default Duration (hours)
                  </Label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.default_duration_hours}
                    onChange={(e) => setFormData({ ...formData, default_duration_hours: parseInt(e.target.value) || 1 })}
                    className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <Label className="block text-body-sm font-weight-medium text-foreground mb-1">
                    Max Capacity
                  </Label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.max_capacity}
                    onChange={(e) => setFormData({ ...formData, max_capacity: e.target.value })}
                    placeholder="Optional"
                    className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="block text-body-sm font-weight-medium text-foreground mb-1">
                    Setup Time (minutes)
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.default_setup_time_minutes}
                    onChange={(e) => setFormData({ ...formData, default_setup_time_minutes: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <Label className="block text-body-sm font-weight-medium text-foreground mb-1">
                    Teardown Time (minutes)
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.default_teardown_time_minutes}
                    onChange={(e) => setFormData({ ...formData, default_teardown_time_minutes: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <Label className="block text-body-sm font-weight-medium text-foreground mb-1">
                  Min Lead Time (days)
                </Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.min_lead_time_days}
                  onChange={(e) => setFormData({ ...formData, min_lead_time_days: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex items-center gap-6">
                <Label className="flex items-center gap-2 cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={formData.requires_approval}
                    onChange={(e) => setFormData({ ...formData, requires_approval: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <Text className="text-body-sm text-foreground">Requires approval</Text>
                </Label>
                <Label className="flex items-center gap-2 cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <Text className="text-body-sm text-foreground">Active</Text>
                </Label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <Button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setFormData(initialFormData);
                    setEditingId(null);
                  }}
                  className="px-4 py-2 border-2 border-border rounded-button hover:bg-muted transition-colors"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-button hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? 'Saving...'
                    : editingId
                    ? 'Update'
                    : 'Create'}
                </Button>
              </div>
            </Form>
          </div>
        </div>
      )}
    </div>
  );
}
