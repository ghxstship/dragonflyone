export const dynamic = 'force-dynamic';

import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const draftSchema = z.object({
  client_id: z.string().uuid().optional(),
  client_name: z.string().optional(),
  client_email: z.string().email().optional(),
  event_name: z.string().optional(),
  event_type: z.string().optional(),
  event_date: z.string().optional(),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  venue_id: z.string().uuid().optional(),
  space_ids: z.array(z.string().uuid()).optional(),
  guest_count: z.number().min(1).optional(),
  notes: z.string().optional(),
  line_items: z.array(z.object({
    name: z.string(),
    quantity: z.number(),
    unit_price: z.number(),
    category: z.string().optional(),
  })).optional(),
});

const ATLVS_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function POST(request: NextRequest) {
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = draftSchema.parse(body);

    // Generate draft booking number
    const timestamp = Date.now().toString(36).toUpperCase();
    const draftNumber = `DRAFT-${timestamp}`;

    // Calculate totals if line items provided
    let subtotal = 0;
    if (validatedData.line_items) {
      subtotal = validatedData.line_items.reduce(
        (sum, item) => sum + (item.quantity * item.unit_price),
        0
      );
    }

    // Create draft booking
    const { data: draft, error: createError } = await supabase
      .from('bookings')
      .insert({
        booking_number: draftNumber,
        status: 'draft',
        client_id: validatedData.client_id || null,
        event_name: validatedData.event_name || 'Untitled Event',
        event_type: validatedData.event_type || null,
        event_date: validatedData.event_date || null,
        start_time: validatedData.start_time || null,
        end_time: validatedData.end_time || null,
        venue_id: validatedData.venue_id || null,
        guest_count_expected: validatedData.guest_count || null,
        notes: validatedData.notes || null,
        subtotal,
        total: subtotal,
        is_draft: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (createError) {
      return NextResponse.json(
        { error: 'Failed to save draft' },
        { status: 500 }
      );
    }

    // Save line items if provided
    if (validatedData.line_items && validatedData.line_items.length > 0) {
      const lineItems = validatedData.line_items.map((item, index) => ({
        booking_id: draft.id,
        name: item.name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.quantity * item.unit_price,
        category: item.category || 'general',
        sort_order: index,
        created_at: new Date().toISOString(),
      }));

      await supabase.from('booking_line_items').insert(lineItems);
    }

    // Save space associations if provided
    if (validatedData.space_ids && validatedData.space_ids.length > 0) {
      const spaceAssociations = validatedData.space_ids.map(spaceId => ({
        booking_id: draft.id,
        space_id: spaceId,
        created_at: new Date().toISOString(),
      }));

      await supabase.from('booking_spaces').insert(spaceAssociations);
    }

    return NextResponse.json({
      success: true,
      draft,
      message: 'Draft saved successfully',
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

export async function GET() {
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get all draft bookings
    const { data: drafts, error } = await supabase
      .from('bookings')
      .select(`
        id,
        booking_number,
        event_name,
        event_date,
        client_id,
        client:clients(id, name),
        status,
        total,
        created_at,
        updated_at
      `)
      .eq('is_draft', true)
      .order('updated_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch drafts' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      drafts: drafts || [],
      count: drafts?.length || 0,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
