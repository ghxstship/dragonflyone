'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  company?: string;
  title?: string;
  organization_id?: string;
  created_at: string;
  updated_at: string;
  // Computed/derived fields
  name?: string;
  status?: string;
  type?: string;
}

interface ContactFilters {
  company?: string;
  organization_id?: string;
}

// Fetch all contacts
export function useContacts(filters?: ContactFilters) {
  return useQuery({
    queryKey: ['contacts', filters],
    queryFn: async () => {
      let query = supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.company) {
        query = query.ilike('company', `%${filters.company}%`);
      }
      if (filters?.organization_id) {
        query = query.eq('organization_id', filters.organization_id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as Contact[];
    },
  });
}

// Fetch single contact
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
      return data as unknown as Contact;
    },
    enabled: !!id,
  });
}

// Create contact
export function useCreateContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contact: Omit<Contact, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('contacts')
        .insert(contact as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });
}

// Update contact
export function useUpdateContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Contact> & { id: string }) => {
      const { data, error } = await supabase
        .from('contacts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });
}

// Delete contact
export function useDeleteContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('contacts').delete().eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });
}
