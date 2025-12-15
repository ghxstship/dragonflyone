'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Shipment {
  id: string;
  organization_id: string;
  project_id?: string;
  project_name?: string;
  origin: string;
  destination: string;
  carrier: string;
  tracking_number?: string;
  ship_date: string;
  expected_delivery: string;
  actual_delivery?: string;
  status: 'scheduled' | 'in_transit' | 'delivered' | 'delayed' | 'cancelled';
  items_count: number;
  weight: number;
  cost: number;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

interface ShipmentFilters {
  status?: string;
  carrier?: string;
  project_id?: string;
}

interface ShipmentsResponse {
  shipments: Shipment[];
  summary: {
    total: number;
    active: number;
    in_transit: number;
    delayed: number;
    total_cost: number;
  };
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
}

export function useShipments(filters?: ShipmentFilters) {
  return useQuery({
    queryKey: ['shipments', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.carrier) params.append('carrier', filters.carrier);
      if (filters?.project_id) params.append('project_id', filters.project_id);

      const response = await fetch(`/api/shipments?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch shipments');
      }
      return response.json() as Promise<ShipmentsResponse>;
    },
  });
}

export function useShipment(id: string) {
  return useQuery({
    queryKey: ['shipments', id],
    queryFn: async () => {
      const response = await fetch(`/api/shipments/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch shipment');
      }
      const data = await response.json();
      return data.shipment as Shipment;
    },
    enabled: !!id,
  });
}

interface CreateShipmentInput {
  organization_id?: string;
  project_id?: string;
  origin: string;
  destination: string;
  carrier: string;
  tracking_number?: string;
  ship_date: string;
  expected_delivery: string;
  items_count: number;
  weight: number;
  cost: number;
  notes?: string;
}

export function useCreateShipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (shipment: CreateShipmentInput) => {
      const response = await fetch('/api/shipments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shipment),
      });
      if (!response.ok) {
        throw new Error('Failed to create shipment');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
    },
  });
}

export function useUpdateShipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Shipment> & { id: string }) => {
      const response = await fetch(`/api/shipments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) {
        throw new Error('Failed to update shipment');
      }
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
      queryClient.invalidateQueries({ queryKey: ['shipments', variables.id] });
    },
  });
}

export function useDeleteShipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/shipments/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete shipment');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
    },
  });
}
