import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Performance capture coordination (photo/video)
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');

    const { data, error } = await supabase.from('performance_captures').select(`
      *, assignments:capture_assignments(id, photographer, position, time_slot, status)
    `).eq('event_id', eventId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ captures: data });
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
    const { action, event_id } = body;

    if (action === 'create_plan') {
      const { capture_type, requirements, positions } = body;

      const { data, error } = await supabase.from('performance_captures').insert({
        event_id, capture_type, requirements, status: 'planned', created_by: user.id
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      if (positions?.length) {
        await supabase.from('capture_assignments').insert(
          positions.map((p: any) => ({ capture_id: data.id, position: p.position, time_slot: p.time_slot, status: 'assigned' }))
        );
      }

      return NextResponse.json({ capture: data }, { status: 201 });
    }

    if (action === 'upload') {
      const { capture_id, media_url, media_type, timestamp, notes } = body;

      const { data, error } = await supabase.from('captured_media').insert({
        capture_id, media_url, media_type, timestamp, notes, uploaded_by: user.id
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ media: data }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
