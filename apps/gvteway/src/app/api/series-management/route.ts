import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}


// Lazy getter for supabase client - only accessed at runtime
const supabase = new Proxy({} as ReturnType<typeof getSupabaseClient>, {
  get(_target, prop) {
    return (getSupabaseClient() as any)[prop];
  }
});

// Series and season management
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const seriesId = searchParams.get('series_id');

    if (seriesId) {
      const { data } = await supabase.from('event_series').select(`
        *, events:events(id, title, date, status)
      `).eq('id', seriesId).single();

      return NextResponse.json({ series: data });
    }

    const { data, error } = await supabase.from('event_series').select(`
      *, event_count:events(count)
    `).order('name', { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ series: data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { action } = body;

    if (action === 'create') {
      const { name, description, series_type, start_date, end_date, recurrence_pattern } = body;

      const { data, error } = await supabase.from('event_series').insert({
        name, description, series_type, start_date, end_date,
        recurrence_pattern, status: 'active', created_by: user.id
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ series: data }, { status: 201 });
    }

    if (action === 'add_event') {
      const { series_id, event_id } = body;

      await supabase.from('events').update({ series_id }).eq('id', event_id);
      return NextResponse.json({ success: true });
    }

    if (action === 'generate_events') {
      const { series_id, template_event_id, dates } = body;

      // Get template event
      const { data: template } = await supabase.from('events').select('*').eq('id', template_event_id).single();
      if (!template) return NextResponse.json({ error: 'Template not found' }, { status: 404 });

      // Create events for each date
      const events = await Promise.all(dates.map(async (date: string) => {
        const { data } = await supabase.from('events').insert({
          ...template,
          id: undefined,
          series_id,
          date,
          status: 'draft',
          created_by: user.id
        }).select().single();
        return data;
      }));

      return NextResponse.json({ events }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
