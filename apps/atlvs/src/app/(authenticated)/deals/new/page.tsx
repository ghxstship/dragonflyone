'use client';

/**
 * Create New Deal Page
 * Form for adding new deals/opportunities to the sales pipeline
 * 
 * Uses normalized CreatePage template from @ghxstship/ui
 */

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Briefcase, DollarSign, FileText } from 'lucide-react';
import { useAuthContext, ATLVS_ADMIN_ROLES } from '@ghxstship/config';
import {
  Body, CreatePage, Grid, Input, Select, Stack, Text, Textarea, useToast,
  type FormSection} from "@ghxstship/ui";
import { useCreateDeal } from '@/hooks/useDeals';

interface FormData {
  title: string;
  client: string;
  contact: string;
  value: string;
  stage: string;
  probability: string;
  expected_close: string;
  source: string;
  description: string;
  notes: string;
}

const STAGE_OPTIONS = [
  { value: 'lead', label: 'Lead' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'proposal', label: 'Proposal' },
  { value: 'negotiation', label: 'Negotiation' },
  { value: 'closed_won', label: 'Closed Won' },
  { value: 'closed_lost', label: 'Closed Lost' },
];

const SOURCE_OPTIONS = [
  { value: '', label: 'Select source' },
  { value: 'referral', label: 'Referral' },
  { value: 'website', label: 'Website' },
  { value: 'cold_outreach', label: 'Cold Outreach' },
  { value: 'event', label: 'Event' },
  { value: 'partner', label: 'Partner' },
];

export default function NewDealPage() {
  const router = useRouter();
  const { hasRole } = useAuthContext();
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    client: '',
    contact: '',
    value: '',
    stage: 'lead',
    probability: '25',
    expected_close: '',
    source: '',
    description: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const createDealMutation = useCreateDeal();

  const canCreateDeal = ATLVS_ADMIN_ROLES.some(role => hasRole(role));

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Deal title is required';
    }
    if (!formData.client.trim()) {
      newErrors.client = 'Client/Company is required';
    }
    if (!formData.value.trim()) {
      newErrors.value = 'Deal value is required';
    } else if (isNaN(parseFloat(formData.value))) {
      newErrors.value = 'Deal value must be a number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      await createDealMutation.mutateAsync({
        title: formData.title,
        description: formData.description,
        notes: formData.notes,
        status: formData.stage as 'lead' | 'qualified' | 'proposal' | 'won' | 'lost',
        value: parseFloat(formData.value) || 0,
        probability: parseInt(formData.probability) || 25,
        expected_close_date: formData.expected_close || undefined,
      });

      toast.success('Deal Created', `${formData.title} has been added to the pipeline.`);

      router.push('/deals');
    } catch (err) {
      toast.error('Failed to Create Deal', err instanceof Error ? err.message : 'An error occurred',);
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
      id: 'info',
      title: 'Deal Information',
      icon: <Briefcase className="h-5 w-5" />,
      content: (
        <Grid cols={2} gap={4} className="grid-cols-1 md:grid-cols-2">
          <Stack gap={2}>
            <Text className="font-weight-medium text-body-sm">Deal Title *</Text>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Enter deal title"
              className={errors.title ? 'border-error' : ''}
            />
            {errors.title && (
              <Body size="xs" className="text-error">{errors.title}</Body>
            )}
          </Stack>

          <Stack gap={2}>
            <Text className="font-weight-medium text-body-sm">Client/Company *</Text>
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
            <Text className="font-weight-medium text-body-sm">Primary Contact</Text>
            <Input
              id="contact"
              value={formData.contact}
              onChange={(e) => handleChange('contact', e.target.value)}
              placeholder="Contact name"
            />
          </Stack>

          <Stack gap={2}>
            <Text className="font-weight-medium text-body-sm">Lead Source</Text>
            <Select
              id="source"
              value={formData.source}
              onChange={(e) => handleChange('source', e.target.value)}
            >
              {SOURCE_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </Stack>
        </Grid>
      ),
    },
    {
      id: 'value',
      title: 'Deal Value & Stage',
      icon: <DollarSign className="h-5 w-5" />,
      content: (
        <Grid cols={2} gap={4} className="grid-cols-1 md:grid-cols-2">
          <Stack gap={2}>
            <Text className="font-weight-medium text-body-sm">Deal Value *</Text>
            <Input
              id="value"
              type="number"
              value={formData.value}
              onChange={(e) => handleChange('value', e.target.value)}
              placeholder="Enter deal value"
              className={errors.value ? 'border-error' : ''}
            />
            {errors.value && (
              <Body size="xs" className="text-error">{errors.value}</Body>
            )}
          </Stack>

          <Stack gap={2}>
            <Text className="font-weight-medium text-body-sm">Pipeline Stage</Text>
            <Select
              id="stage"
              value={formData.stage}
              onChange={(e) => handleChange('stage', e.target.value)}
            >
              {STAGE_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </Stack>

          <Stack gap={2}>
            <Text className="font-weight-medium text-body-sm">Win Probability (%)</Text>
            <Input
              id="probability"
              type="number"
              min="0"
              max="100"
              value={formData.probability}
              onChange={(e) => handleChange('probability', e.target.value)}
            />
          </Stack>

          <Stack gap={2}>
            <Text className="font-weight-medium text-body-sm">Expected Close Date</Text>
            <Input
              id="expected_close"
              type="date"
              value={formData.expected_close}
              onChange={(e) => handleChange('expected_close', e.target.value)}
            />
          </Stack>
        </Grid>
      ),
    },
    {
      id: 'details',
      title: 'Additional Details',
      icon: <FileText className="h-5 w-5" />,
      content: (
        <Stack gap={4}>
          <Stack gap={2}>
            <Text className="font-weight-medium text-body-sm">Deal Description</Text>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Describe the opportunity..."
              rows={3}
            />
          </Stack>

          <Stack gap={2}>
            <Text className="font-weight-medium text-body-sm">Internal Notes</Text>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Add any internal notes..."
              rows={2}
            />
            <Body size="xs" className="text-muted-foreground">
              These notes are only visible to team members
            </Body>
          </Stack>
        </Stack>
      ),
    },
  ], [formData, errors, handleChange]);

  if (!canCreateDeal) {
    return (
      <CreatePage
        title="New Deal"
        subtitle="Create a new sales opportunity"
        backHref="/deals"
        backLabel="Back to Deals"
        sections={[]}
        onSubmit={() => {}}
        accessDenied={{
          title: 'Permission Required',
          description: 'You do not have permission to create deals. This action requires ATLVS Team Member or higher role.',
          action: { label: 'Back to Deals', onClick: () => router.push('/deals') },
        }}
      />
    );
  }

  return (
    <CreatePage
      title="New Deal"
      subtitle="Create a new sales opportunity"
      breadcrumbs={[
        { label: 'Deals', href: '/deals' },
        { label: 'New Deal' },
      ]}
      backHref="/deals"
      backLabel="Back to Deals"
      sections={sections}
      onSubmit={handleSubmit}
      submitLabel="Create Deal"
      isSubmitting={isSubmitting}
      isValid={true}
    />
  );
}
