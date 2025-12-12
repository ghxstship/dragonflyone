export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@ghxstship/config/supabase-types';
import { z } from 'zod';

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const EventCreateSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  organization_id: z.string().uuid(),
  venue_id: z.string().uuid().optional(),
  start_date: z.string(),
  end_date: z.string().optional(),
  timezone: z.string().optional(),
  event_type: z.string().optional(),
  category: z.string().optional(),
  capacity: z.number().int().positive().optional(),
  is_public: z.boolean().optional(),
  created_by: z.string().uuid(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = EventCreateSchema.parse(body);

    const { data: event, error } = await supabase
      .from('events')
      .insert({
        name: validatedData.name,
        description: validatedData.description,
        organization_id: validatedData.organization_id,
        venue_id: validatedData.venue_id,
        start_date: validatedData.start_date,
        end_date: validatedData.end_date,
        timezone: validatedData.timezone || 'America/New_York',
        event_type: validatedData.event_type,
        category: validatedData.category,
        capacity: validatedData.capacity,
        is_public: validatedData.is_public ?? true,
        status: 'draft',
        created_by: validatedData.created_by,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}
