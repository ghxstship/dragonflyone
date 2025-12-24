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
import Link from 'next/link';
import { Plus, Search, Filter, Star, Building2, ChevronRight } from 'lucide-react';
import {
  usePreferredVendors,
  usePreferredVendorMatrix,
  useRemovePreferredVendor,
} from '@/hooks/usePreferredVendors';

export default function PreferredVendorsPage() {
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
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded-card w-1/3" />
          <div className="h-64 bg-muted rounded-card" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-destructive/10 border-2 border-destructive rounded-card p-4 text-destructive">
          Failed to load preferred vendors. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <H1 className="text-h2-md font-weight-bold text-foreground">Preferred Vendors</H1>
          <Body className="text-body-sm text-muted-foreground mt-1">
            Curated lists of preferred vendors by category
          </Body>
        </div>
        <Link
          href="/preferred-vendors/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button border-2 border-primary font-weight-medium text-body-sm hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Preferred Vendor
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search vendors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select
            value={selectedCategory || ''}
            onChange={(e) => setSelectedCategory(e.target.value || null)}
            className="px-3 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Categories</option>
            {data?.categories?.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {matrixData && Object.keys(matrixData.matrix || {}).length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(matrixData.matrix).map(([category, vendors]) => (
            <div
              key={category}
              className="bg-background border-2 border-border rounded-card p-4 hover:border-primary/50 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <H3 className="font-weight-semibold text-foreground">{category}</H3>
                <Text className="text-body-xs text-muted-foreground bg-muted px-2 py-1 rounded-badge">
                  {vendors.length} vendors
                </Text>
              </div>
              <div className="space-y-2">
                {vendors.slice(0, 3).map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-body-sm"
                  >
                    <div className="flex items-center gap-2">
                      <Text className="w-5 h-5 rounded-avatar bg-primary/10 text-primary text-body-xs flex items-center justify-center font-weight-medium">
                        {item.priority}
                      </Text>
                      <Text className="text-foreground">
                        {(item.vendor as { name?: string })?.name || 'Unknown'}
                      </Text>
                    </div>
                    {item.discount && (
                      <Text className="text-body-xs text-success">-{item.discount}%</Text>
                    )}
                  </div>
                ))}
                {vendors.length > 3 && (
                  <Link
                    href={`/preferred-vendors?category=${encodeURIComponent(category)}`}
                    className="text-body-xs text-primary hover:underline flex items-center gap-1"
                  >
                    View all {vendors.length} <ChevronRight className="h-3 w-3" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {(!filteredVendors || filteredVendors.length === 0) && !matrixData?.matrix && (
        <div className="text-center py-12 bg-muted/30 rounded-card border-2 border-dashed border-border">
          <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <H3 className="text-h4-md font-weight-medium text-foreground mb-2">
            No preferred vendors yet
          </H3>
          <Body className="text-body-sm text-muted-foreground mb-4">
            Add vendors to your preferred list for quick access and negotiated rates.
          </Body>
          <Link
            href="/preferred-vendors/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button border-2 border-primary font-weight-medium text-body-sm"
          >
            <Plus className="h-4 w-4" />
            Add First Vendor
          </Link>
        </div>
      )}

      {filteredVendors && filteredVendors.length > 0 && (
        <div className="bg-background border-2 border-border rounded-card overflow-hidden">
          <Table className="w-full">
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="text-left px-4 py-3 text-body-xs font-weight-medium text-muted-foreground uppercase tracking-kicker">
                  Priority
                </TableHead>
                <TableHead className="text-left px-4 py-3 text-body-xs font-weight-medium text-muted-foreground uppercase tracking-kicker">
                  Vendor
                </TableHead>
                <TableHead className="text-left px-4 py-3 text-body-xs font-weight-medium text-muted-foreground uppercase tracking-kicker">
                  Category
                </TableHead>
                <TableHead className="text-left px-4 py-3 text-body-xs font-weight-medium text-muted-foreground uppercase tracking-kicker">
                  Discount
                </TableHead>
                <TableHead className="text-left px-4 py-3 text-body-xs font-weight-medium text-muted-foreground uppercase tracking-kicker">
                  Rating
                </TableHead>
                <TableHead className="text-left px-4 py-3 text-body-xs font-weight-medium text-muted-foreground uppercase tracking-kicker">
                  Valid Until
                </TableHead>
                <TableHead className="text-right px-4 py-3 text-body-xs font-weight-medium text-muted-foreground uppercase tracking-kicker">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border">
              {filteredVendors.map((pv) => (
                <TableRow key={pv.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="px-4 py-3">
                    <Text className="w-6 h-6 rounded-avatar bg-primary text-primary-foreground text-body-xs flex items-center justify-center font-weight-bold">
                      {pv.priority}
                    </Text>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <Link
                      href={`/vendors/${pv.vendor_id}`}
                      className="font-weight-medium text-foreground hover:text-primary"
                    >
                      {pv.vendor?.name || 'Unknown Vendor'}
                    </Link>
                    {pv.vendor?.email && (
                      <div className="text-body-xs text-muted-foreground">
                        {pv.vendor.email}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <Text className="px-2 py-1 bg-muted rounded-badge text-body-xs">
                      {pv.category}
                    </Text>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    {pv.negotiated_discount ? (
                      <Text className="text-success font-weight-medium">
                        -{pv.negotiated_discount}%
                      </Text>
                    ) : (
                      <Text className="text-muted-foreground">-</Text>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    {pv.vendor?.rating ? (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-warning fill-warning" />
                        <Text className="text-body-sm">{pv.vendor.rating.toFixed(1)}</Text>
                      </div>
                    ) : (
                      <Text className="text-muted-foreground">-</Text>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-body-sm text-muted-foreground">
                    {pv.valid_to
                      ? new Date(pv.valid_to).toLocaleDateString()
                      : 'No expiry'}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/preferred-vendors/${pv.id}/edit`}
                        className="px-3 py-1 text-body-xs border-2 border-border rounded-button hover:bg-muted transition-colors"
                      >
                        Edit
                      </Link>
                      <Button
                        onClick={() => handleRemove(pv.id)}
                        disabled={removeMutation.isPending}
                        className="px-3 py-1 text-body-xs border-2 border-destructive text-destructive rounded-button hover:bg-destructive/10 transition-colors disabled:opacity-50"
                      >
                        Remove
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {data?.pagination && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <Body className="text-body-sm text-muted-foreground">
            Showing {filteredVendors?.length || 0} of {data.total} preferred vendors
          </Body>
          <div className="flex items-center gap-2">
            <Button
              disabled={data.pagination.page <= 1}
              className="px-3 py-1 border-2 border-border rounded-button text-body-sm disabled:opacity-50"
            >
              Previous
            </Button>
            <Text className="text-body-sm text-muted-foreground">
              Page {data.pagination.page} of {data.pagination.totalPages}
            </Text>
            <Button
              disabled={!data.pagination.hasMore}
              className="px-3 py-1 border-2 border-border rounded-button text-body-sm disabled:opacity-50"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
