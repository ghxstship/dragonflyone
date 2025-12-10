export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@ghxstship/config';

// Subcontractor opportunity listings
export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const location = searchParams.get('location');
    const status = searchParams.get('status') || 'open';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = (page - 1) * limit;

    let query = supabase.from('subcontractor_opportunities').select(`
      id, title, category, description, location, budget_range, deadline, status, created_at,
      project:projects(id, name),
      applications:subcontractor_applications(id, status)
    `, { count: 'exact' }).eq('status', status);

    if (category) query = query.eq('category', category);
    if (location) query = query.ilike('location', `%${location}%`);

    const { data, error, count } = await query
      .order('deadline', { ascending: true })
      .range(offset, offset + limit - 1);
    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

    const totalCount = count || (data?.length ?? 0);
    const pagination = {
      page,
      limit,
      total: totalCount,
      totalPages: Math.ceil(totalCount / limit),
      hasMore: offset + (data?.length ?? 0) < totalCount,
    };

    return NextResponse.json({ opportunities: data, pagination });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { action } = body;

    if (action === 'create') {
      const { project_id, title, category, description, requirements, location, budget_range, deadline } = body;

      const { data, error } = await supabase.from('subcontractor_opportunities').insert({
        project_id, title, category, description, requirements: requirements || [],
        location, budget_range, deadline, status: 'open', created_by: user.id
      }).select().single();

      if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
      return NextResponse.json({ opportunity: data }, { status: 201 });
    }

    if (action === 'apply') {
      const { opportunity_id, vendor_id, proposal, rate, availability } = body;

      const { data, error } = await supabase.from('subcontractor_applications').insert({
        opportunity_id, vendor_id, proposal, rate, availability, status: 'submitted', submitted_by: user.id
      }).select().single();

      if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
      return NextResponse.json({ application: data }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
