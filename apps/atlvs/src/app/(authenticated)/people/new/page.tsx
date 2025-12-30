'use client';

/**
 * Create New Person Page
 * Form for adding new people to the unified people directory
 * 
 * Uses normalized CreatePage template from @ghxstship/ui
 */

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { User, Tag, FileText } from 'lucide-react';
import { useAuthContext, ATLVS_ADMIN_ROLES } from '@ghxstship/config';
import {
  Body, CreatePage, Grid, Input, Select, Stack, Text, Textarea, useNotifications} from '@ghxstship/ui';
import { useCreatePerson, type PersonType } from '@/hooks/usePeopleQuery';

const PERSON_TYPES: { value: PersonType; label: string; description: string }[] = [
  { value: 'contact', label: 'Contact', description: 'External contact or lead' },
  { value: 'employee', label: 'Employee', description: 'Internal team member' },
  { value: 'crew', label: 'Crew', description: 'Production or event crew' },
  { value: 'artist', label: 'Artist', description: 'Performer or talent' },
  { value: 'volunteer', label: 'Volunteer', description: 'Volunteer staff' },
  { value: 'candidate', label: 'Candidate', description: 'Job applicant' },
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' },
  { value: 'inactive', label: 'Inactive' },
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
  initial_type: PersonType;
  tags: string;
}

export default function NewPersonPage() {
  const router = useRouter();
  const { hasRole } = useAuthContext();
  const { addNotification } = useNotifications();
  const createMutation = useCreatePerson();

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
    initial_type: 'contact',
    tags: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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

      const person = await createMutation.mutateAsync({
        organization_id: '', // Will be set by API based on user's org
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
        initial_type: formData.initial_type,
      });

      addNotification({
        type: 'success',
        title: 'Person Created',
        message: `${formData.first_name} ${formData.last_name} has been added.`,
      });

      router.push(`/people/${person.id}`);
    } catch (err) {
      addNotification({
        type: 'error',
        title: 'Failed to Create Person',
        message: err instanceof Error ? err.message : 'An error occurred',
      });
    } finally {
      setIsSubmitting(false);
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

  // Form sections for CreatePage template
  const sections: FormSection[] = useMemo(() => [
    {
      id: 'basic',
      title: 'Basic Information',
      icon: <User className="h-5 w-5" />,
      content: (
        <Stack gap={4}>
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
          </Grid>

          <Stack gap={2}>
            <Text className="font-weight-medium text-body-sm">Bio</Text>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleChange('bio', e.target.value)}
              placeholder="Brief biography or description..."
              rows={3}
            />
          </Stack>
        </Stack>
      ),
    },
    {
      id: 'classification',
      title: 'Classification',
      icon: <Tag className="h-5 w-5" />,
      content: (
        <Grid cols={2} gap={4} className="grid-cols-1 md:grid-cols-2">
          <Stack gap={2}>
            <Text className="font-weight-medium text-body-sm">Person Type</Text>
            <Select
              id="initial_type"
              value={formData.initial_type}
              onChange={(e) => handleChange('initial_type', e.target.value)}
            >
              {PERSON_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label} - {type.description}
                </option>
              ))}
            </Select>
            <Body size="xs" className="text-muted-foreground">
              Additional profile types can be added after creation
            </Body>
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
            <Text className="font-weight-medium text-body-sm">Tags</Text>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => handleChange('tags', e.target.value)}
              placeholder="Enter tags separated by commas (e.g., VIP, Partner, Local)"
            />
            <Body size="xs" className="text-muted-foreground">
              Separate multiple tags with commas
            </Body>
          </Stack>
        </Grid>
      ),
    },
    {
      id: 'notes',
      title: 'Internal Notes',
      icon: <FileText className="h-5 w-5" />,
      content: (
        <Stack gap={2}>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="Add any internal notes about this person..."
            rows={4}
          />
          <Body size="xs" className="text-muted-foreground">
            These notes are only visible to team members
          </Body>
        </Stack>
      ),
    },
  ], [formData, errors, handleChange]);

  if (!canManagePeople) {
    return (
      <CreatePage
        title="Add New Person"
        subtitle="Create a new entry in the people directory"
        backHref="/people"
        backLabel="Back to People"
        sections={[]}
        onSubmit={() => {}}
        accessDenied={{
          title: 'Permission Required',
          description: 'You do not have permission to add new people.',
          action: { label: 'Back to People', onClick: () => router.push('/people') },
        }}
      />
    );
  }

  return (
    <CreatePage
      title="Add New Person"
      subtitle="Create a new entry in the people directory"
      breadcrumbs={[
        { label: 'People', href: '/people' },
        { label: 'New Person' },
      ]}
      backHref="/people"
      backLabel="Back to People"
      sections={sections}
      onSubmit={handleSubmit}
      submitLabel="Create Person"
      isSubmitting={isSubmitting}
      isValid={true}
    />
  );
}
