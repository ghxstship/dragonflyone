import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Internship and apprenticeship program management
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const programType = searchParams.get('type');
    const status = searchParams.get('status') || 'active';

    let query = supabase.from('internship_programs').select(`
      *, company:companies(name, logo_url),
      positions:program_positions(id, title, department, spots_available)
    `);

    if (programType) query = query.eq('program_type', programType);
    if (status !== 'all') query = query.eq('status', status);

    const { data, error } = await query.order('application_deadline', { ascending: true });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ programs: data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { action } = body;

    if (action === 'create_program') {
      const { company_id, name, program_type, description, duration, compensation, requirements, application_deadline, start_date } = body;

      const { data, error } = await supabase.from('internship_programs').insert({
        company_id, name, program_type, description, duration,
        compensation, requirements: requirements || [],
        application_deadline, start_date, status: 'active', created_by: user.id
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ program: data }, { status: 201 });
    }

    if (action === 'add_position') {
      const { program_id, title, department, description, spots_available, skills_required } = body;

      const { data, error } = await supabase.from('program_positions').insert({
        program_id, title, department, description,
        spots_available, skills_required: skills_required || []
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ position: data }, { status: 201 });
    }

    if (action === 'apply') {
      const { position_id, resume_url, cover_letter, availability } = body;

      const { data, error } = await supabase.from('program_applications').insert({
        position_id, applicant_id: user.id, resume_url, cover_letter,
        availability, status: 'submitted'
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ application: data }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
