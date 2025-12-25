'use client';

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
  Select,
  Skeleton,
  Stack,
  Text,
} from '@ghxstship/ui';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Search, Layout, Eye, Edit, Trash2, MapPin } from 'lucide-react';
import { useFloorPlans, useDeleteFloorPlan } from '@/hooks/useFloorPlans';

export default function FloorPlansPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [spaceFilter, setSpaceFilter] = useState<string>('');

  const { data, isLoading, error } = useFloorPlans('current', { spaceId: spaceFilter || undefined });
  const deleteMutation = useDeleteFloorPlan();

  const filteredPlans = data?.floor_plans?.filter((plan) => {
    const matchesSearch =
      !searchQuery ||
      plan.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.space?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const uniqueSpaces = Array.from(
    new Map(data?.floor_plans?.map((p) => [p.space_id, p.space])).values()
  ).filter(Boolean);

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Delete floor plan "${name}"? This action cannot be undone.`)) {
      await deleteMutation.mutateAsync(id);
    }
  };

  if (isLoading) {
    return (
      <>
        <EnterprisePageHeader title="Floor Plans" subtitle="Loading..." />
        <MainContent padding="lg">
          <Container>
            <Grid cols={3} gap={4}>
              <Skeleton className="h-48" />
              <Skeleton className="h-48" />
              <Skeleton className="h-48" />
            </Grid>
          </Container>
        </MainContent>
      </>
    );
  }

  if (error) {
    return (
      <>
        <EnterprisePageHeader title="Floor Plans" subtitle="Error" />
        <MainContent padding="lg">
          <Container>
            <EmptyState
              title="Failed to load floor plans"
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
        title="Floor Plans"
        subtitle="Manage venue layouts and space configurations"
        primaryAction={{ label: 'New Floor Plan', onClick: () => router.push('/floor-plans/new') }}
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={6}>
            <Stack direction="horizontal" gap={4} className="items-center">
              <Box className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search floor plans..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </Box>
              {uniqueSpaces.length > 0 && (
                <Select
                  value={spaceFilter}
                  onChange={(e) => setSpaceFilter(e.target.value)}
                >
                  <option value="">All Spaces</option>
                  {uniqueSpaces.map((space) => (
                    <option key={space?.id} value={space?.id}>{space?.name}</option>
                  ))}
                </Select>
              )}
            </Stack>

            {(!filteredPlans || filteredPlans.length === 0) ? (
              <EmptyState
                title="No floor plans found"
                description="Create your first floor plan to start mapping out your venues."
                icon={<Layout className="h-12 w-12" />}
                action={{ label: 'Create Floor Plan', onClick: () => router.push('/floor-plans/new') }}
              />
            ) : (
              <Grid cols={3} gap={4}>
                {filteredPlans.map((plan) => (
                  <Card key={plan.id} className="overflow-hidden hover:border-primary/50 transition-colors group">
                    <Box className="aspect-video bg-muted relative">
                      {plan.thumbnail_url ? (
                        <Image src={plan.thumbnail_url} alt={plan.name} fill className="object-cover" />
                      ) : (
                        <Box className="w-full h-full flex items-center justify-center">
                          <Layout className="h-12 w-12 text-muted-foreground" />
                        </Box>
                      )}
                      <Box className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                        <Link href={`/floor-plans/${plan.id}`}>
                          <Button variant="outline" size="sm"><Eye className="h-4 w-4" /></Button>
                        </Link>
                        <Link href={`/floor-plans/${plan.id}/edit`}>
                          <Button variant="outline" size="sm"><Edit className="h-4 w-4" /></Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(plan.id, plan.name)}
                          disabled={deleteMutation.isPending}
                          className="text-destructive border-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </Box>
                    </Box>
                    <Box className="p-4">
                      <H3 className="mb-1">{plan.name}</H3>
                      {plan.space && (
                        <Stack direction="horizontal" gap={1} className="items-center text-muted-foreground mb-2">
                          <MapPin className="h-3 w-3" />
                          <Text size="sm">{plan.space.name}</Text>
                        </Stack>
                      )}
                      <Stack direction="horizontal" className="justify-between text-muted-foreground">
                        <Text size="xs">
                          {plan.dimensions?.width && plan.dimensions?.height
                            ? `${plan.dimensions.width} x ${plan.dimensions.height} ${plan.dimensions.unit || 'ft'}`
                            : 'No dimensions'}
                        </Text>
                        <Text size="xs">{plan.objects?.length || 0} objects</Text>
                      </Stack>
                    </Box>
                  </Card>
                ))}
              </Grid>
            )}
          </Stack>
        </Container>
      </MainContent>
    </>
  );
}
