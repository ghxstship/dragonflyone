export const dynamic = 'force-dynamic';

import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const createOpportunitySchema = z.object({
  contact_id: z.string().uuid().optional(),
  name: z.string().min(1),
  value: z.number().min(0),
  stage: z.enum(['lead', 'qualification', 'needs_analysis', 'proposal', 'negotiation', 'closed_won', 'closed_lost']).optional(),
  probability: z.number().min(0).max(100).optional(),
  expected_close_date: z.string().optional(),
  source: z.string().optional(),
  notes: z.string().optional(),
});

const updateOpportunitySchema = z.object({
  id: z.string().uuid(),
  stage: z.enum(['lead', 'qualification', 'needs_analysis', 'proposal', 'negotiation', 'closed_won', 'closed_lost']).optional(),
  probability: z.number().min(0).max(100).optional(),
  value: z.number().min(0).optional(),
  expected_close_date: z.string().optional(),
  notes: z.string().optional(),
});

// Opportunity tracking with probability weighting
const ATLVS_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const stage = searchParams.get('stage');
    const ownerId = searchParams.get('owner_id');

    let query = supabase.from('deals').select(`
      *, contact:contacts(id, name, company), owner:platform_users(id, first_name, last_name)
    `);

    if (stage) query = query.eq('stage', stage);
    if (ownerId) query = query.eq('owner_id', ownerId);

    const { data, error } = await query.order('expected_close_date', { ascending: true });
    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

    // Calculate weighted pipeline
    const weightedTotal = data?.reduce((sum, opp) => sum + (opp.value * (opp.probability / 100)), 0) || 0;
    const totalValue = data?.reduce((sum, opp) => sum + opp.value, 0) || 0;

    // Group by stage
    interface StageData { count: number; value: number; weighted: number }
    const byStage = data?.reduce((acc: Record<string, StageData>, opp) => {
      if (!acc[opp.stage]) acc[opp.stage] = { count: 0, value: 0, weighted: 0 };
      acc[opp.stage].count++;
      acc[opp.stage].value += opp.value;
      acc[opp.stage].weighted += opp.value * (opp.probability / 100);
      return acc;
    }, {} as Record<string, StageData>) || {};

    return NextResponse.json({
      opportunities: data,
      pipeline: {
        total_value: totalValue,
        weighted_value: Math.round(weightedTotal),
        by_stage: byStage,
        count: data?.length || 0
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch opportunities' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const validatedData = createOpportunitySchema.parse(body);
    const { contact_id, name, value, stage, probability, expected_close_date, source, notes } = validatedData;

    const { data, error } = await supabase.from('deals').insert({
      contact_id, name, value, stage: stage || 'qualification',
      probability: probability || getStageProbability(stage || 'qualification'),
      expected_close_date, source, notes, owner_id: user.id
    }).select().single();

    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    return NextResponse.json({ opportunity: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create opportunity' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = updateOpportunitySchema.parse(body);
    const { id, stage, probability, ...updateData } = validatedData;

    // Auto-update probability based on stage if not manually set
    const newProbability = probability || (stage ? getStageProbability(stage) : undefined);

    const { error } = await supabase.from('deals').update({
      ...updateData,
      stage,
      probability: newProbability,
      updated_at: new Date().toISOString()
    }).eq('id', id);

    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

function getStageProbability(stage: string): number {
  const probabilities: Record<string, number> = {
    'lead': 10,
    'qualification': 20,
    'needs_analysis': 40,
    'proposal': 60,
    'negotiation': 80,
    'closed_won': 100,
    'closed_lost': 0
  };
  return probabilities[stage] || 20;
}
