'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Edit2, Trash2, Package, DollarSign, Check, Star } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Body,
  Button,
  Form,
  H1,
  H3,
  Input,
  Label,
  Text,
  Textarea,
} from '@ghxstship/ui';

interface BookingPackage {
  id: string;
  name: string;
  description?: string;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    unit_price: number;
    included: boolean;
  }>;
  base_price: number;
  is_active: boolean;
  is_featured?: boolean;
  usage_count: number;
  created_at: string;
}

export default function BookingPackagesPage() {
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['booking-packages'],
    queryFn: async () => {
      const response = await fetch('/api/booking-packages');
      if (!response.ok) {
        return { packages: [] };
      }
      return response.json();
    },
  });

  const packages: BookingPackage[] = data?.packages || [];

  const createPackage = useMutation({
    mutationFn: async (pkg: Partial<BookingPackage>) => {
      const response = await fetch('/api/booking-packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pkg),
      });
      if (!response.ok) throw new Error('Failed to create package');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['booking-packages'] });
      setShowAddForm(false);
    },
  });

  const deletePackage = useMutation({
    mutationFn: async (packageId: string) => {
      const response = await fetch(`/api/booking-packages/${packageId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete package');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['booking-packages'] });
    },
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading packages...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12 bg-destructive/10 border-2 border-destructive rounded-card">
          <Body className="text-destructive">Failed to load packages</Body>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/bookings"
            className="p-2 hover:bg-muted rounded-button transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </Link>
          <div>
            <H1 className="text-h2-md font-weight-bold text-foreground">Booking Packages</H1>
            <Body className="text-body-sm text-muted-foreground mt-1">
              Create bundled offerings for your clients
            </Body>
          </div>
        </div>
        <Button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <Text className="text-body-sm font-weight-medium">New Package</Text>
        </Button>
      </div>

      {packages.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 border-2 border-dashed border-border rounded-card">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <Body className="text-body-md text-muted-foreground">No packages yet</Body>
          <Button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-2 mt-4 text-primary hover:underline"
          >
            <Plus className="h-4 w-4" />
            Create your first package
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`bg-background border-2 rounded-card overflow-hidden ${
                !pkg.is_active ? 'opacity-50 border-border' : pkg.is_featured ? 'border-primary' : 'border-border'
              }`}
            >
              {pkg.is_featured && (
                <div className="bg-primary text-primary-foreground text-body-xs text-center py-1">
                  <Star className="inline h-3 w-3 mr-1" />
                  Featured
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <H3 className="text-body-md font-weight-semibold text-foreground">
                      {pkg.name}
                    </H3>
                    {pkg.description && (
                      <Body className="text-body-sm text-muted-foreground mt-1 line-clamp-2">
                        {pkg.description}
                      </Body>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="p-1.5">
                      <Edit2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (confirm('Delete this package?')) {
                          deletePackage.mutate(pkg.id);
                        }
                      }}
                      className="p-1.5 hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  {pkg.items?.slice(0, 4).map((item) => (
                    <div key={item.id} className="flex items-center gap-2 text-body-xs">
                      <Check className="h-3 w-3 bg-success-100 text-success-800" />
                      <Text className="text-muted-foreground">
                        {item.quantity}x {item.name}
                      </Text>
                    </div>
                  ))}
                  {pkg.items && pkg.items.length > 4 && (
                    <Body className="text-body-xs text-muted-foreground">
                      +{pkg.items.length - 4} more items
                    </Body>
                  )}
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <Text className="text-h4-md font-weight-bold text-foreground">
                      {formatCurrency(pkg.base_price)}
                    </Text>
                  </div>
                  <Text className="text-body-xs text-muted-foreground">
                    Used {pkg.usage_count} times
                  </Text>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background border-2 border-border rounded-card p-6 max-w-md w-full mx-4">
            <H3 className="text-h4-md font-weight-semibold text-foreground mb-4">Create Package</H3>
            <Form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                createPackage.mutate({
                  name: formData.get('name') as string,
                  description: formData.get('description') as string || undefined,
                  base_price: parseFloat(formData.get('base_price') as string) || 0,
                  items: [],
                  is_active: true,
                  is_featured: formData.get('is_featured') === 'on',
                  usage_count: 0,
                });
              }}
              className="space-y-4"
            >
              <div>
                <Label className="block text-body-sm font-weight-medium text-foreground mb-1">
                  Package Name *
                </Label>
                <Input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g., Premium Wedding Package"
                  className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <Label className="block text-body-sm font-weight-medium text-foreground mb-1">
                  Description
                </Label>
                <Textarea
                  name="description"
                  rows={2}
                  className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary resize-none"
                />
              </div>
              <div>
                <Label className="block text-body-sm font-weight-medium text-foreground mb-1">
                  Base Price ($) *
                </Label>
                <Input
                  type="number"
                  name="base_price"
                  required
                  min="0"
                  step="0.01"
                  placeholder="5000"
                  className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
                />
              </div>
              <div className="flex items-center gap-2">
                <Input type="checkbox" name="is_featured" id="is_featured" className="w-4 h-4" />
                <Label htmlFor="is_featured" className="text-body-sm text-foreground">
                  Mark as featured package
                </Label>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4">
                <Button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border-2 border-border rounded-button hover:bg-muted transition-colors"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createPackage.isPending}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-button hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {createPackage.isPending ? 'Creating...' : 'Create Package'}
                </Button>
              </div>
            </Form>
          </div>
        </div>
      )}
    </div>
  );
}
