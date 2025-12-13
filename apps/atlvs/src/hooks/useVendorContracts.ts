'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface VendorContract {
  id: string;
  vendor_id: string;
  vendor_name?: string;
  contract_type: string;
  category: string;
  value: number;
  start_date: string;
  expiry_date: string;
  status: 'active' | 'expiring' | 'expired' | 'draft';
  auto_renew: boolean;
  days_until_expiry: number;
  terms?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface VendorContractFilters {
  vendor_id?: string;
  category?: string;
  status?: string;
}

export function useVendorContracts(filters?: VendorContractFilters) {
  return useQuery({
    queryKey: ['vendor-contracts', filters],
    queryFn: async () => {
      let query = supabase
        .from('vendor_contracts')
        .select(`
          *,
          vendors(name)
        `)
        .order('expiry_date', { ascending: true });

      if (filters?.vendor_id) {
        query = query.eq('vendor_id', filters.vendor_id);
      }
      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;
      if (error) throw error;

      const now = new Date();
      return (data || []).map((c: Record<string, unknown>) => {
        const expiryDate = new Date(c.expiry_date as string);
        const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        let status = c.status as string;
        if (daysUntilExpiry < 0) {
          status = 'expired';
        } else if (daysUntilExpiry <= 30) {
          status = 'expiring';
        }

        return {
          ...c,
          vendor_name: (c.vendors as { name: string } | null)?.name || 'Unknown Vendor',
          days_until_expiry: daysUntilExpiry,
          status,
        };
      }) as VendorContract[];
    },
  });
}

export function useVendorContract(id: string) {
  return useQuery({
    queryKey: ['vendor-contracts', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendor_contracts')
        .select(`
          *,
          vendors(name)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      
      const now = new Date();
      const expiryDate = new Date(data.expiry_date);
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      return {
        ...data,
        vendor_name: data.vendors?.name || 'Unknown Vendor',
        days_until_expiry: daysUntilExpiry,
      } as VendorContract;
    },
    enabled: !!id,
  });
}

export function useCreateVendorContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contract: Omit<VendorContract, 'id' | 'created_at' | 'updated_at' | 'days_until_expiry'>) => {
      const { data, error } = await supabase
        .from('vendor_contracts')
        .insert(contract)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-contracts'] });
    },
  });
}

export function useUpdateVendorContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<VendorContract> & { id: string }) => {
      const { data, error } = await supabase
        .from('vendor_contracts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-contracts'] });
    },
  });
}

export function useDeleteVendorContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('vendor_contracts')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-contracts'] });
    },
  });
}
