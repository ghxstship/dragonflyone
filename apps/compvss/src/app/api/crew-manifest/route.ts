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

// Schema for crew manifest entries - uses 3NF crew_manifest table from 0052 migration
const manifestEntrySchema = z.object({
  organization_id: z.string().uuid(),
  event_id: z.string().uuid(),
  person_id: z.string().uuid(),
  role: z.string().min(1),
  department: z.string().optional(),
  position_title: z.string().optional(),
  call_time: z.string().datetime(),
  end_time: z.string().datetime().optional(),
  work_area: z.string().optional(),
  rate_type: z.enum(['hourly', 'daily', 'flat', 'overtime']).default('hourly'),
  rate_amount: z.number().min(0).optional(),
  notes: z.string().optional(),
});

// GET /api/crew-manifest - List crew manifest entries from crew_manifest (3NF table)
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    
    const eventId = searchParams.get('event_id');
    const department = searchParams.get('department');
    const status = searchParams.get('status');
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 500);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Query crew_manifest - the 3NF table for crew assignments
    let query = supabase
      .from('crew_manifest')
      .select(`
        *,
        person:legend_people!person_id(id, display_name, avatar_url, email, phone),
        event:legend_events!event_id(id, name, start_datetime),
        supervisor:legend_people!reporting_to(id, display_name)
      `, { count: 'exact' })
      .order('call_time', { ascending: true })
      .range(offset, offset + limit - 1);

    if (eventId) {
      query = query.eq('event_id', eventId);
    }
    if (department) {
      query = query.eq('department', department);
    }
    if (status) {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query;

    if (error) {
      logger.error('Error fetching crew manifest:', error);
      return NextResponse.json({ 
        manifest: [], 
        total: 0, 
        limit, 
        offset,
        summary: { total_crew: 0, by_department: {}, by_role: {}, by_status: {} }
      });
    }

    const manifest = data || [];
    
    // Build summary
    const summary = {
      total_crew: count || 0,
      by_department: manifest.reduce((acc, m) => {
        const dept = m.department || 'Unassigned';
        acc[dept] = (acc[dept] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      by_role: manifest.reduce((acc, m) => {
        const role = m.role || 'Unassigned';
        acc[role] = (acc[role] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      by_status: manifest.reduce((acc, m) => {
        const st = m.status || 'scheduled';
        acc[st] = (acc[st] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      checked_in: manifest.filter(m => m.status === 'checked_in').length,
    };

    return NextResponse.json({ manifest, total: count, limit, offset, summary, event_id: eventId });
  } catch (error) {
    logger.error('Error in GET /api/crew-manifest:', error instanceof Error ? error : undefined);
    return NextResponse.json({ 
      manifest: [], 
      total: 0, 
      limit: 100, 
      offset: 0,
      summary: { total_crew: 0, by_department: {}, by_role: {}, by_status: {} }
    });
  }
}

// POST /api/crew-manifest - Add crew member to manifest using crew_manifest (3NF table)
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

    // Insert into crew_manifest (3NF table)
    const { data: entry, error } = await supabase
      .from('crew_manifest')
      .insert({
        organization_id: validated.organization_id,
        event_id: validated.event_id,
        person_id: validated.person_id,
        role: validated.role,
        department: validated.department,
        position_title: validated.position_title,
        call_time: validated.call_time,
        end_time: validated.end_time,
        work_area: validated.work_area,
        rate_type: validated.rate_type,
        rate_amount: validated.rate_amount,
        notes: validated.notes,
        status: 'scheduled',
        created_by: authResult.user?.id,
      })
      .select(`
        *,
        person:legend_people!person_id(id, display_name, avatar_url)
      `)
      .single();

    if (error) {
      logger.error('Error adding to crew manifest:', error);
      return NextResponse.json({ error: 'Failed to add to manifest', details: error.message }, { status: 500 });
    }

    return NextResponse.json({ entry }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    logger.error('Error in POST /api/crew-manifest:', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/crew-manifest - Update manifest entry using crew_manifest (3NF table)
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
    const { manifest_id, action, updates } = body;

    if (!manifest_id) {
      return NextResponse.json({ error: 'manifest_id is required' }, { status: 400 });
    }

    if (action === 'check_in') {
      const { data, error } = await supabase
        .from('crew_manifest')
        .update({
          status: 'checked_in',
          checked_in_at: new Date().toISOString(),
        })
        .eq('id', manifest_id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: 'Failed to check in' }, { status: 500 });
      }

      return NextResponse.json({ success: true, entry: data, message: 'Crew member checked in' });
    }

    if (action === 'check_out') {
      const { data, error } = await supabase
        .from('crew_manifest')
        .update({
          status: 'checked_out',
          checked_out_at: new Date().toISOString(),
        })
        .eq('id', manifest_id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: 'Failed to check out' }, { status: 500 });
      }

      return NextResponse.json({ success: true, entry: data, message: 'Crew member checked out' });
    }

    if (updates) {
      const { data, error } = await supabase
        .from('crew_manifest')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', manifest_id)
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

// DELETE /api/crew-manifest - Remove from manifest using crew_manifest (3NF table)
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
    const manifestId = searchParams.get('id');

    if (!manifestId) {
      return NextResponse.json({ error: 'id required' }, { status: 400 });
    }

    // Set status to cancelled instead of deleting
    const { error } = await supabase
      .from('crew_manifest')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('id', manifestId);

    if (error) {
      return NextResponse.json({ error: 'Failed to remove from manifest' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Removed from manifest' });
  } catch (error) {
    logger.error('Error in DELETE /api/crew-manifest:', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
