import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const createHoldSchema = z.object({
  date: z.string(),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  client_id: z.string().uuid().optional(),
  client_name: z.string().optional(),
  hold_type: z.enum(['first_option', 'second_option', 'tentative', 'internal']).default('first_option'),
  expires_at: z.string().optional(),
  notes: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createAdminClient();
    const spaceId = params.id;

    const body = await request.json();
    const validatedData = createHoldSchema.parse(body);

    // Check if space exists
    const { data: space, error: spaceError } = await supabase
      .from('spaces')
      .select('id, name')
      .eq('id', spaceId)
      .single();

    if (spaceError || !space) {
      return NextResponse.json(
        { error: 'Space not found' },
        { status: 404 }
      );
    }

    // Check for conflicts on this date
    const { data: existingHolds } = await supabase
      .from('space_holds')
      .select('id, hold_type, client_name')
      .eq('space_id', spaceId)
      .eq('date', validatedData.date)
      .eq('status', 'active');

    // Check hold priority
    if (existingHolds && existingHolds.length > 0) {
      const hasFirstOption = existingHolds.some(h => h.hold_type === 'first_option');
      if (hasFirstOption && validatedData.hold_type === 'first_option') {
        return NextResponse.json(
          { error: 'First option hold already exists for this date', existing_hold: existingHolds[0] },
          { status: 409 }
        );
      }
    }

    // Calculate expiration (default 48 hours if not specified)
    const expiresAt = validatedData.expires_at 
      ? new Date(validatedData.expires_at)
      : new Date(Date.now() + 48 * 60 * 60 * 1000);

    // Create hold
    const { data: hold, error: createError } = await supabase
      .from('space_holds')
      .insert({
        space_id: spaceId,
        date: validatedData.date,
        start_time: validatedData.start_time || null,
        end_time: validatedData.end_time || null,
        client_id: validatedData.client_id || null,
        client_name: validatedData.client_name || null,
        hold_type: validatedData.hold_type,
        status: 'active',
        expires_at: expiresAt.toISOString(),
        notes: validatedData.notes || null,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (createError) {
      return NextResponse.json(
        { error: 'Failed to create hold' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      hold,
      space: { id: space.id, name: space.name },
      expires_at: expiresAt.toISOString(),
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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createAdminClient();
    const spaceId = params.id;
    const { searchParams } = new URL(request.url);

    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const status = searchParams.get('status') || 'active';

    let query = supabase
      .from('space_holds')
      .select(`
        id,
        date,
        start_time,
        end_time,
        client_id,
        client:clients(id, name),
        client_name,
        hold_type,
        status,
        expires_at,
        notes,
        created_at
      `)
      .eq('space_id', spaceId);

    if (status !== 'all') {
      query = query.eq('status', status);
    }
    if (startDate) {
      query = query.gte('date', startDate);
    }
    if (endDate) {
      query = query.lte('date', endDate);
    }

    query = query.order('date', { ascending: true });

    const { data: holds, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch holds' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      holds: holds || [],
      count: holds?.length || 0,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
