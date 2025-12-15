'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// =============================================================================
// SETTLEMENT HOOKS
// Manage post-production settlements
// =============================================================================

export interface Adjustment {
  id: string;
  description: string;
  amount: number;
  type: 'Credit' | 'Debit';
  category: string;
  approvedBy?: string;
}

export interface Settlement {
  id: string;
  projectId: string;
  projectName: string;
  eventDate: string;
  status: 'Draft' | 'Pending Review' | 'Approved' | 'Finalized';
  contractValue: number;
  actualCosts: number;
  grossProfit: number;
  marginPct: number;
  ticketRevenue?: number;
  merchRevenue?: number;
  sponsorRevenue?: number;
  artistGuarantee?: number;
  artistBackend?: number;
  venueRent?: number;
  productionCosts?: number;
  laborCosts?: number;
  otherCosts?: number;
  adjustments: Adjustment[];
  approvedBy?: string;
  approvedAt?: string;
}

// Fetch settlements
export function useSettlements() {
  return useQuery({
    queryKey: ['settlements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('settlements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return (data || []).map(s => ({
        id: s.id,
        projectId: s.project_id || s.event_id || '',
        projectName: s.project_name || s.event_name || '',
        eventDate: s.event_date || s.created_at?.split('T')[0] || '',
        status: s.status || 'Draft',
        contractValue: s.contract_value || s.total_revenue || 0,
        actualCosts: s.actual_costs || s.total_costs || 0,
        grossProfit: s.gross_profit || s.net_profit || 0,
        marginPct: s.margin_pct || s.margin_percentage || 0,
        ticketRevenue: s.ticket_revenue,
        merchRevenue: s.merch_revenue,
        sponsorRevenue: s.sponsor_revenue,
        artistGuarantee: s.artist_guarantee,
        artistBackend: s.artist_backend,
        venueRent: s.venue_rent,
        productionCosts: s.production_costs,
        laborCosts: s.labor_costs,
        otherCosts: s.other_costs,
        adjustments: s.adjustments || [],
        approvedBy: s.approved_by,
        approvedAt: s.approved_at,
      })) as Settlement[];
    },
  });
}
