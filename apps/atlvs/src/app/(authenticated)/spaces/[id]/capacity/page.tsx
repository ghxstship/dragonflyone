'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Edit2, Trash2, Users } from 'lucide-react';
import { useSpace, useSpaceCapacityConfigs } from '@/hooks/useSpaces';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface CapacityConfig {
  id: string;
  layout_name: string;
  layout_type: 'theater' | 'classroom' | 'banquet' | 'cocktail' | 'conference' | 'u_shape' | 'hollow_square';
  capacity: number;
  is_default: boolean;
  notes?: string;
}

export default function SpaceCapacityPage() {
  const params = useParams();
  const spaceId = params.id as string;
  const queryClient = useQueryClient();

  const { data: spaceData, isLoading: spaceLoading } = useSpace(spaceId);
  const { data: capacityData, isLoading: capacityLoading } = useSpaceCapacityConfigs(spaceId);

  const [showAddForm, setShowAddForm] = useState(false);

  const space = spaceData?.space;
  const configs: CapacityConfig[] = capacityData?.configs || [];

  const createConfig = useMutation({
    mutationFn: async (config: Partial<CapacityConfig>) => {
      const response = await fetch(`/api/spaces/${spaceId}/capacity-configs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (!response.ok) throw new Error('Failed to create capacity config');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['space-capacity-configs', spaceId] });
      setShowAddForm(false);
    },
  });

  const getLayoutIcon = () => {
    return <Users className="h-5 w-5" />;
  };

  if (spaceLoading || capacityLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading capacity configs...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={`/spaces/${spaceId}`}
            className="p-2 hover:bg-muted rounded-button transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </Link>
          <div>
            <h1 className="text-h2-md font-weight-bold text-foreground">Capacity Configurations</h1>
            <p className="text-body-sm text-muted-foreground mt-1">
              {space?.name || 'Space'}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span className="text-body-sm font-weight-medium">Add Layout</span>
        </button>
      </div>

      {configs.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 border-2 border-dashed border-border rounded-card">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-body-md text-muted-foreground">No capacity configurations</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-2 mt-4 text-primary hover:underline"
          >
            <Plus className="h-4 w-4" />
            Add your first layout
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {configs.map((config) => (
            <div
              key={config.id}
              className={`bg-background border-2 rounded-card p-4 ${
                config.is_default ? 'border-primary' : 'border-border'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-card ${config.is_default ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    {getLayoutIcon()}
                  </div>
                  <div>
                    <h3 className="text-body-md font-weight-semibold text-foreground">
                      {config.layout_name}
                    </h3>
                    <p className="text-body-xs text-muted-foreground capitalize">
                      {config.layout_type.replace('_', ' ')}
                    </p>
                  </div>
                </div>
                {config.is_default && (
                  <span className="px-2 py-0.5 text-body-xs bg-primary/10 text-primary rounded">
                    Default
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-body-md font-weight-bold text-foreground">
                    {config.capacity}
                  </span>
                  <span className="text-body-sm text-muted-foreground">guests</span>
                </div>
                <div className="flex items-center gap-1">
                  <button className="p-2 hover:bg-muted rounded-button transition-colors">
                    <Edit2 className="h-4 w-4 text-muted-foreground" />
                  </button>
                  <button className="p-2 hover:bg-destructive/10 rounded-button transition-colors">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </button>
                </div>
              </div>
              {config.notes && (
                <p className="mt-2 text-body-xs text-muted-foreground">{config.notes}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background border-2 border-border rounded-card p-6 max-w-md w-full mx-4">
            <h3 className="text-h4-md font-weight-semibold text-foreground mb-4">Add Layout</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                createConfig.mutate({
                  layout_name: formData.get('layout_name') as string,
                  layout_type: formData.get('layout_type') as CapacityConfig['layout_type'],
                  capacity: parseInt(formData.get('capacity') as string),
                  is_default: formData.get('is_default') === 'on',
                  notes: formData.get('notes') as string || undefined,
                });
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-body-sm font-weight-medium text-foreground mb-1">
                  Layout Name
                </label>
                <input
                  type="text"
                  name="layout_name"
                  required
                  placeholder="e.g., Theater Style"
                  className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-body-sm font-weight-medium text-foreground mb-1">
                    Layout Type
                  </label>
                  <select
                    name="layout_type"
                    className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
                  >
                    <option value="theater">Theater</option>
                    <option value="classroom">Classroom</option>
                    <option value="banquet">Banquet</option>
                    <option value="cocktail">Cocktail</option>
                    <option value="conference">Conference</option>
                    <option value="u_shape">U-Shape</option>
                    <option value="hollow_square">Hollow Square</option>
                  </select>
                </div>
                <div>
                  <label className="block text-body-sm font-weight-medium text-foreground mb-1">
                    Capacity
                  </label>
                  <input
                    type="number"
                    name="capacity"
                    required
                    min="1"
                    className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
              <div>
                <label className="block text-body-sm font-weight-medium text-foreground mb-1">
                  Notes (optional)
                </label>
                <textarea
                  name="notes"
                  rows={2}
                  className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary resize-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="is_default"
                  id="is_default"
                  className="w-4 h-4"
                />
                <label htmlFor="is_default" className="text-body-sm text-foreground">
                  Set as default layout
                </label>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border-2 border-border rounded-button hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createConfig.isPending}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-button hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {createConfig.isPending ? 'Adding...' : 'Add Layout'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
