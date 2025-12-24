'use client';

import {
  Body,
  Button,
  Form,
  H1,
  H3,
  Input,
  Label,
  Text,
} from '@ghxstship/ui';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Edit2, Trash2, GripVertical, Settings } from 'lucide-react';
import { usePipelineStages, useCreatePipelineStage, useUpdatePipelineStage, useDeletePipelineStage } from '@/hooks/usePipeline';

interface PipelineStage {
  id: string;
  name: string;
  color: string;
  probability: number;
  order_index: number;
  is_active: boolean;
}

const STAGE_COLORS = [
  { id: 'gray', color: '#6b7280', label: 'Gray' },
  { id: 'blue', color: '#3b82f6', label: 'Blue' },
  { id: 'green', color: '#22c55e', label: 'Green' },
  { id: 'yellow', color: '#eab308', label: 'Yellow' },
  { id: 'orange', color: '#f97316', label: 'Orange' },
  { id: 'red', color: '#ef4444', label: 'Red' },
  { id: 'purple', color: '#8b5cf6', label: 'Purple' },
  { id: 'pink', color: '#ec4899', label: 'Pink' },
];

export default function PipelineSettingsPage() {
  const { data, isLoading, error } = usePipelineStages();
  const createStage = useCreatePipelineStage();
  const updateStage = useUpdatePipelineStage();
  const deleteStage = useDeletePipelineStage();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingStage, setEditingStage] = useState<PipelineStage | null>(null);

  const stages: PipelineStage[] = data?.stages || [];

  const handleCreateStage = async (formData: FormData) => {
    await createStage.mutateAsync({
      name: formData.get('name') as string,
      color: formData.get('color') as string,
      probability: parseInt(formData.get('probability') as string) || 0,
      order_index: stages.length,
      is_active: true,
    });
    setShowAddForm(false);
  };

  const handleUpdateStage = async (stage: PipelineStage, updates: Partial<PipelineStage>) => {
    await updateStage.mutateAsync({
      stageId: stage.id,
      ...updates,
    });
    setEditingStage(null);
  };

  const handleDeleteStage = async (stageId: string) => {
    if (confirm('Delete this stage? Deals in this stage will need to be moved.')) {
      await deleteStage.mutateAsync(stageId);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading settings...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12 bg-destructive/10 border-2 border-destructive rounded-card">
          <Body className="text-destructive">Failed to load pipeline settings</Body>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/pipeline"
            className="p-2 hover:bg-muted rounded-button transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </Link>
          <div>
            <H1 className="text-h2-md font-weight-bold text-foreground flex items-center gap-2">
              <Settings className="h-6 w-6" />
              Pipeline Settings
            </H1>
            <Body className="text-body-sm text-muted-foreground mt-1">
              Configure deal stages and probabilities
            </Body>
          </div>
        </div>
        <Button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <Text className="text-body-sm font-weight-medium">Add Stage</Text>
        </Button>
      </div>

      <div className="bg-background border-2 border-border rounded-card overflow-hidden">
        <div className="px-4 py-3 bg-muted/30 border-b border-border">
          <div className="grid grid-cols-12 gap-4 text-body-sm font-weight-medium text-muted-foreground">
            <div className="col-span-1"></div>
            <div className="col-span-4">Stage Name</div>
            <div className="col-span-2">Color</div>
            <div className="col-span-2">Probability</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-1"></div>
          </div>
        </div>
        {stages.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Body className="text-body-md">No stages configured</Body>
            <Button
              onClick={() => setShowAddForm(true)}
              className="mt-2 text-primary hover:underline"
            >
              Add your first stage
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {stages.map((stage) => (
              <div
                key={stage.id}
                className={`px-4 py-3 grid grid-cols-12 gap-4 items-center ${
                  !stage.is_active ? 'opacity-50' : ''
                }`}
              >
                <div className="col-span-1 text-muted-foreground cursor-move">
                  <GripVertical className="h-4 w-4" />
                </div>
                <div className="col-span-4">
                  {editingStage?.id === stage.id ? (
                    <Input
                      type="text"
                      defaultValue={stage.name}
                      onBlur={(e) => handleUpdateStage(stage, { name: e.target.value })}
                      className="w-full px-2 py-1 border-2 border-border rounded text-body-sm focus:outline-none focus:border-primary"
                      autoFocus
                    />
                  ) : (
                    <Text className="text-body-sm font-weight-medium text-foreground">
                      {stage.name}
                    </Text>
                  )}
                </div>
                <div className="col-span-2">
                  <div
                    className="w-6 h-6 rounded-avatar border-2 border-border"
                    style={{ backgroundColor: stage.color }}
                  />
                </div>
                <div className="col-span-2">
                  <Text className="text-body-sm text-muted-foreground">
                    {stage.probability}%
                  </Text>
                </div>
                <div className="col-span-2">
                  <Button
                    onClick={() => handleUpdateStage(stage, { is_active: !stage.is_active })}
                    className={`px-2 py-0.5 text-body-xs rounded ${
                      stage.is_active
                        ? 'bg-success-100 text-success-800'
                        : 'bg-ink-100 text-ink-800'
                    }`}
                  >
                    {stage.is_active ? 'Active' : 'Inactive'}
                  </Button>
                </div>
                <div className="col-span-1 flex items-center gap-1 justify-end">
                  <Button
                    onClick={() => setEditingStage(stage)}
                    className="p-1 hover:bg-muted rounded transition-colors"
                  >
                    <Edit2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                  <Button
                    onClick={() => handleDeleteStage(stage.id)}
                    className="p-1 hover:bg-destructive/10 rounded transition-colors"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background border-2 border-border rounded-card p-6 max-w-md w-full mx-4">
            <H3 className="text-h4-md font-weight-semibold text-foreground mb-4">Add Stage</H3>
            <Form
              onSubmit={(e) => {
                e.preventDefault();
                handleCreateStage(new FormData(e.currentTarget));
              }}
              className="space-y-4"
            >
              <div>
                <Label className="block text-body-sm font-weight-medium text-foreground mb-1">
                  Stage Name *
                </Label>
                <Input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g., Qualified"
                  className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <Label className="block text-body-sm font-weight-medium text-foreground mb-1">
                  Color
                </Label>
                <div className="grid grid-cols-8 gap-2">
                  {STAGE_COLORS.map((c) => (
                    <Label key={c.id} className="cursor-pointer">
                      <Input
                        type="radio"
                        name="color"
                        value={c.color}
                        defaultChecked={c.id === 'blue'}
                        className="sr-only"
                      />
                      <div
                        className="w-8 h-8 rounded-avatar border-2 border-border hover:ring-2 hover:ring-primary/50"
                        style={{ backgroundColor: c.color }}
                      />
                    </Label>
                  ))}
                </div>
              </div>
              <div>
                <Label className="block text-body-sm font-weight-medium text-foreground mb-1">
                  Win Probability (%)
                </Label>
                <Input
                  type="number"
                  name="probability"
                  min="0"
                  max="100"
                  defaultValue="25"
                  className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
                />
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
                  disabled={createStage.isPending}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-button hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {createStage.isPending ? 'Adding...' : 'Add Stage'}
                </Button>
              </div>
            </Form>
          </div>
        </div>
      )}
    </div>
  );
}
