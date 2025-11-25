import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Partnership and collaboration opportunities
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status') || 'open';

    let query = supabase.from('partnership_opportunities').select(`
      *, company:companies(name, logo_url),
      applications:partnership_applications(count)
    `);

    if (type) query = query.eq('partnership_type', type);
    if (status !== 'all') query = query.eq('status', status);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ opportunities: data });
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

    if (action === 'create') {
      const { company_id, title, partnership_type, description, requirements, benefits, deadline } = body;

      const { data, error } = await supabase.from('partnership_opportunities').insert({
        company_id, title, partnership_type, description,
        requirements: requirements || [], benefits: benefits || [],
        deadline, status: 'open', created_by: user.id
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ opportunity: data }, { status: 201 });
    }

    if (action === 'apply') {
      const { opportunity_id, company_id, proposal, contact_info } = body;

      const { data, error } = await supabase.from('partnership_applications').insert({
        opportunity_id, company_id, proposal, contact_info,
        status: 'submitted', submitted_by: user.id
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ application: data }, { status: 201 });
    }

    if (action === 'update_status') {
      const { application_id, status, feedback } = body;

      await supabase.from('partnership_applications').update({
        status, feedback, reviewed_at: new Date().toISOString()
      }).eq('id', application_id);

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
