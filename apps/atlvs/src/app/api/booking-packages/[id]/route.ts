import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const updatePackageSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  event_types: z.array(z.string()).optional(),
  base_price: z.number().min(0).optional(),
  min_guests: z.number().min(1).optional().nullable(),
  max_guests: z.number().min(1).optional().nullable(),
  duration_hours: z.number().min(1).optional().nullable(),
  included_items: z.array(z.object({
    name: z.string(),
    category: z.string(),
    quantity: z.number().default(1),
  })).optional(),
  optional_add_ons: z.array(z.string().uuid()).optional(),
  is_featured: z.boolean().optional(),
  is_active: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createAdminClient();
    const { id } = params;

    const { data: pkg, error } = await supabase
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
        created_at,
        updated_at
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Package not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to fetch package' },
        { status: 500 }
      );
    }

    return NextResponse.json({ package: pkg });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createAdminClient();
    const { id } = params;

    const body = await request.json();
    const validatedData = updatePackageSchema.parse(body);

    const updateData: Record<string, unknown> = {
      ...validatedData,
      updated_at: new Date().toISOString(),
    };

    const { data: pkg, error } = await supabase
      .from('booking_packages')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Package not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to update package' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      package: pkg,
    });
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createAdminClient();
    const { id } = params;

    // Soft delete by setting is_active to false
    const { error } = await supabase
      .from('booking_packages')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete package' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
