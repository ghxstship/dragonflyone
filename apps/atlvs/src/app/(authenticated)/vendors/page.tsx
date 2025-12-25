'use client';

import {
  Badge,
  Body,
  Box,
  Card,
  Container,
  EmptyState,
  EnterprisePageHeader,
  Grid,
  H3,
  Input,
  MainContent,
  Select,
  Skeleton,
  Stack,
  Text,
} from '@ghxstship/ui';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Search, Filter, Building2, Phone, Mail, MapPin, ExternalLink } from 'lucide-react';
import { useVendorProfiles, useVendorCategories } from '@/hooks/useVendorProfiles';

const STATUS_CONFIG = {
  active: { label: 'Active', color: 'bg-success/20 text-success' },
  inactive: { label: 'Inactive', color: 'bg-muted text-muted-foreground' },
  pending: { label: 'Pending', color: 'bg-warning/20 text-warning' },
  suspended: { label: 'Suspended', color: 'bg-destructive/20 text-destructive' },
};

export default function VendorsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const { data, isLoading, error } = useVendorProfiles({
    category_id: categoryFilter || undefined,
    status: statusFilter || undefined,
    search: searchQuery || undefined,
  });

  const { data: categoriesData } = useVendorCategories();

  if (isLoading) {
    return (
      <>
        <EnterprisePageHeader title="Vendor Directory" subtitle="Loading..." />
        <MainContent padding="lg">
          <Container>
            <Stack gap={4}>
              <Grid cols={3} gap={4}>
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-48" />)}
              </Grid>
            </Stack>
          </Container>
        </MainContent>
      </>
    );
  }

  if (error) {
    return (
      <>
        <EnterprisePageHeader title="Vendor Directory" subtitle="Error" />
        <MainContent padding="lg">
          <Container>
            <EmptyState
              title="Failed to load vendors"
              description="Please try again."
              action={{ label: 'Retry', onClick: () => window.location.reload() }}
            />
          </Container>
        </MainContent>
      </>
    );
  }

  return (
    <>
      <EnterprisePageHeader
        title="Vendor Directory"
        subtitle="Centralized database of vendors with categories and certifications"
        primaryAction={{ label: 'Add Vendor', onClick: () => router.push('/vendors/new') }}
        secondaryAction={{ label: 'Categories', onClick: () => router.push('/vendors/categories') }}
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={6}>
            <Stack direction="horizontal" gap={4} className="flex-wrap items-center">
              <Box className="relative flex-1 min-w-[200px] max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search vendors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </Box>
              <Stack direction="horizontal" gap={2} className="items-center">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                  <option value="">All Categories</option>
                  {categoriesData?.categories?.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </Select>
              </Stack>
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="">All Statuses</option>
                {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                  <option key={status} value={status}>{config.label}</option>
                ))}
              </Select>
            </Stack>

            {(!data?.vendors || data.vendors.length === 0) ? (
              <EmptyState
                title="No vendors found"
                description="Add vendors to your directory to start managing relationships."
                icon={<Building2 className="h-12 w-12" />}
                action={{ label: 'Add First Vendor', onClick: () => router.push('/vendors/new') }}
              />
            ) : (
              <Grid cols={3} gap={4}>
                {data.vendors.map((vendor) => {
                  const statusConfig = STATUS_CONFIG[vendor.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.active;
                  return (
                    <Link key={vendor.id} href={`/vendors/${vendor.id}`}>
                      <Card className="p-4 hover:border-primary/50 transition-colors h-full">
                        <Stack direction="horizontal" gap={3} className="items-start mb-3">
                          {vendor.logo_url ? (
                            <Image
                              src={vendor.logo_url}
                              alt={vendor.name}
                              width={48}
                              height={48}
                              className="rounded-card object-cover"
                            />
                          ) : (
                            <Box className="w-12 h-12 rounded-card bg-muted flex items-center justify-center">
                              <Building2 className="h-6 w-6 text-muted-foreground" />
                            </Box>
                          )}
                          <Box className="flex-1 min-w-0">
                            <Stack direction="horizontal" className="justify-between items-start gap-2">
                              <H3 className="truncate">{vendor.name}</H3>
                              <Badge className={`shrink-0 ${statusConfig.color}`}>{statusConfig.label}</Badge>
                            </Stack>
                            {vendor.category && (
                              <Body size="xs" className="text-muted-foreground">{vendor.category.name}</Body>
                            )}
                          </Box>
                        </Stack>

                        {vendor.description && (
                          <Body size="sm" className="text-muted-foreground mb-3 line-clamp-2">{vendor.description}</Body>
                        )}

                        <Stack gap={1} className="text-muted-foreground">
                          {typeof vendor.contact_info?.email === 'string' && vendor.contact_info.email && (
                            <Stack direction="horizontal" gap={2} className="items-center">
                              <Mail className="h-3 w-3" />
                              <Text size="xs" className="truncate">{vendor.contact_info.email}</Text>
                            </Stack>
                          )}
                          {typeof vendor.contact_info?.phone === 'string' && vendor.contact_info.phone && (
                            <Stack direction="horizontal" gap={2} className="items-center">
                              <Phone className="h-3 w-3" />
                              <Text size="xs">{vendor.contact_info.phone}</Text>
                            </Stack>
                          )}
                          {vendor.service_areas && vendor.service_areas.length > 0 && (
                            <Stack direction="horizontal" gap={2} className="items-center">
                              <MapPin className="h-3 w-3" />
                              <Text size="xs" className="truncate">{vendor.service_areas.slice(0, 2).join(', ')}</Text>
                            </Stack>
                          )}
                          {vendor.website && (
                            <Stack direction="horizontal" gap={2} className="items-center">
                              <ExternalLink className="h-3 w-3" />
                              <Text size="xs" className="truncate">{vendor.website}</Text>
                            </Stack>
                          )}
                        </Stack>
                      </Card>
                    </Link>
                  );
                })}
              </Grid>
            )}

            {data && data.total > (data.vendors?.length || 0) && (
              <Box className="text-center">
                <Body size="sm" className="text-muted-foreground">
                  Showing {data.vendors?.length || 0} of {data.total} vendors
                </Body>
              </Box>
            )}
          </Stack>
        </Container>
      </MainContent>
    </>
  );
}
