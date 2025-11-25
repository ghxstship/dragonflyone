import { NextRequest, NextResponse } from "next/server";
import { apiRoute } from '@ghxstship/config/middleware';
import { PlatformRole } from '@ghxstship/config/roles';
import { z } from "zod";

import { gvtewayEvents } from "../../../data/gvteway";
import { supabaseAdmin } from "../../../lib/supabase";

type Params = {
  query?: string;
  priceRange?: string;
  nearbyOnly?: string;
  lastMinuteOnly?: string;
  trendingOnly?: string;
  newOnly?: string;
};

export const GET = apiRoute(
  async (request: NextRequest) => {
    const { searchParams } = new URL(request.url);
    const params: Params = Object.fromEntries(searchParams.entries());

    const events = gvtewayEvents.filter((event) => {
      if (params.query && !`${event.title} ${event.headliner} ${event.city}`.toLowerCase().includes(params.query.toLowerCase())) {
        return false;
      }
      if (params.priceRange && params.priceRange !== "all" && event.priceRange !== params.priceRange) {
        return false;
      }
      if (params.nearbyOnly === "true" && event.distanceMiles > 50) {
        return false;
      }
      if (params.lastMinuteOnly === "true" && !event.hasLastMinuteOffers) {
        return false;
      }
      if (params.trendingOnly === "true" && !event.isTrending) {
        return false;
      }
      if (params.newOnly === "true" && !event.isNew) {
        return false;
      }
      return true;
    });

    return NextResponse.json({ events });
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
  async (request: NextRequest, context: any) => {
    try {
      const payload = context.validated;

      const { data, error } = await supabaseAdmin
        .from("gvteway_events")
        .insert({
          title: payload.title,
          slug: payload.slug,
          headliner: payload.headliner,
          venue: payload.venue,
          city: payload.city,
          start_date: payload.startDate,
          status: payload.status,
          price_range: payload.priceRange,
          genres: payload.genres,
          experience_tags: payload.experienceTags,
          created_by: context.user?.id,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ event: data }, { status: 201 });
    } catch (error: any) {
      return NextResponse.json({ error: error.message || 'Unable to create event' }, { status: 500 });
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
