import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const updateSchema = z.object({
  asset_id: z.string().uuid().optional().nullable(),
  serial_number: z.string().min(1).max(100).optional(),
  component_type: z.string().min(1).max(100).optional(),
  manufacturer: z.string().max(255).optional().nullable(),
  model: z.string().max(255).optional().nullable(),
  part_number: z.string().max(100).optional().nullable(),
  firmware_version: z.string().max(50).optional().nullable(),
  hardware_revision: z.string().max(50).optional().nullable(),
  manufacture_date: z.string().optional().nullable(),
  purchase_date: z.string().optional().nullable(),
  warranty_expiration: z.string().optional().nullable(),
  status: z.enum(['active', 'in_repair', 'retired', 'lost', 'disposed']).optional(),
  condition: z.enum(['new', 'excellent', 'good', 'fair', 'poor', 'non_functional']).optional(),
  location_id: z.string().uuid().optional().nullable(),
  parent_component_id: z.string().uuid().optional().nullable(),
  specifications: z.record(z.any()).optional(),
  notes: z.string().optional().nullable(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createAdminClient();
  try {
    const { data, error } = await supabase
      .from('serialized_components')
      .select(`
        *,
        asset:assets(id, name, asset_tag, category),
        location:asset_locations(id, name, building, floor),
        parent_component:serialized_components!parent_component_id(id, serial_number, component_type),
        child_components:serialized_components!serialized_components_parent_component_id_fkey(id, serial_number, component_type, status),
        service_history:component_service_history(
          id, service_type, service_date, service_provider, description, cost, next_service_date
        ),
        transfers:component_transfers(
          id, transfer_type, transfer_date, reason,
          from_asset:assets!from_asset_id(id, name),
          to_asset:assets!to_asset_id(id, name)
        )
      `)
      .eq('id', params.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Component not found' },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error fetching serialized component:', error);
    return NextResponse.json(
      { error: 'Failed to fetch serialized component' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createAdminClient();
  try {
    const body = await request.json();
    const validated = updateSchema.parse(body);

    // If updating serial number, check for duplicates
    if (validated.serial_number) {
      const { data: existing } = await supabase
        .from('serialized_components')
        .select('id')
        .eq('serial_number', validated.serial_number)
        .neq('id', params.id)
        .single();

      if (existing) {
        return NextResponse.json(
          { error: 'Serial number already exists' },
          { status: 409 }
        );
      }
    }

    const { data, error } = await supabase
      .from('serialized_components')
      .update(validated)
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Component not found' },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json({ data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error updating serialized component:', error);
    return NextResponse.json(
      { error: 'Failed to update serialized component' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createAdminClient();
  try {
    const { error } = await supabase
      .from('serialized_components')
      .delete()
      .eq('id', params.id);

    if (error) throw error;

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting serialized component:', error);
    return NextResponse.json(
      { error: 'Failed to delete serialized component' },
      { status: 500 }
    );
  }
}
