import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const createAddOnSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  category: z.string(),
  price: z.number().min(0),
  price_type: z.enum(['flat', 'per_person', 'per_hour', 'per_unit']).default('flat'),
  min_quantity: z.number().min(1).default(1),
  max_quantity: z.number().min(1).optional(),
  available_for_event_types: z.array(z.string()).optional(),
  requires_advance_notice_hours: z.number().min(0).optional(),
  is_active: z.boolean().default(true),
});

const ATLVS_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function GET(request: NextRequest) {
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);

    const category = searchParams.get('category');
    const eventType = searchParams.get('event_type');
    const maxPrice = searchParams.get('max_price');

    let query = supabase
      .from('booking_add_ons')
      .select(`
        id,
        name,
        description,
        category,
        price,
        price_type,
        min_quantity,
        max_quantity,
        available_for_event_types,
        requires_advance_notice_hours,
        is_active,
        created_at
      `)
      .eq('is_active', true)
      .order('category', { ascending: true })
      .order('name', { ascending: true });

    if (category) {
      query = query.eq('category', category);
    }
    if (eventType) {
      query = query.or(`available_for_event_types.cs.{${eventType}},available_for_event_types.is.null`);
    }
    if (maxPrice) {
      query = query.lte('price', parseFloat(maxPrice));
    }

    const { data: addOns, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch add-ons' },
        { status: 500 }
      );
    }

    // Group by category
    const byCategory: Record<string, typeof addOns> = {};
    addOns?.forEach((addOn) => {
      if (!byCategory[addOn.category]) {
        byCategory[addOn.category] = [];
      }
      byCategory[addOn.category].push(addOn);
    });

    return NextResponse.json({
      add_ons: addOns || [],
      by_category: byCategory,
      count: addOns?.length || 0,
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
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = createAdminClient();

    const body = await request.json();
    const validatedData = createAddOnSchema.parse(body);

    const { data: addOn, error } = await supabase
      .from('booking_add_ons')
      .insert({
        name: validatedData.name,
        description: validatedData.description || null,
        category: validatedData.category,
        price: validatedData.price,
        price_type: validatedData.price_type,
        min_quantity: validatedData.min_quantity,
        max_quantity: validatedData.max_quantity || null,
        available_for_event_types: validatedData.available_for_event_types || null,
        requires_advance_notice_hours: validatedData.requires_advance_notice_hours || null,
        is_active: validatedData.is_active,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to create add-on' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      add_on: addOn,
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
