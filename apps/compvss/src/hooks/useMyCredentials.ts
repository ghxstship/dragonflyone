'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// =============================================================================
// MY CREDENTIALS HOOKS
// Manage crew certifications and credentials
// =============================================================================

export interface MyCredentialItem {
  id: string;
  name: string;
  type: string;
  zone: string;
  valid_from: string;
  valid_until: string;
  issuer: string;
  status: 'active' | 'expiring_soon' | 'expired' | 'pending';
  documentUrl?: string;
  [key: string]: unknown;
}

export interface MyCredentialsSummary {
  total: number;
  active: number;
  expiring_soon: number;
  expired: number;
}

// Fetch my credentials with summary
export function useMyCredentials() {
  const query = useQuery({
    queryKey: ['my-credentials'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workforce_certifications')
        .select('*')
        .order('expiration_date', { ascending: true });

      if (error) throw error;
      
      const items = (data || []).map(c => {
        const expiryDate = new Date(c.expiration_date || '');
        const today = new Date();
        const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        let status: MyCredentialItem['status'] = 'active';
        if (daysUntilExpiry < 0) status = 'expired';
        else if (daysUntilExpiry < 30) status = 'expiring_soon';
        else if (!c.is_verified) status = 'pending';
        
        return {
          id: c.id,
          name: c.certification_name || '',
          type: c.certification_type || 'Certification',
          zone: 'General',
          valid_from: c.issue_date || '',
          valid_until: c.expiration_date || '',
          issuer: c.issuing_authority || '',
          status,
          documentUrl: c.document_url,
        } as MyCredentialItem;
      });

      const summary: MyCredentialsSummary = {
        total: items.length,
        active: items.filter(i => i.status === 'active').length,
        expiring_soon: items.filter(i => i.status === 'expiring_soon').length,
        expired: items.filter(i => i.status === 'expired').length,
      };

      return { items, summary };
    },
  });

  return {
    items: query.data?.items || [],
    summary: query.data?.summary,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
