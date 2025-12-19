'use client';

import Image from 'next/image';
import { ArrowLeft, Building2, Mail, Phone, MapPin, Globe, Star, Edit, Trash2 } from 'lucide-react';
import { useVendorProfile, useDeleteVendor } from '@/hooks/useVendorProfiles';
import { useVendorReviews, useVendorMetrics } from '@/hooks/useVendorPerformance';
import { useRouter } from 'next/navigation';

export default function VendorDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();

  const { data, isLoading, error } = useVendorProfile(id);
  const { data: reviewsData } = useVendorReviews(id);
  const { data: metricsData } = useVendorMetrics(id);
  const deleteMutation = useDeleteVendor();

  const vendor = data?.vendor;

  const handleDelete = async () => {
    if (confirm(`Delete vendor "${vendor?.name}"? This action cannot be undone.`)) {
      await deleteMutation.mutateAsync(id);
      router.push('/vendors');
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded-card w-1/3" />
          <div className="h-48 bg-muted rounded-card" />
        </div>
      </div>
    );
  }

  if (error || !vendor) {
    return (
      <div className="p-6">
        <div className="bg-destructive/10 border-2 border-destructive rounded-card p-4 text-destructive">
          Failed to load vendor details. The vendor may not exist.
        </div>
      </div>
    );
  }

  const statusColors = {
    active: 'bg-success/20 text-success',
    inactive: 'bg-muted text-muted-foreground',
    pending: 'bg-warning/20 text-warning',
    suspended: 'bg-destructive/20 text-destructive',
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <a
            href="/vendors"
            className="p-2 border-2 border-border rounded-button hover:bg-muted transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </a>
          <div className="flex items-center gap-4">
            {vendor.logo_url ? (
              <Image
                src={vendor.logo_url}
                alt={vendor.name}
                width={64}
                height={64}
                className="w-16 h-16 rounded-card object-cover border-2 border-border"
              />
            ) : (
              <div className="w-16 h-16 rounded-card bg-muted flex items-center justify-center border-2 border-border">
                <Building2 className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-h2-md font-weight-bold text-foreground">{vendor.name}</h1>
                <span className={`px-2 py-1 rounded-badge text-body-xs font-weight-medium ${statusColors[vendor.status as keyof typeof statusColors] || statusColors.active}`}>
                  {vendor.status}
                </span>
              </div>
              {vendor.category && (
                <p className="text-body-sm text-muted-foreground">{vendor.category.name}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={`/vendors/${id}/edit`}
            className="inline-flex items-center gap-2 px-4 py-2 border-2 border-border rounded-button text-body-sm font-weight-medium hover:bg-muted transition-colors"
          >
            <Edit className="h-4 w-4" />
            Edit
          </a>
          <button
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="inline-flex items-center gap-2 px-4 py-2 border-2 border-destructive text-destructive rounded-button text-body-sm font-weight-medium hover:bg-destructive/10 transition-colors disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-background border-2 border-border rounded-card p-6">
            <h2 className="text-h4-md font-weight-semibold text-foreground mb-4">About</h2>
            {vendor.description ? (
              <p className="text-body-sm text-foreground">{vendor.description}</p>
            ) : (
              <p className="text-body-sm text-muted-foreground italic">No description provided</p>
            )}
          </div>

          <div className="bg-background border-2 border-border rounded-card p-6">
            <h2 className="text-h4-md font-weight-semibold text-foreground mb-4">Contact Information</h2>
            <div className="grid grid-cols-2 gap-4">
              {typeof vendor.contact_info?.email === 'string' && vendor.contact_info.email && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-card">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-body-xs text-muted-foreground">Email</p>
                    <a href={`mailto:${vendor.contact_info.email}`} className="text-body-sm text-primary hover:underline">
                      {vendor.contact_info.email}
                    </a>
                  </div>
                </div>
              )}
              {typeof vendor.contact_info?.phone === 'string' && vendor.contact_info.phone && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-card">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-body-xs text-muted-foreground">Phone</p>
                    <a href={`tel:${vendor.contact_info.phone}`} className="text-body-sm text-foreground">
                      {vendor.contact_info.phone}
                    </a>
                  </div>
                </div>
              )}
              {vendor.website && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-card">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-body-xs text-muted-foreground">Website</p>
                    <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="text-body-sm text-primary hover:underline">
                      {vendor.website}
                    </a>
                  </div>
                </div>
              )}
              {vendor.service_areas && vendor.service_areas.length > 0 && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-card">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-body-xs text-muted-foreground">Service Areas</p>
                    <p className="text-body-sm text-foreground">{vendor.service_areas.join(', ')}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {reviewsData?.reviews && reviewsData.reviews.length > 0 && (
            <div className="bg-background border-2 border-border rounded-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-h4-md font-weight-semibold text-foreground">Reviews</h2>
                <a href={`/vendors/${id}/reviews`} className="text-body-sm text-primary hover:underline">
                  View all
                </a>
              </div>
              <div className="space-y-4">
                {reviewsData.reviews.slice(0, 3).map((review) => (
                  <div key={review.id} className="border-b border-border pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${star <= review.overall_rating ? 'text-warning fill-warning' : 'text-muted'}`}
                          />
                        ))}
                      </div>
                      <span className="text-body-xs text-muted-foreground">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {review.review_text && (
                      <p className="text-body-sm text-foreground">{review.review_text}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {metricsData?.metrics && metricsData.metrics.length > 0 && (
            <div className="bg-background border-2 border-border rounded-card p-6">
              <h2 className="text-h4-md font-weight-semibold text-foreground mb-4">Performance</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-body-sm text-muted-foreground">Quality Score</span>
                  <span className="font-weight-medium">{metricsData.metrics[0]?.quality_score?.toFixed(1) || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-body-sm text-muted-foreground">On-Time Rate</span>
                  <span className="font-weight-medium">{metricsData.metrics[0]?.on_time_rate ? `${(metricsData.metrics[0].on_time_rate * 100).toFixed(0)}%` : 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-body-sm text-muted-foreground">Total Bookings</span>
                  <span className="font-weight-medium">{metricsData.metrics[0]?.total_bookings || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-body-sm text-muted-foreground">Issues</span>
                  <span className="font-weight-medium">{metricsData.metrics[0]?.issue_count || 0}</span>
                </div>
              </div>
            </div>
          )}

          <div className="bg-background border-2 border-border rounded-card p-6">
            <h2 className="text-h4-md font-weight-semibold text-foreground mb-4">Details</h2>
            <div className="space-y-3">
              {vendor.payment_terms && (
                <div className="flex items-center justify-between">
                  <span className="text-body-sm text-muted-foreground">Payment Terms</span>
                  <span className="text-body-sm font-weight-medium">{vendor.payment_terms}</span>
                </div>
              )}
              {vendor.tax_id && (
                <div className="flex items-center justify-between">
                  <span className="text-body-sm text-muted-foreground">Tax ID</span>
                  <span className="text-body-sm font-weight-medium">{vendor.tax_id}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-body-sm text-muted-foreground">Added</span>
                <span className="text-body-sm font-weight-medium">
                  {new Date(vendor.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-background border-2 border-border rounded-card p-6">
            <h2 className="text-h4-md font-weight-semibold text-foreground mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <a
                href={`/vendor-orders/new?vendor=${id}`}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button border-2 border-primary font-weight-medium text-body-sm hover:bg-primary/90 transition-colors"
              >
                Create Order
              </a>
              <a
                href={`/preferred-vendors/new?vendor=${id}`}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 border-2 border-border rounded-button font-weight-medium text-body-sm hover:bg-muted transition-colors"
              >
                Add to Preferred
              </a>
              <a
                href={`/vendors/${id}/reviews/new`}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 border-2 border-border rounded-button font-weight-medium text-body-sm hover:bg-muted transition-colors"
              >
                Write Review
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
