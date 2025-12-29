export const dynamic = 'force-dynamic';

import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const createSelectionSchema = z.object({
  rfp_id: z.string().uuid(),
  vendor_id: z.string().uuid(),
  justification: z.string().optional(),
  contract_value: z.number().min(0).optional(),
  approvers: z.array(z.string().uuid()).optional(),
});

const approvalActionSchema = z.object({
  selection_id: z.string().uuid(),
  action: z.enum(['approve', 'reject']),
  comments: z.string().optional(),
});

// Vendor selection workflows with approval routing
const ATLVS_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const rfpId = searchParams.get('rfp_id');
    const status = searchParams.get('status');

    let query = supabase.from('vendor_selections').select(`
      *, rfp:rfps(id, title), vendor:vendors(id, name),
      approvals:selection_approvals(id, approver:platform_users(first_name, last_name), status, approved_at)
    `);

    if (rfpId) query = query.eq('rfp_id', rfpId);
    if (status) query = query.eq('status', status);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

    return NextResponse.json({
      selections: data,
      pending_approval: data?.filter(s => s.status === 'pending_approval') || []
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch selections' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const validatedData = createSelectionSchema.parse(body);
    const { rfp_id, vendor_id, justification, contract_value, approvers } = validatedData;

    // Create selection record
    const { data: selection, error } = await supabase.from('vendor_selections').insert({
      rfp_id, vendor_id, justification, contract_value,
      status: 'pending_approval', submitted_by: user.id
    }).select().single();

    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

    // Create approval requests
    const approvalRecords = (approvers || []).map((approverId: string, index: number) => ({
      selection_id: selection.id,
      approver_id: approverId,
      sequence: index + 1,
      status: index === 0 ? 'pending' : 'waiting'
    }));

    if (approvalRecords.length > 0) {
      await supabase.from('selection_approvals').insert(approvalRecords);

      // Notify first approver
      await supabase.from('notifications').insert({
        user_id: approvers[0],
        type: 'approval_required',
        title: 'Vendor Selection Approval Required',
        message: `Please review vendor selection for RFP`,
        reference_id: selection.id
      });
    }

    return NextResponse.json({ selection }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create selection' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const validatedData = approvalActionSchema.parse(body);
    const { selection_id, action, comments } = validatedData;

    if (action === 'approve' || action === 'reject') {
      // Update approval record
      await supabase.from('selection_approvals').update({
        status: action === 'approve' ? 'approved' : 'rejected',
        approved_at: new Date().toISOString(),
        comments
      }).eq('selection_id', selection_id).eq('approver_id', user.id);

      if (action === 'approve') {
        // Check if all approvals complete
        const { data: approvals } = await supabase.from('selection_approvals').select('*')
          .eq('selection_id', selection_id).order('sequence', { ascending: true });

        const currentIndex = approvals?.findIndex(a => a.approver_id === user.id) || 0;
        const nextApproval = approvals?.[currentIndex + 1];

        if (nextApproval) {
          // Activate next approver
          await supabase.from('selection_approvals').update({ status: 'pending' }).eq('id', nextApproval.id);
          
          await supabase.from('notifications').insert({
            user_id: nextApproval.approver_id,
            type: 'approval_required',
            title: 'Vendor Selection Approval Required',
            reference_id: selection_id
          });
        } else {
          // All approved
          await supabase.from('vendor_selections').update({ status: 'approved' }).eq('id', selection_id);
        }
      } else {
        // Rejected
        await supabase.from('vendor_selections').update({ status: 'rejected' }).eq('id', selection_id);
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
