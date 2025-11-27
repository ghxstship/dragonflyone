import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@ghxstship/config';

// Client requirements documentation and scope definition
export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');

    let query = supabase.from('client_requirements').select(`
      *, project:projects(id, name, client_id),
      items:requirement_items(id, category, description, priority, status)
    `);

    if (projectId) query = query.eq('project_id', projectId);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ requirements: data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch requirements' }, { status: 500 });
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
    const { project_id, scope_summary, deliverables, constraints, assumptions, exclusions, items } = body;

    const { data: requirement, error } = await supabase.from('client_requirements').insert({
      project_id, scope_summary, deliverables: deliverables || [],
      constraints: constraints || [], assumptions: assumptions || [],
      exclusions: exclusions || [], status: 'draft', created_by: user.id
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Add requirement items
    if (items?.length) {
      const itemRecords = items.map((item: any) => ({
        requirement_id: requirement.id,
        category: item.category,
        description: item.description,
        priority: item.priority || 'medium',
        status: 'pending'
      }));
      await supabase.from('requirement_items').insert(itemRecords);
    }

    return NextResponse.json({ requirement }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create requirements' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { id, action } = body;

    if (action === 'approve') {
      await supabase.from('client_requirements').update({
        status: 'approved', approved_by: user.id, approved_at: new Date().toISOString()
      }).eq('id', id);
      return NextResponse.json({ success: true });
    }

    if (action === 'sign_off') {
      await supabase.from('client_requirements').update({
        client_signed_off: true, signed_off_at: new Date().toISOString()
      }).eq('id', id);
      return NextResponse.json({ success: true });
    }

    const { error } = await supabase.from('client_requirements').update(body).eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
