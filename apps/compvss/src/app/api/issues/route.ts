import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const category = searchParams.get('category');

    let query = supabase
      .from('production_issues')
      .select(`
        *,
        reporter:platform_users!production_issues_reported_by_fkey(id, first_name, last_name),
        assignee:platform_users!production_issues_assigned_to_fkey(id, first_name, last_name)
      `)
      .order('created_at', { ascending: false });

    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (priority) {
      query = query.eq('priority', priority);
    }

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const issues = data?.map(i => ({
      id: i.id,
      title: i.title,
      description: i.description,
      category: i.category,
      priority: i.priority,
      status: i.status,
      reported_by: i.reporter ? `${(i.reporter as any).first_name} ${(i.reporter as any).last_name}` : 'Unknown',
      assigned_to: i.assignee ? `${(i.assignee as any).first_name} ${(i.assignee as any).last_name}` : null,
      department: i.department,
      location: i.location,
      created_at: i.created_at,
      updated_at: i.updated_at,
      escalation_level: i.escalation_level || 0,
      resolution: i.resolution,
    })) || [];

    return NextResponse.json({ issues });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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
    const { project_id, title, description, category, priority, department, location } = body;

    if (!title || !category || !priority) {
      return NextResponse.json(
        { error: 'Title, category, and priority are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('production_issues')
      .insert({
        project_id,
        title,
        description,
        category,
        priority,
        department,
        location,
        status: 'open',
        reported_by: user.id,
        escalation_level: 0,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ issue: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
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
    const { id, status, assigned_to, resolution, escalation_level } = body;

    if (!id) {
      return NextResponse.json({ error: 'Issue ID required' }, { status: 400 });
    }

    const updates: Record<string, any> = { updated_at: new Date().toISOString() };
    if (status) updates.status = status;
    if (assigned_to) updates.assigned_to = assigned_to;
    if (resolution) updates.resolution = resolution;
    if (escalation_level !== undefined) updates.escalation_level = escalation_level;

    const { data, error } = await supabase
      .from('production_issues')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ issue: data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
