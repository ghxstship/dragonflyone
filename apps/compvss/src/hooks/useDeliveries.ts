'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// =============================================================================
// DELIVERIES HOOKS
// Manage delivery tracking and receiving
// =============================================================================

export interface DeliveryItem {
  name: string;
  quantity: number;
  received?: number;
}

export interface Delivery {
  id: string;
  vendor: string;
  description: string;
  scheduledDate: string;
  scheduledTime: string;
  accessPoint: string;
  projectId?: string;
  status: 'Scheduled' | 'In Transit' | 'Arrived' | 'Received' | 'Delayed';
  items: DeliveryItem[];
  carrier?: string;
  trackingNumber?: string;
  receivedBy?: string;
  receivedAt?: string;
  created_at?: string;
  updated_at?: string;
}

// Fetch all deliveries
export function useDeliveries(projectId?: string) {
  return useQuery({
    queryKey: ['deliveries', projectId],
    queryFn: async () => {
      let query = supabase
        .from('deliveries')
        .select('*')
        .order('scheduled_date', { ascending: true });

      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      return (data || []).map(d => ({
        id: d.id,
        vendor: d.vendor,
        description: d.description,
        scheduledDate: d.scheduled_date,
        scheduledTime: d.scheduled_time,
        accessPoint: d.access_point,
        projectId: d.project_id,
        status: d.status,
        items: d.items || [],
        carrier: d.carrier,
        trackingNumber: d.tracking_number,
        receivedBy: d.received_by,
        receivedAt: d.received_at,
        created_at: d.created_at,
        updated_at: d.updated_at,
      })) as Delivery[];
    },
  });
}

// Create delivery
export function useCreateDelivery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (delivery: Omit<Delivery, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('deliveries')
        .insert({
          vendor: delivery.vendor,
          description: delivery.description,
          scheduled_date: delivery.scheduledDate,
          scheduled_time: delivery.scheduledTime,
          access_point: delivery.accessPoint,
          project_id: delivery.projectId,
          status: delivery.status,
          items: delivery.items,
          carrier: delivery.carrier,
          tracking_number: delivery.trackingNumber,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliveries'] });
    },
  });
}

// Update delivery
export function useUpdateDelivery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Delivery> & { id: string }) => {
      const dbUpdates: Record<string, unknown> = {};
      if (updates.vendor) dbUpdates.vendor = updates.vendor;
      if (updates.description) dbUpdates.description = updates.description;
      if (updates.scheduledDate) dbUpdates.scheduled_date = updates.scheduledDate;
      if (updates.scheduledTime) dbUpdates.scheduled_time = updates.scheduledTime;
      if (updates.accessPoint) dbUpdates.access_point = updates.accessPoint;
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.items) dbUpdates.items = updates.items;
      if (updates.carrier) dbUpdates.carrier = updates.carrier;
      if (updates.trackingNumber) dbUpdates.tracking_number = updates.trackingNumber;
      if (updates.receivedBy) dbUpdates.received_by = updates.receivedBy;
      if (updates.receivedAt) dbUpdates.received_at = updates.receivedAt;

      const { data, error } = await supabase
        .from('deliveries')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliveries'] });
    },
  });
}

// Delete delivery
export function useDeleteDelivery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('deliveries').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliveries'] });
    },
  });
}
