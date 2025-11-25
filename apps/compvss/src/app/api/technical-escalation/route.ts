import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Technical issue escalation with priority levels
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');
    const priority = searchParams.get('priority');

    let query = supabase.from('technical_issues').select(`
      *, reported_by:platform_users!reported_by(first_name, last_name),
      assigned_to:platform_users!assigned_to(first_name, last_name)
    `).eq('event_id', eventId);

    if (priority) query = query.eq('priority', priority);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({
      issues: data,
      by_priority: {
        critical: data?.filter(i => i.priority === 'critical') || [],
        high: data?.filter(i => i.priority === 'high') || [],
        medium: data?.filter(i => i.priority === 'medium') || [],
        low: data?.filter(i => i.priority === 'low') || []
      }
    });
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
    const { event_id, department, description, priority, assigned_to } = body;

    const { data, error } = await supabase.from('technical_issues').insert({
      event_id, department, description, priority: priority || 'medium',
      assigned_to, status: 'open', reported_by: user.id
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Notify for critical issues
    if (priority === 'critical' && assigned_to) {
      await supabase.from('notifications').insert({
        user_id: assigned_to, type: 'critical_issue',
        title: 'CRITICAL Technical Issue', message: description,
        priority: 'urgent', reference_id: data.id
      });
    }

    return NextResponse.json({ issue: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { id, action, status, resolution, priority } = body;

    if (action === 'escalate') {
      await supabase.from('technical_issues').update({
        priority: 'critical', escalated: true, escalated_at: new Date().toISOString()
      }).eq('id', id);
      return NextResponse.json({ success: true });
    }

    await supabase.from('technical_issues').update({
      status, resolution, priority,
      resolved_at: status === 'resolved' ? new Date().toISOString() : null
    }).eq('id', id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
