'use client';

/**
 * Edit Person Page
 * Form for editing existing people in the unified people directory
 * 
 * Uses normalized EditPage template from @ghxstship/ui
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { User } from 'lucide-react';
import { useAuthContext, ATLVS_ADMIN_ROLES } from '@ghxstship/config';
import {
  Body, Box, EditPage, Grid, Input, Select, Stack, Text, Textarea, useToast,
  type FormSection} from "@ghxstship/ui";
import { usePersonQuery, useUpdatePerson, useDeletePerson } from '@/hooks/usePeopleQuery';

// Person types are managed on the detail page, not the edit form

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'archived', label: 'Archived' },
  { value: 'draft', label: 'Draft' },
];

interface FormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  mobile: string;
  title: string;
  bio: string;
  notes: string;
  status: 'active' | 'inactive' | 'pending' | 'archived' | 'draft';
  tags: string;
}

export default function EditPersonPage() {
  const router = useRouter();
  const params = useParams();
  const personId = params?.id as string;
  
  const { hasRole } = useAuthContext();
  const toast = useToast();
  
  const { data: person, isLoading, error } = usePersonQuery(personId);
  const updateMutation = useUpdatePerson();
  const deleteMutation = useDeletePerson();

  const canManagePeople = ATLVS_ADMIN_ROLES.some(role => hasRole(role));

  const [formData, setFormData] = useState<FormData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    mobile: '',
    title: '',
    bio: '',
    notes: '',
    status: 'active',
    tags: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  // EditPage handles delete dialog internally

  // Populate form when person data loads
  useEffect(() => {
    if (person) {
      setFormData({
        first_name: person.first_name || '',
        last_name: person.last_name || '',
        email: person.email || '',
        phone: person.phone || '',
        mobile: person.mobile || '',
        title: person.title || '',
        bio: person.bio || '',
        notes: person.notes || '',
        status: person.status,
        tags: person.tags?.join(', ') || '',
      });
    }
  }, [person]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
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
        id: personId,
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        mobile: formData.mobile.trim() || undefined,
        title: formData.title.trim() || undefined,
        bio: formData.bio.trim() || undefined,
        notes: formData.notes.trim() || undefined,
        status: formData.status,
        tags: tags.length > 0 ? tags : undefined,
      });

      toast.success('Person Updated', `${formData.first_name} ${formData.last_name} has been updated.`);

      router.push(`/people/${personId}`);
    } catch (err) {
      toast.error('Failed to Update Person', err instanceof Error ? err.message : 'An error occurred',);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      await deleteMutation.mutateAsync(personId);

      toast.success('Person Deleted', `${person?.display_name} has been removed.`);

      router.push('/people');
    } catch (err) {
      toast.error('Failed to Delete Person', err instanceof Error ? err.message : 'An error occurred',);
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
      icon: <User className="h-5 w-5" />,
      content: (
        <Grid cols={2} gap={4} className="grid-cols-1 md:grid-cols-2">
          <Stack gap={2}>
            <Text className="font-weight-medium text-body-sm">First Name *</Text>
            <Input
              id="first_name"
              value={formData.first_name}
              onChange={(e) => handleChange('first_name', e.target.value)}
              placeholder="Enter first name"
              className={errors.first_name ? 'border-error' : ''}
            />
            {errors.first_name && (
              <Body size="xs" className="text-error">{errors.first_name}</Body>
            )}
          </Stack>

          <Stack gap={2}>
            <Text className="font-weight-medium text-body-sm">Last Name *</Text>
            <Input
              id="last_name"
              value={formData.last_name}
              onChange={(e) => handleChange('last_name', e.target.value)}
              placeholder="Enter last name"
              className={errors.last_name ? 'border-error' : ''}
            />
            {errors.last_name && (
              <Body size="xs" className="text-error">{errors.last_name}</Body>
            )}
          </Stack>

          <Stack gap={2}>
            <Text className="font-weight-medium text-body-sm">Email</Text>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="email@example.com"
              className={errors.email ? 'border-error' : ''}
            />
            {errors.email && (
              <Body size="xs" className="text-error">{errors.email}</Body>
            )}
          </Stack>

          <Stack gap={2}>
            <Text className="font-weight-medium text-body-sm">Phone</Text>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="+1 (555) 000-0000"
            />
          </Stack>

          <Stack gap={2}>
            <Text className="font-weight-medium text-body-sm">Mobile</Text>
            <Input
              id="mobile"
              type="tel"
              value={formData.mobile}
              onChange={(e) => handleChange('mobile', e.target.value)}
              placeholder="+1 (555) 000-0000"
            />
          </Stack>

          <Stack gap={2}>
            <Text className="font-weight-medium text-body-sm">Title / Role</Text>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="e.g., Marketing Manager"
            />
          </Stack>

          <Stack gap={2} className="md:col-span-2">
            <Text className="font-weight-medium text-body-sm">Bio</Text>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleChange('bio', e.target.value)}
              placeholder="Brief biography or description..."
              rows={3}
            />
          </Stack>
        </Grid>
      ),
    },
    {
      id: 'classification',
      title: 'Classification & Status',
      icon: <Box className="h-5 w-5" />,
      content: (
        <Grid cols={2} gap={4} className="grid-cols-1 md:grid-cols-2">
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

          <Stack gap={2}>
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

          <Stack gap={2} className="md:col-span-2">
            <Text className="font-weight-medium text-body-sm">Internal Notes</Text>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Add any internal notes about this person..."
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
      title={person ? `Edit ${person.display_name}` : 'Edit Person'}
      subtitle="Update person information"
      breadcrumbs={person ? [
        { label: 'People', href: '/people' },
        { label: person.display_name, href: `/people/${personId}` },
        { label: 'Edit' },
      ] : undefined}
      backHref={person ? `/people/${personId}` : '/people'}
      backLabel="Back to Person"
      sections={sections}
      onSubmit={handleSubmit}
      submitLabel="Save Changes"
      isSubmitting={isSubmitting}
      isValid={true}
      isLoading={isLoading}
      notFound={!isLoading && (error || !person) ? {
        title: 'Person Not Found',
        description: "The person you're trying to edit doesn't exist or has been removed.",
        action: { label: 'Back to People', onClick: () => router.push('/people') },
      } : undefined}
      accessDenied={!canManagePeople ? {
        title: 'Permission Required',
        description: 'You do not have permission to edit people.',
        action: { label: 'Back to People', onClick: () => router.push('/people') },
      } : undefined}
      onDelete={handleDelete}
      isDeleting={isDeleting}
      deleteConfirmMessage="This action cannot be undone. This will permanently delete the person and all associated profile data, assignments, and history."
    />
  );
}
