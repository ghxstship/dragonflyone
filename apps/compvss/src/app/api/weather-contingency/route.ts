export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase, withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const createContingencyPlanSchema = z.object({
  event_type: z.string().min(1),
  title: z.string().min(1),
  weather_conditions: z.array(z.string()).optional(),
  decision_timeline: z.string().optional(),
  communication_plan: z.string().optional(),
  triggers: z.array(z.object({
    condition: z.string(),
    threshold: z.string().optional(),
    action: z.string(),
  })).optional(),
});

// Weather contingency planning guides
const COMPVSS_ROLES = [
  PlatformRole.COMPVSS_ADMIN, PlatformRole.COMPVSS_TEAM_MEMBER, PlatformRole.COMPVSS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const eventType = searchParams.get('event_type');
    const weatherCondition = searchParams.get('condition');

    let query = supabase.from('weather_contingency_plans').select(`
      *, triggers:contingency_triggers(id, condition, threshold, action)
    `);

    if (eventType) query = query.eq('event_type', eventType);
    if (weatherCondition) query = query.contains('weather_conditions', [weatherCondition]);

    const { data, error } = await query.order('event_type', { ascending: true });
    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

    return NextResponse.json({ plans: data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const validatedData = createContingencyPlanSchema.parse(body);
    const { event_type, title, weather_conditions, decision_timeline, communication_plan, triggers } = validatedData;

    const { data, error } = await supabase.from('weather_contingency_plans').insert({
      event_type, title, weather_conditions: weather_conditions || [],
      decision_timeline, communication_plan, created_by: user.id
    }).select().single();

    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

    if (triggers?.length) {
      await supabase.from('contingency_triggers').insert(
        triggers.map((t: Record<string, unknown>) => ({
          plan_id: data.id, condition: t.condition,
          threshold: t.threshold, action: t.action
        }))
      );
    }

    return NextResponse.json({ plan: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}
