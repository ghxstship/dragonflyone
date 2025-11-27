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

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('accessibility_requests')
      .select(`
        *,
        events (
          id,
          title,
          date
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const requests = data?.map(req => ({
      id: req.id,
      event_id: req.event_id,
      event_title: (req.events as any)?.title,
      event_date: (req.events as any)?.date,
      request_type: req.services?.join(', ') || req.request_type,
      status: req.status,
      notes: req.notes,
      created_at: req.created_at,
    })) || [];

    return NextResponse.json({ requests });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const { data, error } = await supabase
      .from('accessibility_requests')
      .insert({
        user_id: user.id,
        event_id: body.event_id,
        order_id: body.order_id,
        services: body.services,
        notes: body.notes,
        contact_phone: body.contact_phone,
        emergency_contact: body.emergency_contact,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Save preferences if requested
    if (body.save_preferences) {
      await supabase
        .from('user_accessibility_preferences')
        .upsert({
          user_id: user.id,
          default_services: body.services,
          contact_phone: body.contact_phone,
          emergency_contact: body.emergency_contact,
          updated_at: new Date().toISOString(),
        });
    }

    return NextResponse.json({ request: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
