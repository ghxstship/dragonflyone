export const dynamic = 'force-dynamic';

import { logger, withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

const ATLVS_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

// GET /api/contracts/[id]/audit - Get contract audit trail
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createAdminClient();
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    
    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden - ATLVS access required' }, { status: 403 });
    }

    const { id } = params;

    // Verify contract exists
    const { data: contract, error: contractError } = await supabase
      .from('contracts')
      .select('id, title')
      .eq('id', id)
      .single();

    if (contractError || !contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }

    // Get audit logs
    const { data: auditLogs, error } = await supabase
      .from('contract_audit_logs')
      .select(`
        id,
        action,
        details,
        ip_address,
        user_agent,
        created_at,
        actor:platform_users!actor_id(id, full_name, email)
      `)
      .eq('contract_id', id)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Error fetching audit logs:', error);
      return NextResponse.json(
        { error: 'Failed to fetch audit logs', details: error.message },
        { status: 500 }
      );
    }

    // Get signature events
    const { data: signatures } = await supabase
      .from('contract_signatures')
      .select(`
        id,
        signer_name,
        signer_email,
        signed_at,
        ip_address,
        status
      `)
      .eq('contract_id', id)
      .order('created_at', { ascending: false });

    // Combine and format the audit trail
    const formattedLogs = (auditLogs || []).map(log => ({
      id: log.id,
      type: 'action',
      action: log.action,
      details: log.details,
      actor: log.actor,
      ip_address: log.ip_address,
      user_agent: log.user_agent,
      timestamp: log.created_at,
    }));

    const signatureEvents = (signatures || []).map(sig => ({
      id: sig.id,
      type: 'signature',
      action: sig.status === 'signed' ? 'signed' : sig.status,
      details: {
        signer_name: sig.signer_name,
        signer_email: sig.signer_email,
      },
      ip_address: sig.ip_address,
      timestamp: sig.signed_at || sig.created_at,
    }));

    const allEvents = [...formattedLogs, ...signatureEvents].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return NextResponse.json({
      contract_id: id,
      contract_title: contract.title,
      events: allEvents,
      total: allEvents.length,
    });
  } catch (error) {
    logger.error('Error in GET /api/contracts/[id]/audit:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
