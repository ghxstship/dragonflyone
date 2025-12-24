'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Edit2, Trash2, Users } from 'lucide-react';
import { useSpace, useSpaceCapacityConfigs } from '@/hooks/useSpaces';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Body,
  Button,
  Form,
  H1,
  H3,
  Input,
  Label,
  Select,
  Text,
  Textarea,
} from '@ghxstship/ui';

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
            <H1 className="text-h2-md font-weight-bold text-foreground">Capacity Configurations</H1>
            <Body className="text-body-sm text-muted-foreground mt-1">
              {space?.name || 'Space'}
            </Body>
          </div>
        </div>
        <Button variant="solid" size="sm" onClick={() => setShowAddForm(true)} icon={<Plus className="h-4 w-4" />} iconPosition="left">
          Add Layout
        </Button>
      </div>

      {configs.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 border-2 border-dashed border-border rounded-card">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <Body className="text-body-md text-muted-foreground">No capacity configurations</Body>
          <Button variant="ghost" size="sm" onClick={() => setShowAddForm(true)} icon={<Plus className="h-4 w-4" />} iconPosition="left" className="mt-4">
            Add your first layout
          </Button>
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
                    <H3 className="text-body-md font-weight-semibold text-foreground">
                      {config.layout_name}
                    </H3>
                    <Body className="text-body-xs text-muted-foreground capitalize">
                      {config.layout_type.replace('_', ' ')}
                    </Body>
                  </div>
                </div>
                {config.is_default && (
                  <Text className="px-2 py-0.5 text-body-xs bg-primary/10 text-primary rounded">
                    Default
                  </Text>
                )}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <Text className="text-body-md font-weight-bold text-foreground">
                    {config.capacity}
                  </Text>
                  <Text className="text-body-sm text-muted-foreground">guests</Text>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="p-2">
                    <Edit2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                  <Button variant="ghost" size="icon" className="p-2 hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
              {config.notes && (
                <Body className="mt-2 text-body-xs text-muted-foreground">{config.notes}</Body>
              )}
            </div>
          ))}
        </div>
      )}

      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background border-2 border-border rounded-card p-6 max-w-md w-full mx-4">
            <H3 className="text-h4-md font-weight-semibold text-foreground mb-4">Add Layout</H3>
            <Form
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
                <Label className="block text-body-sm font-weight-medium text-foreground mb-1">
                  Layout Name
                </Label>
                <Input
                  type="text"
                  name="layout_name"
                  required
                  placeholder="e.g., Theater Style"
                  className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="block text-body-sm font-weight-medium text-foreground mb-1">
                    Layout Type
                  </Label>
                  <Select
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
                  </Select>
                </div>
                <div>
                  <Label className="block text-body-sm font-weight-medium text-foreground mb-1">
                    Capacity
                  </Label>
                  <Input
                    type="number"
                    name="capacity"
                    required
                    min="1"
                    className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
              <div>
                <Label className="block text-body-sm font-weight-medium text-foreground mb-1">
                  Notes (optional)
                </Label>
                <Textarea
                  name="notes"
                  rows={2}
                  className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary resize-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="checkbox"
                  name="is_default"
                  id="is_default"
                  className="w-4 h-4"
                />
                <Label htmlFor="is_default" className="text-body-sm text-foreground">
                  Set as default layout
                </Label>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4">
                <Button variant="outline" size="sm" type="button" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
                <Button variant="solid" size="sm" type="submit" disabled={createConfig.isPending} isLoading={createConfig.isPending} loadingText="Adding...">
                  Add Layout
                </Button>
              </div>
            </Form>
          </div>
        </div>
      )}
    </div>
  );
}
