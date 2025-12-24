'use client';

import {
  Body,
  Button,
  H1,
  H3,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Text,
} from '@ghxstship/ui';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Search, Grid3X3, List, Users, DollarSign, MapPin } from 'lucide-react';
import { useSpaces } from '@/hooks/useSpaces';

export default function SpacesPage() {
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
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading spaces...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12 bg-destructive/10 border-2 border-destructive rounded-card">
          <Body className="text-destructive">Failed to load spaces</Body>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <H1 className="text-h2-md font-weight-bold text-foreground">Spaces</H1>
          <Body className="text-body-sm text-muted-foreground mt-1">
            Manage your venue spaces and configurations
          </Body>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/spaces/combinations"
            className="flex items-center gap-2 px-4 py-2 border-2 border-border rounded-button hover:bg-muted transition-colors"
          >
            <Grid3X3 className="h-4 w-4" />
            <Text className="text-body-sm">Combinations</Text>
          </Link>
          <Link
            href="/spaces/new"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <Text className="text-body-sm font-weight-medium">Add Space</Text>
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search spaces..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
          />
        </div>
        <div className="flex items-center border-2 border-border rounded-button overflow-hidden">
          <Button
            onClick={() => setViewMode('grid')}
            className={`p-2 ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => setViewMode('list')}
            className={`p-2 ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {filteredSpaces.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 border-2 border-dashed border-border rounded-card">
          <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <Body className="text-body-md text-muted-foreground">
            {searchQuery ? 'No spaces match your search' : 'No spaces yet'}
          </Body>
          {!searchQuery && (
            <Link
              href="/spaces/new"
              className="inline-flex items-center gap-2 mt-4 text-primary hover:underline"
            >
              <Plus className="h-4 w-4" />
              Add your first space
            </Link>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSpaces.map((space) => (
            <Link
              key={space.id}
              href={`/spaces/${space.id}`}
              className="bg-background border-2 border-border rounded-card overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="h-40 bg-muted/50 flex items-center justify-center relative">
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
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <H3 className="text-body-md font-weight-semibold text-foreground">
                    {space.name}
                  </H3>
                  <Text className={`px-2 py-0.5 text-body-xs rounded ${
                    space.is_active ? 'bg-success-100 text-success-800' : 'bg-ink-100 text-ink-800'
                  }`}>
                    {space.is_active ? 'Active' : 'Inactive'}
                  </Text>
                </div>
                {space.description && (
                  <Body className="text-body-sm text-muted-foreground mb-3 line-clamp-2">
                    {space.description}
                  </Body>
                )}
                <div className="flex items-center gap-4 text-body-xs text-muted-foreground">
                  <Text className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {space.capacity || 0} guests
                  </Text>
                  {space.base_price && (
                    <Text className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      ${space.base_price}
                    </Text>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-background border-2 border-border rounded-card overflow-hidden">
          <Table className="w-full">
            <TableHeader>
              <TableRow className="border-b border-border bg-muted/30">
                <TableHead className="px-4 py-3 text-left text-body-sm font-weight-medium text-muted-foreground">
                  Space
                </TableHead>
                <TableHead className="px-4 py-3 text-left text-body-sm font-weight-medium text-muted-foreground">
                  Capacity
                </TableHead>
                <TableHead className="px-4 py-3 text-left text-body-sm font-weight-medium text-muted-foreground">
                  Base Price
                </TableHead>
                <TableHead className="px-4 py-3 text-left text-body-sm font-weight-medium text-muted-foreground">
                  Status
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSpaces.map((space) => (
                <TableRow key={space.id} className="border-b border-border hover:bg-muted/30">
                  <TableCell className="px-4 py-3">
                    <Link
                      href={`/spaces/${space.id}`}
                      className="text-body-sm font-weight-medium text-foreground hover:text-primary"
                    >
                      {space.name}
                    </Link>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-body-sm text-muted-foreground">
                    {space.capacity || 0} guests
                  </TableCell>
                  <TableCell className="px-4 py-3 text-body-sm text-muted-foreground">
                    {space.base_price ? `$${space.base_price}` : 'N/A'}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <Text className={`px-2 py-0.5 text-body-xs rounded ${
                      space.is_active ? 'bg-success-100 text-success-800' : 'bg-ink-100 text-ink-800'
                    }`}>
                      {space.is_active ? 'Active' : 'Inactive'}
                    </Text>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
