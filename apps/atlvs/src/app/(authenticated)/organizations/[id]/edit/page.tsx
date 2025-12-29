'use client';

/**
 * Edit Organization Page
 * Form for editing existing organizations in the unified organizations directory
 * 
 * Uses normalized EditPage template from @ghxstship/ui
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Building2, Phone, FileText } from 'lucide-react';
import { useAuthContext, ATLVS_ADMIN_ROLES } from '@ghxstship/config';
import {
  Body,
  EditPage,
  Grid,
  Input,
  Select,
  Stack,
  Text,
  Textarea,
  useNotifications,
  type FormSection,
} from '@ghxstship/ui';
import { 
  useOrganizationQuery, 
  useUpdateOrganization, 
  useDeleteOrganization,
  type OrgType, 
  type Organization 
} from '@/hooks/useOrganizationsQuery';

const ORG_TYPES: { value: OrgType; label: string; description: string }[] = [
  { value: 'vendor', label: 'Vendor', description: 'Supplier or service provider' },
  { value: 'client', label: 'Client', description: 'Customer or buyer' },
  { value: 'sponsor', label: 'Sponsor', description: 'Event or project sponsor' },
  { value: 'partner', label: 'Partner', description: 'Strategic partner' },
  { value: 'agency', label: 'Agency', description: 'Talent or booking agency' },
  { value: 'subsidiary', label: 'Subsidiary', description: 'Subsidiary company' },
  { value: 'other', label: 'Other', description: 'Other organization type' },
];

// Status options are defined inline in the form section

const COMPANY_SIZES = [
  { value: '1-10', label: '1-10 employees' },
  { value: '11-50', label: '11-50 employees' },
  { value: '51-200', label: '51-200 employees' },
  { value: '201-500', label: '201-500 employees' },
  { value: '501-1000', label: '501-1000 employees' },
  { value: '1001-5000', label: '1001-5000 employees' },
  { value: '5000+', label: '5000+ employees' },
];

interface FormData {
  name: string;
  legal_name: string;
  code: string;
  description: string;
  org_type: OrgType;
  email: string;
  phone: string;
  website: string;
  tax_id: string;
  industry: string;
  company_size: Organization['company_size'] | '';
  status: Organization['status'];
  tags: string;
  notes: string;
}

export default function EditOrganizationPage() {
  const router = useRouter();
  const params = useParams();
  const orgId = params?.id as string;
  
  const { hasRole } = useAuthContext();
  const { addNotification } = useNotifications();
  
  const { data: org, isLoading, error } = useOrganizationQuery(orgId);
  const updateMutation = useUpdateOrganization();
  const deleteMutation = useDeleteOrganization();

  const canManageOrgs = ATLVS_ADMIN_ROLES.some(role => hasRole(role));

  const [formData, setFormData] = useState<FormData>({
    name: '',
    legal_name: '',
    code: '',
    description: '',
    org_type: 'vendor',
    email: '',
    phone: '',
    website: '',
    tax_id: '',
    industry: '',
    company_size: '',
    status: 'active',
    tags: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  // EditPage handles delete dialog internally

  useEffect(() => {
    if (org) {
      setFormData({
        name: org.name || '',
        legal_name: org.legal_name || '',
        code: org.code || '',
        description: org.description || '',
        org_type: org.org_type || 'vendor',
        email: org.email || '',
        phone: org.phone || '',
        website: org.website || '',
        tax_id: org.tax_id || '',
        industry: org.industry || '',
        company_size: org.company_size ?? '',
        status: org.status,
        tags: org.tags?.join(', ') || '',
        notes: org.notes || '',
      });
    }
  }, [org]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Organization name is required';
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      newErrors.website = 'Website must start with http:// or https://';
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
        id: orgId,
        name: formData.name.trim(),
        legal_name: formData.legal_name.trim() || undefined,
        code: formData.code.trim() || undefined,
        description: formData.description.trim() || undefined,
        org_type: formData.org_type,
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        website: formData.website.trim() || undefined,
        tax_id: formData.tax_id.trim() || undefined,
        industry: formData.industry.trim() || undefined,
        company_size: formData.company_size || undefined,
        status: formData.status,
        tags: tags.length > 0 ? tags : undefined,
        notes: formData.notes.trim() || undefined,
      });

      addNotification({
        type: 'success',
        title: 'Organization Updated',
        message: `${formData.name} has been updated.`,
      });

      router.push(`/organizations/${orgId}`);
    } catch (err) {
      addNotification({
        type: 'error',
        title: 'Failed to Update Organization',
        message: err instanceof Error ? err.message : 'An error occurred',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      await deleteMutation.mutateAsync(orgId);

      addNotification({
        type: 'success',
        title: 'Organization Deleted',
        message: `${org?.name} has been removed.`,
      });

      router.push('/organizations');
    } catch (err) {
      addNotification({
        type: 'error',
        title: 'Failed to Delete Organization',
        message: err instanceof Error ? err.message : 'An error occurred',
      });
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
      title: 'Organization Information',
      icon: <Building2 className="h-5 w-5" />,
      content: (
        <Grid cols={2} gap={4} className="grid-cols-1 md:grid-cols-2">
          <Stack gap={2} className="md:col-span-2">
            <Text className="font-weight-medium text-body-sm">Organization Name *</Text>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Enter organization name"
              className={errors.name ? 'border-error' : ''}
            />
            {errors.name && (
              <Body size="xs" className="text-error">{errors.name}</Body>
            )}
          </Stack>

          <Stack gap={2}>
            <Text className="font-weight-medium text-body-sm">Organization Type *</Text>
            <Select
              id="org_type"
              value={formData.org_type}
              onChange={(e) => handleChange('org_type', e.target.value as OrgType)}
            >
              {ORG_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </Select>
          </Stack>

          <Stack gap={2}>
            <Text className="font-weight-medium text-body-sm">Industry</Text>
            <Input
              id="industry"
              value={formData.industry}
              onChange={(e) => handleChange('industry', e.target.value)}
              placeholder="e.g., Entertainment, Technology"
            />
          </Stack>

          <Stack gap={2}>
            <Text className="font-weight-medium text-body-sm">Company Size</Text>
            <Select
              id="company_size"
              value={formData.company_size}
              onChange={(e) => handleChange('company_size', e.target.value)}
            >
              {COMPANY_SIZES.map(size => (
                <option key={size.value} value={size.value}>
                  {size.label}
                </option>
              ))}
            </Select>
          </Stack>

          <Stack gap={2}>
            <Text className="font-weight-medium text-body-sm">Website</Text>
            <Input
              id="website"
              value={formData.website}
              onChange={(e) => handleChange('website', e.target.value)}
              placeholder="https://example.com"
            />
          </Stack>
        </Grid>
      ),
    },
    {
      id: 'contact',
      title: 'Contact & Classification',
      icon: <Phone className="h-5 w-5" />,
      content: (
        <Grid cols={2} gap={4} className="grid-cols-1 md:grid-cols-2">
          <Stack gap={2}>
            <Text className="font-weight-medium text-body-sm">Email</Text>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="contact@example.com"
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
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="+1 (555) 123-4567"
            />
          </Stack>

          <Stack gap={2}>
            <Text className="font-weight-medium text-body-sm">Tax ID / EIN</Text>
            <Input
              id="tax_id"
              value={formData.tax_id}
              onChange={(e) => handleChange('tax_id', e.target.value)}
              placeholder="XX-XXXXXXX"
            />
          </Stack>

          <Stack gap={2}>
            <Text className="font-weight-medium text-body-sm">Status</Text>
            <Select
              id="status"
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </Select>
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
            <Text className="font-weight-medium text-body-sm">Description</Text>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Describe the organization..."
              rows={4}
            />
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

          <Stack gap={2}>
            <Text className="font-weight-medium text-body-sm">Internal Notes</Text>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Add any internal notes about this organization..."
              rows={3}
            />
            <Body size="xs" className="text-muted-foreground">
              These notes are only visible to team members
            </Body>
          </Stack>
        </Stack>
      ),
    },
  ], [formData, errors, handleChange]);

  // EditPage handles loading, not found, and access denied states
  return (
    <EditPage
      title={org ? `Edit ${org.name}` : 'Edit Organization'}
      subtitle="Update organization information"
      breadcrumbs={org ? [
        { label: 'Organizations', href: '/organizations' },
        { label: org.name, href: `/organizations/${orgId}` },
        { label: 'Edit' },
      ] : undefined}
      backHref={org ? `/organizations/${orgId}` : '/organizations'}
      backLabel="Back to Organization"
      sections={sections}
      onSubmit={handleSubmit}
      submitLabel="Save Changes"
      isSubmitting={isSubmitting}
      isValid={true}
      isLoading={isLoading}
      notFound={!isLoading && (error || !org) ? {
        title: 'Organization Not Found',
        description: "The organization you're trying to edit doesn't exist or has been removed.",
        action: { label: 'Back to Organizations', onClick: () => router.push('/organizations') },
      } : undefined}
      accessDenied={!canManageOrgs ? {
        title: 'Permission Required',
        description: 'You do not have permission to edit organizations.',
        action: { label: 'Back to Organizations', onClick: () => router.push('/organizations') },
      } : undefined}
      onDelete={handleDelete}
      isDeleting={isDeleting}
      deleteConfirmMessage="This action cannot be undone. This will permanently delete the organization and all associated contracts, orders, and history."
    />
  );
}
