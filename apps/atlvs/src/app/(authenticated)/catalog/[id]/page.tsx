'use client';

import {
  Body,
  Button,
  H1,
  H2,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Text,
} from '@ghxstship/ui';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Package, Tag, Edit, Trash2, DollarSign, Clock, Layers } from 'lucide-react';
import { useCatalogItem, useDeleteCatalogItem } from '@/hooks/useCatalog';
import { useRouter } from 'next/navigation';

export default function CatalogItemDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();

  const { data, isLoading, error } = useCatalogItem(id);
  const deleteMutation = useDeleteCatalogItem();

  const item = data?.item;

  const handleDelete = async () => {
    if (confirm(`Delete "${item?.name}"? This action cannot be undone.`)) {
      await deleteMutation.mutateAsync(id);
      router.push('/catalog');
    }
  };

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
          <div className="h-48 bg-muted rounded-card" />
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="p-6">
        <div className="bg-destructive/10 border-2 border-destructive rounded-card p-4 text-destructive">
          Failed to load catalog item. The item may not exist.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/catalog"
            className="p-2 border-2 border-border rounded-button hover:bg-muted transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex items-center gap-4">
            {item.images && item.images.length > 0 ? (
              <Image
                src={item.images[0]}
                alt={item.name}
                width={64}
                height={64}
                className="w-16 h-16 rounded-card object-cover border-2 border-border"
              />
            ) : (
              <div className="w-16 h-16 rounded-card bg-muted flex items-center justify-center border-2 border-border">
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-3">
                <H1 className="text-h2-md font-weight-bold text-foreground">{item.name}</H1>
                <Text className={`px-2 py-1 rounded-badge text-body-xs font-weight-medium ${statusColors[item.status as keyof typeof statusColors] || statusColors.draft}`}>
                  {item.status}
                </Text>
              </div>
              {item.sku && (
                <Body className="text-body-sm text-muted-foreground">SKU: {item.sku}</Body>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/catalog/${id}/edit`}
            className="inline-flex items-center gap-2 px-4 py-2 border-2 border-border rounded-button text-body-sm font-weight-medium hover:bg-muted transition-colors"
          >
            <Edit className="h-4 w-4" />
            Edit
          </Link>
          <Button
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="inline-flex items-center gap-2 px-4 py-2 border-2 border-destructive text-destructive rounded-button text-body-sm font-weight-medium hover:bg-destructive/10 transition-colors disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-background border-2 border-border rounded-card p-6">
            <H2 className="text-h4-md font-weight-semibold text-foreground mb-4">Description</H2>
            {item.description ? (
              <Body className="text-body-sm text-foreground">{item.description}</Body>
            ) : (
              <Body className="text-body-sm text-muted-foreground italic">No description provided</Body>
            )}
          </div>

          {item.specifications && Object.keys(item.specifications).length > 0 && (
            <div className="bg-background border-2 border-border rounded-card p-6">
              <H2 className="text-h4-md font-weight-semibold text-foreground mb-4">Specifications</H2>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(item.specifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <Text className="text-body-sm text-muted-foreground capitalize">{key.replace(/_/g, ' ')}</Text>
                    <Text className="text-body-sm font-weight-medium">{String(value)}</Text>
                  </div>
                ))}
              </div>
            </div>
          )}

          {item.pricing_tiers && item.pricing_tiers.length > 0 && (
            <div className="bg-background border-2 border-border rounded-card p-6">
              <H2 className="text-h4-md font-weight-semibold text-foreground mb-4">Volume Pricing</H2>
              <div className="overflow-x-auto">
                <Table className="w-full">
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="text-left px-4 py-2 text-body-xs font-weight-medium text-muted-foreground">Quantity</TableHead>
                      <TableHead className="text-right px-4 py-2 text-body-xs font-weight-medium text-muted-foreground">Price</TableHead>
                      <TableHead className="text-right px-4 py-2 text-body-xs font-weight-medium text-muted-foreground">Discount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-border">
                    {item.pricing_tiers.map((tier, index) => (
                      <TableRow key={index}>
                        <TableCell className="px-4 py-2 text-body-sm">
                          {tier.quantity_min}+ {item.unit_type || 'units'}
                        </TableCell>
                        <TableCell className="px-4 py-2 text-body-sm text-right font-weight-medium">
                          {formatCurrency(tier.price)}
                        </TableCell>
                        <TableCell className="px-4 py-2 text-body-sm text-right text-success">
                          {tier.discount_percent ? `${tier.discount_percent}% off` : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-background border-2 border-border rounded-card p-6">
            <H2 className="text-h4-md font-weight-semibold text-foreground mb-4">Pricing</H2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-card">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <Body className="text-body-xs text-muted-foreground">Base Price</Body>
                  <Body className="text-h4-md font-weight-bold text-foreground">
                    {formatCurrency(item.base_price)}
                    <Text className="text-body-sm font-weight-normal text-muted-foreground ml-1">
                      /{item.unit_type || 'unit'}
                    </Text>
                  </Body>
                </div>
              </div>
                          </div>
          </div>

          <div className="bg-background border-2 border-border rounded-card p-6">
            <H2 className="text-h4-md font-weight-semibold text-foreground mb-4">Details</H2>
            <div className="space-y-3">
              {item.category && (
                <div className="flex items-center gap-3">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <Body className="text-body-xs text-muted-foreground">Category</Body>
                    <Body className="text-body-sm font-weight-medium">{item.category.name}</Body>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Layers className="h-4 w-4 text-muted-foreground" />
                <div>
                  <Body className="text-body-xs text-muted-foreground">Quantity Range</Body>
                  <Body className="text-body-sm font-weight-medium">
                    {item.min_quantity || 1} - {item.max_quantity || 'No limit'}
                  </Body>
                </div>
              </div>
              {item.lead_time_days && (
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <Body className="text-body-xs text-muted-foreground">Lead Time</Body>
                    <Body className="text-body-sm font-weight-medium">{item.lead_time_days} days</Body>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-background border-2 border-border rounded-card p-6">
            <H2 className="text-h4-md font-weight-semibold text-foreground mb-4">Quick Actions</H2>
            <div className="space-y-2">
              <Link
                href={`/vendor-orders/new?item=${id}`}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button border-2 border-primary font-weight-medium text-body-sm hover:bg-primary/90 transition-colors"
              >
                Create Order
              </Link>
              <Link
                href={`/catalog/${id}/pricing`}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 border-2 border-border rounded-button font-weight-medium text-body-sm hover:bg-muted transition-colors"
              >
                Manage Pricing Tiers
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
