'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Plus, Search, Layout, Eye, Edit, Trash2, MapPin } from 'lucide-react';
import { useFloorPlans, useDeleteFloorPlan } from '@/hooks/useFloorPlans';

export default function FloorPlansPage() {
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
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded-card w-1/3" />
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
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
          Failed to load floor plans. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h2-md font-weight-bold text-foreground">Floor Plans</h1>
          <p className="text-body-sm text-muted-foreground mt-1">
            Manage venue layouts and space configurations
          </p>
        </div>
        <a
          href="/floor-plans/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button border-2 border-primary font-weight-medium text-body-sm hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Floor Plan
        </a>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search floor plans..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>
        {uniqueSpaces.length > 0 && (
          <select
            value={spaceFilter}
            onChange={(e) => setSpaceFilter(e.target.value)}
            className="px-3 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Spaces</option>
            {uniqueSpaces.map((space) => (
              <option key={space?.id} value={space?.id}>
                {space?.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {(!filteredPlans || filteredPlans.length === 0) && (
        <div className="text-center py-12 bg-muted/30 rounded-card border-2 border-dashed border-border">
          <Layout className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-h4-md font-weight-medium text-foreground mb-2">
            No floor plans found
          </h3>
          <p className="text-body-sm text-muted-foreground mb-4">
            Create your first floor plan to start mapping out your venues.
          </p>
          <a
            href="/floor-plans/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button border-2 border-primary font-weight-medium text-body-sm"
          >
            <Plus className="h-4 w-4" />
            Create Floor Plan
          </a>
        </div>
      )}

      {filteredPlans && filteredPlans.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPlans.map((plan) => (
            <div
              key={plan.id}
              className="bg-background border-2 border-border rounded-card overflow-hidden hover:border-primary/50 transition-colors group"
            >
              <div className="aspect-video bg-muted relative">
                {plan.thumbnail_url ? (
                  <Image
                    src={plan.thumbnail_url}
                    alt={plan.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Layout className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <a
                    href={`/floor-plans/${plan.id}`}
                    className="p-2 bg-background rounded-button border-2 border-border hover:bg-muted"
                  >
                    <Eye className="h-4 w-4" />
                  </a>
                  <a
                    href={`/floor-plans/${plan.id}/edit`}
                    className="p-2 bg-background rounded-button border-2 border-border hover:bg-muted"
                  >
                    <Edit className="h-4 w-4" />
                  </a>
                                    <button
                    onClick={() => handleDelete(plan.id, plan.name)}
                    disabled={deleteMutation.isPending}
                    className="p-2 bg-background rounded-button border-2 border-destructive text-destructive hover:bg-destructive/10 disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-weight-semibold text-foreground mb-1">{plan.name}</h3>
                {plan.space && (
                  <div className="flex items-center gap-1 text-body-sm text-muted-foreground mb-2">
                    <MapPin className="h-3 w-3" />
                    {plan.space.name}
                  </div>
                )}
                <div className="flex items-center justify-between text-body-xs text-muted-foreground">
                  <span>
                    {plan.dimensions?.width && plan.dimensions?.height
                      ? `${plan.dimensions.width} x ${plan.dimensions.height} ${plan.dimensions.unit || 'ft'}`
                      : 'No dimensions'}
                  </span>
                  <span>
                    {plan.objects?.length || 0} objects
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
