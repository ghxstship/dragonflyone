'use client';

import { ArrowLeft, Star, Trash2, Phone, Mail, ExternalLink } from 'lucide-react';
import { useRemovePreferredVendor, useUpdatePreferredVendor } from '@/hooks/usePreferredVendors';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const STATUS_CONFIG = {
  active: { label: 'Active', color: 'bg-success/20 text-success' },
  pending: { label: 'Pending', color: 'bg-warning/20 text-warning' },
  inactive: { label: 'Inactive', color: 'bg-muted text-muted-foreground' },
  suspended: { label: 'Suspended', color: 'bg-destructive/20 text-destructive' },
};

const TIER_CONFIG = {
  platinum: { label: 'Platinum', color: 'bg-primary text-primary-foreground' },
  gold: { label: 'Gold', color: 'bg-warning text-warning-foreground' },
  silver: { label: 'Silver', color: 'bg-muted text-muted-foreground' },
  bronze: { label: 'Bronze', color: 'bg-warning text-warning-foreground' },
};

export default function PreferredVendorDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['preferred-vendor', id],
    queryFn: async () => {
      const res = await fetch(`/api/preferred-vendors?id=${id}`);
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
  });
  const deleteMutation = useRemovePreferredVendor();
  const updateMutation = useUpdatePreferredVendor();

  const preferredVendor = data?.preferred_vendor || data?.preferred_vendors?.[0];
  const vendor = preferredVendor?.vendor;

  const handleDelete = async () => {
    if (confirm('Remove this vendor from preferred list? This cannot be undone.')) {
      setIsDeleting(true);
      await deleteMutation.mutateAsync(id);
      router.push('/preferred-vendors');
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    await updateMutation.mutateAsync({ id, status: newStatus as 'active' | 'inactive' });
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded-card w-1/3" />
          <div className="h-64 bg-muted rounded-card" />
        </div>
      </div>
    );
  }

  if (error || !preferredVendor) {
    return (
      <div className="p-6">
        <div className="bg-destructive/10 border-2 border-destructive rounded-card p-4 text-destructive">
          Preferred vendor not found.
        </div>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[preferredVendor.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.active;
  const tierConfig = TIER_CONFIG[preferredVendor.tier as keyof typeof TIER_CONFIG];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <a
            href="/preferred-vendors"
            className="p-2 border-2 border-border rounded-button hover:bg-muted transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </a>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-card">
              <Star className="h-6 w-6 text-primary fill-primary" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-h2-md font-weight-bold text-foreground">
                  {vendor?.company_name || vendor?.name || 'Preferred Vendor'}
                </h1>
                <span className={`px-2 py-1 rounded-badge text-body-xs font-weight-medium ${statusConfig.color}`}>
                  {statusConfig.label}
                </span>
                {tierConfig && (
                  <span className={`px-2 py-1 rounded-badge text-body-xs font-weight-medium ${tierConfig.color}`}>
                    {tierConfig.label}
                  </span>
                )}
              </div>
              <p className="text-body-sm text-muted-foreground mt-1">
                {preferredVendor.category || 'Uncategorized'} • Added {new Date(preferredVendor.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={`/vendors/${vendor?.id}`}
            className="inline-flex items-center gap-2 px-4 py-2 border-2 border-border rounded-button text-body-sm font-weight-medium hover:bg-muted transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            View Full Profile
          </a>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="inline-flex items-center gap-2 px-4 py-2 border-2 border-destructive text-destructive rounded-button text-body-sm font-weight-medium hover:bg-destructive/10 transition-colors disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            Remove
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-background border-2 border-border rounded-card p-6">
            <h2 className="text-h4-md font-weight-semibold text-foreground mb-4">Vendor Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-body-xs text-muted-foreground">Company Name</p>
                <p className="text-body-sm font-weight-medium">{vendor?.company_name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-body-xs text-muted-foreground">Contact Name</p>
                <p className="text-body-sm font-weight-medium">{vendor?.name || 'N/A'}</p>
              </div>
              {vendor?.email && (
                <div>
                  <p className="text-body-xs text-muted-foreground">Email</p>
                  <a href={`mailto:${vendor.email}`} className="text-body-sm text-primary hover:underline flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {vendor.email}
                  </a>
                </div>
              )}
              {vendor?.phone && (
                <div>
                  <p className="text-body-xs text-muted-foreground">Phone</p>
                  <a href={`tel:${vendor.phone}`} className="text-body-sm text-primary hover:underline flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {vendor.phone}
                  </a>
                </div>
              )}
            </div>
          </div>

          {preferredVendor.notes && (
            <div className="bg-background border-2 border-border rounded-card p-6">
              <h2 className="text-h4-md font-weight-semibold text-foreground mb-4">Notes</h2>
              <p className="text-body-sm text-foreground whitespace-pre-wrap">{preferredVendor.notes}</p>
            </div>
          )}

          {preferredVendor.specialties && preferredVendor.specialties.length > 0 && (
            <div className="bg-background border-2 border-border rounded-card p-6">
              <h2 className="text-h4-md font-weight-semibold text-foreground mb-4">Specialties</h2>
              <div className="flex flex-wrap gap-2">
                {preferredVendor.specialties.map((specialty: string, index: number) => (
                  <span key={index} className="px-3 py-1 bg-primary/10 text-primary rounded-badge text-body-sm">
                    {specialty}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-background border-2 border-border rounded-card p-6">
            <h2 className="text-h4-md font-weight-semibold text-foreground mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <button
                onClick={() => handleStatusChange(preferredVendor.status === 'active' ? 'inactive' : 'active')}
                disabled={updateMutation.isPending}
                className="w-full px-4 py-2 border-2 border-border rounded-button text-body-sm font-weight-medium hover:bg-muted transition-colors text-left disabled:opacity-50"
              >
                {preferredVendor.status === 'active' ? 'Deactivate' : 'Activate'} Preferred Status
              </button>
              <a
                href={`/vendor-orders/new?vendor=${vendor?.id}`}
                className="block w-full px-4 py-2 border-2 border-border rounded-button text-body-sm font-weight-medium hover:bg-muted transition-colors text-left"
              >
                Create Order
              </a>
              <a
                href={`/vendors/${vendor?.id}/reviews`}
                className="block w-full px-4 py-2 border-2 border-border rounded-button text-body-sm font-weight-medium hover:bg-muted transition-colors text-left"
              >
                View Reviews
              </a>
            </div>
          </div>

          {preferredVendor.pricing_tier && (
            <div className="bg-background border-2 border-border rounded-card p-6">
              <h2 className="text-h4-md font-weight-semibold text-foreground mb-4">Pricing</h2>
              <div className="space-y-2">
                <div>
                  <p className="text-body-xs text-muted-foreground">Pricing Tier</p>
                  <p className="text-body-sm font-weight-medium capitalize">{preferredVendor.pricing_tier}</p>
                </div>
                {preferredVendor.discount_percentage && (
                  <div>
                    <p className="text-body-xs text-muted-foreground">Negotiated Discount</p>
                    <p className="text-body-sm font-weight-medium text-success">{preferredVendor.discount_percentage}% off</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="bg-background border-2 border-border rounded-card p-6">
            <h2 className="text-h4-md font-weight-semibold text-foreground mb-4">Agreement Details</h2>
            <div className="space-y-2">
              <div>
                <p className="text-body-xs text-muted-foreground">Added Date</p>
                <p className="text-body-sm font-weight-medium">
                  {new Date(preferredVendor.created_at).toLocaleDateString()}
                </p>
              </div>
              {preferredVendor.contract_expires_at && (
                <div>
                  <p className="text-body-xs text-muted-foreground">Contract Expires</p>
                  <p className="text-body-sm font-weight-medium">
                    {new Date(preferredVendor.contract_expires_at).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
