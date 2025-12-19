'use client';

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
                <h1 className="text-h2-md font-weight-bold text-foreground">{item.name}</h1>
                <span className={`px-2 py-1 rounded-badge text-body-xs font-weight-medium ${statusColors[item.status as keyof typeof statusColors] || statusColors.draft}`}>
                  {item.status}
                </span>
              </div>
              {item.sku && (
                <p className="text-body-sm text-muted-foreground">SKU: {item.sku}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={`/catalog/${id}/edit`}
            className="inline-flex items-center gap-2 px-4 py-2 border-2 border-border rounded-button text-body-sm font-weight-medium hover:bg-muted transition-colors"
          >
            <Edit className="h-4 w-4" />
            Edit
          </a>
          <button
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="inline-flex items-center gap-2 px-4 py-2 border-2 border-destructive text-destructive rounded-button text-body-sm font-weight-medium hover:bg-destructive/10 transition-colors disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-background border-2 border-border rounded-card p-6">
            <h2 className="text-h4-md font-weight-semibold text-foreground mb-4">Description</h2>
            {item.description ? (
              <p className="text-body-sm text-foreground">{item.description}</p>
            ) : (
              <p className="text-body-sm text-muted-foreground italic">No description provided</p>
            )}
          </div>

          {item.specifications && Object.keys(item.specifications).length > 0 && (
            <div className="bg-background border-2 border-border rounded-card p-6">
              <h2 className="text-h4-md font-weight-semibold text-foreground mb-4">Specifications</h2>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(item.specifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <span className="text-body-sm text-muted-foreground capitalize">{key.replace(/_/g, ' ')}</span>
                    <span className="text-body-sm font-weight-medium">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {item.pricing_tiers && item.pricing_tiers.length > 0 && (
            <div className="bg-background border-2 border-border rounded-card p-6">
              <h2 className="text-h4-md font-weight-semibold text-foreground mb-4">Volume Pricing</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left px-4 py-2 text-body-xs font-weight-medium text-muted-foreground">Quantity</th>
                      <th className="text-right px-4 py-2 text-body-xs font-weight-medium text-muted-foreground">Price</th>
                      <th className="text-right px-4 py-2 text-body-xs font-weight-medium text-muted-foreground">Discount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {item.pricing_tiers.map((tier, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 text-body-sm">
                          {tier.quantity_min}+ {item.unit_type || 'units'}
                        </td>
                        <td className="px-4 py-2 text-body-sm text-right font-weight-medium">
                          {formatCurrency(tier.price)}
                        </td>
                        <td className="px-4 py-2 text-body-sm text-right text-success">
                          {tier.discount_percent ? `${tier.discount_percent}% off` : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-background border-2 border-border rounded-card p-6">
            <h2 className="text-h4-md font-weight-semibold text-foreground mb-4">Pricing</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-card">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-body-xs text-muted-foreground">Base Price</p>
                  <p className="text-h4-md font-weight-bold text-foreground">
                    {formatCurrency(item.base_price)}
                    <span className="text-body-sm font-weight-normal text-muted-foreground ml-1">
                      /{item.unit_type || 'unit'}
                    </span>
                  </p>
                </div>
              </div>
                          </div>
          </div>

          <div className="bg-background border-2 border-border rounded-card p-6">
            <h2 className="text-h4-md font-weight-semibold text-foreground mb-4">Details</h2>
            <div className="space-y-3">
              {item.category && (
                <div className="flex items-center gap-3">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-body-xs text-muted-foreground">Category</p>
                    <p className="text-body-sm font-weight-medium">{item.category.name}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Layers className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-body-xs text-muted-foreground">Quantity Range</p>
                  <p className="text-body-sm font-weight-medium">
                    {item.min_quantity || 1} - {item.max_quantity || 'No limit'}
                  </p>
                </div>
              </div>
              {item.lead_time_days && (
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-body-xs text-muted-foreground">Lead Time</p>
                    <p className="text-body-sm font-weight-medium">{item.lead_time_days} days</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-background border-2 border-border rounded-card p-6">
            <h2 className="text-h4-md font-weight-semibold text-foreground mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <a
                href={`/vendor-orders/new?item=${id}`}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button border-2 border-primary font-weight-medium text-body-sm hover:bg-primary/90 transition-colors"
              >
                Create Order
              </a>
              <a
                href={`/catalog/${id}/pricing`}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 border-2 border-border rounded-button font-weight-medium text-body-sm hover:bg-muted transition-colors"
              >
                Manage Pricing Tiers
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
