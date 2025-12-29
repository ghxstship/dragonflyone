export const dynamic = 'force-dynamic';

import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const createLeadSchema = z.object({
  contact_id: z.string().uuid(),
  source: z.string().optional(),
  budget_range: z.string().optional(),
  timeline: z.string().optional(),
  decision_maker: z.union([z.boolean(), z.string()]).optional(),
  company_size: z.string().optional(),
  industry: z.string().optional(),
});

const recalculateLeadSchema = z.object({
  id: z.string().uuid(),
  action: z.literal('recalculate'),
});

const updateLeadSchema = z.object({
  id: z.string().uuid(),
  action: z.string().optional(),
  status: z.string().optional(),
  assigned_to: z.string().uuid().optional(),
  notes: z.string().optional(),
});

// Lead scoring and qualification automation
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
    const minScore = searchParams.get('min_score');

    let query = supabase.from('leads').select(`
      *, contact:contacts(id, name, email, company), assigned_to:platform_users(id, first_name, last_name)
    `);

    if (minScore) query = query.gte('score', parseInt(minScore));

    const { data, error } = await query.order('score', { ascending: false });
    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

    return NextResponse.json({
      leads: data,
      hot_leads: data?.filter(l => l.score >= 80) || [],
      warm_leads: data?.filter(l => l.score >= 50 && l.score < 80) || [],
      cold_leads: data?.filter(l => l.score < 50) || []
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 });
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
    const validatedData = createLeadSchema.parse(body);

    // Calculate lead score
    const score = calculateLeadScore({ budget_range: validatedData.budget_range, timeline: validatedData.timeline, decision_maker: validatedData.decision_maker, company_size: validatedData.company_size, industry: validatedData.industry });
    const qualification = score >= 80 ? 'hot' : score >= 50 ? 'warm' : 'cold';

    const { data, error } = await supabase.from('leads').insert({
      contact_id: validatedData.contact_id,
      source: validatedData.source,
      budget_range: validatedData.budget_range,
      timeline: validatedData.timeline,
      decision_maker: validatedData.decision_maker,
      company_size: validatedData.company_size,
      industry: validatedData.industry,
      score, qualification, status: 'new', created_by: user.id
    }).select().single();

    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    return NextResponse.json({ lead: data, score, qualification }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 });
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
    
    if (body.action === 'recalculate') {
      const validatedData = recalculateLeadSchema.parse(body);
      const { id } = validatedData;
      const { data: lead } = await supabase.from('leads').select('*').eq('id', id).single();
      if (lead) {
        const newScore = calculateLeadScore(lead);
        await supabase.from('leads').update({
          score: newScore, qualification: newScore >= 80 ? 'hot' : newScore >= 50 ? 'warm' : 'cold'
        }).eq('id', id);
      }
      return NextResponse.json({ success: true });
    }

    const validatedData = updateLeadSchema.parse(body);
    const { id, ...updateData } = validatedData;
    const { error } = await supabase.from('leads').update(updateData).eq('id', id);
    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

interface LeadData { budget_range?: string; timeline?: string; decision_maker?: boolean | string; company_size?: string; industry?: string }
function calculateLeadScore(data: LeadData): number {
  let score = 0;

  // Budget scoring (0-30 points)
  if (data.budget_range === 'over_100k') score += 30;
  else if (data.budget_range === '50k_100k') score += 25;
  else if (data.budget_range === '25k_50k') score += 15;
  else if (data.budget_range === 'under_25k') score += 5;

  // Timeline scoring (0-25 points)
  if (data.timeline === 'immediate') score += 25;
  else if (data.timeline === '1_3_months') score += 20;
  else if (data.timeline === '3_6_months') score += 10;
  else if (data.timeline === '6_plus_months') score += 5;

  // Decision maker (0-20 points)
  if (data.decision_maker === true) score += 20;
  else if (data.decision_maker === 'influencer') score += 10;

  // Company size (0-15 points)
  if (data.company_size === 'enterprise') score += 15;
  else if (data.company_size === 'mid_market') score += 12;
  else if (data.company_size === 'small_business') score += 8;

  // Industry fit (0-10 points)
  const targetIndustries = ['entertainment', 'events', 'hospitality', 'media'];
  if (targetIndustries.includes(data.industry)) score += 10;

  return Math.min(score, 100);
}
