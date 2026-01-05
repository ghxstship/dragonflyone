'use client';

/**
 * Edit Project Page
 * Form for editing existing production projects
 * 
 * Uses normalized EditPage template from @ghxstship/ui
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Briefcase, MapPin, Calendar, DollarSign } from 'lucide-react';
import { useAuthContext, ATLVS_ADMIN_ROLES } from '@ghxstship/config';
import {
  Body, EditPage, Grid, Input, Select, Stack, Textarea, useToast,
  type FormSection } from "@ghxstship/ui";
import { useProject, useUpdateProject, useDeleteProject } from '@/hooks/useProjects';

const PROJECT_TYPES = [
  { value: 'production', label: 'Production' },
  { value: 'event', label: 'Event' },
  { value: 'tour', label: 'Tour' },
  { value: 'festival', label: 'Festival' },
  { value: 'corporate', label: 'Corporate' },
];

const STATUS_OPTIONS = [
  { value: 'planning', label: 'Planning' },
  { value: 'active', label: 'Active' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

interface FormData {
  name: string;
  client: string;
  type: string;
  status: string;
  start_date: string;
  end_date: string;
  budget: string;
  description: string;
  venue: string;
  capacity: string;
  notes: string;
}

export default function EditProjectPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params?.id as string;
  
  const { hasRole } = useAuthContext();
  const toast = useToast();
  
  const { data: project, isLoading, error } = useProject(projectId);
  const updateMutation = useUpdateProject();
  const deleteMutation = useDeleteProject();

  const canManageProjects = ATLVS_ADMIN_ROLES.some(role => hasRole(role));

  const [formData, setFormData] = useState<FormData>({
    name: '',
    client: '',
    type: 'production',
    status: 'planning',
    start_date: '',
    end_date: '',
    budget: '',
    description: '',
    venue: '',
    capacity: '',
    notes: '' });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || '',
        client: project.client_id || '',
        type: project.type || 'production',
        status: project.status || 'planning',
        start_date: project.start_date?.split('T')[0] || '',
        end_date: project.end_date?.split('T')[0] || '',
        budget: project.budget?.toString() || '',
        description: project.description || '',
        venue: '',
        capacity: '',
        notes: '' });
    }
  }, [project]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required';
    }
    if (!formData.client.trim()) {
      newErrors.client = 'Client is required';
    }
    if (!formData.start_date) {
      newErrors.start_date = 'Start date is required';
    }
    if (formData.end_date && formData.start_date && formData.end_date < formData.start_date) {
      newErrors.end_date = 'End date must be after start date';
    }
    if (formData.budget && isNaN(parseFloat(formData.budget))) {
      newErrors.budget = 'Budget must be a valid number';
    }
    if (formData.capacity && isNaN(parseInt(formData.capacity))) {
      newErrors.capacity = 'Capacity must be a valid number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      await updateMutation.mutateAsync({
        id: projectId,
        name: formData.name.trim(),
        client_id: formData.client.trim() || undefined,
        status: formData.status as 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled',
        start_date: formData.start_date,
        end_date: formData.end_date || undefined,
        budget: formData.budget ? parseFloat(formData.budget) : undefined,
        description: formData.description.trim() || undefined });

      toast.success('Project Updated', `${formData.name} has been updated.`);

      router.push(`/projects/${projectId}`);
    } catch (err) {
      toast.error('Failed to Update Project', err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      await deleteMutation.mutateAsync(projectId);

      toast.success('Project Deleted', `${project?.name} has been removed.`);

      router.push('/projects');
    } catch (err) {
      toast.error('Failed to Delete Project', err instanceof Error ? err.message : 'An error occurred');
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

  const sections: FormSection[] = useMemo(() => [
    {
      id: 'details',
      title: 'Project Details',
      icon: <Briefcase className="h-5 w-5" />,
      content: (
        <Stack gap={4}>
          <Grid cols={2} gap={4} className="grid-cols-1 md:grid-cols-2">
            <Stack gap={2}>
              <Body size="sm" className="font-weight-medium">Project Name *</Body>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Enter project name"
                className={errors.name ? 'border-error' : ''}
              />
              {errors.name && (
                <Body size="xs" className="text-error">{errors.name}</Body>
              )}
            </Stack>

            <Stack gap={2}>
              <Body size="sm" className="font-weight-medium">Client *</Body>
              <Input
                id="client"
                value={formData.client}
                onChange={(e) => handleChange('client', e.target.value)}
                placeholder="Select or enter client"
                className={errors.client ? 'border-error' : ''}
              />
              {errors.client && (
                <Body size="xs" className="text-error">{errors.client}</Body>
              )}
            </Stack>

            <Stack gap={2}>
              <Body size="sm" className="font-weight-medium">Project Type</Body>
              <Select
                id="type"
                value={formData.type}
                onChange={(e) => handleChange('type', e.target.value)}
              >
                {PROJECT_TYPES.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </Select>
            </Stack>

            <Stack gap={2}>
              <Body size="sm" className="font-weight-medium">Status</Body>
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
          </Grid>

          <Stack gap={2}>
            <Body size="sm" className="font-weight-medium">Description</Body>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Enter project description..."
              rows={4}
            />
          </Stack>
        </Stack>
      ) },
    {
      id: 'schedule',
      title: 'Schedule',
      icon: <Calendar className="h-5 w-5" />,
      content: (
        <Grid cols={2} gap={4} className="grid-cols-1 md:grid-cols-2">
          <Stack gap={2}>
            <Body size="sm" className="font-weight-medium">Start Date *</Body>
            <Input
              id="start_date"
              type="date"
              value={formData.start_date}
              onChange={(e) => handleChange('start_date', e.target.value)}
              className={errors.start_date ? 'border-error' : ''}
            />
            {errors.start_date && (
              <Body size="xs" className="text-error">{errors.start_date}</Body>
            )}
          </Stack>

          <Stack gap={2}>
            <Body size="sm" className="font-weight-medium">End Date</Body>
            <Input
              id="end_date"
              type="date"
              value={formData.end_date}
              onChange={(e) => handleChange('end_date', e.target.value)}
              className={errors.end_date ? 'border-error' : ''}
            />
            {errors.end_date && (
              <Body size="xs" className="text-error">{errors.end_date}</Body>
            )}
          </Stack>
        </Grid>
      ) },
    {
      id: 'budget',
      title: 'Budget & Venue',
      icon: <DollarSign className="h-5 w-5" />,
      content: (
        <Grid cols={2} gap={4} className="grid-cols-1 md:grid-cols-2">
          <Stack gap={2}>
            <Body size="sm" className="font-weight-medium">Budget</Body>
            <Input
              id="budget"
              type="number"
              value={formData.budget}
              onChange={(e) => handleChange('budget', e.target.value)}
              placeholder="Enter budget"
              className={errors.budget ? 'border-error' : ''}
            />
            {errors.budget && (
              <Body size="xs" className="text-error">{errors.budget}</Body>
            )}
          </Stack>

          <Stack gap={2}>
            <Body size="sm" className="font-weight-medium">Expected Capacity</Body>
            <Input
              id="capacity"
              type="number"
              value={formData.capacity}
              onChange={(e) => handleChange('capacity', e.target.value)}
              placeholder="Enter expected attendance"
              className={errors.capacity ? 'border-error' : ''}
            />
            {errors.capacity && (
              <Body size="xs" className="text-error">{errors.capacity}</Body>
            )}
          </Stack>
        </Grid>
      ) },
    {
      id: 'venue',
      title: 'Venue & Notes',
      icon: <MapPin className="h-5 w-5" />,
      content: (
        <Stack gap={4}>
          <Stack gap={2}>
            <Body size="sm" className="font-weight-medium">Venue</Body>
            <Input
              id="venue"
              value={formData.venue}
              onChange={(e) => handleChange('venue', e.target.value)}
              placeholder="Select or enter venue"
            />
          </Stack>

          <Stack gap={2}>
            <Body size="sm" className="font-weight-medium">Notes</Body>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Add any internal notes..."
              rows={3}
            />
            <Body size="xs" className="text-muted-foreground">
              These notes are only visible to team members
            </Body>
          </Stack>
        </Stack>
      ) },
  ], [formData, errors, handleChange]);

  return (
    <EditPage
      title={project ? `Edit ${project.name}` : 'Edit Project'}
      subtitle="Update project information"
      breadcrumbs={project ? [
        { label: 'Projects', href: '/projects' },
        { label: project.name, href: `/projects/${projectId}` },
        { label: 'Edit' },
      ] : undefined}
      backHref={project ? `/projects/${projectId}` : '/projects'}
      backLabel="Back to Project"
      sections={sections}
      onSubmit={handleSubmit}
      submitLabel="Save Changes"
      isSubmitting={isSubmitting}
      isValid={true}
      isLoading={isLoading}
      notFound={!isLoading && (error || !project) ? {
        title: 'Project Not Found',
        description: "The project you're trying to edit doesn't exist or has been removed.",
        action: { label: 'Back to Projects', onClick: () => router.push('/projects') } } : undefined}
      accessDenied={!canManageProjects ? {
        title: 'Permission Required',
        description: 'You do not have permission to edit projects.',
        action: { label: 'Back to Projects', onClick: () => router.push('/projects') } } : undefined}
      onDelete={handleDelete}
      isDeleting={isDeleting}
      deleteConfirmMessage="This action cannot be undone. This will permanently delete the project and all associated milestones, budget items, and documents."
    />
  );
}
