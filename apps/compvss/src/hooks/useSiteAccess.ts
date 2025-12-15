'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// =============================================================================
// SITE ACCESS HOOKS
// Manage access points and vehicle passes
// =============================================================================

export interface AccessPoint {
  id: string;
  name: string;
  type: 'Gate' | 'Loading Dock' | 'Parking' | 'Entrance';
  status: 'Open' | 'Restricted' | 'Closed';
  currentVehicles?: number;
  maxCapacity?: number;
  production_id?: string;
}

export interface VehiclePass {
  id: string;
  vehicleType: 'Truck' | 'Van' | 'Car' | 'Bus';
  licensePlate: string;
  company: string;
  driver: string;
  accessPoints: string[];
  validFrom: string;
  validUntil: string;
  status: 'Active' | 'Pending' | 'Expired';
  production_id?: string;
}

// Fetch access points
export function useAccessPoints(productionId?: string) {
  return useQuery({
    queryKey: ['access-points', productionId],
    queryFn: async () => {
      let query = supabase
        .from('access_points')
        .select('*')
        .order('name', { ascending: true });

      if (productionId) {
        query = query.eq('production_id', productionId);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      return (data || []).map(p => ({
        id: p.id,
        name: p.name,
        type: p.type,
        status: p.status,
        currentVehicles: p.current_vehicles,
        maxCapacity: p.max_capacity,
        production_id: p.production_id,
      })) as AccessPoint[];
    },
  });
}

// Fetch vehicle passes
export function useVehiclePasses(productionId?: string) {
  return useQuery({
    queryKey: ['vehicle-passes', productionId],
    queryFn: async () => {
      let query = supabase
        .from('vehicle_passes')
        .select('*')
        .order('valid_from', { ascending: true });

      if (productionId) {
        query = query.eq('production_id', productionId);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      return (data || []).map(p => ({
        id: p.id,
        vehicleType: p.vehicle_type,
        licensePlate: p.license_plate,
        company: p.company,
        driver: p.driver,
        accessPoints: p.access_points || [],
        validFrom: p.valid_from,
        validUntil: p.valid_until,
        status: p.status,
        production_id: p.production_id,
      })) as VehiclePass[];
    },
  });
}

// Issue vehicle pass
export function useIssueVehiclePass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (pass: Omit<VehiclePass, 'id'>) => {
      const { data, error } = await supabase
        .from('vehicle_passes')
        .insert({
          vehicle_type: pass.vehicleType,
          license_plate: pass.licensePlate,
          company: pass.company,
          driver: pass.driver,
          access_points: pass.accessPoints,
          valid_from: pass.validFrom,
          valid_until: pass.validUntil,
          status: pass.status,
          production_id: pass.production_id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-passes'] });
    },
  });
}

// Update access point status
export function useUpdateAccessPointStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: AccessPoint['status'] }) => {
      const { data, error } = await supabase
        .from('access_points')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['access-points'] });
    },
  });
}
