import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const transferSchema = z.object({
  to_asset_id: z.string().uuid().optional().nullable(),
  to_location_id: z.string().uuid().optional().nullable(),
  transfer_type: z.enum(['installation', 'removal', 'relocation', 'swap', 'loan', 'return']),
  reason: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createAdminClient();
  try {
    const { data, error } = await supabase
      .from('component_transfers')
      .select(`
        *,
        from_asset:assets!from_asset_id(id, name, asset_tag),
        to_asset:assets!to_asset_id(id, name, asset_tag),
        from_location:asset_locations!from_location_id(id, name, building),
        to_location:asset_locations!to_location_id(id, name, building),
        authorized_by_user:platform_users!authorized_by(id, email, full_name),
        performed_by_user:platform_users!performed_by(id, email, full_name)
      `)
      .eq('component_id', params.id)
      .order('transfer_date', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error fetching transfer history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transfer history' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createAdminClient();
  try {
    const body = await request.json();
    const validated = transferSchema.parse(body);

    // Get current component state
    const { data: component, error: componentError } = await supabase
      .from('serialized_components')
      .select('asset_id, location_id')
      .eq('id', params.id)
      .single();

    if (componentError || !component) {
      return NextResponse.json(
        { error: 'Component not found' },
        { status: 404 }
      );
    }

    // Create transfer record
    const { data: transfer, error: transferError } = await supabase
      .from('component_transfers')
      .insert({
        component_id: params.id,
        from_asset_id: component.asset_id,
        from_location_id: component.location_id,
        to_asset_id: validated.to_asset_id,
        to_location_id: validated.to_location_id,
        transfer_type: validated.transfer_type,
        reason: validated.reason,
        notes: validated.notes,
        transfer_date: new Date().toISOString(),
      })
      .select()
      .single();

    if (transferError) throw transferError;

    // Update component with new asset/location
    const updateData: Record<string, unknown> = {};
    if (validated.to_asset_id !== undefined) {
      updateData.asset_id = validated.to_asset_id;
    }
    if (validated.to_location_id !== undefined) {
      updateData.location_id = validated.to_location_id;
    }

    if (Object.keys(updateData).length > 0) {
      const { error: updateError } = await supabase
        .from('serialized_components')
        .update(updateData)
        .eq('id', params.id);

      if (updateError) throw updateError;
    }

    return NextResponse.json({ data: transfer }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating transfer:', error);
    return NextResponse.json(
      { error: 'Failed to create transfer' },
      { status: 500 }
    );
  }
}
