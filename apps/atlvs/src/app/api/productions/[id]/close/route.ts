import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { log, withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const updateChecklistSchema = z.object({
  checklist: z.record(z.boolean()),
});

const ATLVS_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = await createClient();
    const { id } = params;

    // Get production close status
    const { data: production, error } = await supabase
      .from('productions')
      .select('id, name, status, close_checklist')
      .eq('id', id)
      .single();

    if (error) {
      log.error('Failed to fetch production close status', { error, id });
      return NextResponse.json({ error: 'Failed to fetch production' }, { status: 500 });
    }

    return NextResponse.json({ production });
  } catch (error) {
    log.error('Error in production close GET', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = await createClient();
    const { id } = params;
    const body = await request.json();
    const validatedData = updateChecklistSchema.parse(body);
    const { checklist } = validatedData;

    // Update production close checklist
    const { data, error } = await supabase
      .from('productions')
      .update({
        close_checklist: checklist,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      log.error('Failed to update production close checklist', { error, id });
      return NextResponse.json({ error: 'Failed to update checklist' }, { status: 500 });
    }

    log.info('Production close checklist updated', { id });
    return NextResponse.json({ production: data });
  } catch (error) {
    log.error('Error in production close POST', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = await createClient();
    const { id } = params;

    // Archive the production
    const { data, error } = await supabase
      .from('productions')
      .update({
        status: 'archived',
        archived_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      log.error('Failed to archive production', { error, id });
      return NextResponse.json({ error: 'Failed to archive production' }, { status: 500 });
    }

    log.info('Production archived', { id });
    return NextResponse.json({ production: data, message: 'Production archived successfully' });
  } catch (error) {
    log.error('Error in production close PUT', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
