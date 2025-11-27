import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@ghxstship/config';

// GET - Fetch permits
export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
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
      return NextResponse.json({ error: error.message }, { status: 500 });
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
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      project_id,
      permit_type, // 'fire', 'noise', 'street_closure', 'alcohol', 'food', 'assembly', 'pyro', 'other'
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
    } = body;

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
      return NextResponse.json({ error: error.message }, { status: 500 });
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
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { permit_id, action, ...updateData } = body;

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
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update permit' },
      { status: 500 }
    );
  }
}
