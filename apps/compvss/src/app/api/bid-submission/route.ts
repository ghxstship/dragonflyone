export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase, withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const createBidSchema = z.object({
  rfp_id: z.string().uuid(),
  proposal_summary: z.string(),
  total_amount: z.number(),
  timeline: z.record(z.unknown()).optional(),
  attachments: z.array(z.object({
    name: z.string(),
    url: z.string().url(),
    type: z.string().optional(),
  })).optional(),
  line_items: z.array(z.record(z.unknown())).optional(),
});

const withdrawBidSchema = z.object({
  id: z.string().uuid(),
  action: z.literal('withdraw'),
});

// Bid submission portal with file attachments
const COMPVSS_ROLES = [
  PlatformRole.COMPVSS_ADMIN, PlatformRole.COMPVSS_TEAM_MEMBER, PlatformRole.COMPVSS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const userId = authResult.user?.id;
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const rfpId = searchParams.get('rfp_id');

    let query = supabase.from('bid_submissions').select(`
      *, rfp:rfps(id, title, deadline), attachments:bid_attachments(id, name, url, type)
    `).eq('submitted_by', userId);

    if (rfpId) query = query.eq('rfp_id', rfpId);

    const { data, error } = await query.order('submitted_at', { ascending: false });
    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

    return NextResponse.json({ submissions: data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const userId = authResult.user?.id;
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const validatedData = createBidSchema.parse(body);
    const { rfp_id, proposal_summary, total_amount, timeline, attachments, line_items } = validatedData;

    // Check deadline
    const { data: rfp } = await supabase.from('rfps').select('deadline').eq('id', rfp_id).single();
    if (rfp && new Date(rfp.deadline) < new Date()) {
      return NextResponse.json({ error: 'Submission deadline has passed' }, { status: 400 });
    }

    const { data: submission, error } = await supabase.from('bid_submissions').insert({
      rfp_id, proposal_summary, total_amount, timeline,
      line_items: line_items || [], status: 'submitted',
      submitted_by: userId, submitted_at: new Date().toISOString()
    }).select().single();

    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

    // Add attachments
    if (attachments?.length) {
      await supabase.from('bid_attachments').insert(
        attachments.map((a: Record<string, unknown>) => ({ submission_id: submission.id, name: a.name, url: a.url, type: a.type }))
      );
    }

    return NextResponse.json({ submission }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to submit' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = withdrawBidSchema.parse(body);
    const { id, action } = validatedData;

    if (action === 'withdraw') {
      await supabase.from('bid_submissions').update({
        status: 'withdrawn', withdrawn_at: new Date().toISOString()
      }).eq('id', id);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
