'use client';

/**
 * Edit Deal Page
 * Form for editing existing deals/opportunities
 * 
 * Uses normalized EditPage template from @ghxstship/ui
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Briefcase, DollarSign, FileText } from 'lucide-react';
import { useAuthContext, ATLVS_ADMIN_ROLES } from '@ghxstship/config';
import {
  Body, EditPage, Grid, Input, Select, Stack, Textarea, useToast,
  type FormSection } from "@ghxstship/ui";
import { useDeal, useUpdateDeal, useDeleteDeal } from '@/hooks/useDeals';

const STAGE_OPTIONS = [
  { value: 'lead', label: 'Lead' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'proposal', label: 'Proposal' },
  { value: 'negotiation', label: 'Negotiation' },
  { value: 'won', label: 'Closed Won' },
  { value: 'lost', label: 'Closed Lost' },
];

const SOURCE_OPTIONS = [
  { value: '', label: 'Select source' },
  { value: 'referral', label: 'Referral' },
  { value: 'website', label: 'Website' },
  { value: 'cold_outreach', label: 'Cold Outreach' },
  { value: 'event', label: 'Event' },
  { value: 'partner', label: 'Partner' },
];

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

export default function EditDealPage() {
  const router = useRouter();
  const params = useParams();
  const dealId = params?.id as string;
  
  const { hasRole } = useAuthContext();
  const toast = useToast();
  
  const { data: deal, isLoading, error } = useDeal(dealId);
  const updateMutation = useUpdateDeal();
  const deleteMutation = useDeleteDeal();

  const canManageDeals = ATLVS_ADMIN_ROLES.some(role => hasRole(role));

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
    notes: '' });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (deal) {
      setFormData({
        title: deal.title || '',
        client: deal.client || '',
        contact: deal.contact || '',
        value: deal.value?.toString() || '',
        stage: deal.status || 'lead',
        probability: deal.probability?.toString() || '25',
        expected_close: deal.expected_close_date?.split('T')[0] || '',
        source: deal.source || '',
        description: deal.description || '',
        notes: deal.notes || '' });
    }
  }, [deal]);

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
      await updateMutation.mutateAsync({
        id: dealId,
        title: formData.title.trim(),
        client: formData.client.trim() || undefined,
        contact: formData.contact.trim() || undefined,
        value: parseFloat(formData.value) || 0,
        status: formData.stage as 'lead' | 'qualified' | 'proposal' | 'won' | 'lost',
        probability: parseInt(formData.probability) || 25,
        expected_close_date: formData.expected_close || undefined,
        source: formData.source || undefined,
        description: formData.description.trim() || undefined,
        notes: formData.notes.trim() || undefined });

      toast.success('Deal Updated', `${formData.title} has been updated.`);

      router.push(`/deals/${dealId}`);
    } catch (err) {
      toast.error('Failed to Update Deal', err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      await deleteMutation.mutateAsync(dealId);

      toast.success('Deal Deleted', `${deal?.title} has been removed.`);

      router.push('/deals');
    } catch (err) {
      toast.error('Failed to Delete Deal', err instanceof Error ? err.message : 'An error occurred');
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
      id: 'info',
      title: 'Deal Information',
      icon: <Briefcase className="h-5 w-5" />,
      content: (
        <Grid cols={2} gap={4} className="grid-cols-1 md:grid-cols-2">
          <Stack gap={2}>
            <Body size="sm" className="font-weight-medium">Deal Title *</Body>
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
            <Body size="sm" className="font-weight-medium">Client/Company *</Body>
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
            <Body size="sm" className="font-weight-medium">Primary Contact</Body>
            <Input
              id="contact"
              value={formData.contact}
              onChange={(e) => handleChange('contact', e.target.value)}
              placeholder="Contact name"
            />
          </Stack>

          <Stack gap={2}>
            <Body size="sm" className="font-weight-medium">Lead Source</Body>
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
      ) },
    {
      id: 'value',
      title: 'Deal Value & Stage',
      icon: <DollarSign className="h-5 w-5" />,
      content: (
        <Grid cols={2} gap={4} className="grid-cols-1 md:grid-cols-2">
          <Stack gap={2}>
            <Body size="sm" className="font-weight-medium">Deal Value *</Body>
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
            <Body size="sm" className="font-weight-medium">Pipeline Stage</Body>
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
            <Body size="sm" className="font-weight-medium">Win Probability (%)</Body>
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
            <Body size="sm" className="font-weight-medium">Expected Close Date</Body>
            <Input
              id="expected_close"
              type="date"
              value={formData.expected_close}
              onChange={(e) => handleChange('expected_close', e.target.value)}
            />
          </Stack>
        </Grid>
      ) },
    {
      id: 'details',
      title: 'Additional Details',
      icon: <FileText className="h-5 w-5" />,
      content: (
        <Stack gap={4}>
          <Stack gap={2}>
            <Body size="sm" className="font-weight-medium">Deal Description</Body>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Describe the opportunity..."
              rows={3}
            />
          </Stack>

          <Stack gap={2}>
            <Body size="sm" className="font-weight-medium">Internal Notes</Body>
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
      ) },
  ], [formData, errors, handleChange]);

  return (
    <EditPage
      title={deal ? `Edit ${deal.title}` : 'Edit Deal'}
      subtitle="Update deal information"
      breadcrumbs={deal ? [
        { label: 'Deals', href: '/deals' },
        { label: deal.title, href: `/deals/${dealId}` },
        { label: 'Edit' },
      ] : undefined}
      backHref={deal ? `/deals/${dealId}` : '/deals'}
      backLabel="Back to Deal"
      sections={sections}
      onSubmit={handleSubmit}
      submitLabel="Save Changes"
      isSubmitting={isSubmitting}
      isValid={true}
      isLoading={isLoading}
      notFound={!isLoading && (error || !deal) ? {
        title: 'Deal Not Found',
        description: "The deal you're trying to edit doesn't exist or has been removed.",
        action: { label: 'Back to Deals', onClick: () => router.push('/deals') } } : undefined}
      accessDenied={!canManageDeals ? {
        title: 'Permission Required',
        description: 'You do not have permission to edit deals.',
        action: { label: 'Back to Deals', onClick: () => router.push('/deals') } } : undefined}
      onDelete={handleDelete}
      isDeleting={isDeleting}
      deleteConfirmMessage="This action cannot be undone. This will permanently delete the deal and all associated activity history."
    />
  );
}
