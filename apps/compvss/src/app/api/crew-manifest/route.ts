export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { logger, withAuth, PlatformRole } from '@ghxstship/config';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const COMPVSS_ADMIN_ROLES = [
  PlatformRole.COMPVSS_ADMIN,
  PlatformRole.COMPVSS_TEAM_MEMBER,
  PlatformRole.LEGEND_SUPER_ADMIN,
  PlatformRole.LEGEND_ADMIN,
];

const manifestEntrySchema = z.object({
  event_id: z.string().uuid(),
  crew_member_id: z.string().uuid(),
  role_id: z.string().uuid().optional(),
  department_id: z.string().uuid().optional(),
  shift_start: z.string().datetime(),
  shift_end: z.string().datetime(),
  check_in_location: z.string().optional(),
  notes: z.string().optional(),
});

// GET /api/crew-manifest - List crew manifest entries
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    
    const eventId = searchParams.get('event_id');
    const departmentId = searchParams.get('department_id');
    const date = searchParams.get('date');
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 500);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Query crew_members with event assignments
    let query = supabase
      .from('crew_members')
      .select(`
        *,
        role:crew_roles(id, name, description),
        department:departments(id, name),
        skills:crew_member_skills(
          skill:skills(id, name, category)
        ),
        certifications:crew_member_certifications(
          certification:certifications(id, name, issuing_authority, expiry_date)
        )
      `, { count: 'exact' })
      .eq('status', 'active')
      .order('last_name', { ascending: true })
      .range(offset, offset + limit - 1);

    if (departmentId) {
      query = query.eq('department_id', departmentId);
    }

    const { data, error, count } = await query;

    if (error) {
      if (error.message?.includes('does not exist') || error.code === '42P01') {
        return NextResponse.json({ 
          manifest: [], 
          total: 0, 
          limit, 
          offset,
          summary: { total_crew: 0, by_department: {}, by_role: {} }
        });
      }
      logger.error('Error fetching crew manifest:', error);
      return NextResponse.json({ error: 'Failed to fetch crew manifest' }, { status: 500 });
    }

    const manifest = data || [];
    
    // Build summary
    const summary = {
      total_crew: count || 0,
      by_department: manifest.reduce((acc, m) => {
        const dept = (m.department as { name?: string } | null)?.name || 'Unassigned';
        acc[dept] = (acc[dept] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      by_role: manifest.reduce((acc, m) => {
        const role = (m.role as { name?: string } | null)?.name || 'Unassigned';
        acc[role] = (acc[role] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      active_certifications: manifest.filter(m => 
        Array.isArray(m.certifications) && m.certifications.length > 0
      ).length,
    };

    return NextResponse.json({ manifest, total: count, limit, offset, summary, event_id: eventId, date });
  } catch (error) {
    logger.error('Error in GET /api/crew-manifest:', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/crew-manifest - Add crew member to manifest
export async function POST(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ADMIN_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const supabase = getSupabaseClient();
    const body = await request.json();
    const validated = manifestEntrySchema.parse(body);

    // For now, update the crew member's assignment
    const { data: entry, error } = await supabase
      .from('crew_members')
      .update({
        department_id: validated.department_id,
        role_id: validated.role_id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', validated.crew_member_id)
      .select(`
        *,
        role:crew_roles(id, name),
        department:departments(id, name)
      `)
      .single();

    if (error) {
      logger.error('Error adding to crew manifest:', error);
      return NextResponse.json({ error: 'Failed to add to manifest', details: error.message }, { status: 500 });
    }

    return NextResponse.json({ entry, event_id: validated.event_id }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    logger.error('Error in POST /api/crew-manifest:', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/crew-manifest - Update manifest entry
export async function PATCH(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ADMIN_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = getSupabaseClient();
    const body = await request.json();
    const { crew_member_id, action, updates } = body;

    if (!crew_member_id) {
      return NextResponse.json({ error: 'crew_member_id is required' }, { status: 400 });
    }

    if (action === 'check_in') {
      const { data, error } = await supabase
        .from('crew_members')
        .update({
          metadata: { checked_in_at: new Date().toISOString(), check_in_location: body.location },
          updated_at: new Date().toISOString(),
        })
        .eq('id', crew_member_id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: 'Failed to check in' }, { status: 500 });
      }

      return NextResponse.json({ success: true, entry: data, message: 'Crew member checked in' });
    }

    if (updates) {
      const { data, error } = await supabase
        .from('crew_members')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', crew_member_id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
      }

      return NextResponse.json({ success: true, entry: data });
    }

    return NextResponse.json({ error: 'No action specified' }, { status: 400 });
  } catch (error) {
    logger.error('Error in PATCH /api/crew-manifest:', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/crew-manifest - Remove from manifest
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ADMIN_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const crewMemberId = searchParams.get('crew_member_id');

    if (!crewMemberId) {
      return NextResponse.json({ error: 'crew_member_id required' }, { status: 400 });
    }

    // Set crew member to inactive for the event
    const { error } = await supabase
      .from('crew_members')
      .update({ status: 'inactive', updated_at: new Date().toISOString() })
      .eq('id', crewMemberId);

    if (error) {
      return NextResponse.json({ error: 'Failed to remove from manifest' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Removed from manifest' });
  } catch (error) {
    logger.error('Error in DELETE /api/crew-manifest:', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
