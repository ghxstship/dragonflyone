'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface FloorPlanObject {
  id: string;
  organization_id?: string;
  name: string;
  category: string;
  icon_svg?: string;
  icon_url?: string;
  dimensions: { width: number; height: number };
  default_capacity: number;
  is_custom: boolean;
  is_active: boolean;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface FloorPlan {
  id: string;
  organization_id: string;
  space_id?: string;
  name: string;
  description?: string;
  version: number;
  canvas_data: Record<string, unknown>;
  dimensions: { width: number; height: number; unit: string };
  scale: number;
  objects: Array<{
    id: string;
    object_id: string;
    x: number;
    y: number;
    rotation: number;
    scale: number;
    metadata?: Record<string, unknown>;
  }>;
  capacity_by_setup: Record<string, number>;
  thumbnail_url?: string;
  is_template: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
  space?: {
    id: string;
    name: string;
  };
}

interface FloorPlansResponse {
  floor_plans: FloorPlan[];
}

interface FloorPlanObjectsResponse {
  objects: FloorPlanObject[];
  by_category: Record<string, FloorPlanObject[]>;
  categories: string[];
}

interface CreateFloorPlanInput {
  organization_id: string;
  space_id?: string;
  name: string;
  description?: string;
  dimensions?: { width: number; height: number; unit?: string };
  scale?: number;
  is_template?: boolean;
}

interface UpdateFloorPlanInput {
  name?: string;
  description?: string;
  canvas_data?: Record<string, unknown>;
  dimensions?: { width: number; height: number; unit: string };
  scale?: number;
  objects?: FloorPlan['objects'];
  capacity_by_setup?: Record<string, number>;
  thumbnail_url?: string;
}

async function fetchFloorPlans(
  organizationId: string,
  spaceId?: string,
  isTemplate?: boolean
): Promise<FloorPlansResponse> {
  const params = new URLSearchParams();
  params.set('organization_id', organizationId);
  if (spaceId) params.set('space_id', spaceId);
  if (isTemplate !== undefined) params.set('is_template', String(isTemplate));

  const res = await fetch(`/api/floor-plans?${params}`);
  if (!res.ok) throw new Error('Failed to fetch floor plans');
  return res.json();
}

async function fetchFloorPlan(id: string): Promise<{ floor_plan: FloorPlan }> {
  const res = await fetch(`/api/floor-plans/${id}`);
  if (!res.ok) throw new Error('Failed to fetch floor plan');
  return res.json();
}

async function fetchFloorPlanObjects(
  organizationId?: string,
  category?: string
): Promise<FloorPlanObjectsResponse> {
  const params = new URLSearchParams();
  if (organizationId) params.set('organization_id', organizationId);
  if (category) params.set('category', category);

  const res = await fetch(`/api/floor-plan-objects?${params}`);
  if (!res.ok) throw new Error('Failed to fetch floor plan objects');
  return res.json();
}

async function createFloorPlan(input: CreateFloorPlanInput): Promise<{ floor_plan: FloorPlan }> {
  const res = await fetch('/api/floor-plans', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error('Failed to create floor plan');
  return res.json();
}

async function updateFloorPlan(
  id: string,
  input: UpdateFloorPlanInput
): Promise<{ floor_plan: FloorPlan }> {
  const res = await fetch(`/api/floor-plans/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error('Failed to update floor plan');
  return res.json();
}

async function deleteFloorPlan(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`/api/floor-plans/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete floor plan');
  return res.json();
}

export function useFloorPlans(
  organizationId: string | undefined,
  options?: { spaceId?: string; isTemplate?: boolean }
) {
  return useQuery({
    queryKey: ['floor-plans', organizationId, options],
    queryFn: () => fetchFloorPlans(organizationId!, options?.spaceId, options?.isTemplate),
    enabled: !!organizationId,
  });
}

export function useFloorPlan(id: string | undefined) {
  return useQuery({
    queryKey: ['floor-plan', id],
    queryFn: () => fetchFloorPlan(id!),
    enabled: !!id,
  });
}

export function useFloorPlanObjects(organizationId?: string, category?: string) {
  return useQuery({
    queryKey: ['floor-plan-objects', organizationId, category],
    queryFn: () => fetchFloorPlanObjects(organizationId, category),
  });
}

export function useCreateFloorPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createFloorPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['floor-plans'] });
    },
  });
}

export function useUpdateFloorPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateFloorPlanInput }) =>
      updateFloorPlan(id, input),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['floor-plans'] });
      queryClient.invalidateQueries({ queryKey: ['floor-plan', id] });
    },
  });
}

export function useDeleteFloorPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteFloorPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['floor-plans'] });
    },
  });
}
