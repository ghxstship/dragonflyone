'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// =============================================================================
// CREDENTIALS HOOKS
// Manage credentials and zone access for productions
// Event-level roles: Operations Director, Security Lead, Guest Services Manager
// =============================================================================

export interface CredentialType {
  id: string;
  production_id: string;
  organization_id: string;
  name: string;
  code: string;
  description?: string;
  access_level: number;
  color: string;
  icon?: string;
  max_issued?: number;
  requires_photo: boolean;
  requires_background_check: boolean;
  valid_from?: string;
  valid_until?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Credential {
  id: string;
  production_id: string;
  credential_type_id: string;
  contact_id: string;
  badge_number: string;
  status: 'pending' | 'active' | 'suspended' | 'revoked' | 'expired';
  issued_at?: string;
  issued_by?: string;
  expires_at?: string;
  revoked_at?: string;
  revoked_by?: string;
  revoke_reason?: string;
  photo_url?: string;
  qr_code?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  credential_type?: CredentialType;
  contact?: { id: string; first_name: string; last_name: string; email: string; phone?: string };
}

export interface Zone {
  id: string;
  production_id: string;
  venue_id?: string;
  name: string;
  code: string;
  zone_type: 'public' | 'vip' | 'backstage' | 'production' | 'operations' | 'restricted' | 'emergency';
  description?: string;
  capacity?: number;
  access_level: number;
  parent_zone_id?: string;
  color?: string;
  coordinates?: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CredentialZoneAccess {
  id: string;
  credential_type_id: string;
  zone_id: string;
  access_type: 'full' | 'escorted' | 'time_limited' | 'denied';
  time_restrictions?: Record<string, unknown>;
  created_at: string;
}

interface CredentialFilters {
  productionId?: string;
  credentialTypeId?: string;
  status?: string;
  contactId?: string;
}

// Fetch credential types for a production
export function useCredentialTypes(productionId?: string) {
  return useQuery({
    queryKey: ['credential_types', productionId],
    queryFn: async () => {
      let query = supabase
        .from('workforce_certifications')
        .select('*')
        .order('access_level', { ascending: false });

      if (productionId) {
        query = query.eq('production_id', productionId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as CredentialType[];
    },
  });
}

// Fetch single credential type
export function useCredentialType(id: string) {
  return useQuery({
    queryKey: ['credential_types', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workforce_certifications')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as unknown as CredentialType;
    },
    enabled: !!id,
  });
}

// Fetch all credentials
export function useCredentials(filters?: CredentialFilters) {
  return useQuery({
    queryKey: ['credentials', filters],
    queryFn: async () => {
      let query = supabase
        .from('workforce_certifications')
        .select(`
          *,
          credential_type:credential_types(*),
          contact:contacts(id, first_name, last_name, email, phone)
        `)
        .order('created_at', { ascending: false });

      if (filters?.productionId) {
        query = query.eq('production_id', filters.productionId);
      }
      if (filters?.credentialTypeId) {
        query = query.eq('credential_type_id', filters.credentialTypeId);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.contactId) {
        query = query.eq('contact_id', filters.contactId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as Credential[];
    },
  });
}

// Fetch single credential
export function useCredential(id: string) {
  return useQuery({
    queryKey: ['credentials', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workforce_certifications')
        .select(`
          *,
          credential_type:credential_types(*),
          contact:contacts(id, first_name, last_name, email, phone)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as unknown as Credential;
    },
    enabled: !!id,
  });
}

// Fetch zones for a production
export function useZones(productionId?: string) {
  return useQuery({
    queryKey: ['zones', productionId],
    queryFn: async () => {
      let query = supabase
        .from('legend_places')
        .select('*')
        .order('access_level', { ascending: false });

      if (productionId) {
        query = query.eq('production_id', productionId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as Zone[];
    },
  });
}

// Fetch zone access matrix for a credential type
export function useCredentialZoneAccess(credentialTypeId: string) {
  return useQuery({
    queryKey: ['credential_zone_access', credentialTypeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workforce_certifications')
        .select(`
          *,
          zone:zones(*)
        `)
        .eq('credential_type_id', credentialTypeId);

      if (error) throw error;
      return data as unknown as (CredentialZoneAccess & { zone: Zone })[];
    },
    enabled: !!credentialTypeId,
  });
}

// Create credential type
export function useCreateCredentialType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentialType: Omit<CredentialType, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('workforce_certifications')
        .insert(credentialType)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credential_types'] });
    },
  });
}

// Update credential type
export function useUpdateCredentialType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CredentialType> & { id: string }) => {
      const { data, error } = await supabase
        .from('workforce_certifications')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credential_types'] });
    },
  });
}

// Issue credential
export function useIssueCredential() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credential: Omit<Credential, 'id' | 'created_at' | 'updated_at' | 'credential_type' | 'contact'>) => {
      const { data, error } = await supabase
        .from('workforce_certifications')
        .insert({
          ...credential,
          status: 'active',
          issued_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credentials'] });
    },
  });
}

// Revoke credential
export function useRevokeCredential() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reason, revokedBy }: { id: string; reason: string; revokedBy: string }) => {
      const { data, error } = await supabase
        .from('workforce_certifications')
        .update({
          status: 'revoked',
          revoked_at: new Date().toISOString(),
          revoked_by: revokedBy,
          revoke_reason: reason,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credentials'] });
    },
  });
}

// Suspend credential
export function useSuspendCredential() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const { data, error } = await supabase
        .from('workforce_certifications')
        .update({
          status: 'suspended',
          notes: reason,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credentials'] });
    },
  });
}

// Reactivate credential
export function useReactivateCredential() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('workforce_certifications')
        .update({ status: 'active' })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credentials'] });
    },
  });
}

// Verify credential by badge number or QR
export function useVerifyCredential() {
  return useMutation({
    mutationFn: async ({ badgeNumber, zoneId }: { badgeNumber: string; zoneId?: string }) => {
      // First find the credential
      const { data: credential, error: credError } = await supabase
        .from('workforce_certifications')
        .select(`
          *,
          credential_type:credential_types(*),
          contact:contacts(id, first_name, last_name, email, phone)
        `)
        .eq('badge_number', badgeNumber)
        .single();

      if (credError) throw new Error('Credential not found');
      
      // Check if active
      if (credential.status !== 'active') {
        return { valid: false, reason: `Credential is ${credential.status}`, credential };
      }

      // Check expiration
      if (credential.expires_at && new Date(credential.expires_at) < new Date()) {
        return { valid: false, reason: 'Credential has expired', credential };
      }

      // If zone specified, check zone access
      if (zoneId) {
        const { data: access } = await supabase
          .from('workforce_certifications')
          .select('access_type')
          .eq('credential_type_id', credential.credential_type_id)
          .eq('zone_id', zoneId)
          .single();

        if (!access || access.access_type === 'denied') {
          return { valid: false, reason: 'No access to this zone', credential };
        }

        return { valid: true, accessType: access.access_type, credential };
      }

      return { valid: true, credential };
    },
  });
}

// Create zone
export function useCreateZone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (zone: Omit<Zone, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('legend_places')
        .insert(zone)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zones'] });
    },
  });
}

// Update zone access for credential type
export function useUpdateZoneAccess() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      credentialTypeId, 
      zoneAccess 
    }: { 
      credentialTypeId: string; 
      zoneAccess: { zone_id: string; access_type: string }[] 
    }) => {
      // Delete existing access
      await supabase
        .from('workforce_certifications')
        .delete()
        .eq('credential_type_id', credentialTypeId);

      // Insert new access
      if (zoneAccess.length > 0) {
        const { error } = await supabase
          .from('workforce_certifications')
          .insert(zoneAccess.map(za => ({
            credential_type_id: credentialTypeId,
            zone_id: za.zone_id,
            access_type: za.access_type,
          })));

        if (error) throw error;
      }

      return { credentialTypeId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['credential_zone_access', data.credentialTypeId] });
    },
  });
}

// Get credential statistics
export function useCredentialStats(productionId?: string) {
  return useQuery({
    queryKey: ['credentials', 'stats', productionId],
    queryFn: async () => {
      let query = supabase.from('workforce_certifications').select('status, credential_type_id');
      
      if (productionId) {
        query = query.eq('production_id', productionId);
      }

      const { data, error } = await query;
      if (error) throw error;

      const credentials = data || [];
      return {
        total: credentials.length,
        active: credentials.filter(c => c.status === 'active').length,
        pending: credentials.filter(c => c.status === 'pending').length,
        suspended: credentials.filter(c => c.status === 'suspended').length,
        revoked: credentials.filter(c => c.status === 'revoked').length,
        expired: credentials.filter(c => c.status === 'expired').length,
      };
    },
  });
}

// Log credential scan
export function useLogCredentialScan() {
  return useMutation({
    mutationFn: async ({ 
      credentialId, 
      zoneId, 
      scanType, 
      result 
    }: { 
      credentialId: string; 
      zoneId: string; 
      scanType: 'entry' | 'exit' | 'verify';
      result: 'granted' | 'denied';
    }) => {
      const { data, error } = await supabase
        .from('audit_logs')
        .insert({
          credential_id: credentialId,
          zone_id: zoneId,
          scan_type: scanType,
          result,
          scanned_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
  });
}
