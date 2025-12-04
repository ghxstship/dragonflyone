import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  role?: string;
  department?: string;
  organization_id?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Hook to fetch contacts for credential issuance
 */
export function useContacts(filters?: { search?: string; department?: string }) {
  return useQuery({
    queryKey: ['contacts', filters],
    queryFn: async () => {
      let query = supabase
        .from('contacts')
        .select('*')
        .order('last_name', { ascending: true });

      if (filters?.search) {
        query = query.or(
          `first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`
        );
      }

      if (filters?.department) {
        query = query.eq('department', filters.department);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Contact[];
    },
  });
}

/**
 * Hook to fetch a single contact by ID
 */
export function useContact(id: string) {
  return useQuery({
    queryKey: ['contacts', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Contact;
    },
    enabled: Boolean(id),
  });
}
