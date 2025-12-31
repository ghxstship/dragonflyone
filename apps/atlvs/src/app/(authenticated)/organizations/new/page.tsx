'use client';

/**
 * Create New Organization Page
 * Form for adding new organizations to the unified organizations directory
 * 
 * Uses normalized CreatePage template from @ghxstship/ui
 */

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Phone, Tag, FileText } from 'lucide-react';
import { useAuthContext, ATLVS_ADMIN_ROLES } from '@ghxstship/config';
import {
  Body, CreatePage, Grid, Input, Select, Stack, Text, Textarea, useToast,
  type FormSection} from "@ghxstship/ui";
import { useCreateOrganization, type OrgType, type Organization } from '@/hooks/useOrganizationsQuery';

const ORG_TYPES: { value: OrgType; label: string; description: string }[] = [
  { value: 'vendor', label: 'Vendor', description: 'Supplier or service provider' },
  { value: 'client', label: 'Client', description: 'Customer or buyer' },
  { value: 'sponsor', label: 'Sponsor', description: 'Event or project sponsor' },
  { value: 'partner', label: 'Partner', description: 'Strategic partner' },
  { value: 'agency', label: 'Agency', description: 'Talent or booking agency' },
  { value: 'subsidiary', label: 'Subsidiary', description: 'Subsidiary company' },
  { value: 'other', label: 'Other', description: 'Other organization type' },
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'draft', label: 'Draft' },
];

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

export default function NewOrganizationPage() {
  const router = useRouter();
  const { hasRole } = useAuthContext();
  const toast = useToast();
  const createMutation = useCreateOrganization();

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

      const org = await createMutation.mutateAsync({
        organization_id: '', // Will be set by API based on user's org
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

      toast.success('Organization Created', `${formData.name} has been added.`);

      router.push(`/organizations/${org.id}`);
    } catch (err) {
      toast.error('Failed to Create Organization', err instanceof Error ? err.message : 'An error occurred');
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
      icon: <Building2 className="h-5 w-5" />,
      content: (
        <Stack gap={4}>
          <Grid cols={2} gap={4} className="grid-cols-1 md:grid-cols-2">
            <Stack gap={2}>
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
              <Text className="font-weight-medium text-body-sm">Legal Name</Text>
              <Input
                id="legal_name"
                value={formData.legal_name}
                onChange={(e) => handleChange('legal_name', e.target.value)}
                placeholder="Legal entity name (if different)"
              />
            </Stack>

            <Stack gap={2}>
              <Text className="font-weight-medium text-body-sm">Code / Abbreviation</Text>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => handleChange('code', e.target.value)}
                placeholder="e.g., ACME"
              />
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
          </Grid>

          <Stack gap={2}>
            <Text className="font-weight-medium text-body-sm">Description</Text>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Brief description of the organization..."
              rows={3}
            />
          </Stack>
        </Stack>
      ),
    },
    {
      id: 'contact',
      title: 'Contact Information',
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
              placeholder="contact@organization.com"
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

          <Stack gap={2} className="md:col-span-2">
            <Text className="font-weight-medium text-body-sm">Website</Text>
            <Input
              id="website"
              value={formData.website}
              onChange={(e) => handleChange('website', e.target.value)}
              placeholder="https://www.organization.com"
              className={errors.website ? 'border-error' : ''}
            />
            {errors.website && (
              <Body size="xs" className="text-error">{errors.website}</Body>
            )}
          </Stack>
        </Grid>
      ),
    },
    {
      id: 'classification',
      title: 'Classification',
      icon: <Tag className="h-5 w-5" />,
      content: (
        <Grid cols={2} gap={4} className="grid-cols-1 md:grid-cols-2">
          <Stack gap={2}>
            <Text className="font-weight-medium text-body-sm">Organization Type</Text>
            <Select
              id="org_type"
              value={formData.org_type}
              onChange={(e) => handleChange('org_type', e.target.value)}
            >
              {ORG_TYPES.map(type => (
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

          <Stack gap={2}>
            <Text className="font-weight-medium text-body-sm">Company Size</Text>
            <Select
              id="company_size"
              value={formData.company_size || ''}
              onChange={(e) => handleChange('company_size', e.target.value)}
            >
              <option value="">Select size...</option>
              {COMPANY_SIZES.map(size => (
                <option key={size.value} value={size.value}>
                  {size.label}
                </option>
              ))}
            </Select>
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

          <Stack gap={2} className="md:col-span-2">
            <Text className="font-weight-medium text-body-sm">Tags</Text>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => handleChange('tags', e.target.value)}
              placeholder="Enter tags separated by commas (e.g., Preferred, Local, National)"
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
            placeholder="Add any internal notes about this organization..."
            rows={4}
          />
          <Body size="xs" className="text-muted-foreground">
            These notes are only visible to team members
          </Body>
        </Stack>
      ),
    },
  ], [formData, errors, handleChange]);

  if (!canManageOrgs) {
    return (
      <CreatePage
        title="Add New Organization"
        subtitle="Create a new entry in the organizations directory"
        backHref="/organizations"
        backLabel="Back to Organizations"
        sections={[]}
        onSubmit={() => {}}
        accessDenied={{
          title: 'Permission Required',
          description: 'You do not have permission to add new organizations.',
          action: { label: 'Back to Organizations', onClick: () => router.push('/organizations') },
        }}
      />
    );
  }

  return (
    <CreatePage
      title="Add New Organization"
      subtitle="Create a new entry in the organizations directory"
      breadcrumbs={[
        { label: 'Organizations', href: '/organizations' },
        { label: 'New Organization' },
      ]}
      backHref="/organizations"
      backLabel="Back to Organizations"
      sections={sections}
      onSubmit={handleSubmit}
      submitLabel="Create Organization"
      isSubmitting={isSubmitting}
      isValid={true}
    />
  );
}
