import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

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

const willCallSchema = z.object({
  ticket_id: z.string().uuid(),
  event_id: z.string().uuid(),
  pickup_name: z.string().min(1),
  pickup_email: z.string().email().optional(),
  pickup_phone: z.string().optional(),
  id_type: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    let query = supabase
      .from('will_call_entries')
      .select(`*, ticket:tickets(id, ticket_type, section, row, seat)`)
      .order('pickup_name', { ascending: true });

    if (eventId) query = query.eq('event_id', eventId);
    if (status) query = query.eq('status', status);
    if (search) query = query.ilike('pickup_name', `%${search}%`);

    const { data: entries, error } = await query;
    if (error) throw error;

    const summary = {
      total: entries?.length || 0,
      pending: entries?.filter(e => e.status === 'pending').length || 0,
      picked_up: entries?.filter(e => e.status === 'picked_up').length || 0,
    };

    return NextResponse.json({ entries, summary });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const validated = willCallSchema.parse(body);

    const { data: entry, error } = await supabase
      .from('will_call_entries')
      .insert({ ...validated, status: 'pending', created_at: new Date().toISOString() })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ entry }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const { id, action, ...updates } = body;

    if (action === 'pickup') {
      const { data: entry, error } = await supabase
        .from('will_call_entries')
        .update({
          status: 'picked_up',
          picked_up_at: new Date().toISOString(),
          picked_up_by: updates.picked_up_by,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ entry });
    }

    const { data: entry, error } = await supabase
      .from('will_call_entries')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ entry });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const { error } = await supabase
      .from('will_call_entries')
      .update({ status: 'cancelled' })
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
