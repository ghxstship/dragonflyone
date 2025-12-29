'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext, PlatformRole } from '@ghxstship/config';
import {
  CreatePage,
  Field,
  Input,
  Textarea,
  Select,
  Grid,
  Stack,
  useNotifications,
} from '@ghxstship/ui';
import { Briefcase, Calendar, DollarSign } from 'lucide-react';

// Roles that can create projects
const ADMIN_ROLES = [
  PlatformRole.COMPVSS_ADMIN,
  PlatformRole.LEGEND_SUPER_ADMIN,
  PlatformRole.LEGEND_ADMIN,
  PlatformRole.LEGEND_DEVELOPER,
];

export default function NewProjectPage() {
  const router = useRouter();
  const { hasRole } = useAuthContext();
  const { addNotification } = useNotifications();
  
  const [formData, setFormData] = useState({
    name: '',
    client: '',
    type: 'concert',
    venue: '',
    loadInDate: '',
    eventDate: '',
    loadOutDate: '',
    budget: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canCreateProject = ADMIN_ROLES.some(role => hasRole(role));

  useEffect(() => {
    if (!canCreateProject) {
      router.replace('/projects');
    }
  }, [canCreateProject, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/projects/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create project');
      }

      addNotification({
        type: 'success',
        title: 'Project Created',
        message: `${formData.name} has been created successfully.`,
      });
      router.push('/dashboard');
    } catch (err) {
      addNotification({
        type: 'error',
        title: 'Failed to Create Project',
        message: err instanceof Error ? err.message : 'An error occurred',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!canCreateProject) {
    return null;
  }

  const sections = [
    {
      id: 'project-info',
      title: 'Project Information',
      icon: <Briefcase className="h-5 w-5" />,
      content: (
        <Stack gap={6}>
          <Field label="Project Name" required>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Summer Music Festival 2024"
              required
            />
          </Field>

          <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
            <Field label="Client" required>
              <Input
                value={formData.client}
                onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                placeholder="Client Name"
                required
              />
            </Field>

            <Field label="Production Type" required>
              <Select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="concert">Concert</option>
                <option value="festival">Festival</option>
                <option value="corporate">Corporate Event</option>
                <option value="theater">Theater</option>
                <option value="sports">Sports Event</option>
              </Select>
            </Field>
          </Grid>

          <Field label="Venue" required>
            <Input
              value={formData.venue}
              onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
              placeholder="Venue Name"
              required
            />
          </Field>
        </Stack>
      ),
    },
    {
      id: 'schedule',
      title: 'Schedule',
      icon: <Calendar className="h-5 w-5" />,
      content: (
        <Grid cols={3} gap={4} className="sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Load-In Date" required>
            <Input
              type="date"
              value={formData.loadInDate}
              onChange={(e) => setFormData({ ...formData, loadInDate: e.target.value })}
              required
            />
          </Field>

          <Field label="Event Date" required>
            <Input
              type="date"
              value={formData.eventDate}
              onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
              required
            />
          </Field>

          <Field label="Load-Out Date" required>
            <Input
              type="date"
              value={formData.loadOutDate}
              onChange={(e) => setFormData({ ...formData, loadOutDate: e.target.value })}
              required
            />
          </Field>
        </Grid>
      ),
    },
    {
      id: 'budget-notes',
      title: 'Budget & Notes',
      icon: <DollarSign className="h-5 w-5" />,
      content: (
        <Stack gap={6}>
          <Field label="Budget (USD)" required>
            <Input
              type="number"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              placeholder="50000"
              required
            />
          </Field>

          <Field label="Production Notes">
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Special requirements, technical notes..."
              rows={4}
            />
          </Field>
        </Stack>
      ),
    },
  ];

  return (
    <CreatePage
      title="New Production"
      subtitle="Create a new production project"
      breadcrumbs={[
        { label: 'Projects', href: '/projects' },
        { label: 'New Project' },
      ]}
      backHref="/projects"
      backLabel="Back to Projects"
      sections={sections}
      onSubmit={handleSubmit}
      submitLabel="Create Project"
      isSubmitting={isSubmitting}
      isValid={!!formData.name && !!formData.client && !!formData.venue}
    />
  );
}
