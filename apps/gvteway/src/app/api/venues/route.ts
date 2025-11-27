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

const createVenueSchema = z.object({
  name: z.string().min(1),
  city: z.string().min(1),
  capacity: z.number().min(0).optional(),
  address: z.string().optional(),
  metadata: z.record(z.unknown()).default({}),
});

export const GET = apiRoute(
  async (request: NextRequest) => {
    try {
      const supabase = getSupabaseClient();
      const { searchParams } = new URL(request.url);
      const city = searchParams.get('city');
      const limit = parseInt(searchParams.get('limit') || '50');
      const offset = parseInt(searchParams.get('offset') || '0');

      let query = supabase.from('venues').select('*', { count: 'exact' })
        .order('name').range(offset, offset + limit - 1);

      if (city) query = query.eq('city', city);

      const { data, error, count } = await query;
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ venues: data, total: count, limit, offset });
    } catch (error: any) {
      return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
  },
  {
    auth: false,
    rateLimit: { maxRequests: 200, windowMs: 60000 },
  }
);

export const POST = apiRoute(
  async (request: NextRequest, context: any) => {
    try {
      const supabase = getSupabaseClient();
      const payload = context.validated;
      const { data, error } = await supabase.from('venues').insert({
        ...payload,
        created_by: context.user?.id,
      }).select().single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ venue: data }, { status: 201 });
    } catch (error: any) {
      return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
  },
  {
    auth: true,
    roles: [PlatformRole.GVTEWAY_ADMIN, PlatformRole.GVTEWAY_VENUE_MANAGER],
    validation: createVenueSchema,
    rateLimit: { maxRequests: 20, windowMs: 60000 },
    audit: { action: 'venue:create', resource: 'venues' },
  }
);
