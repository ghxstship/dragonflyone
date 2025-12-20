'use client';

import Image from 'next/image';
import { ArrowLeft, Layout, Edit, Trash2, Copy, Download, Maximize2 } from 'lucide-react';
import { useFloorPlan, useDeleteFloorPlan } from '@/hooks/useFloorPlans';
import { useRouter } from 'next/navigation';
import { Button } from '@ghxstship/ui';

export default function FloorPlanDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();

  const { data, isLoading, error } = useFloorPlan(id);
  const deleteMutation = useDeleteFloorPlan();

  const floorPlan = data?.floor_plan;

  const handleDelete = async () => {
    if (confirm(`Delete floor plan "${floorPlan?.name}"? This action cannot be undone.`)) {
      await deleteMutation.mutateAsync(id);
      router.push('/floor-plans');
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded-card w-1/3" />
          <div className="h-96 bg-muted rounded-card" />
        </div>
      </div>
    );
  }

  if (error || !floorPlan) {
    return (
      <div className="p-6">
        <div className="bg-destructive/10 border-2 border-destructive rounded-card p-4 text-destructive">
          Failed to load floor plan. The floor plan may not exist.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <a
            href="/floor-plans"
            className="p-2 border-2 border-border rounded-button hover:bg-muted transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </a>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-card">
              <Layout className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-h2-md font-weight-bold text-foreground">{floorPlan.name}</h1>
                {floorPlan.is_template && (
                  <span className="px-2 py-1 rounded-badge text-body-xs font-weight-medium bg-primary/20 text-primary">
                    Template
                  </span>
                )}
              </div>
              {floorPlan.space && (
                <p className="text-body-sm text-muted-foreground">{floorPlan.space.name}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={`/floor-plans/${id}/edit`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button border-2 border-primary font-weight-medium text-body-sm hover:bg-primary/90 transition-colors"
          >
            <Edit className="h-4 w-4" />
            Edit
          </a>
          <button
            className="inline-flex items-center gap-2 px-4 py-2 border-2 border-border rounded-button text-body-sm font-weight-medium hover:bg-muted transition-colors"
            title="Duplicate"
          >
            <Copy className="h-4 w-4" />
          </button>
          <button
            className="inline-flex items-center gap-2 px-4 py-2 border-2 border-border rounded-button text-body-sm font-weight-medium hover:bg-muted transition-colors"
            title="Export"
          >
            <Download className="h-4 w-4" />
          </button>
          <button
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="inline-flex items-center gap-2 px-4 py-2 border-2 border-destructive text-destructive rounded-button text-body-sm font-weight-medium hover:bg-destructive/10 transition-colors disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="bg-background border-2 border-border rounded-card overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
              <span className="text-body-sm font-weight-medium">Floor Plan View</span>
              <Button variant="ghost" size="icon" className="p-2" title="Fullscreen">
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
            <div 
              className="relative bg-muted/20 flex items-center justify-center"
              style={{ 
                minHeight: '500px',
                aspectRatio: floorPlan.dimensions ? `${floorPlan.dimensions.width}/${floorPlan.dimensions.height}` : '16/9'
              }}
            >
              {floorPlan.thumbnail_url ? (
                <Image
                  src={floorPlan.thumbnail_url}
                  alt={floorPlan.name}
                  fill
                  className="object-contain"
                />
              ) : (
                <div className="text-center p-8">
                  <Layout className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-body-sm text-muted-foreground">
                    No preview available
                  </p>
                  <a
                    href={`/floor-plans/${id}/edit`}
                    className="inline-flex items-center gap-2 px-4 py-2 mt-4 bg-primary text-primary-foreground rounded-button border-2 border-primary font-weight-medium text-body-sm"
                  >
                    <Edit className="h-4 w-4" />
                    Open Designer
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-background border-2 border-border rounded-card p-6">
            <h2 className="text-h4-md font-weight-semibold text-foreground mb-4">Details</h2>
            <div className="space-y-3">
              {floorPlan.dimensions && (
                <div>
                  <p className="text-body-xs text-muted-foreground">Dimensions</p>
                  <p className="text-body-sm font-weight-medium">
                    {floorPlan.dimensions.width} x {floorPlan.dimensions.height} {floorPlan.dimensions.unit || 'ft'}
                  </p>
                </div>
              )}
              {floorPlan.scale && (
                <div>
                  <p className="text-body-xs text-muted-foreground">Scale</p>
                  <p className="text-body-sm font-weight-medium">{floorPlan.scale}px per unit</p>
                </div>
              )}
              {floorPlan.capacity_by_setup && Object.keys(floorPlan.capacity_by_setup).length > 0 && (
                <div>
                  <p className="text-body-xs text-muted-foreground mb-2">Capacity</p>
                  <div className="space-y-1">
                    {Object.entries(floorPlan.capacity_by_setup).map(([setup, capacity]) => (
                      <div key={setup} className="flex justify-between text-body-sm">
                        <span className="capitalize">{setup.replace(/_/g, ' ')}</span>
                        <span className="font-weight-medium">{String(capacity)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <p className="text-body-xs text-muted-foreground">Objects</p>
                <p className="text-body-sm font-weight-medium">{floorPlan.objects?.length || 0} placed</p>
              </div>
              <div>
                <p className="text-body-xs text-muted-foreground">Created</p>
                <p className="text-body-sm font-weight-medium">
                  {new Date(floorPlan.created_at).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-body-xs text-muted-foreground">Last Modified</p>
                <p className="text-body-sm font-weight-medium">
                  {new Date(floorPlan.updated_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {floorPlan.description && (
            <div className="bg-background border-2 border-border rounded-card p-6">
              <h2 className="text-h4-md font-weight-semibold text-foreground mb-4">Description</h2>
              <p className="text-body-sm text-foreground">{floorPlan.description}</p>
            </div>
          )}

          <div className="bg-background border-2 border-border rounded-card p-6">
            <h2 className="text-h4-md font-weight-semibold text-foreground mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <a
                href={`/floor-plans/${id}/edit`}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button border-2 border-primary font-weight-medium text-body-sm hover:bg-primary/90 transition-colors"
              >
                Open in Designer
              </a>
              <button
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 border-2 border-border rounded-button font-weight-medium text-body-sm hover:bg-muted transition-colors"
              >
                Export as PDF
              </button>
              <button
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 border-2 border-border rounded-button font-weight-medium text-body-sm hover:bg-muted transition-colors"
              >
                Save as Template
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
