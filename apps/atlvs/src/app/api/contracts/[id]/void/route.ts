export const dynamic = 'force-dynamic';

import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const ATLVS_ADMIN_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

const voidSchema = z.object({
  reason: z.string().min(1, 'Reason is required'),
  notify_signers: z.boolean().default(true),
});

// POST /api/contracts/[id]/void - Void a contract
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createAdminClient();
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    
    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ADMIN_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const { id } = params;
    const body = await request.json();
    const validated = voidSchema.parse(body);

    // Get current contract
    const { data: contract, error: fetchError } = await supabase
      .from('contracts')
      .select('id, status, title')
      .eq('id', id)
      .single();

    if (fetchError || !contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }

    // Only active or pending contracts can be voided
    if (!['active', 'pending_approval', 'pending_signature'].includes(contract.status)) {
      return NextResponse.json(
        { error: 'Only active or pending contracts can be voided' },
        { status: 400 }
      );
    }

    // Update contract status to voided
    const { data, error } = await supabase
      .from('contracts')
      .update({
        status: 'voided',
        void_reason: validated.reason,
        voided_at: new Date().toISOString(),
        voided_by: authResult.user?.id || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.error('Error voiding contract:', error);
      return NextResponse.json(
        { error: 'Failed to void contract', details: error.message },
        { status: 500 }
      );
    }

    // Log the void action
    await supabase.from('contract_audit_logs').insert({
      contract_id: id,
      action: 'voided',
      actor_id: authResult.user?.id || null,
      details: { reason: validated.reason },
      ip_address: request.headers.get('x-forwarded-for') || null,
      user_agent: request.headers.get('user-agent') || null,
    });

    return NextResponse.json({
      success: true,
      contract: data,
      message: 'Contract voided successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    logger.error('Error in POST /api/contracts/[id]/void:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
