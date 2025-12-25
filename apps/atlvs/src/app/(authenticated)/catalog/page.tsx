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
  Grid as GridLayout,
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
import Image from 'next/image';
import Link from 'next/link';
import { Search, Filter, Package, Grid, List, Tag } from 'lucide-react';
import { useCatalogItems, useCatalogCategories } from '@/hooks/useCatalog';

type ViewMode = 'grid' | 'list';

export default function CatalogPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const { data, isLoading, error } = useCatalogItems({
    category_id: categoryFilter || undefined,
    status: statusFilter || undefined,
    search: searchQuery || undefined,
  });

  const { data: categoriesData } = useCatalogCategories();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const statusColors = {
    draft: 'bg-muted text-muted-foreground',
    active: 'bg-success/20 text-success',
    inactive: 'bg-warning/20 text-warning',
    discontinued: 'bg-destructive/20 text-destructive',
  };

  if (isLoading) {
    return (
      <>
        <EnterprisePageHeader title="Product Catalog" subtitle="Loading..." />
        <MainContent padding="lg">
          <Container>
            <GridLayout cols={4} gap={4}>
              <Skeleton className="h-48" />
              <Skeleton className="h-48" />
              <Skeleton className="h-48" />
              <Skeleton className="h-48" />
            </GridLayout>
          </Container>
        </MainContent>
      </>
    );
  }

  if (error) {
    return (
      <>
        <EnterprisePageHeader title="Product Catalog" subtitle="Error" />
        <MainContent padding="lg">
          <Container>
            <EmptyState
              title="Failed to load catalog"
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
        title="Product Catalog"
        subtitle="Global catalog aligned with 24 asset categories"
        primaryAction={{ label: 'Add Item', onClick: () => router.push('/catalog/new') }}
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={6}>
            <Stack direction="horizontal" gap={4} className="flex-wrap items-center">
              <Box className="relative flex-1 min-w-[200px] max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search catalog..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </Box>
              <Stack direction="horizontal" gap={2} className="items-center">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {categoriesData?.categories?.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </Select>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="inactive">Inactive</option>
                  <option value="discontinued">Discontinued</option>
                </Select>
              </Stack>
              <Stack direction="horizontal" className="border rounded-button overflow-hidden">
                <Button
                  variant={viewMode === 'grid' ? 'solid' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'solid' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </Stack>
            </Stack>

            {(!data?.items || data.items.length === 0) ? (
              <EmptyState
                title="No catalog items found"
                description="Start building your product catalog to streamline ordering."
                icon={<Package className="h-12 w-12" />}
                action={{ label: 'Add First Item', onClick: () => router.push('/catalog/new') }}
              />
            ) : viewMode === 'grid' ? (
              <GridLayout cols={4} gap={4}>
                {data.items.map((item) => (
                  <Link key={item.id} href={`/catalog/${item.id}`}>
                    <Card className="overflow-hidden hover:border-primary/50 transition-colors">
                      <Box className="aspect-square bg-muted flex items-center justify-center relative">
                        {item.images && item.images.length > 0 ? (
                          <Image src={item.images[0]} alt={item.name} fill className="object-cover" />
                        ) : (
                          <Package className="h-12 w-12 text-muted-foreground" />
                        )}
                      </Box>
                      <Box className="p-4">
                        <Stack direction="horizontal" className="justify-between items-start gap-2 mb-1">
                          <H3 className="line-clamp-1">{item.name}</H3>
                          <Badge className={statusColors[item.status]}>{item.status}</Badge>
                        </Stack>
                        {item.sku && <Body size="xs" className="text-muted-foreground mb-2">SKU: {item.sku}</Body>}
                        {item.category && (
                          <Stack direction="horizontal" gap={1} className="items-center text-muted-foreground mb-2">
                            <Tag className="h-3 w-3" />
                            <Text size="xs">{item.category.name}</Text>
                          </Stack>
                        )}
                        <Stack direction="horizontal" className="justify-between items-center">
                          <Text className="font-weight-bold">{formatCurrency(item.base_price)}</Text>
                          <Text size="xs" className="text-muted-foreground">per {item.unit_type || 'unit'}</Text>
                        </Stack>
                      </Box>
                    </Card>
                  </Link>
                ))}
              </GridLayout>
            ) : (
              <Card className="overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Link href={`/catalog/${item.id}`} className="hover:text-primary">
                            {item.name}
                          </Link>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{item.sku || '-'}</TableCell>
                        <TableCell className="text-muted-foreground">{item.category?.name || '-'}</TableCell>
                        <TableCell>
                          <Badge className={statusColors[item.status]}>{item.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Text className="font-weight-medium">{formatCurrency(item.base_price)}</Text>
                          <Text size="xs" className="text-muted-foreground ml-1">/{item.unit_type || 'unit'}</Text>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            )}
          </Stack>
        </Container>
      </MainContent>
    </>
  );
}
