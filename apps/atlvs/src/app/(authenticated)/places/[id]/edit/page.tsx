'use client';

/**
 * Edit Place Page
 * Form for editing existing places in the unified places directory
 * 
 * Uses normalized EditPage template from @ghxstship/ui
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { MapPin, Ruler } from 'lucide-react';
import { useAuthContext, ATLVS_ADMIN_ROLES } from '@ghxstship/config';
import {
  Body, EditPage, Grid, Input, Select, Stack, Text, Textarea, useToast,
  type FormSection} from "@ghxstship/ui";
import { 
  usePlaceQuery, 
  useUpdatePlace, 
  useDeletePlace,
  type PlaceType, 
  type Place 
} from '@/hooks/usePlacesQuery';

const PLACE_TYPES: { value: PlaceType; label: string; description: string }[] = [
  { value: 'venue', label: 'Venue', description: 'Event venue or performance space' },
  { value: 'warehouse', label: 'Warehouse', description: 'Storage or logistics facility' },
  { value: 'stage', label: 'Stage', description: 'Performance stage area' },
  { value: 'zone', label: 'Zone', description: 'Designated area within a venue' },
  { value: 'room', label: 'Room', description: 'Meeting or conference room' },
  { value: 'space', label: 'Space', description: 'General purpose space' },
  { value: 'site', label: 'Site', description: 'Outdoor or construction site' },
  { value: 'office', label: 'Office', description: 'Office location' },
  { value: 'other', label: 'Other', description: 'Other location type' },
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'archived', label: 'Archived' },
  { value: 'draft', label: 'Draft' },
];

interface FormData {
  name: string;
  code: string;
  description: string;
  place_type: PlaceType;
  capacity: string;
  square_footage: string;
  timezone: string;
  status: Place['status'];
  tags: string;
  notes: string;
}

export default function EditPlacePage() {
  const router = useRouter();
  const params = useParams();
  const placeId = params?.id as string;
  
  const { hasRole } = useAuthContext();
  const toast = useToast();
  
  const { data: place, isLoading, error } = usePlaceQuery(placeId);
  const updateMutation = useUpdatePlace();
  const deleteMutation = useDeletePlace();

  const canManagePlaces = ATLVS_ADMIN_ROLES.some(role => hasRole(role));

  const [formData, setFormData] = useState<FormData>({
    name: '',
    code: '',
    description: '',
    place_type: 'venue',
    capacity: '',
    square_footage: '',
    timezone: 'America/New_York',
    status: 'active',
    tags: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  // EditPage handles delete dialog internally

  useEffect(() => {
    if (place) {
      setFormData({
        name: place.name || '',
        code: place.code || '',
        description: place.description || '',
        place_type: place.place_type || 'venue',
        capacity: place.capacity?.toString() || '',
        square_footage: place.square_footage?.toString() || '',
        timezone: place.timezone || 'America/New_York',
        status: place.status,
        tags: place.tags?.join(', ') || '',
        notes: place.notes || '',
      });
    }
  }, [place]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Place name is required';
    }
    if (formData.capacity && isNaN(parseInt(formData.capacity))) {
      newErrors.capacity = 'Capacity must be a number';
    }
    if (formData.square_footage && isNaN(parseInt(formData.square_footage))) {
      newErrors.square_footage = 'Square footage must be a number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const tags = formData.tags
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);

      await updateMutation.mutateAsync({
        id: placeId,
        name: formData.name.trim(),
        code: formData.code.trim() || undefined,
        description: formData.description.trim() || undefined,
        place_type: formData.place_type,
        capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
        square_footage: formData.square_footage ? parseInt(formData.square_footage) : undefined,
        timezone: formData.timezone,
        status: formData.status,
        tags: tags.length > 0 ? tags : undefined,
        notes: formData.notes.trim() || undefined,
      });

      toast.success('Place Updated', `${formData.name} has been updated.`);

      router.push(`/places/${placeId}`);
    } catch (err) {
      toast.error('Failed to Update Place', err instanceof Error ? err.message : 'An error occurred',);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      await deleteMutation.mutateAsync(placeId);

      toast.success('Place Deleted', `${place?.name} has been removed.`);

      router.push('/places');
    } catch (err) {
      toast.error('Failed to Delete Place', err instanceof Error ? err.message : 'An error occurred',);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleChange = useCallback((field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => {
      if (prev[field]) {
        return { ...prev, [field]: undefined };
      }
      return prev;
    });
  }, []);

  // Form sections for EditPage template
  const sections: FormSection[] = useMemo(() => [
    {
      id: 'info',
      title: 'Basic Information',
      icon: <MapPin className="h-5 w-5" />,
      content: (
        <Grid cols={2} gap={4} className="grid-cols-1 md:grid-cols-2">
          <Stack gap={2}>
            <Text className="font-weight-medium text-body-sm">Place Name *</Text>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Enter place name"
              className={errors.name ? 'border-error' : ''}
            />
            {errors.name && (
              <Body size="xs" className="text-error">{errors.name}</Body>
            )}
          </Stack>

          <Stack gap={2}>
            <Text className="font-weight-medium text-body-sm">Code / Abbreviation</Text>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) => handleChange('code', e.target.value)}
              placeholder="e.g., MAIN-STAGE"
            />
          </Stack>

          <Stack gap={2}>
            <Text className="font-weight-medium text-body-sm">Place Type</Text>
            <Select
              id="place_type"
              value={formData.place_type}
              onChange={(e) => handleChange('place_type', e.target.value)}
            >
              {PLACE_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label} - {type.description}
                </option>
              ))}
            </Select>
          </Stack>

          <Stack gap={2}>
            <Text className="font-weight-medium text-body-sm">Status</Text>
            <Select
              id="status"
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
            >
              {STATUS_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </Stack>

          <Stack gap={2} className="md:col-span-2">
            <Text className="font-weight-medium text-body-sm">Description</Text>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Brief description of this place..."
              rows={3}
            />
          </Stack>
        </Grid>
      ),
    },
    {
      id: 'capacity',
      title: 'Capacity & Details',
      icon: <Ruler className="h-5 w-5" />,
      content: (
        <Grid cols={3} gap={4} className="grid-cols-1 md:grid-cols-3">
          <Stack gap={2}>
            <Text className="font-weight-medium text-body-sm">Capacity</Text>
            <Input
              id="capacity"
              type="number"
              value={formData.capacity}
              onChange={(e) => handleChange('capacity', e.target.value)}
              placeholder="e.g., 500"
              className={errors.capacity ? 'border-error' : ''}
            />
            {errors.capacity && (
              <Body size="xs" className="text-error">{errors.capacity}</Body>
            )}
          </Stack>

          <Stack gap={2}>
            <Text className="font-weight-medium text-body-sm">Square Footage</Text>
            <Input
              id="square_footage"
              type="number"
              value={formData.square_footage}
              onChange={(e) => handleChange('square_footage', e.target.value)}
              placeholder="e.g., 10000"
              className={errors.square_footage ? 'border-error' : ''}
            />
            {errors.square_footage && (
              <Body size="xs" className="text-error">{errors.square_footage}</Body>
            )}
          </Stack>

          <Stack gap={2}>
            <Text className="font-weight-medium text-body-sm">Timezone</Text>
            <Select
              id="timezone"
              value={formData.timezone}
              onChange={(e) => handleChange('timezone', e.target.value)}
            >
              <option value="America/New_York">Eastern Time (ET)</option>
              <option value="America/Chicago">Central Time (CT)</option>
              <option value="America/Denver">Mountain Time (MT)</option>
              <option value="America/Los_Angeles">Pacific Time (PT)</option>
              <option value="America/Anchorage">Alaska Time (AKT)</option>
              <option value="Pacific/Honolulu">Hawaii Time (HT)</option>
              <option value="UTC">UTC</option>
            </Select>
          </Stack>

          <Stack gap={2} className="md:col-span-3">
            <Text className="font-weight-medium text-body-sm">Tags</Text>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => handleChange('tags', e.target.value)}
              placeholder="Enter tags separated by commas"
            />
            <Body size="xs" className="text-muted-foreground">
              Separate multiple tags with commas
            </Body>
          </Stack>

          <Stack gap={2} className="md:col-span-3">
            <Text className="font-weight-medium text-body-sm">Internal Notes</Text>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Add any internal notes about this place..."
              rows={3}
            />
            <Body size="xs" className="text-muted-foreground">
              These notes are only visible to team members
            </Body>
          </Stack>
        </Grid>
      ),
    },
  ], [formData, errors, handleChange]);

  // EditPage handles loading, not found, and access denied states
  return (
    <EditPage
      title={place ? `Edit ${place.name}` : 'Edit Place'}
      subtitle="Update place information"
      breadcrumbs={place ? [
        { label: 'Places', href: '/places' },
        { label: place.name, href: `/places/${placeId}` },
        { label: 'Edit' },
      ] : undefined}
      backHref={place ? `/places/${placeId}` : '/places'}
      backLabel="Back to Place"
      sections={sections}
      onSubmit={handleSubmit}
      submitLabel="Save Changes"
      isSubmitting={isSubmitting}
      isValid={true}
      isLoading={isLoading}
      notFound={!isLoading && (error || !place) ? {
        title: 'Place Not Found',
        description: "The place you're trying to edit doesn't exist or has been removed.",
        action: { label: 'Back to Places', onClick: () => router.push('/places') },
      } : undefined}
      accessDenied={!canManagePlaces ? {
        title: 'Permission Required',
        description: 'You do not have permission to edit places.',
        action: { label: 'Back to Places', onClick: () => router.push('/places') },
      } : undefined}
      onDelete={handleDelete}
      isDeleting={isDeleting}
      deleteConfirmMessage="This action cannot be undone. This will permanently delete the place and all associated events, bookings, and history."
    />
  );
}
