'use client';

import {
  Body,
  Button,
  H1,
  H3,
  Input,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Text,
} from '@ghxstship/ui';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Plus, Search, Filter, Package, Grid, List, Tag } from 'lucide-react';
import { useCatalogItems, useCatalogCategories } from '@/hooks/useCatalog';

type ViewMode = 'grid' | 'list';

export default function CatalogPage() {
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
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded-card w-1/3" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-48 bg-muted rounded-card" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-destructive/10 border-2 border-destructive rounded-card p-4 text-destructive">
          Failed to load catalog items. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <H1 className="text-h2-md font-weight-bold text-foreground">Product Catalog</H1>
          <Body className="text-body-sm text-muted-foreground mt-1">
            Global catalog aligned with 24 asset categories
          </Body>
        </div>
        <Link
          href="/catalog/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button border-2 border-primary font-weight-medium text-body-sm hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Item
        </Link>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search catalog..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Categories</option>
            {categoriesData?.categories?.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </Select>
        </div>

        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="inactive">Inactive</option>
          <option value="discontinued">Discontinued</option>
        </Select>

        <div className="flex items-center border-2 border-border rounded-button overflow-hidden">
          <Button
            onClick={() => setViewMode('grid')}
            className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => setViewMode('list')}
            className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {(!data?.items || data.items.length === 0) && (
        <div className="text-center py-12 bg-muted/30 rounded-card border-2 border-dashed border-border">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <H3 className="text-h4-md font-weight-medium text-foreground mb-2">
            No catalog items found
          </H3>
          <Body className="text-body-sm text-muted-foreground mb-4">
            Start building your product catalog to streamline ordering.
          </Body>
          <Link
            href="/catalog/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button border-2 border-primary font-weight-medium text-body-sm"
          >
            <Plus className="h-4 w-4" />
            Add First Item
          </Link>
        </div>
      )}

      {data?.items && data.items.length > 0 && viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {data.items.map((item) => (
            <Link
              key={item.id}
              href={`/catalog/${item.id}`}
              className="bg-background border-2 border-border rounded-card overflow-hidden hover:border-primary/50 transition-colors"
            >
              <div className="aspect-square bg-muted flex items-center justify-center relative">
                {item.images && item.images.length > 0 ? (
                  <Image
                    src={item.images[0]}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <Package className="h-12 w-12 text-muted-foreground" />
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <H3 className="font-weight-semibold text-foreground line-clamp-1">
                    {item.name}
                  </H3>
                  <Text className={`px-2 py-0.5 rounded-badge text-body-xs font-weight-medium ${statusColors[item.status]}`}>
                    {item.status}
                  </Text>
                </div>
                {item.sku && (
                  <Body className="text-body-xs text-muted-foreground mb-2">
                    SKU: {item.sku}
                  </Body>
                )}
                {item.category && (
                  <div className="flex items-center gap-1 text-body-xs text-muted-foreground mb-2">
                    <Tag className="h-3 w-3" />
                    {item.category.name}
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <Text className="font-weight-bold text-foreground">
                    {formatCurrency(item.base_price)}
                  </Text>
                  <Text className="text-body-xs text-muted-foreground">
                    per {item.unit_type || 'unit'}
                  </Text>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {data?.items && data.items.length > 0 && viewMode === 'list' && (
        <div className="bg-background border-2 border-border rounded-card overflow-hidden">
          <Table className="w-full">
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="text-left px-4 py-3 text-body-xs font-weight-medium text-muted-foreground uppercase tracking-kicker">
                  Item
                </TableHead>
                <TableHead className="text-left px-4 py-3 text-body-xs font-weight-medium text-muted-foreground uppercase tracking-kicker">
                  SKU
                </TableHead>
                <TableHead className="text-left px-4 py-3 text-body-xs font-weight-medium text-muted-foreground uppercase tracking-kicker">
                  Category
                </TableHead>
                <TableHead className="text-left px-4 py-3 text-body-xs font-weight-medium text-muted-foreground uppercase tracking-kicker">
                  Status
                </TableHead>
                <TableHead className="text-right px-4 py-3 text-body-xs font-weight-medium text-muted-foreground uppercase tracking-kicker">
                  Price
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border">
              {data.items.map((item) => (
                <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="px-4 py-3">
                    <Link
                      href={`/catalog/${item.id}`}
                      className="font-weight-medium text-foreground hover:text-primary"
                    >
                      {item.name}
                    </Link>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-body-sm text-muted-foreground">
                    {item.sku || '-'}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-body-sm text-muted-foreground">
                    {item.category?.name || '-'}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <Text className={`px-2 py-0.5 rounded-badge text-body-xs font-weight-medium ${statusColors[item.status]}`}>
                      {item.status}
                    </Text>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right font-weight-medium text-foreground">
                    {formatCurrency(item.base_price)}
                    <Text className="text-body-xs text-muted-foreground ml-1">
                      /{item.unit_type || 'unit'}
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
