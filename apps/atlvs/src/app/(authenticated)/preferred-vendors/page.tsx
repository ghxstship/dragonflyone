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
  H3,
  Input,
  MainContent,
  Select,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Text,
} from '@ghxstship/ui';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Filter, Star, Building2, ChevronRight } from 'lucide-react';
import {
  usePreferredVendors,
  usePreferredVendorMatrix,
  useRemovePreferredVendor,
} from '@/hooks/usePreferredVendors';

export default function PreferredVendorsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data, isLoading, error } = usePreferredVendors();
  const { data: matrixData } = usePreferredVendorMatrix();
  const removeMutation = useRemovePreferredVendor();

  const filteredVendors = data?.preferred_vendors?.filter((vendor) => {
    const matchesSearch =
      !searchQuery ||
      vendor.vendor?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.category?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || vendor.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleRemove = async (id: string) => {
    if (confirm('Remove this vendor from preferred list?')) {
      await removeMutation.mutateAsync(id);
    }
  };

  if (isLoading) {
    return (
      <>
        <EnterprisePageHeader title="Preferred Vendors" subtitle="Loading..." />
        <MainContent padding="lg">
          <Container>
            <Stack gap={4}>
              <Skeleton className="h-10 w-1/3" />
              <Skeleton className="h-64" />
            </Stack>
          </Container>
        </MainContent>
      </>
    );
  }

  if (error) {
    return (
      <>
        <EnterprisePageHeader title="Preferred Vendors" subtitle="Error" />
        <MainContent padding="lg">
          <Container>
            <EmptyState
              title="Failed to load preferred vendors"
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
        title="Preferred Vendors"
        subtitle="Curated lists of preferred vendors by category"
        primaryAction={{ label: 'Add Preferred Vendor', onClick: () => router.push('/preferred-vendors/new') }}
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={6}>
            <Stack direction="horizontal" gap={4} className="items-center">
              <Box className="relative flex-1 max-w-md">
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
                <Select
                  value={selectedCategory || ''}
                  onChange={(e) => setSelectedCategory(e.target.value || null)}
                >
                  <option value="">All Categories</option>
                  {data?.categories?.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </Select>
              </Stack>
            </Stack>

            {matrixData && Object.keys(matrixData.matrix || {}).length > 0 && (
              <Grid cols={3} gap={4}>
                {Object.entries(matrixData.matrix).map(([category, vendors]) => (
                  <Card key={category} className="p-4 hover:border-primary/50 transition-colors">
                    <Stack direction="horizontal" className="justify-between items-center mb-3">
                      <H3>{category}</H3>
                      <Badge className="bg-muted">{vendors.length} vendors</Badge>
                    </Stack>
                    <Stack gap={2}>
                      {vendors.slice(0, 3).map((item, idx) => (
                        <Stack key={idx} direction="horizontal" className="justify-between items-center">
                          <Stack direction="horizontal" gap={2} className="items-center">
                            <Box className="w-5 h-5 rounded-avatar bg-primary/10 text-primary flex items-center justify-center">
                              <Text size="xs" className="font-weight-medium">{item.priority}</Text>
                            </Box>
                            <Text size="sm">{(item.vendor as { name?: string })?.name || 'Unknown'}</Text>
                          </Stack>
                          {item.discount && <Text size="xs" className="text-success">-{item.discount}%</Text>}
                        </Stack>
                      ))}
                      {vendors.length > 3 && (
                        <Link href={`/preferred-vendors?category=${encodeURIComponent(category)}`} className="text-primary hover:underline flex items-center gap-1">
                          <Text size="xs">View all {vendors.length}</Text>
                          <ChevronRight className="h-3 w-3" />
                        </Link>
                      )}
                    </Stack>
                  </Card>
                ))}
              </Grid>
            )}

            {(!filteredVendors || filteredVendors.length === 0) && !matrixData?.matrix && (
              <EmptyState
                title="No preferred vendors yet"
                description="Add vendors to your preferred list for quick access and negotiated rates."
                icon={<Building2 className="h-12 w-12" />}
                action={{ label: 'Add First Vendor', onClick: () => router.push('/preferred-vendors/new') }}
              />
            )}

            {filteredVendors && filteredVendors.length > 0 && (
              <Card className="overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Priority</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Discount</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Valid Until</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVendors.map((pv) => (
                      <TableRow key={pv.id}>
                        <TableCell>
                          <Box className="w-6 h-6 rounded-avatar bg-primary text-primary-foreground flex items-center justify-center">
                            <Text size="xs" className="font-weight-bold">{pv.priority}</Text>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Link href={`/vendors/${pv.vendor_id}`} className="font-weight-medium hover:text-primary">
                            {pv.vendor?.name || 'Unknown Vendor'}
                          </Link>
                          {pv.vendor?.email && <Body size="xs" className="text-muted-foreground">{pv.vendor.email}</Body>}
                        </TableCell>
                        <TableCell><Badge className="bg-muted">{pv.category}</Badge></TableCell>
                        <TableCell>
                          {pv.negotiated_discount ? (
                            <Text className="text-success font-weight-medium">-{pv.negotiated_discount}%</Text>
                          ) : (
                            <Text className="text-muted-foreground">-</Text>
                          )}
                        </TableCell>
                        <TableCell>
                          {pv.vendor?.rating ? (
                            <Stack direction="horizontal" gap={1} className="items-center">
                              <Star className="h-4 w-4 text-warning fill-warning" />
                              <Text size="sm">{pv.vendor.rating.toFixed(1)}</Text>
                            </Stack>
                          ) : (
                            <Text className="text-muted-foreground">-</Text>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {pv.valid_to ? new Date(pv.valid_to).toLocaleDateString() : 'No expiry'}
                        </TableCell>
                        <TableCell className="text-right">
                          <Stack direction="horizontal" gap={2} className="justify-end">
                            <Link href={`/preferred-vendors/${pv.id}/edit`}>
                              <Button variant="outline" size="sm">Edit</Button>
                            </Link>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemove(pv.id)}
                              disabled={removeMutation.isPending}
                              className="text-destructive border-destructive"
                            >
                              Remove
                            </Button>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            )}

            {data?.pagination && data.pagination.totalPages > 1 && (
              <Stack direction="horizontal" className="justify-between items-center">
                <Body size="sm" className="text-muted-foreground">
                  Showing {filteredVendors?.length || 0} of {data.total} preferred vendors
                </Body>
                <Stack direction="horizontal" gap={2} className="items-center">
                  <Button variant="outline" size="sm" disabled={data.pagination.page <= 1}>Previous</Button>
                  <Text size="sm" className="text-muted-foreground">
                    Page {data.pagination.page} of {data.pagination.totalPages}
                  </Text>
                  <Button variant="outline" size="sm" disabled={!data.pagination.hasMore}>Next</Button>
                </Stack>
              </Stack>
            )}
          </Stack>
        </Container>
      </MainContent>
    </>
  );
}
