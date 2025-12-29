export const dynamic = 'force-dynamic';

import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

const COMPVSS_APPROVE_ROLES = [
  PlatformRole.COMPVSS_ADMIN, PlatformRole.COMPVSS_TEAM_MEMBER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

// POST /api/beos/[id]/approve - Approve BEO
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = supabaseAdmin;
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    
    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_APPROVE_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden - Approval access required' }, { status: 403 });
    }

    const { id } = params;

    // Check current status
    const { data: existing, error: fetchError } = await supabase
      .from('beos')
      .select('status')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json({ error: 'BEO not found' }, { status: 404 });
      }
      return NextResponse.json({ error: 'Failed to fetch BEO' }, { status: 500 });
    }

    if (existing.status === 'approved' || existing.status === 'distributed') {
      return NextResponse.json({ error: 'BEO is already approved' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('beos')
      .update({
        status: 'approved',
        approved_by: authResult.user?.id,
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.error('Failed to approve BEO', { error, beoId: id });
      return NextResponse.json({ error: 'Failed to approve BEO' }, { status: 500 });
    }

    logger.info('BEO approved', { beoId: id, approvedBy: authResult.user?.id });
    return NextResponse.json({ beo: data });
  } catch (error) {
    logger.error('BEO approve error', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
