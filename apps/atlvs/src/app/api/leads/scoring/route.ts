export const dynamic = 'force-dynamic';

import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const recalculateSchema = z.object({
  lead_id: z.string().uuid(),
  action: z.literal('recalculate'),
});

const qualifySchema = z.object({
  lead_id: z.string().uuid(),
  action: z.literal('qualify'),
  qualification_status: z.string(),
});

const scoringActionSchema = z.discriminatedUnion('action', [recalculateSchema, qualifySchema]);

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
    const qualification = searchParams.get('qualification');
    const source = searchParams.get('source');
    const minScore = searchParams.get('min_score');

    let query = supabase
      .from('leads')
      .select('*')
      .order('score', { ascending: false });

    if (qualification) {
      query = query.eq('qualification_status', qualification);
    }

    if (source) {
      query = query.eq('source', source);
    }

    if (minScore) {
      query = query.gte('score', parseInt(minScore));
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    }

    return NextResponse.json({ leads: data || [] });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
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
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = scoringActionSchema.parse(body);
    const { lead_id, action } = validatedData;

    // Get lead and scoring rules
    const { data: lead } = await supabase
      .from('leads')
      .select('*')
      .eq('id', lead_id)
      .single();

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    if (action === 'recalculate') {
      // Get active scoring rules
      const { data: rules } = await supabase
        .from('lead_scoring_rules')
        .select('*')
        .eq('is_active', true);

      // Calculate score based on rules
      let score = 0;
      const breakdown = {
        demographic: 0,
        behavioral: 0,
        engagement: 0,
        fit: 0,
      };

      // Apply rules (simplified - in production would evaluate conditions)
      rules?.forEach(rule => {
        // Add points based on category
        breakdown[rule.category as keyof typeof breakdown] += rule.points;
        score += rule.points;
      });

      // Update lead score
      const { data: updated, error: updateError } = await supabase
        .from('leads')
        .update({
          score,
          score_breakdown: breakdown,
          updated_at: new Date().toISOString(),
        })
        .eq('id', lead_id)
        .select()
        .single();

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }

      return NextResponse.json({ lead: updated });
    }

    if (action === 'qualify') {
      const { qualification_status } = validatedData;

      const { data: updated, error: updateError } = await supabase
        .from('leads')
        .update({
          qualification_status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', lead_id)
        .select()
        .single();

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }

      return NextResponse.json({ lead: updated });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
