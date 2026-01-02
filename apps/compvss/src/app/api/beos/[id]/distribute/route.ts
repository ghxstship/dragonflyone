export const dynamic = 'force-dynamic';

import { withAuth, PlatformRole, logger } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { z } from 'zod';

const COMPVSS_DISTRIBUTE_ROLES = [
  PlatformRole.COMPVSS_ADMIN, PlatformRole.COMPVSS_TEAM_MEMBER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

const distributeSchema = z.object({
  recipients: z.array(z.string().email()).min(1, 'At least one recipient required'),
});

// POST /api/beos/[id]/distribute - Distribute BEO to team
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = supabaseAdmin;
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    
    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_DISTRIBUTE_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden - Distribution access required' }, { status: 403 });
    }

    const { id } = params;
    const body = await request.json();
    const validation = distributeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: validation.error.errors 
      }, { status: 400 });
    }

    const { recipients } = validation.data;

    // Check BEO exists and is approved
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

    if (!['approved', 'distributed'].includes(existing.status)) {
      return NextResponse.json({ error: 'BEO must be approved before distribution' }, { status: 400 });
    }

    // Create distribution records
    const distributions = recipients.map(email => ({
      beo_id: id,
      recipient_type: 'email',
      recipient_email: email,
      sent_at: new Date().toISOString(),
    }));

    const { error: distError } = await supabase
      .from('beo_distributions')
      .insert(distributions);

    if (distError) {
      logger.error('Failed to create distribution records', { error: distError, beoId: id });
    }

    // Update BEO status to distributed
    const { data, error } = await supabase
      .from('beos')
      .update({
        status: 'distributed',
        distributed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.error('Failed to update BEO status', { error, beoId: id });
      return NextResponse.json({ error: 'Failed to distribute BEO' }, { status: 500 });
    }

    logger.info('BEO distributed', { beoId: id, recipientCount: recipients.length });
    return NextResponse.json({ 
      success: true, 
      beo: data,
      distributed_to: recipients.length 
    });
  } catch (error) {
    logger.error('BEO distribute error', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
