'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Edit2, Trash2, Layers, Users, Check } from 'lucide-react';
import { useSpaces } from '@/hooks/useSpaces';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

interface SpaceCombination {
  id: string;
  name: string;
  description?: string;
  space_ids: string[];
  combined_capacity: number;
  pricing_modifier?: number;
  is_active: boolean;
  spaces?: Array<{ id: string; name: string; capacity: number }>;
}

export default function SpaceCombinationsPage() {
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedSpaces, setSelectedSpaces] = useState<string[]>([]);

  const { data: spacesData, isLoading: spacesLoading } = useSpaces();
  const spaces = spacesData?.spaces || [];

  const { data: combinationsData, isLoading: combinationsLoading } = useQuery({
    queryKey: ['space-combinations'],
    queryFn: async () => {
      const response = await fetch('/api/spaces/combinations');
      if (!response.ok) throw new Error('Failed to fetch combinations');
      return response.json();
    },
  });

  const combinations: SpaceCombination[] = combinationsData?.combinations || [];

  const createCombination = useMutation({
    mutationFn: async (combination: Partial<SpaceCombination>) => {
      const response = await fetch('/api/spaces/combinations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(combination),
      });
      if (!response.ok) throw new Error('Failed to create combination');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['space-combinations'] });
      setShowAddForm(false);
      setSelectedSpaces([]);
    },
  });

  const toggleSpace = (spaceId: string) => {
    setSelectedSpaces((prev) =>
      prev.includes(spaceId)
        ? prev.filter((id) => id !== spaceId)
        : [...prev, spaceId]
    );
  };

  const calculateCombinedCapacity = () => {
    return spaces
      .filter((s) => selectedSpaces.includes(s.id))
      .reduce((sum, s) => sum + (s.capacity || 0), 0);
  };

  if (spacesLoading || combinationsLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading combinations...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/spaces"
            className="p-2 hover:bg-muted rounded-button transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </Link>
          <div>
            <H1 className="text-h2-md font-weight-bold text-foreground">Space Combinations</H1>
            <Body className="text-body-sm text-muted-foreground mt-1">
              Create and manage combined space configurations
            </Body>
          </div>
        </div>
        <Button variant="solid" size="sm" onClick={() => setShowAddForm(true)} icon={<Plus className="h-4 w-4" />} iconPosition="left">
          New Combination
        </Button>
      </div>

      {combinations.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 border-2 border-dashed border-border rounded-card">
          <Layers className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <Body className="text-body-md text-muted-foreground">No space combinations configured</Body>
          <Button variant="ghost" size="sm" onClick={() => setShowAddForm(true)} icon={<Plus className="h-4 w-4" />} iconPosition="left" className="mt-4">
            Create your first combination
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {combinations.map((combination) => (
            <div
              key={combination.id}
              className={`bg-background border-2 rounded-card p-4 ${
                !combination.is_active ? 'opacity-50 border-border' : 'border-primary/30'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <H3 className="text-body-md font-weight-semibold text-foreground">
                    {combination.name}
                  </H3>
                  {combination.description && (
                    <Body className="text-body-sm text-muted-foreground mt-1">
                      {combination.description}
                    </Body>
                  )}
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
              <div className="flex flex-wrap gap-2 mb-3">
                {combination.spaces?.map((space) => (
                  <Text
                    key={space.id}
                    className="px-2 py-1 bg-muted text-muted-foreground text-body-xs rounded"
                  >
                    {space.name}
                  </Text>
                )) || (
                  <Text className="text-body-xs text-muted-foreground">
                    {combination.space_ids.length} spaces
                  </Text>
                )}
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <Text className="text-body-md font-weight-bold text-foreground">
                    {combination.combined_capacity}
                  </Text>
                  <Text className="text-body-sm text-muted-foreground">guests</Text>
                </div>
                {combination.pricing_modifier && combination.pricing_modifier !== 1 && (
                  <Text className="text-body-xs text-muted-foreground">
                    {combination.pricing_modifier > 1 ? '+' : ''}
                    {((combination.pricing_modifier - 1) * 100).toFixed(0)}% pricing
                  </Text>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background border-2 border-border rounded-card p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <H3 className="text-h4-md font-weight-semibold text-foreground mb-4">Create Combination</H3>
            <Form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                createCombination.mutate({
                  name: formData.get('name') as string,
                  description: formData.get('description') as string || undefined,
                  space_ids: selectedSpaces,
                  combined_capacity: calculateCombinedCapacity(),
                  pricing_modifier: parseFloat(formData.get('pricing_modifier') as string) || 1,
                  is_active: true,
                });
              }}
              className="space-y-4"
            >
              <div>
                <Label className="block text-body-sm font-weight-medium text-foreground mb-1">
                  Combination Name
                </Label>
                <Input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g., Grand Ballroom + Garden Terrace"
                  className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <Label className="block text-body-sm font-weight-medium text-foreground mb-1">
                  Description (optional)
                </Label>
                <Textarea
                  name="description"
                  rows={2}
                  className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary resize-none"
                />
              </div>
              <div>
                <Label className="block text-body-sm font-weight-medium text-foreground mb-2">
                  Select Spaces
                </Label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border-2 border-border rounded-card p-2">
                  {spaces.map((space) => (
                    <Button
                      key={space.id}
                      type="button"
                      onClick={() => toggleSpace(space.id)}
                      className={`flex items-center gap-2 p-2 rounded border-2 transition-colors text-left ${
                        selectedSpaces.includes(space.id)
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:bg-muted'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                        selectedSpaces.includes(space.id)
                          ? 'bg-primary border-primary'
                          : 'border-muted-foreground'
                      }`}>
                        {selectedSpaces.includes(space.id) && (
                          <Check className="h-3 w-3 text-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Body className="text-body-sm font-weight-medium text-foreground truncate">
                          {space.name}
                        </Body>
                        <Body className="text-body-xs text-muted-foreground">
                          {space.capacity} guests
                        </Body>
                      </div>
                    </Button>
                  ))}
                </div>
                {selectedSpaces.length > 0 && (
                  <Body className="mt-2 text-body-sm text-muted-foreground">
                    Combined capacity: <Text className="font-weight-bold text-foreground">{calculateCombinedCapacity()}</Text> guests
                  </Body>
                )}
              </div>
              <div>
                <Label className="block text-body-sm font-weight-medium text-foreground mb-1">
                  Pricing Modifier
                </Label>
                <Select
                  name="pricing_modifier"
                  className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
                >
                  <option value="0.9">10% discount</option>
                  <option value="0.95">5% discount</option>
                  <option value="1" selected>No modifier</option>
                  <option value="1.05">5% premium</option>
                  <option value="1.1">10% premium</option>
                </Select>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4">
                <Button variant="outline" size="sm" type="button" onClick={() => { setShowAddForm(false); setSelectedSpaces([]); }}>
                  Cancel
                </Button>
                <Button variant="solid" size="sm" type="submit" disabled={createCombination.isPending || selectedSpaces.length < 2} isLoading={createCombination.isPending} loadingText="Creating...">
                  Create Combination
                </Button>
              </div>
            </Form>
          </div>
        </div>
      )}
    </div>
  );
}
