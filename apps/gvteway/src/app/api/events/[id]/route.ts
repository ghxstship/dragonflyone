export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { apiRoute } from '@ghxstship/config/middleware';
import { PlatformRole } from '@ghxstship/config/roles';
import { supabaseAdmin } from '@/lib/supabase';

const updateEventSchema = z.object({
  title: z.string().min(3).optional(),
  headliner: z.string().min(1).optional(),
  venue: z.string().min(1).optional(),
  city: z.string().min(1).optional(),
  start_date: z.string().optional(),
  status: z.enum(['draft', 'on-sale', 'sold-out', 'published', 'cancelled']).optional(),
  price_range: z.enum(['$', '$$', '$$$']).optional(),
  genres: z.array(z.string()).optional(),
  experience_tags: z.array(z.string()).optional(),
});

// GET - Public endpoint to fetch single event
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { data, error } = await supabaseAdmin
      .from('events')
      .select(`
        *,
        ticket_types (*)
      `)
      .eq('id', params.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform data for frontend compatibility
    const event = {
      ...data,
      title: data.name,
      venue: data.venue_name,
      city: data.venue_city,
      event_date: data.start_date,
      event_time: data.start_time,
      genre: data.category,
    };

    return NextResponse.json({ event });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Authenticated endpoint to update event (Admin only)
export const PATCH = apiRoute(
  async (request: NextRequest, context: Record<string, unknown>) => {
    const params = context.params as { id: string };
    const payload = context.validated as z.infer<typeof updateEventSchema>;
    
    // Map frontend fields to database schema
    const dbPayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (payload.title) dbPayload.name = payload.title;
    if (payload.headliner) dbPayload.description = `${payload.headliner} performance`;
    if (payload.venue) dbPayload.venue_name = payload.venue;
    if (payload.city) dbPayload.venue_city = payload.city;
    if (payload.start_date) dbPayload.start_date = payload.start_date;
    if (payload.status) {
      dbPayload.status = payload.status === 'on-sale' ? 'published' : payload.status === 'sold-out' ? 'sold_out' : payload.status;
    }
    if (payload.genres) dbPayload.genres = payload.genres;
    if (payload.experience_tags) dbPayload.tags = payload.experience_tags;

    const { data, error } = await supabaseAdmin
      .from('events')
      .update(dbPayload)
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ event: data });
  },
  {
    auth: true,
    roles: [PlatformRole.GVTEWAY_ADMIN],
    validation: updateEventSchema,
    rateLimit: { maxRequests: 50, windowMs: 60000 },
    audit: { action: 'event:update', resource: 'events' },
  }
);

// DELETE - Authenticated endpoint to delete event (Admin only)
export const DELETE = apiRoute(
  async (request: NextRequest, context: Record<string, unknown>) => {
    const params = context.params as { id: string };
    
    const { error } = await supabaseAdmin
      .from('events')
      .delete()
      .eq('id', params.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true }, { status: 200 });
  },
  {
    auth: true,
    roles: [PlatformRole.GVTEWAY_ADMIN],
    rateLimit: { maxRequests: 20, windowMs: 60000 },
    audit: { action: 'event:delete', resource: 'events' },
  }
);
