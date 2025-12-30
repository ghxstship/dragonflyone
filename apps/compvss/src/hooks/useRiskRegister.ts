'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// =============================================================================
// RISK REGISTER HOOKS
// Manage project risks and mitigation strategies
// =============================================================================

export interface Risk {
  id: string;
  title: string;
  description: string;
  category: 'Technical' | 'Weather' | 'Vendor' | 'Safety' | 'Financial' | 'Operational' | 'Regulatory';
  probability: 'Low' | 'Medium' | 'High';
  impact: 'Low' | 'Medium' | 'High' | 'Critical';
  riskScore: number;
  status: 'Identified' | 'Mitigating' | 'Monitoring' | 'Closed';
  owner: string;
  projectId: string;
  projectName: string;
  mitigationPlan?: string;
  contingencyPlan?: string;
  triggers?: string[];
  identifiedDate: string;
  reviewDate?: string;
}

// Fetch risks
export function useRisks() {
  return useQuery({
    queryKey: ['risks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('risk_score', { ascending: false });

      if (error) throw error;
      
      return (data || []).map(r => ({
        id: r.id,
        title: r.title,
        description: r.description,
        category: r.category,
        probability: r.probability,
        impact: r.impact,
        riskScore: r.risk_score || 0,
        status: r.status,
        owner: r.owner,
        projectId: r.project_id,
        projectName: r.project_name,
        mitigationPlan: r.mitigation_plan,
        contingencyPlan: r.contingency_plan,
        triggers: r.triggers || [],
        identifiedDate: r.identified_date || r.created_at?.split('T')[0],
        reviewDate: r.review_date,
      })) as Risk[];
    },
  });
}

// Create risk
export function useCreateRisk() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (risk: Omit<Risk, 'id' | 'riskScore'>) => {
      // Calculate risk score based on probability and impact
      const probScores = { Low: 1, Medium: 2, High: 3 };
      const impactScores = { Low: 1, Medium: 2, High: 3, Critical: 4 };
      const riskScore = probScores[risk.probability] * impactScores[risk.impact];

      const { data, error } = await supabase
        .from('projects')
        .insert({
          title: risk.title,
          description: risk.description,
          category: risk.category,
          probability: risk.probability,
          impact: risk.impact,
          risk_score: riskScore,
          status: risk.status,
          owner: risk.owner,
          project_id: risk.projectId,
          project_name: risk.projectName,
          mitigation_plan: risk.mitigationPlan,
          contingency_plan: risk.contingencyPlan,
          triggers: risk.triggers,
          identified_date: risk.identifiedDate,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['risks'] });
    },
  });
}

// Update risk status
export function useUpdateRiskStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Risk['status'] }) => {
      const { data, error } = await supabase
        .from('projects')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['risks'] });
    },
  });
}
