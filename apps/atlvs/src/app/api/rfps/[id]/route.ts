export const dynamic = 'force-dynamic';

import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const updateRfpSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  requirements: z.array(z.record(z.unknown())).optional(),
  specifications: z.record(z.unknown()).optional(),
  submission_deadline: z.string().optional(),
  questions_deadline: z.string().optional(),
  decision_date: z.string().optional(),
  budget_min: z.number().optional(),
  budget_max: z.number().optional(),
  evaluation_criteria: z.array(z.record(z.unknown())).optional(),
  terms_and_conditions: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(['draft', 'open', 'closed', 'evaluating', 'awarded', 'cancelled']).optional(),
});

const ATLVS_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data, error } = await supabase
      .from('rfps')
      .select(`
        *,
        booking:bookings(id, booking_number, event_name, event_date),
        production:productions(id, name),
        created_by_user:users!rfps_created_by_fkey(id, email, full_name),
        vendors:rfp_vendors(
          id, status, invited_at, viewed_at, submitted_at, declined_at, decline_reason,
          vendor:vendor_profiles(id, name, logo_url, contact_info)
        ),
        quotes:rfp_quotes(
          id, quote_number, vendor_id, total, valid_until, submitted_at, ranking, total_score,
          line_items, proposal_text, evaluated_at
        ),
        awards:rfp_awards(
          id, vendor_id, final_amount, award_reason, awarded_at,
          vendor:vendor_profiles(id, name)
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'RFP not found' }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ rfp: data });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body = await request.json();
    const payload = updateRfpSchema.parse(body);

    if (payload.status === 'open' && !payload.submission_deadline) {
      const { data: existing } = await supabase
        .from('rfps')
        .select('submission_deadline')
        .eq('id', id)
        .single();

      if (!existing?.submission_deadline) {
        return NextResponse.json(
          { error: 'submission_deadline required to publish RFP' },
          { status: 400 }
        );
      }
    }

    const updateData: Record<string, unknown> = { ...payload };
    if (payload.status === 'open') {
      updateData.published_at = new Date().toISOString();
    } else if (payload.status === 'closed') {
      updateData.closed_at = new Date().toISOString();
    } else if (payload.status === 'awarded') {
      updateData.awarded_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('rfps')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ rfp: data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 422 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: existing } = await supabase
      .from('rfps')
      .select('status')
      .eq('id', id)
      .single();

    if (existing?.status && !['draft', 'cancelled'].includes(existing.status)) {
      return NextResponse.json(
        { error: 'Can only delete draft or cancelled RFPs' },
        { status: 400 }
      );
    }

    const { error } = await supabase.from('rfps').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
