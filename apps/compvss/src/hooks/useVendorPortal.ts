'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// =============================================================================
// VENDOR PORTAL HOOKS
// Manage vendor portal data
// =============================================================================

export interface VendorData {
  companyName: string;
  activeContracts: number;
  pendingDeliveries: number;
  pendingInvoices: number;
  totalRevenue: number;
}

export interface VendorDelivery {
  id: string;
  production: string;
  date: string;
  items: string;
  status: 'confirmed' | 'pending';
}

export interface VendorInvoice {
  id: string;
  production: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
}

// Fetch vendor data
export function useVendorData() {
  return useQuery({
    queryKey: ['vendor-data'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendor_profiles')
        .select('*')
        .single();

      if (error) throw error;
      
      return {
        companyName: data?.company_name || 'Vendor',
        activeContracts: data?.active_contracts_count || 0,
        pendingDeliveries: data?.pending_deliveries_count || 0,
        pendingInvoices: data?.pending_invoices_count || 0,
        totalRevenue: data?.total_revenue || 0,
      } as VendorData;
    },
  });
}

// Fetch vendor deliveries
export function useVendorDeliveries() {
  return useQuery({
    queryKey: ['vendor-deliveries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendor_deliveries')
        .select('*')
        .gte('date', new Date().toISOString())
        .order('date', { ascending: true })
        .limit(5);

      if (error) throw error;
      
      return (data || []).map(d => ({
        id: d.id,
        production: d.production_name,
        date: d.date,
        items: d.items_description,
        status: d.status,
      })) as VendorDelivery[];
    },
  });
}

// Fetch vendor invoices
export function useVendorInvoices() {
  return useQuery({
    queryKey: ['vendor-invoices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendor_invoices')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      
      return (data || []).map(i => ({
        id: i.invoice_number || i.id,
        production: i.production_name,
        amount: i.amount,
        status: i.status,
      })) as VendorInvoice[];
    },
  });
}
