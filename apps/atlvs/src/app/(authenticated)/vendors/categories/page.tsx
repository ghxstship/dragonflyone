'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
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
  Skeleton,
  Stack,
  Text,
  useNotifications,
} from '@ghxstship/ui';
import { Search, Folder, FolderOpen, Edit2, Trash2, ChevronRight, ChevronDown, Users } from 'lucide-react';

interface VendorCategory {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  description?: string;
  vendors_count: number;
  children?: VendorCategory[];
}

const DEMO_CATEGORIES: VendorCategory[] = [
  { 
    id: '1', 
    name: 'Catering', 
    slug: 'catering', 
    parent_id: null, 
    description: 'Food and beverage services', 
    vendors_count: 25,
    children: [
      { id: '1a', name: 'Full Service Catering', slug: 'full-service', parent_id: '1', vendors_count: 12, children: [] },
      { id: '1b', name: 'Specialty Foods', slug: 'specialty-foods', parent_id: '1', vendors_count: 8, children: [] },
      { id: '1c', name: 'Beverage Services', slug: 'beverage', parent_id: '1', vendors_count: 5, children: [] },
    ]
  },
  { 
    id: '2', 
    name: 'Florals & Decor', 
    slug: 'florals-decor', 
    parent_id: null, 
    description: 'Flowers and decorations', 
    vendors_count: 18,
    children: [
      { id: '2a', name: 'Florists', slug: 'florists', parent_id: '2', vendors_count: 10, children: [] },
      { id: '2b', name: 'Event Decor', slug: 'event-decor', parent_id: '2', vendors_count: 8, children: [] },
    ]
  },
  { 
    id: '3', 
    name: 'Entertainment', 
    slug: 'entertainment', 
    parent_id: null, 
    description: 'Music, DJs, and performers', 
    vendors_count: 30,
    children: [
      { id: '3a', name: 'Bands & Musicians', slug: 'bands', parent_id: '3', vendors_count: 15, children: [] },
      { id: '3b', name: 'DJs', slug: 'djs', parent_id: '3', vendors_count: 10, children: [] },
      { id: '3c', name: 'Specialty Acts', slug: 'specialty-acts', parent_id: '3', vendors_count: 5, children: [] },
    ]
  },
  { 
    id: '4', 
    name: 'Audio/Visual', 
    slug: 'audio-visual', 
    parent_id: null, 
    description: 'AV equipment and services', 
    vendors_count: 15,
    children: []
  },
  { 
    id: '5', 
    name: 'Photography & Video', 
    slug: 'photo-video', 
    parent_id: null, 
    description: 'Photo and video services', 
    vendors_count: 22,
    children: []
  },
  { 
    id: '6', 
    name: 'Rentals', 
    slug: 'rentals', 
    parent_id: null, 
    description: 'Tables, chairs, linens', 
    vendors_count: 20,
    children: []
  },
];

async function fetchVendorCategories(): Promise<VendorCategory[]> {
  const response = await fetch('/api/vendors/categories');
  if (!response.ok) throw new Error('Failed to fetch vendor categories');
  return response.json();
}

export default function VendorCategoriesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(['1', '2', '3']));

  const { data: apiCategories, isLoading, error } = useQuery({
    queryKey: ['vendor-categories'],
    queryFn: fetchVendorCategories,
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (categoryId: string) => {
      const response = await fetch(`/api/vendors/categories/${categoryId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete category');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-categories'] });
      addNotification({ type: 'success', title: 'Category Deleted', message: 'Vendor category has been deleted.' });
    },
    onError: () => {
      addNotification({ type: 'error', title: 'Delete Failed', message: 'Failed to delete category.' });
    },
  });

  // Use API data or fall back to demo data
  const categories = apiCategories && apiCategories.length > 0 ? apiCategories : DEMO_CATEGORIES;

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const filteredCategories = searchQuery
    ? categories.filter((c) => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.children?.some((child) => child.name.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : categories;

  const totalCategories = categories.reduce((sum, c) => sum + 1 + (c.children?.length || 0), 0);
  const totalVendors = categories.reduce((sum, c) => sum + c.vendors_count, 0);

  if (isLoading) {
    return (
      <>
        <EnterprisePageHeader title="Vendor Categories" subtitle="Loading..." />
        <MainContent padding="lg">
          <Container>
            <Stack gap={4}>
              <Grid cols={2} gap={4}>
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
              </Grid>
              <Skeleton className="h-64" />
            </Stack>
          </Container>
        </MainContent>
      </>
    );
  }

  if (error && !apiCategories) {
    return (
      <>
        <EnterprisePageHeader title="Vendor Categories" subtitle="Error" />
        <MainContent padding="lg">
          <Container>
            <EmptyState
              title="Error Loading Categories"
              description={error instanceof Error ? error.message : 'Failed to load vendor categories'}
              action={{ label: 'Retry', onClick: () => window.location.reload() }}
            />
          </Container>
        </MainContent>
      </>
    );
  }

  const renderCategory = (category: VendorCategory, depth: number = 0) => {
    const isExpanded = expandedIds.has(category.id);
    const hasChildren = category.children && category.children.length > 0;

    return (
      <Box key={category.id}>
        <Stack 
          direction="horizontal" 
          gap={3} 
          className="p-3 border-b border-border hover:bg-muted/30 transition-colors items-center"
          style={{ paddingLeft: `${depth * 24 + 12}px` }}
        >
          {hasChildren ? (
            <Button variant="ghost" size="sm" onClick={() => toggleExpanded(category.id)}>
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          ) : (
            <Box className="w-6" />
          )}

          {isExpanded ? <FolderOpen className="h-5 w-5 text-primary" /> : <Folder className="h-5 w-5 text-muted-foreground" />}

          <Box className="flex-1">
            <Text size="sm" className="font-weight-medium">{category.name}</Text>
            {category.description && <Text size="xs" className="text-muted-foreground ml-2">{category.description}</Text>}
          </Box>

          <Stack direction="horizontal" gap={1} className="items-center text-muted-foreground">
            <Users className="h-3 w-3" />
            <Text size="xs">{category.vendors_count}</Text>
          </Stack>

          <Stack direction="horizontal" gap={1}>
            <Button variant="ghost" size="sm"><Edit2 className="h-4 w-4" /></Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-destructive"
              onClick={(e) => { e.stopPropagation(); deleteCategoryMutation.mutate(category.id); }}
              disabled={deleteCategoryMutation.isPending}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </Stack>
        </Stack>

        {hasChildren && isExpanded && (
          <Box>{category.children?.map((child) => renderCategory(child, depth + 1))}</Box>
        )}
      </Box>
    );
  };

  return (
    <>
      <EnterprisePageHeader
        title="Vendor Categories"
        subtitle="Organize vendors by service type"
        primaryAction={{ label: 'Add Category', onClick: () => {} }}
        secondaryAction={{ label: 'View Vendors', onClick: () => router.push('/vendors') }}
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={6}>
            <Grid cols={2} gap={4}>
              <Card className="p-4">
                <Stack direction="horizontal" gap={2} className="items-center mb-2">
                  <Folder className="h-5 w-5 text-primary" />
                  <Text size="sm" className="text-muted-foreground">Categories</Text>
                </Stack>
                <Body className="font-weight-bold">{totalCategories}</Body>
              </Card>
              <Card className="p-4">
                <Stack direction="horizontal" gap={2} className="items-center mb-2">
                  <Users className="h-5 w-5 text-primary" />
                  <Text size="sm" className="text-muted-foreground">Total Vendors</Text>
                </Stack>
                <Body className="font-weight-bold">{totalVendors}</Body>
              </Card>
            </Grid>

            <Box className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </Box>

            <Card className="overflow-hidden">
              <Stack direction="horizontal" gap={3} className="border-b border-border bg-muted/30 p-3 items-center">
                <Box className="w-6" />
                <Box className="w-5" />
                <Text size="xs" className="flex-1 font-weight-semibold text-muted-foreground uppercase">Category Name</Text>
                <Text size="xs" className="font-weight-semibold text-muted-foreground uppercase w-16 text-right">Vendors</Text>
                <Box className="w-16" />
              </Stack>

              {filteredCategories.length === 0 ? (
                <EmptyState
                  title="No categories found"
                  description={searchQuery ? 'Try adjusting your search' : 'Create your first category'}
                  icon={<Folder className="h-12 w-12" />}
                />
              ) : (
                filteredCategories.map((category) => renderCategory(category))
              )}
            </Card>
          </Stack>
        </Container>
      </MainContent>
    </>
  );
}
