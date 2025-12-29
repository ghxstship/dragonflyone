export const dynamic = 'force-dynamic';

import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const createHoldSchema = z.object({
  organization_id: z.string().uuid(),
  space_id: z.string().uuid(),
  contact_id: z.string().uuid().optional(),
  lead_id: z.string().uuid().optional(),
  hold_date: z.string(),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  priority: z.enum(['first_right', 'standard', 'low']).default('standard'),
  expires_at: z.string(),
  notes: z.string().optional(),
});

const ATLVS_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function GET(request: NextRequest) {
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { searchParams } = new URL(request.url);

    const orgId = searchParams.get('organization_id');
    const spaceId = searchParams.get('space_id');
    const status = searchParams.get('status');
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');

    if (!orgId) {
      return NextResponse.json({ error: 'organization_id required' }, { status: 400 });
    }

    let query = supabase
      .from('space_holds')
      .select(`
        *,
        space:venue_spaces(id, name),
        contact:contacts(id, first_name, last_name, email),
        lead:leads(id, first_name, last_name, email)
      `)
      .eq('organization_id', orgId)
      .order('hold_date', { ascending: true });

    if (spaceId) query = query.eq('space_id', spaceId);
    if (status) query = query.eq('status', status);
    if (dateFrom) query = query.gte('hold_date', dateFrom);
    if (dateTo) query = query.lte('hold_date', dateTo);

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ holds: data, total: count });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body = await request.json();
    const payload = createHoldSchema.parse(body);

    const { data: existingHolds } = await supabase
      .from('space_holds')
      .select('id, priority')
      .eq('space_id', payload.space_id)
      .eq('hold_date', payload.hold_date)
      .eq('status', 'active');

    if (existingHolds?.length) {
      const higherPriority = existingHolds.some(h => 
        h.priority === 'first_right' && payload.priority !== 'first_right'
      );
      if (higherPriority) {
        return NextResponse.json(
          { error: 'A first-right hold already exists for this date', existing_holds: existingHolds },
          { status: 409 }
        );
      }
    }

    const { data, error } = await supabase
      .from('space_holds')
      .insert({
        ...payload,
        status: 'active',
      })
      .select(`
        *,
        space:venue_spaces(id, name)
      `)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ hold: data }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 422 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
