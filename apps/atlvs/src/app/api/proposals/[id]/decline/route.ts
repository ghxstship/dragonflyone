import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const declineSchema = z.object({
  reason: z.string().optional(),
  feedback: z.string().optional(),
  declined_by_name: z.string().optional(),
  declined_by_email: z.string().email().optional(),
});

const ATLVS_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

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

    const supabase = createAdminClient();
    const proposalId = params.id;

    const body = await request.json().catch(() => ({}));
    const validatedData = declineSchema.parse(body);

    // Get proposal
    const { data: proposal, error: proposalError } = await supabase
      .from('proposals')
      .select('id, status, proposal_number, client_id, booking_id')
      .eq('id', proposalId)
      .single();

    if (proposalError || !proposal) {
      return NextResponse.json(
        { error: 'Proposal not found' },
        { status: 404 }
      );
    }

    if (proposal.status === 'declined') {
      return NextResponse.json(
        { error: 'Proposal has already been declined' },
        { status: 400 }
      );
    }

    if (proposal.status === 'accepted') {
      return NextResponse.json(
        { error: 'Proposal has already been accepted and cannot be declined' },
        { status: 400 }
      );
    }

    // Update proposal status
    const { data: updatedProposal, error: updateError } = await supabase
      .from('proposals')
      .update({
        status: 'declined',
        declined_at: new Date().toISOString(),
        decline_reason: validatedData.reason || null,
        decline_feedback: validatedData.feedback || null,
        declined_by_name: validatedData.declined_by_name || null,
        declined_by_email: validatedData.declined_by_email || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', proposalId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to decline proposal' },
        { status: 500 }
      );
    }

    // Update associated booking if exists
    if (proposal.booking_id) {
      await supabase
        .from('legend_events')
        .update({
          proposal_status: 'declined',
          updated_at: new Date().toISOString(),
        })
        .eq('id', proposal.booking_id);
    }

    // Log activity
    await supabase.from('proposal_activities').insert({
      proposal_id: proposalId,
      activity_type: 'declined',
      description: validatedData.reason 
        ? `Proposal declined: ${validatedData.reason}` 
        : 'Proposal declined by client',
      metadata: {
        declined_by_name: validatedData.declined_by_name,
        declined_by_email: validatedData.declined_by_email,
        feedback: validatedData.feedback,
      },
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      proposal: updatedProposal,
      message: 'Proposal declined',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
