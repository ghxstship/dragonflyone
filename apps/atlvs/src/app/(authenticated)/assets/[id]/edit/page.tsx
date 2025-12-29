'use client';

/**
 * Edit Asset Page
 * Form for editing existing assets in the asset catalog
 * 
 * Uses normalized EditPage template from @ghxstship/ui
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Package, DollarSign, FileText } from 'lucide-react';
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
import { useAssets, useUpdateAsset, useDeleteAsset, type Asset } from '@/hooks/useAssets';

const ASSET_CATEGORIES = [
  { value: 'audio', label: 'Audio Equipment' },
  { value: 'video', label: 'Video Equipment' },
  { value: 'lighting', label: 'Lighting' },
  { value: 'staging', label: 'Staging' },
  { value: 'rigging', label: 'Rigging' },
  { value: 'power', label: 'Power Distribution' },
  { value: 'furniture', label: 'Furniture' },
  { value: 'vehicles', label: 'Vehicles' },
  { value: 'tools', label: 'Tools' },
  { value: 'other', label: 'Other' },
];

const STATE_OPTIONS: { value: Asset['state']; label: string }[] = [
  { value: 'available', label: 'Available' },
  { value: 'reserved', label: 'Reserved' },
  { value: 'deployed', label: 'Deployed' },
  { value: 'maintenance', label: 'In Maintenance' },
  { value: 'retired', label: 'Retired' },
];

interface FormData {
  tag: string;
  name: string;
  category: string;
  state: Asset['state'];
  purchase_price: string;
  purchase_date: string;
  location: string;
  depreciation_rate: string;
  notes: string;
}

export default function EditAssetPage() {
  const router = useRouter();
  const params = useParams();
  const assetId = params?.id as string;
  
  const { hasRole } = useAuthContext();
  const { addNotification } = useNotifications();
  
  const { data: assets, isLoading } = useAssets();
  const asset = assets?.find(a => a.id === assetId);
  const updateMutation = useUpdateAsset();
  const deleteMutation = useDeleteAsset();

  const canManageAssets = ATLVS_ADMIN_ROLES.some(role => hasRole(role));

  const [formData, setFormData] = useState<FormData>({
    tag: '',
    name: '',
    category: 'audio',
    state: 'available',
    purchase_price: '',
    purchase_date: '',
    location: '',
    depreciation_rate: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (asset) {
      setFormData({
        tag: asset.tag || '',
        name: asset.name || '',
        category: asset.category || 'audio',
        state: asset.state || 'available',
        purchase_price: asset.purchase_price?.toString() || '',
        purchase_date: asset.purchase_date?.split('T')[0] || '',
        location: asset.location || '',
        depreciation_rate: asset.depreciation_rate?.toString() || '',
        notes: '',
      });
    }
  }, [asset]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.tag.trim()) {
      newErrors.tag = 'Asset tag is required';
    }
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    if (formData.purchase_price && isNaN(parseFloat(formData.purchase_price))) {
      newErrors.purchase_price = 'Purchase price must be a number';
    }
    if (formData.depreciation_rate && isNaN(parseFloat(formData.depreciation_rate))) {
      newErrors.depreciation_rate = 'Depreciation rate must be a number';
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
        id: assetId,
        tag: formData.tag.trim(),
        name: formData.name.trim() || undefined,
        category: formData.category,
        state: formData.state,
        purchase_price: formData.purchase_price ? parseFloat(formData.purchase_price) : undefined,
        purchase_date: formData.purchase_date || undefined,
        location: formData.location.trim() || undefined,
        depreciation_rate: formData.depreciation_rate ? parseFloat(formData.depreciation_rate) : undefined,
      });

      addNotification({
        type: 'success',
        title: 'Asset Updated',
        message: `${formData.tag} has been updated.`,
      });

      router.push(`/assets/${assetId}`);
    } catch (err) {
      addNotification({
        type: 'error',
        title: 'Failed to Update Asset',
        message: err instanceof Error ? err.message : 'An error occurred',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      await deleteMutation.mutateAsync(assetId);

      addNotification({
        type: 'success',
        title: 'Asset Deleted',
        message: `${asset?.tag} has been removed.`,
      });

      router.push('/assets');
    } catch (err) {
      addNotification({
        type: 'error',
        title: 'Failed to Delete Asset',
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
      title: 'Asset Information',
      icon: <Package className="h-5 w-5" />,
      content: (
        <Grid cols={2} gap={4} className="grid-cols-1 md:grid-cols-2">
          <Stack gap={2}>
            <Text className="font-weight-medium text-body-sm">Asset Tag *</Text>
            <Input
              id="tag"
              value={formData.tag}
              onChange={(e) => handleChange('tag', e.target.value)}
              placeholder="e.g., AUD-001"
              className={errors.tag ? 'border-error' : ''}
            />
            {errors.tag && (
              <Body size="xs" className="text-error">{errors.tag}</Body>
            )}
          </Stack>

          <Stack gap={2}>
            <Text className="font-weight-medium text-body-sm">Name / Description</Text>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g., JBL VTX A12 Line Array"
            />
          </Stack>

          <Stack gap={2}>
            <Text className="font-weight-medium text-body-sm">Category *</Text>
            <Select
              id="category"
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
            >
              {ASSET_CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </Select>
            {errors.category && (
              <Body size="xs" className="text-error">{errors.category}</Body>
            )}
          </Stack>

          <Stack gap={2}>
            <Text className="font-weight-medium text-body-sm">State</Text>
            <Select
              id="state"
              value={formData.state}
              onChange={(e) => handleChange('state', e.target.value)}
            >
              {STATE_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </Stack>

          <Stack gap={2}>
            <Text className="font-weight-medium text-body-sm">Location</Text>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              placeholder="e.g., Warehouse A, Bay 3"
            />
          </Stack>
        </Grid>
      ),
    },
    {
      id: 'financial',
      title: 'Financial Information',
      icon: <DollarSign className="h-5 w-5" />,
      content: (
        <Grid cols={3} gap={4} className="grid-cols-1 md:grid-cols-3">
          <Stack gap={2}>
            <Text className="font-weight-medium text-body-sm">Purchase Price</Text>
            <Input
              id="purchase_price"
              type="number"
              step="0.01"
              value={formData.purchase_price}
              onChange={(e) => handleChange('purchase_price', e.target.value)}
              placeholder="0.00"
              className={errors.purchase_price ? 'border-error' : ''}
            />
            {errors.purchase_price && (
              <Body size="xs" className="text-error">{errors.purchase_price}</Body>
            )}
          </Stack>

          <Stack gap={2}>
            <Text className="font-weight-medium text-body-sm">Purchase Date</Text>
            <Input
              id="purchase_date"
              type="date"
              value={formData.purchase_date}
              onChange={(e) => handleChange('purchase_date', e.target.value)}
            />
          </Stack>

          <Stack gap={2}>
            <Text className="font-weight-medium text-body-sm">Depreciation Rate (%)</Text>
            <Input
              id="depreciation_rate"
              type="number"
              step="0.1"
              value={formData.depreciation_rate}
              onChange={(e) => handleChange('depreciation_rate', e.target.value)}
              placeholder="e.g., 10"
              className={errors.depreciation_rate ? 'border-error' : ''}
            />
            {errors.depreciation_rate && (
              <Body size="xs" className="text-error">{errors.depreciation_rate}</Body>
            )}
          </Stack>
        </Grid>
      ),
    },
    {
      id: 'notes',
      title: 'Notes',
      icon: <FileText className="h-5 w-5" />,
      content: (
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          placeholder="Add any notes about this asset..."
          rows={4}
        />
      ),
    },
  ], [formData, errors, handleChange]);

  // EditPage handles loading, not found, and access denied states
  return (
    <EditPage
      title={asset ? `Edit ${asset.tag}` : 'Edit Asset'}
      subtitle="Update asset information"
      breadcrumbs={asset ? [
        { label: 'Assets', href: '/assets' },
        { label: asset.tag, href: `/assets/${assetId}` },
        { label: 'Edit' },
      ] : undefined}
      backHref={asset ? `/assets/${assetId}` : '/assets'}
      backLabel="Back to Asset"
      sections={sections}
      onSubmit={handleSubmit}
      submitLabel="Save Changes"
      isSubmitting={isSubmitting}
      isValid={true}
      isLoading={isLoading}
      notFound={!isLoading && !asset ? {
        title: 'Asset Not Found',
        description: "The asset you're trying to edit doesn't exist or has been removed.",
        action: { label: 'Back to Assets', onClick: () => router.push('/assets') },
      } : undefined}
      accessDenied={!canManageAssets ? {
        title: 'Permission Required',
        description: 'You do not have permission to edit assets.',
        action: { label: 'Back to Assets', onClick: () => router.push('/assets') },
      } : undefined}
      onDelete={handleDelete}
      isDeleting={isDeleting}
      deleteConfirmMessage="This action cannot be undone. This will permanently delete the asset and all associated deployment history."
    />
  );
}
