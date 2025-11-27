import { NextRequest, NextResponse } from 'next/server';
import { apiRoute } from '@ghxstship/config/middleware';
import { PlatformRole } from '@ghxstship/config/roles';
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

const createOrderSchema = z.object({
  user_id: z.string().uuid(),
  event_id: z.string().uuid(),
  total_amount: z.number().min(0),
  status: z.enum(['pending', 'completed', 'cancelled', 'refunded']).default('pending'),
  payment_intent_id: z.string().optional(),
  metadata: z.record(z.unknown()).default({}),
});

export const GET = apiRoute(
  async (request: NextRequest, context: any) => {
    try {
      const supabase = getSupabaseClient();
      const { searchParams } = new URL(request.url);
      const userId = searchParams.get('user_id') || context.user?.id;
      const eventId = searchParams.get('event_id');
      const status = searchParams.get('status');
      const limit = parseInt(searchParams.get('limit') || '50');
      const offset = parseInt(searchParams.get('offset') || '0');

      let query = supabase.from('orders').select('*, events(*)', { count: 'exact' })
        .order('created_at', { ascending: false }).range(offset, offset + limit - 1);

      if (userId) query = query.eq('user_id', userId);
      if (eventId) query = query.eq('event_id', eventId);
      if (status) query = query.eq('status', status);

      const { data, error, count } = await query;
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ orders: data, total: count, limit, offset });
    } catch (error: any) {
      return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
  },
  {
    auth: true,
    rateLimit: { maxRequests: 100, windowMs: 60000 },
    audit: { action: 'orders:view', resource: 'orders' },
  }
);

export const POST = apiRoute(
  async (request: NextRequest, context: any) => {
    try {
      const supabase = getSupabaseClient();
      const payload = context.validated;
      const { data, error } = await supabase.from('orders').insert({
        ...payload,
        created_by: context.user?.id,
      }).select().single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ order: data }, { status: 201 });
    } catch (error: any) {
      return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
  },
  {
    auth: true,
    validation: createOrderSchema,
    rateLimit: { maxRequests: 50, windowMs: 60000 },
    audit: { action: 'order:create', resource: 'orders' },
  }
);
