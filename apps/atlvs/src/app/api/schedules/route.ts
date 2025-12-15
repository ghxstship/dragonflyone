export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ATLVS_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

const ATLVS_ADMIN_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

const ScheduleSchema = z.object({
  organization_id: z.string().uuid(),
  event_id: z.string().uuid().optional(),
  production_id: z.string().uuid().optional(),
  name: z.string().min(1),
  description: z.string().optional(),
  schedule_type: z.enum(['production', 'rehearsal', 'load_in', 'load_out', 'show', 'meeting', 'other']).default('production'),
  start_date: z.string(),
  end_date: z.string().optional(),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  location: z.string().optional(),
  status: z.enum(['draft', 'published', 'in_progress', 'completed', 'cancelled']).default('draft'),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organization_id');
    const eventId = searchParams.get('event_id');
    const productionId = searchParams.get('production_id');
    const status = searchParams.get('status');
    const scheduleType = searchParams.get('schedule_type');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('schedules')
      .select('*', { count: 'exact' })
      .order('start_date', { ascending: true })
      .range(offset, offset + limit - 1);

    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }
    if (eventId) {
      query = query.eq('event_id', eventId);
    }
    if (productionId) {
      query = query.eq('production_id', productionId);
    }
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    if (scheduleType && scheduleType !== 'all') {
      query = query.eq('schedule_type', scheduleType);
    }

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const schedules = data || [];
    const summary = {
      total: count || 0,
      by_status: {
        draft: schedules.filter(s => s.status === 'draft').length,
        published: schedules.filter(s => s.status === 'published').length,
        in_progress: schedules.filter(s => s.status === 'in_progress').length,
        completed: schedules.filter(s => s.status === 'completed').length,
      },
    };

    return NextResponse.json({
      schedules,
      summary,
      pagination: { limit, offset, total: count || 0 },
    });
  } catch (error: unknown) {
    return NextResponse.json({ error: 'Failed to fetch schedules' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ADMIN_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = ScheduleSchema.parse(body);

    const { data, error } = await supabase
      .from('schedules')
      .insert(validatedData)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ schedule: data }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 422 });
    }
    return NextResponse.json({ error: 'Failed to create schedule' }, { status: 500 });
  }
}
