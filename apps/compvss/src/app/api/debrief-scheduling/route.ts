import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Artist/client debrief scheduling
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');
    const projectId = searchParams.get('project_id');

    let query = supabase.from('debriefs').select(`
      *, attendees:debrief_attendees(id, name, role, confirmed),
      notes:debrief_notes(id, topic, content, action_items)
    `);

    if (eventId) query = query.eq('event_id', eventId);
    if (projectId) query = query.eq('project_id', projectId);

    const { data, error } = await query.order('scheduled_at', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ debriefs: data });
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

    if (action === 'schedule') {
      const { event_id, project_id, debrief_type, scheduled_at, location, attendees, agenda } = body;

      const { data, error } = await supabase.from('debriefs').insert({
        event_id, project_id, debrief_type, scheduled_at, location,
        agenda: agenda || [], status: 'scheduled', created_by: user.id
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      if (attendees?.length) {
        await supabase.from('debrief_attendees').insert(
          attendees.map((a: any) => ({ debrief_id: data.id, name: a.name, role: a.role, email: a.email, confirmed: false }))
        );
      }

      return NextResponse.json({ debrief: data }, { status: 201 });
    }

    if (action === 'add_notes') {
      const { debrief_id, topic, content, action_items } = body;

      const { data, error } = await supabase.from('debrief_notes').insert({
        debrief_id, topic, content, action_items: action_items || [], created_by: user.id
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ note: data }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
