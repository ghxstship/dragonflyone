export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { apiRoute } from '@ghxstship/config/middleware';
import { PlatformRole } from '@ghxstship/config/roles';
import { logger } from '@ghxstship/config';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Schema for creating venues (stored in legend_places with place_type='venue')
const createVenueSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  capacity: z.number().min(0).optional(),
  organization_id: z.string().uuid(),
  metadata: z.object({
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    address: z.string().optional(),
    postal_code: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional(),
    website: z.string().url().optional(),
    amenities: z.array(z.string()).optional(),
    accessibility_features: z.array(z.string()).optional(),
  }).optional(),
});

// GET /api/venues - List venues from legend_places with place_type='venue'
export const GET = apiRoute(
  async (request: NextRequest) => {
    try {
      const supabase = getSupabaseClient();
      const { searchParams } = new URL(request.url);
      const city = searchParams.get('city');
      const limit = parseInt(searchParams.get('limit') || '50');
      const offset = parseInt(searchParams.get('offset') || '0');

      // Query legend_places filtered by place_type='venue' - 3NF compliant
      let query = supabase
        .from('legend_places')
        .select('*', { count: 'exact' })
        .eq('place_type', 'venue')
        .eq('status', 'active')
        .order('name')
        .range(offset, offset + limit - 1);

      // Filter by city from metadata
      if (city) {
        query = query.eq('metadata->city', city);
      }

      const { data, error, count } = await query;
      
      if (error) {
        logger.error('Error fetching venues from legend_places:', error);
        return NextResponse.json({ venues: [], total: 0, limit, offset });
      }

      return NextResponse.json({ venues: data, total: count, limit, offset });
    } catch (error) {
      logger.error('Error in GET /api/venues:', error instanceof Error ? error : undefined);
      return NextResponse.json({ venues: [], total: 0, limit: 50, offset: 0 });
    }
  },
  {
    auth: false,
    rateLimit: { maxRequests: 200, windowMs: 60000 },
  }
);

// POST /api/venues - Create venue in legend_places with place_type='venue'
export const POST = apiRoute(
  async (request: NextRequest, context) => {
    try {
      const supabase = getSupabaseClient();
      const payload = context.validated as z.infer<typeof createVenueSchema>;
      
      const { data, error } = await supabase
        .from('legend_places')
        .insert({
          organization_id: payload.organization_id,
          name: payload.name,
          description: payload.description,
          place_type: 'venue',
          capacity: payload.capacity,
          metadata: payload.metadata || {},
          status: 'active',
          created_by: context.user?.id,
        })
        .select()
        .single();

      if (error) {
        logger.error('Error creating venue in legend_places:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ venue: data }, { status: 201 });
    } catch (error) {
      logger.error('Error in POST /api/venues:', error instanceof Error ? error : undefined);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  },
  {
    auth: true,
    roles: [PlatformRole.GVTEWAY_ADMIN, PlatformRole.GVTEWAY_VENUE_MANAGER],
    validation: createVenueSchema,
    rateLimit: { maxRequests: 20, windowMs: 60000 },
    audit: { action: 'venue:create', resource: 'legend_places' },
  }
);
