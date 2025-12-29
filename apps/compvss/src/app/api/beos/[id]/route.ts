export const dynamic = 'force-dynamic';

import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { z } from 'zod';

const COMPVSS_ROLES = [
  PlatformRole.COMPVSS_ADMIN, PlatformRole.COMPVSS_TEAM_MEMBER, 
  PlatformRole.COMPVSS_COLLABORATOR, PlatformRole.COMPVSS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

const COMPVSS_WRITE_ROLES = [
  PlatformRole.COMPVSS_ADMIN, PlatformRole.COMPVSS_TEAM_MEMBER, PlatformRole.COMPVSS_COLLABORATOR,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

const updateBEOSchema = z.object({
  name: z.string().min(1).optional(),
  event_date: z.string().optional(),
  event_start_time: z.string().optional(),
  event_end_time: z.string().optional(),
  venue_name: z.string().optional(),
  room_name: z.string().optional(),
  guest_count: z.number().int().min(0).optional(),
  sections: z.record(z.unknown()).optional(),
  notes: z.string().optional(),
  internal_notes: z.string().optional(),
  status: z.enum(['draft', 'pending_review', 'approved', 'distributed', 'executed', 'archived']).optional(),
});

// GET /api/beos/[id] - Get BEO details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = supabaseAdmin;
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    
    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden - COMPVSS access required' }, { status: 403 });
    }

    const { id } = params;

    const { data, error } = await supabase
      .from('beos')
      .select(`
        *,
        booking:bookings(id, booking_number, event_name, contact:contacts(first_name, last_name, email, phone)),
        event:events(id, name)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'BEO not found' }, { status: 404 });
      }
      logger.error('Failed to fetch BEO', { error, beoId: id });
      return NextResponse.json({ error: 'Failed to fetch BEO' }, { status: 500 });
    }

    // Get version history
    const { data: versions } = await supabase
      .from('beo_versions')
      .select('*')
      .eq('beo_id', id)
      .order('version_number', { ascending: false })
      .limit(10);

    return NextResponse.json({ beo: data, versions: versions || [] });
  } catch (error) {
    logger.error('BEO GET error', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/beos/[id] - Update BEO
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = supabaseAdmin;
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    
    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_WRITE_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden - COMPVSS write access required' }, { status: 403 });
    }

    const { id } = params;
    const body = await request.json();
    const validation = updateBEOSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: validation.error.errors 
      }, { status: 400 });
    }

    const input = validation.data;

    const { data, error } = await supabase
      .from('beos')
      .update({
        ...input,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'BEO not found' }, { status: 404 });
      }
      logger.error('Failed to update BEO', { error, beoId: id });
      return NextResponse.json({ error: 'Failed to update BEO' }, { status: 500 });
    }

    logger.info('BEO updated', { beoId: id });
    return NextResponse.json({ beo: data });
  } catch (error) {
    logger.error('BEO PUT error', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/beos/[id] - Delete BEO
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = supabaseAdmin;
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    
    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_WRITE_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden - COMPVSS write access required' }, { status: 403 });
    }

    const { id } = params;

    // Check if BEO is in a deletable state
    const { data: existing } = await supabase
      .from('beos')
      .select('status')
      .eq('id', id)
      .single();

    if (existing && !['draft', 'archived'].includes(existing.status)) {
      return NextResponse.json({ 
        error: 'Cannot delete BEO that is not in draft or archived status' 
      }, { status: 400 });
    }

    const { error } = await supabase
      .from('beos')
      .delete()
      .eq('id', id);

    if (error) {
      logger.error('Failed to delete BEO', { error, beoId: id });
      return NextResponse.json({ error: 'Failed to delete BEO' }, { status: 500 });
    }

    logger.info('BEO deleted', { beoId: id });
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('BEO DELETE error', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
