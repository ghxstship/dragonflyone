import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const createPackageSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  event_types: z.array(z.string()).optional(),
  base_price: z.number().min(0),
  min_guests: z.number().min(1).optional(),
  max_guests: z.number().min(1).optional(),
  duration_hours: z.number().min(1).optional(),
  included_items: z.array(z.object({
    name: z.string(),
    category: z.string(),
    quantity: z.number().default(1),
  })).optional(),
  optional_add_ons: z.array(z.string().uuid()).optional(),
  is_featured: z.boolean().default(false),
  is_active: z.boolean().default(true),
});

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);

    const eventType = searchParams.get('event_type');
    const minGuests = searchParams.get('min_guests');
    const maxPrice = searchParams.get('max_price');
    const featured = searchParams.get('featured') === 'true';

    let query = supabase
      .from('booking_packages')
      .select(`
        id,
        name,
        description,
        event_types,
        base_price,
        min_guests,
        max_guests,
        duration_hours,
        included_items,
        optional_add_ons,
        is_featured,
        is_active,
        created_at
      `)
      .eq('is_active', true)
      .order('base_price', { ascending: true });

    if (eventType) {
      query = query.contains('event_types', [eventType]);
    }
    if (minGuests) {
      query = query.gte('max_guests', parseInt(minGuests));
    }
    if (maxPrice) {
      query = query.lte('base_price', parseFloat(maxPrice));
    }
    if (featured) {
      query = query.eq('is_featured', true);
    }

    const { data: packages, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch packages' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      packages: packages || [],
      count: packages?.length || 0,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient();

    const body = await request.json();
    const validatedData = createPackageSchema.parse(body);

    const { data: pkg, error } = await supabase
      .from('booking_packages')
      .insert({
        name: validatedData.name,
        description: validatedData.description || null,
        event_types: validatedData.event_types || [],
        base_price: validatedData.base_price,
        min_guests: validatedData.min_guests || null,
        max_guests: validatedData.max_guests || null,
        duration_hours: validatedData.duration_hours || null,
        included_items: validatedData.included_items || [],
        optional_add_ons: validatedData.optional_add_ons || [],
        is_featured: validatedData.is_featured,
        is_active: validatedData.is_active,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to create package' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      package: pkg,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
