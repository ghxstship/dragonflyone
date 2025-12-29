export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase, withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const createPermitSchema = z.object({
  project_id: z.string().uuid(),
  permit_type: z.string(),
  issuing_authority: z.string().optional(),
  jurisdiction: z.string().optional(),
  application_date: z.string().optional(),
  deadline: z.string().optional(),
  event_date: z.string().optional(),
  venue_address: z.string().optional(),
  expected_attendance: z.number().int().optional(),
  description: z.string().optional(),
  requirements: z.array(z.string()).optional(),
  fee_amount: z.number().optional(),
  contact_name: z.string().optional(),
  contact_phone: z.string().optional(),
  contact_email: z.string().email().optional(),
});

const submitSchema = z.object({
  permit_id: z.string().uuid(),
  action: z.literal('submit'),
});

const approveSchema = z.object({
  permit_id: z.string().uuid(),
  action: z.literal('approve'),
  permit_number: z.string().optional(),
  approved_date: z.string().optional(),
  expiration_date: z.string().optional(),
  conditions: z.array(z.string()).optional(),
});

const rejectSchema = z.object({
  permit_id: z.string().uuid(),
  action: z.literal('reject'),
  rejection_reason: z.string().optional(),
  can_reapply: z.boolean().optional(),
});

const updatePermitSchema = z.object({
  permit_id: z.string().uuid(),
  action: z.string().optional(),
}).passthrough();

const permitPatchActionSchema = z.union([submitSchema, approveSchema, rejectSchema, updatePermitSchema]);

// GET - Fetch permits
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

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');
    const status = searchParams.get('status');
    const type = searchParams.get('type');

    let query = supabase
      .from('permits')
      .select(`
        *,
        project:projects(id, name),
        submitted_by:platform_users!submitted_by(id, email, first_name, last_name),
        documents:permit_documents(*)
      `);

    if (projectId) query = query.eq('project_id', projectId);
    if (status) query = query.eq('status', status);
    if (type) query = query.eq('permit_type', type);

    const { data, error } = await query.order('deadline', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    }

    // Get upcoming deadlines
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const upcomingDeadlines = data.filter(
      p => p.deadline && new Date(p.deadline) <= sevenDaysFromNow && p.status !== 'approved'
    );

    return NextResponse.json({
      permits: data,
      upcoming_deadlines: upcomingDeadlines,
      stats: {
        total: data.length,
        pending: data.filter(p => p.status === 'pending').length,
        approved: data.filter(p => p.status === 'approved').length,
        rejected: data.filter(p => p.status === 'rejected').length,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch permits' },
      { status: 500 }
    );
  }
}

// POST - Create permit application
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
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createPermitSchema.parse(body);
    const {
      project_id,
      permit_type,
      issuing_authority,
      jurisdiction,
      application_date,
      deadline,
      event_date,
      venue_address,
      expected_attendance,
      description,
      requirements,
      fee_amount,
      contact_name,
      contact_phone,
      contact_email,
    } = validatedData;

    const { data: permit, error } = await supabase
      .from('permits')
      .insert({
        project_id,
        permit_type,
        issuing_authority,
        jurisdiction,
        application_date: application_date || new Date().toISOString(),
        deadline,
        event_date,
        venue_address,
        expected_attendance,
        description,
        requirements: requirements || [],
        fee_amount,
        contact_name,
        contact_phone,
        contact_email,
        status: 'draft',
        submitted_by: user.id,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    }

    return NextResponse.json({ permit }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create permit' },
      { status: 500 }
    );
  }
}

// PATCH - Update permit status or details
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
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = permitPatchActionSchema.parse(body);
    const { permit_id, action, ...updateData } = validatedData;

    if (action === 'submit') {
      await supabase
        .from('permits')
        .update({
          status: 'pending',
          submitted_at: new Date().toISOString(),
        })
        .eq('id', permit_id);

      return NextResponse.json({ success: true, message: 'Permit submitted' });
    }

    if (action === 'approve') {
      const { permit_number, approved_date, expiration_date, conditions } = updateData;

      await supabase
        .from('permits')
        .update({
          status: 'approved',
          permit_number,
          approved_date: approved_date || new Date().toISOString(),
          expiration_date,
          conditions: conditions || [],
        })
        .eq('id', permit_id);

      return NextResponse.json({ success: true });
    }

    if (action === 'reject') {
      const { rejection_reason, can_reapply } = updateData;

      await supabase
        .from('permits')
        .update({
          status: 'rejected',
          rejection_reason,
          can_reapply: can_reapply !== false,
          rejected_at: new Date().toISOString(),
        })
        .eq('id', permit_id);

      return NextResponse.json({ success: true });
    }

    // Default: update permit
    const { error } = await supabase
      .from('permits')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', permit_id);

    if (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update permit' },
      { status: 500 }
    );
  }
}
