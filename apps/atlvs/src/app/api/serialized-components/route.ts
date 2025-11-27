import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const componentSchema = z.object({
  asset_id: z.string().uuid().optional(),
  serial_number: z.string().min(1).max(100),
  component_type: z.string().min(1).max(100),
  manufacturer: z.string().max(255).optional(),
  model: z.string().max(255).optional(),
  part_number: z.string().max(100).optional(),
  firmware_version: z.string().max(50).optional(),
  hardware_revision: z.string().max(50).optional(),
  manufacture_date: z.string().optional(),
  purchase_date: z.string().optional(),
  warranty_expiration: z.string().optional(),
  status: z.enum(['active', 'in_repair', 'retired', 'lost', 'disposed']).default('active'),
  condition: z.enum(['new', 'excellent', 'good', 'fair', 'poor', 'non_functional']).default('good'),
  location_id: z.string().uuid().optional(),
  parent_component_id: z.string().uuid().optional(),
  specifications: z.record(z.any()).optional(),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const { searchParams } = new URL(request.url);
    const asset_id = searchParams.get('asset_id');
    const status = searchParams.get('status');
    const component_type = searchParams.get('component_type');
    const serial_number = searchParams.get('serial_number');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    let query = supabase
      .from('serialized_components')
      .select(`
        *,
        asset:assets(id, name, asset_tag),
        location:asset_locations(id, name, building),
        parent_component:serialized_components!parent_component_id(id, serial_number, component_type)
      `, { count: 'exact' });

    if (asset_id) {
      query = query.eq('asset_id', asset_id);
    }
    if (status) {
      query = query.eq('status', status);
    }
    if (component_type) {
      query = query.ilike('component_type', `%${component_type}%`);
    }
    if (serial_number) {
      query = query.ilike('serial_number', `%${serial_number}%`);
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching serialized components:', error);
    return NextResponse.json(
      { error: 'Failed to fetch serialized components' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const body = await request.json();
    const validated = componentSchema.parse(body);

    // Check for duplicate serial number
    const { data: existing } = await supabase
      .from('serialized_components')
      .select('id')
      .eq('serial_number', validated.serial_number)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Serial number already exists' },
        { status: 409 }
      );
    }

    const { data, error } = await supabase
      .from('serialized_components')
      .insert(validated)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating serialized component:', error);
    return NextResponse.json(
      { error: 'Failed to create serialized component' },
      { status: 500 }
    );
  }
}
