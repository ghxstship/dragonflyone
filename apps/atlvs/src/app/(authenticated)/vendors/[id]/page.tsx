'use client';

import {
  Badge,
  Body,
  Box,
  Button,
  Card,
  Container,
  EmptyState,
  EnterprisePageHeader,
  Grid,
  H2,
  MainContent,
  Skeleton,
  Stack,
  Text,
} from '@ghxstship/ui';

import Image from 'next/image';
import { Building2, Mail, Phone, MapPin, Globe, Star, Edit, Trash2 } from 'lucide-react';
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
      <>
        <EnterprisePageHeader title="Vendor Details" subtitle="Loading..." />
        <MainContent padding="lg">
          <Container>
            <Stack gap={6}>
              <Skeleton className="h-8 w-1/3" />
              <Grid cols={3} gap={6}>
                <Box className="col-span-2"><Skeleton className="h-48" /></Box>
                <Skeleton className="h-48" />
              </Grid>
            </Stack>
          </Container>
        </MainContent>
      </>
    );
  }

  if (error || !vendor) {
    return (
      <>
        <EnterprisePageHeader title="Vendor Details" subtitle="Error" />
        <MainContent padding="lg">
          <Container>
            <EmptyState
              title="Vendor not found"
              description="The vendor you're looking for doesn't exist or has been removed."
              action={{ label: 'Back to Vendors', onClick: () => router.push('/vendors') }}
            />
          </Container>
        </MainContent>
      </>
    );
  }

  const getStatusVariant = (status: string): 'success' | 'warning' | 'error' | 'info' => {
    switch (status) {
      case 'active': return 'success';
      case 'pending': return 'warning';
      case 'suspended': return 'error';
      default: return 'info';
    }
  };

  return (
    <>
      <EnterprisePageHeader
        title={vendor.name}
        subtitle={vendor.category?.name || 'Vendor'}
      />
      <Box className="px-6 py-3 border-b border-border flex items-center justify-between">
        <Stack direction="horizontal" gap={3} className="items-center">
          {vendor.logo_url ? (
            <Image
              src={vendor.logo_url}
              alt={vendor.name}
              width={48}
              height={48}
              className="w-12 h-12 rounded-card object-cover border-2 border-border"
            />
          ) : (
            <Box className="w-12 h-12 rounded-card bg-muted flex items-center justify-center border-2 border-border">
              <Building2 className="h-6 w-6 text-muted-foreground" />
            </Box>
          )}
          <Badge variant={getStatusVariant(vendor.status)}>{vendor.status}</Badge>
        </Stack>
        <Stack direction="horizontal" gap={2}>
          <Link href={`/vendors/${id}/edit`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
          <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </Stack>
      </Box>
      <MainContent padding="lg">
        <Container>
          <Grid cols={3} gap={6}>
            <Stack gap={6} className="col-span-2">
              <Card className="p-6">
                <H2 className="mb-4">About</H2>
                {vendor.description ? (
                  <Body size="sm">{vendor.description}</Body>
                ) : (
                  <Body size="sm" className="text-muted-foreground italic">No description provided</Body>
                )}
              </Card>

              <Card className="p-6">
                <H2 className="mb-4">Contact Information</H2>
                <Grid cols={2} gap={4}>
                  {typeof vendor.contact_info?.email === 'string' && vendor.contact_info.email && (
                    <Stack direction="horizontal" gap={3} className="items-center">
                      <Box className="p-2 bg-muted rounded-card">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                      </Box>
                      <Stack gap={0}>
                        <Body size="xs" className="text-muted-foreground">Email</Body>
                        <Link href={`mailto:${vendor.contact_info.email}`} className="text-primary hover:underline">
                          <Text size="sm">{vendor.contact_info.email}</Text>
                        </Link>
                      </Stack>
                    </Stack>
                  )}
                  {typeof vendor.contact_info?.phone === 'string' && vendor.contact_info.phone && (
                    <Stack direction="horizontal" gap={3} className="items-center">
                      <Box className="p-2 bg-muted rounded-card">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                      </Box>
                      <Stack gap={0}>
                        <Body size="xs" className="text-muted-foreground">Phone</Body>
                        <Link href={`tel:${vendor.contact_info.phone}`}>
                          <Text size="sm">{vendor.contact_info.phone}</Text>
                        </Link>
                      </Stack>
                    </Stack>
                  )}
                  {vendor.website && (
                    <Stack direction="horizontal" gap={3} className="items-center">
                      <Box className="p-2 bg-muted rounded-card">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                      </Box>
                      <Stack gap={0}>
                        <Body size="xs" className="text-muted-foreground">Website</Body>
                        <Link href={vendor.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          <Text size="sm">{vendor.website}</Text>
                        </Link>
                      </Stack>
                    </Stack>
                  )}
                  {vendor.service_areas && vendor.service_areas.length > 0 && (
                    <Stack direction="horizontal" gap={3} className="items-center">
                      <Box className="p-2 bg-muted rounded-card">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                      </Box>
                      <Stack gap={0}>
                        <Body size="xs" className="text-muted-foreground">Service Areas</Body>
                        <Body size="sm">{vendor.service_areas.join(', ')}</Body>
                      </Stack>
                    </Stack>
                  )}
                </Grid>
              </Card>

              {reviewsData?.reviews && reviewsData.reviews.length > 0 && (
                <Card className="p-6">
                  <Stack direction="horizontal" className="justify-between mb-4">
                    <H2>Reviews</H2>
                    <Link href={`/vendors/${id}/reviews`} className="text-primary hover:underline">
                      <Text size="sm">View all</Text>
                    </Link>
                  </Stack>
                  <Stack gap={4}>
                    {reviewsData.reviews.slice(0, 3).map((review) => (
                      <Box key={review.id} className="border-b border-border pb-4 last:border-0 last:pb-0">
                        <Stack direction="horizontal" gap={2} className="items-center mb-2">
                          <Stack direction="horizontal" gap={1}>
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${star <= review.overall_rating ? 'text-warning fill-warning' : 'text-muted'}`}
                              />
                            ))}
                          </Stack>
                          <Text size="xs" className="text-muted-foreground">
                            {new Date(review.created_at).toLocaleDateString()}
                          </Text>
                        </Stack>
                        {review.review_text && <Body size="sm">{review.review_text}</Body>}
                      </Box>
                    ))}
                  </Stack>
                </Card>
              )}
            </Stack>

            <Stack gap={6}>
              {metricsData?.metrics && metricsData.metrics.length > 0 && (
                <Card className="p-6">
                  <H2 className="mb-4">Performance</H2>
                  <Stack gap={4}>
                    <Stack direction="horizontal" className="justify-between">
                      <Text size="sm" className="text-muted-foreground">Quality Score</Text>
                      <Text size="sm" className="font-weight-medium">{metricsData.metrics[0]?.quality_score?.toFixed(1) || 'N/A'}</Text>
                    </Stack>
                    <Stack direction="horizontal" className="justify-between">
                      <Text size="sm" className="text-muted-foreground">On-Time Rate</Text>
                      <Text size="sm" className="font-weight-medium">{metricsData.metrics[0]?.on_time_rate ? `${(metricsData.metrics[0].on_time_rate * 100).toFixed(0)}%` : 'N/A'}</Text>
                    </Stack>
                    <Stack direction="horizontal" className="justify-between">
                      <Text size="sm" className="text-muted-foreground">Total Bookings</Text>
                      <Text size="sm" className="font-weight-medium">{metricsData.metrics[0]?.total_bookings || 0}</Text>
                    </Stack>
                    <Stack direction="horizontal" className="justify-between">
                      <Text size="sm" className="text-muted-foreground">Issues</Text>
                      <Text size="sm" className="font-weight-medium">{metricsData.metrics[0]?.issue_count || 0}</Text>
                    </Stack>
                  </Stack>
                </Card>
              )}

              <Card className="p-6">
                <H2 className="mb-4">Details</H2>
                <Stack gap={3}>
                  {vendor.payment_terms && (
                    <Stack direction="horizontal" className="justify-between">
                      <Text size="sm" className="text-muted-foreground">Payment Terms</Text>
                      <Text size="sm" className="font-weight-medium">{vendor.payment_terms}</Text>
                    </Stack>
                  )}
                  {vendor.tax_id && (
                    <Stack direction="horizontal" className="justify-between">
                      <Text size="sm" className="text-muted-foreground">Tax ID</Text>
                      <Text size="sm" className="font-weight-medium">{vendor.tax_id}</Text>
                    </Stack>
                  )}
                  <Stack direction="horizontal" className="justify-between">
                    <Text size="sm" className="text-muted-foreground">Added</Text>
                    <Text size="sm" className="font-weight-medium">
                      {new Date(vendor.created_at).toLocaleDateString()}
                    </Text>
                  </Stack>
                </Stack>
              </Card>

              <Card className="p-6">
                <H2 className="mb-4">Quick Actions</H2>
                <Stack gap={2}>
                  <Link href={`/vendor-orders/new?vendor=${id}`}>
                    <Button className="w-full">Create Order</Button>
                  </Link>
                  <Link href={`/preferred-vendors/new?vendor=${id}`}>
                    <Button variant="outline" className="w-full">Add to Preferred</Button>
                  </Link>
                  <Link href={`/vendors/${id}/reviews/new`}>
                    <Button variant="outline" className="w-full">Write Review</Button>
                  </Link>
                </Stack>
              </Card>
            </Stack>
          </Grid>
        </Container>
      </MainContent>
    </>
  );
}
