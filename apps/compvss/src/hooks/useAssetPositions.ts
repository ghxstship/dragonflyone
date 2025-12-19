import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface AssetPosition {
  id: string;
  booking_id: string;
  asset_id: string;
  asset_name: string;
  zone_id?: string;
  zone_name?: string;
  x: number;
  y: number;
  z: number;
  rotation: number;
  time_start: string;
  time_end: string;
  status: 'planned' | 'setup' | 'active' | 'teardown' | 'completed';
  assigned_crew?: string[];
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface PositionTimeline {
  booking_id: string;
  event_name: string;
  event_date: string;
  positions: Array<{
    time: string;
    assets: AssetPosition[];
  }>;
  zones: Array<{
    id: string;
    name: string;
    coordinates: Array<{ x: number; y: number }>;
  }>;
}

export interface CreatePositionInput {
  booking_id: string;
  asset_id: string;
  zone_id?: string;
  x: number;
  y: number;
  z: number;
  rotation?: number;
  time_start: string;
  time_end: string;
  assigned_crew?: string[];
  notes?: string;
}

export interface UpdatePositionInput extends Partial<Omit<CreatePositionInput, 'booking_id' | 'asset_id'>> {
  id: string;
}

async function fetchBookingPositions(bookingId: string, time?: string): Promise<{
  positions: AssetPosition[];
  timeline: PositionTimeline;
}> {
  const params = new URLSearchParams();
  if (time) params.set('time', time);

  const response = await fetch(`/api/asset-positions/${bookingId}?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch asset positions');
  }
  return response.json();
}

async function createPosition(input: CreatePositionInput): Promise<AssetPosition> {
  const response = await fetch('/api/asset-positions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create position');
  }
  return response.json();
}

async function updatePosition({ id, ...input }: UpdatePositionInput): Promise<AssetPosition> {
  const response = await fetch(`/api/asset-positions/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update position');
  }
  return response.json();
}

async function deletePosition(id: string): Promise<void> {
  const response = await fetch(`/api/asset-positions/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete position');
  }
}

async function bulkUpdatePositions(input: {
  bookingId: string;
  positions: Array<{ id: string; x: number; y: number; z?: number; rotation?: number }>;
}): Promise<{ updated: number }> {
  const response = await fetch('/api/asset-positions/bulk-update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to bulk update positions');
  }
  return response.json();
}

async function checkCollisions(input: {
  bookingId: string;
  assetId: string;
  x: number;
  y: number;
  z: number;
  timeStart: string;
  timeEnd: string;
  excludePositionId?: string;
}): Promise<{
  hasCollision: boolean;
  collidingAssets: Array<{ asset_id: string; asset_name: string; position_id: string }>;
}> {
  const response = await fetch('/api/asset-positions/check-collision', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new Error('Failed to check collisions');
  }
  return response.json();
}

export function useBookingPositions(bookingId: string, time?: string) {
  return useQuery({
    queryKey: ['asset-positions', bookingId, time],
    queryFn: () => fetchBookingPositions(bookingId, time),
    enabled: !!bookingId,
  });
}

export function useCreatePosition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPosition,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['asset-positions', data.booking_id] });
    },
  });
}

export function useUpdatePosition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePosition,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['asset-positions', data.booking_id] });
    },
  });
}

export function useDeletePosition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePosition,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asset-positions'] });
    },
  });
}

export function useBulkUpdatePositions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bulkUpdatePositions,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['asset-positions', variables.bookingId] });
    },
  });
}

export function useCheckCollisions() {
  return useMutation({
    mutationFn: checkCollisions,
  });
}
