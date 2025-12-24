'use client';

import {
  Body,
  Button,
  H1,
  H2,
  Text,
} from '@ghxstship/ui';

import Image from 'next/image';
import { ArrowLeft, Building2, Mail, Phone, MapPin, Globe, Star, Edit, Trash2 } from 'lucide-react';
import { useVendorProfile, useDeleteVendor } from '@/hooks/useVendorProfiles';
import { useVendorReviews, useVendorMetrics } from '@/hooks/useVendorPerformance';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
          <Link
            href="/vendors"
            className="p-2 border-2 border-border rounded-button hover:bg-muted transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
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
                <H1 className="text-h2-md font-weight-bold text-foreground">{vendor.name}</H1>
                <Text className={`px-2 py-1 rounded-badge text-body-xs font-weight-medium ${statusColors[vendor.status as keyof typeof statusColors] || statusColors.active}`}>
                  {vendor.status}
                </Text>
              </div>
              {vendor.category && (
                <Body className="text-body-sm text-muted-foreground">{vendor.category.name}</Body>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/vendors/${id}/edit`}
            className="inline-flex items-center gap-2 px-4 py-2 border-2 border-border rounded-button text-body-sm font-weight-medium hover:bg-muted transition-colors"
          >
            <Edit className="h-4 w-4" />
            Edit
          </Link>
          <Button
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="inline-flex items-center gap-2 px-4 py-2 border-2 border-destructive text-destructive rounded-button text-body-sm font-weight-medium hover:bg-destructive/10 transition-colors disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-background border-2 border-border rounded-card p-6">
            <H2 className="text-h4-md font-weight-semibold text-foreground mb-4">About</H2>
            {vendor.description ? (
              <Body className="text-body-sm text-foreground">{vendor.description}</Body>
            ) : (
              <Body className="text-body-sm text-muted-foreground italic">No description provided</Body>
            )}
          </div>

          <div className="bg-background border-2 border-border rounded-card p-6">
            <H2 className="text-h4-md font-weight-semibold text-foreground mb-4">Contact Information</H2>
            <div className="grid grid-cols-2 gap-4">
              {typeof vendor.contact_info?.email === 'string' && vendor.contact_info.email && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-card">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <Body className="text-body-xs text-muted-foreground">Email</Body>
                    <Link href={`mailto:${vendor.contact_info.email}`} className="text-body-sm text-primary hover:underline">
                      {vendor.contact_info.email}
                    </Link>
                  </div>
                </div>
              )}
              {typeof vendor.contact_info?.phone === 'string' && vendor.contact_info.phone && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-card">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <Body className="text-body-xs text-muted-foreground">Phone</Body>
                    <Link href={`tel:${vendor.contact_info.phone}`} className="text-body-sm text-foreground">
                      {vendor.contact_info.phone}
                    </Link>
                  </div>
                </div>
              )}
              {vendor.website && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-card">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <Body className="text-body-xs text-muted-foreground">Website</Body>
                    <Link href={vendor.website} target="_blank" rel="noopener noreferrer" className="text-body-sm text-primary hover:underline">
                      {vendor.website}
                    </Link>
                  </div>
                </div>
              )}
              {vendor.service_areas && vendor.service_areas.length > 0 && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-card">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <Body className="text-body-xs text-muted-foreground">Service Areas</Body>
                    <Body className="text-body-sm text-foreground">{vendor.service_areas.join(', ')}</Body>
                  </div>
                </div>
              )}
            </div>
          </div>

          {reviewsData?.reviews && reviewsData.reviews.length > 0 && (
            <div className="bg-background border-2 border-border rounded-card p-6">
              <div className="flex items-center justify-between mb-4">
                <H2 className="text-h4-md font-weight-semibold text-foreground">Reviews</H2>
                <Link href={`/vendors/${id}/reviews`} className="text-body-sm text-primary hover:underline">
                  View all
                </Link>
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
                      <Text className="text-body-xs text-muted-foreground">
                        {new Date(review.created_at).toLocaleDateString()}
                      </Text>
                    </div>
                    {review.review_text && (
                      <Body className="text-body-sm text-foreground">{review.review_text}</Body>
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
              <H2 className="text-h4-md font-weight-semibold text-foreground mb-4">Performance</H2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Text className="text-body-sm text-muted-foreground">Quality Score</Text>
                  <Text className="font-weight-medium">{metricsData.metrics[0]?.quality_score?.toFixed(1) || 'N/A'}</Text>
                </div>
                <div className="flex items-center justify-between">
                  <Text className="text-body-sm text-muted-foreground">On-Time Rate</Text>
                  <Text className="font-weight-medium">{metricsData.metrics[0]?.on_time_rate ? `${(metricsData.metrics[0].on_time_rate * 100).toFixed(0)}%` : 'N/A'}</Text>
                </div>
                <div className="flex items-center justify-between">
                  <Text className="text-body-sm text-muted-foreground">Total Bookings</Text>
                  <Text className="font-weight-medium">{metricsData.metrics[0]?.total_bookings || 0}</Text>
                </div>
                <div className="flex items-center justify-between">
                  <Text className="text-body-sm text-muted-foreground">Issues</Text>
                  <Text className="font-weight-medium">{metricsData.metrics[0]?.issue_count || 0}</Text>
                </div>
              </div>
            </div>
          )}

          <div className="bg-background border-2 border-border rounded-card p-6">
            <H2 className="text-h4-md font-weight-semibold text-foreground mb-4">Details</H2>
            <div className="space-y-3">
              {vendor.payment_terms && (
                <div className="flex items-center justify-between">
                  <Text className="text-body-sm text-muted-foreground">Payment Terms</Text>
                  <Text className="text-body-sm font-weight-medium">{vendor.payment_terms}</Text>
                </div>
              )}
              {vendor.tax_id && (
                <div className="flex items-center justify-between">
                  <Text className="text-body-sm text-muted-foreground">Tax ID</Text>
                  <Text className="text-body-sm font-weight-medium">{vendor.tax_id}</Text>
                </div>
              )}
              <div className="flex items-center justify-between">
                <Text className="text-body-sm text-muted-foreground">Added</Text>
                <Text className="text-body-sm font-weight-medium">
                  {new Date(vendor.created_at).toLocaleDateString()}
                </Text>
              </div>
            </div>
          </div>

          <div className="bg-background border-2 border-border rounded-card p-6">
            <H2 className="text-h4-md font-weight-semibold text-foreground mb-4">Quick Actions</H2>
            <div className="space-y-2">
              <Link
                href={`/vendor-orders/new?vendor=${id}`}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button border-2 border-primary font-weight-medium text-body-sm hover:bg-primary/90 transition-colors"
              >
                Create Order
              </Link>
              <Link
                href={`/preferred-vendors/new?vendor=${id}`}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 border-2 border-border rounded-button font-weight-medium text-body-sm hover:bg-muted transition-colors"
              >
                Add to Preferred
              </Link>
              <Link
                href={`/vendors/${id}/reviews/new`}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 border-2 border-border rounded-button font-weight-medium text-body-sm hover:bg-muted transition-colors"
              >
                Write Review
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
