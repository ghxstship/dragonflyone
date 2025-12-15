export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { apiRoute } from '@ghxstship/config/middleware';
import { PlatformRole } from '@ghxstship/config/roles';
import { z } from "zod";

import { gvtewayEvents } from "../../../data/gvteway";
import { supabaseAdmin } from "../../../lib/supabase";

export const GET = apiRoute(
  async (request: NextRequest) => {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || searchParams.get('q');
    const category = searchParams.get('category');
    const status = searchParams.get('status') || 'published';
    const trending = searchParams.get('trending');
    const recommended = searchParams.get('recommended');
    const nearby = searchParams.get('nearby');
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    let dbQuery = supabaseAdmin
      .from('events')
      .select('*', { count: 'exact' })
      .order('start_date', { ascending: true });

    // Apply filters
    if (status && status !== 'all') {
      dbQuery = dbQuery.eq('status', status);
    }
    if (category && category !== 'all') {
      dbQuery = dbQuery.eq('category', category);
    }
    if (query) {
      dbQuery = dbQuery.or(`name.ilike.%${query}%,description.ilike.%${query}%,venue_name.ilike.%${query}%,venue_city.ilike.%${query}%`);
    }
    if (trending === 'true') {
      dbQuery = dbQuery.eq('is_featured', true);
    }
    if (recommended === 'true') {
      // Recommended events: featured or high ticket sales, ordered by popularity
      dbQuery = dbQuery.or('is_featured.eq.true,tickets_sold.gt.100');
    }
    if (nearby === 'true') {
      // Nearby events: filter by common US cities (would need user location in production)
      // For now, show events from major metro areas as "nearby" placeholder
      dbQuery = dbQuery.in('venue_city', ['New York', 'Los Angeles', 'Chicago', 'Miami', 'Austin', 'Seattle']);
    }

    // Apply pagination
    dbQuery = dbQuery.range(offset, offset + limit - 1);

    const { data, error, count } = await dbQuery;

    if (error) {
      // Fallback to demo data on error for graceful degradation
      const fallbackEvents = gvtewayEvents.map(e => ({
        id: e.id,
        name: e.title,
        title: e.title,
        description: `${e.headliner} at ${e.venue}`,
        venue_name: e.venue,
        venue: e.venue,
        venue_city: e.city,
        city: e.city,
        start_date: e.startDate,
        date: e.startDate,
        status: e.status === 'on-sale' ? 'published' : e.status,
        category: e.genres[0] || 'concert',
        is_featured: e.isTrending,
        price: e.priceRange === '$' ? 50 : e.priceRange === '$$' ? 150 : 300,
        image_url: null,
      }));
      return NextResponse.json({ events: fallbackEvents, total: fallbackEvents.length, source: 'fallback' });
    }

    // Transform data for frontend compatibility
    const events = (data || []).map(event => ({
      ...event,
      title: event.name,
      venue: event.venue_name,
      city: event.venue_city,
      date: event.start_date,
      price: event.min_price || 0,
      image: event.image_url,
    }));

    return NextResponse.json({ events, total: count || events.length, source: 'database' });
  },
  {
    auth: false,
    rateLimit: { maxRequests: 200, windowMs: 60000 },
  }
);

const createEventSchema = z.object({
  title: z.string().min(3),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  headliner: z.string().min(1),
  venue: z.string().min(1),
  city: z.string().min(1),
  startDate: z.string().min(1),
  status: z.enum(["draft", "on-sale", "sold-out"]),
  priceRange: z.enum(["$", "$$", "$$$"])
    .optional()
    .default("$$"),
  genres: z.array(z.string()).default([]),
  experienceTags: z.array(z.string()).default([]),
});

export const POST = apiRoute(
  async (request: NextRequest, context: Record<string, unknown>) => {
    try {
      const payload = context.validated as z.infer<typeof createEventSchema>;
      const user = context.user as { id?: string } | undefined;

      // Map the input to the real events table schema
      const { data, error } = await supabaseAdmin
        .from("events")
        .insert({
          name: payload.title,
          slug: payload.slug,
          description: `${payload.headliner} performance`,
          venue_name: payload.venue,
          venue_city: payload.city,
          start_date: payload.startDate,
          status: payload.status === 'on-sale' ? 'published' : payload.status === 'sold-out' ? 'sold_out' : 'draft',
          category: payload.genres[0] || 'concert',
          genres: payload.genres,
          tags: payload.experienceTags,
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message || 'Failed to create event' }, { status: 500 });
      }

      return NextResponse.json({ event: data }, { status: 201 });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unable to create event';
      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
  },
  {
    auth: true,
    roles: [PlatformRole.GVTEWAY_ADMIN],
    validation: createEventSchema,
    rateLimit: { maxRequests: 20, windowMs: 60000 },
    audit: { action: 'event:create', resource: 'events' },
  }
);
