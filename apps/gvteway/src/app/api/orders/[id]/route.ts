import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
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

const updateOrderSchema = z.object({
  status: z.enum(['pending', 'completed', 'cancelled', 'refunded']).optional(),
  payment_intent_id: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from('orders').select('*, gvteway_events(*)').eq('id', params.id).single();
    if (error) {
      if (error.code === 'PGRST116') return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ order: data });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const payload = updateOrderSchema.parse(body);
    const { data, error } = await supabase.from('orders').update(payload).eq('id', params.id).select().single();
    if (error) {
      if (error.code === 'PGRST116') return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ order: data });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: error.issues }, { status: 422 });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
