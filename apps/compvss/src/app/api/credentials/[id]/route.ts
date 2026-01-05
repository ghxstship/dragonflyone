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

const COMPVSS_ROLES = [
  PlatformRole.COMPVSS_ADMIN,
  PlatformRole.COMPVSS_TEAM_MEMBER,
  PlatformRole.LEGEND_SUPER_ADMIN,
  PlatformRole.LEGEND_ADMIN,
];

const credentialUpdateSchema = z.object({
  status: z.enum(['active', 'revoked', 'expired', 'suspended']).optional(),
  access_level: z.string().optional(),
  valid_until: z.string().datetime().optional(),
  notes: z.string().optional() });

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = getSupabaseClient();
    const { id } = await params;

    const { data, error } = await supabase
      .from('credentials')
      .select(`
        *,
        holder:legend_people(id, first_name, last_name, email),
        event:legend_events(id, name, start_datetime)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Credential not found' }, { status: 404 });
      }
      if (error.code === '42P01') {
        return NextResponse.json({ error: 'Credential not found' }, { status: 404 });
      }
      logger.error('Error fetching credential:', error);
      return NextResponse.json({ error: 'Failed to fetch credential' }, { status: 500 });
    }

    return NextResponse.json({ credential: data });
  } catch (error) {
    logger.error('Error in GET /api/credentials/[id]:', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = getSupabaseClient();
    const { id } = await params;
    const body = await request.json();
    const validated = credentialUpdateSchema.parse(body);

    const { data, error } = await supabase
      .from('credentials')
      .update({
        ...validated,
        updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Credential not found' }, { status: 404 });
      }
      logger.error('Error updating credential:', error);
      return NextResponse.json({ error: 'Failed to update credential' }, { status: 500 });
    }

    return NextResponse.json({ credential: data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    logger.error('Error in PATCH /api/credentials/[id]:', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = getSupabaseClient();
    const { id } = await params;

    const { error } = await supabase
      .from('credentials')
      .update({ status: 'revoked', updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      logger.error('Error revoking credential:', error);
      return NextResponse.json({ error: 'Failed to revoke credential' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Credential revoked' });
  } catch (error) {
    logger.error('Error in DELETE /api/credentials/[id]:', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
