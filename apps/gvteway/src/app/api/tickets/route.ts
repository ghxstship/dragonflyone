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

const createTicketSchema = z.object({
  order_id: z.string().uuid(),
  event_id: z.string().uuid(),
  ticket_type: z.string(),
  price: z.number().min(0),
  status: z.enum(['valid', 'used', 'cancelled', 'refunded']).default('valid'),
});

export const GET = apiRoute(
  async (request: NextRequest, context: any) => {
    try {
      const supabase = getSupabaseClient();
      const { searchParams } = new URL(request.url);
      const orderId = searchParams.get('order_id');
      const userId = searchParams.get('user_id') || context.user?.id;

      let query = supabase.from('tickets').select('*, orders(*), events(*)');

      if (orderId) query = query.eq('order_id', orderId);
      if (userId) query = query.eq('orders.user_id', userId);

      const { data, error } = await query;
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ tickets: data });
    } catch (error: any) {
      return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
  },
  {
    auth: true,
    rateLimit: { maxRequests: 100, windowMs: 60000 },
    audit: { action: 'tickets:view', resource: 'tickets' },
  }
);

export const POST = apiRoute(
  async (request: NextRequest, context: any) => {
    try {
      const supabase = getSupabaseClient();
      const payload = context.validated;
      const { data, error } = await supabase.from('tickets').insert({
        ...payload,
        created_by: context.user?.id,
      }).select().single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ticket: data }, { status: 201 });
    } catch (error: any) {
      return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
  },
  {
    auth: true,
    roles: [PlatformRole.GVTEWAY_ADMIN],
    validation: createTicketSchema,
    rateLimit: { maxRequests: 50, windowMs: 60000 },
    audit: { action: 'ticket:create', resource: 'tickets' },
  }
);
