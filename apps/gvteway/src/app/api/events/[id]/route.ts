export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}



const updateEventSchema = z.object({
  title: z.string().min(3).optional(),
  headliner: z.string().min(1).optional(),
  venue: z.string().min(1).optional(),
  city: z.string().min(1).optional(),
  start_date: z.string().optional(),
  status: z.enum(['draft', 'on-sale', 'sold-out']).optional(),
  price_range: z.enum(['$', '$$', '$$$']).optional(),
  genres: z.array(z.string()).optional(),
  experience_tags: z.array(z.string()).optional(),
});

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from('gvteway_events').select('*').eq('id', params.id).single();
    if (error) {
      if (error.message?.includes('does not exist') || error.code === '42P01') {
        return NextResponse.json({ event: null });
      }
      if (error.code === 'PGRST116') return NextResponse.json({ error: 'Event not found' }, { status: 404 });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ event: data });
  } catch (error) {
    const msg = error instanceof Error ? error.message : '';
    if (msg.includes('does not exist') || msg.includes('42P01')) {
      return NextResponse.json({ event: null });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const payload = updateEventSchema.parse(body);
    const { data, error } = await supabase.from('gvteway_events').update(payload).eq('id', params.id).select().single();
    if (error) {
      if (error.message?.includes('does not exist') || error.code === '42P01') {
        return NextResponse.json({ event: null });
      }
      if (error.code === 'PGRST116') return NextResponse.json({ error: 'Event not found' }, { status: 404 });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ event: data });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: error.issues }, { status: 422 });
    const msg = error instanceof Error ? error.message : '';
    if (msg.includes('does not exist') || msg.includes('42P01')) {
      return NextResponse.json({ event: null });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from('gvteway_events').delete().eq('id', params.id);
    if (error) {
      if (error.message?.includes('does not exist') || error.code === '42P01') {
        return NextResponse.json({ success: true });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : '';
    if (msg.includes('does not exist') || msg.includes('42P01')) {
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
