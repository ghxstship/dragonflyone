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
import Image from 'next/image';
import { Search, Grid3X3, List, Users, DollarSign, MapPin } from 'lucide-react';
import { useSpaces } from '@/hooks/useSpaces';

export default function SpacesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { data, isLoading, error } = useSpaces();

  const spaces = data?.spaces || [];
  const filteredSpaces = spaces.filter(
    (space) =>
      space.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (space.description && space.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (isLoading) {
    return (
      <>
        <EnterprisePageHeader title="Spaces" subtitle="Loading..." />
        <MainContent padding="lg">
          <Container>
            <Grid cols={3} gap={4}>
              <Skeleton className="h-64" />
              <Skeleton className="h-64" />
              <Skeleton className="h-64" />
            </Grid>
          </Container>
        </MainContent>
      </>
    );
  }

  if (error) {
    return (
      <>
        <EnterprisePageHeader title="Spaces" subtitle="Error" />
        <MainContent padding="lg">
          <Container>
            <EmptyState
              title="Failed to load spaces"
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
        title="Spaces"
        subtitle="Manage your venue spaces and configurations"
        primaryAction={{ label: 'Add Space', onClick: () => router.push('/spaces/new') }}
        secondaryActions={[
          { label: 'Combinations', onClick: () => router.push('/spaces/combinations') }
        ]}
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={6}>
            <Stack direction="horizontal" gap={4} className="items-center">
              <Box className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search spaces..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </Box>
              <Stack direction="horizontal" className="border rounded-button overflow-hidden">
                <Button
                  variant={viewMode === 'grid' ? 'solid' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 className="h-4 w-4" />
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

            {filteredSpaces.length === 0 ? (
              <EmptyState
                title={searchQuery ? 'No spaces match your search' : 'No spaces yet'}
                description={searchQuery ? 'Try adjusting your search' : 'Add your first space to get started'}
                icon={<MapPin className="h-12 w-12" />}
                action={!searchQuery ? { label: 'Add Space', onClick: () => router.push('/spaces/new') } : undefined}
              />
            ) : viewMode === 'grid' ? (
              <Grid cols={3} gap={4}>
                {filteredSpaces.map((space) => (
                  <Link key={space.id} href={`/spaces/${space.id}`}>
                    <Card className="overflow-hidden hover:shadow-md transition-shadow">
                      <Box className="h-40 bg-muted/50 flex items-center justify-center relative">
                        {space.photos && space.photos.length > 0 ? (
                          <Image
                            src={space.photos[0]}
                            alt={space.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <MapPin className="h-12 w-12 text-muted-foreground" />
                        )}
                      </Box>
                      <Box className="p-4">
                        <Stack direction="horizontal" className="justify-between items-start mb-2">
                          <H3>{space.name}</H3>
                          <Badge variant={space.is_active ? 'solid' : 'outline'}>
                            {space.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </Stack>
                        {space.description && (
                          <Body size="sm" className="text-muted-foreground mb-3 line-clamp-2">
                            {space.description}
                          </Body>
                        )}
                        <Stack direction="horizontal" gap={4} className="text-muted-foreground">
                          <Text size="xs" className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {space.capacity || 0} guests
                          </Text>
                          {space.base_price && (
                            <Text size="xs" className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              ${space.base_price}
                            </Text>
                          )}
                        </Stack>
                      </Box>
                    </Card>
                  </Link>
                ))}
              </Grid>
            ) : (
              <Card className="overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Space</TableHead>
                      <TableHead>Capacity</TableHead>
                      <TableHead>Base Price</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSpaces.map((space) => (
                      <TableRow key={space.id}>
                        <TableCell>
                          <Link href={`/spaces/${space.id}`} className="hover:text-primary">
                            {space.name}
                          </Link>
                        </TableCell>
                        <TableCell>{space.capacity || 0} guests</TableCell>
                        <TableCell>{space.base_price ? `$${space.base_price}` : 'N/A'}</TableCell>
                        <TableCell>
                          <Badge variant={space.is_active ? 'solid' : 'outline'}>
                            {space.is_active ? 'Active' : 'Inactive'}
                          </Badge>
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
