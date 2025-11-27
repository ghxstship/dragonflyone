import { NextRequest, NextResponse } from 'next/server';
import { apiRoute } from '@ghxstship/config/middleware';
import { PlatformRole } from '@ghxstship/config/roles';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const createEventSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  venue_id: z.string().uuid(),
  start_date: z.string(),
  end_date: z.string().optional(),
  status: z.enum(['draft', 'published', 'cancelled', 'completed']).default('draft'),
  capacity: z.number().positive().optional(),
  age_restriction: z.number().min(0).max(21).optional(),
  genres: z.array(z.string()).default([]),
});

export const GET = apiRoute(
  async (request: NextRequest) => {
    try {
      const supabase = getSupabaseClient();
      const { searchParams } = new URL(request.url);
      
      const status = searchParams.get('status');
      const venueId = searchParams.get('venue_id');
      const genre = searchParams.get('genre');
      const limit = parseInt(searchParams.get('limit') || '50');
      const offset = parseInt(searchParams.get('offset') || '0');

      let query = supabase
        .from('events')
        .select('*, venues(*), ticket_types(*)', { count: 'exact' })
        .order('start_date', { ascending: true })
        .range(offset, offset + limit - 1);

      if (status) {
        query = query.eq('status', status);
      }

      if (venueId) {
        query = query.eq('venue_id', venueId);
      }

      if (genre) {
        query = query.contains('genres', [genre]);
      }

      const { data, error, count } = await query;

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ 
        events: data, 
        total: count,
        limit,
        offset
      });
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

      const { data, error } = await supabase
        .from('events')
        .insert({
          ...payload,
          created_by: context.user?.id,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ event: data }, { status: 201 });
    } catch (error: any) {
      return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
  },
  {
    auth: true,
    roles: [PlatformRole.GVTEWAY_ADMIN, PlatformRole.GVTEWAY_EXPERIENCE_CREATOR],
    validation: createEventSchema,
    rateLimit: { maxRequests: 20, windowMs: 60000 },
    audit: { action: 'event:create', resource: 'events' },
  }
);
