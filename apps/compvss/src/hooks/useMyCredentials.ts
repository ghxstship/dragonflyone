'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// =============================================================================
// MY CREDENTIALS HOOKS
// Manage crew certifications and credentials
// =============================================================================

export interface Credential {
  id: string;
  name: string;
  type: string;
  issuer: string;
  issueDate: string;
  expiryDate: string;
  status: 'active' | 'expiring' | 'expired' | 'pending';
  documentUrl?: string;
}

// Fetch my credentials
export function useMyCredentials() {
  return useQuery({
    queryKey: ['my-credentials'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workforce_certifications')
        .select('*')
        .order('expires_at', { ascending: true });

      if (error) throw error;
      
      return (data || []).map(c => {
        const expiryDate = new Date(c.expires_at || '');
        const today = new Date();
        const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        let status: Credential['status'] = 'active';
        if (daysUntilExpiry < 0) status = 'expired';
        else if (daysUntilExpiry < 30) status = 'expiring';
        else if (c.status === 'pending') status = 'pending';
        
        return {
          id: c.id,
          name: c.name || '',
          type: c.certification_type || 'Certification',
          issuer: c.issuing_authority || '',
          issueDate: c.issued_at || '',
          expiryDate: c.expires_at || '',
          status,
          documentUrl: c.document_url,
        };
      }) as Credential[];
    },
  });
}
