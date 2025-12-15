export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const UpdateShipmentSchema = z.object({
  origin: z.string().min(1).optional(),
  destination: z.string().min(1).optional(),
  carrier: z.string().min(1).optional(),
  tracking_number: z.string().optional(),
  ship_date: z.string().optional(),
  expected_delivery: z.string().optional(),
  actual_delivery: z.string().optional(),
  items_count: z.number().int().min(1).optional(),
  weight: z.number().min(0).optional(),
  cost: z.number().min(0).optional(),
  status: z.enum(['scheduled', 'in_transit', 'delivered', 'delayed', 'cancelled']).optional(),
  notes: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data, error } = await supabase
      .from('shipments')
      .select(`
        *,
        project:projects(id, name)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Shipment not found' }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ shipment: data });
  } catch (error: unknown) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const validationResult = UpdateShipmentSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const updateData = {
      ...validationResult.data,
      updated_at: new Date().toISOString(),
    };

    // If status is changing to delivered, set actual_delivery
    if (updateData.status === 'delivered' && !updateData.actual_delivery) {
      updateData.actual_delivery = new Date().toISOString().split('T')[0];
    }

    const { data, error } = await supabase
      .from('shipments')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Shipment not found' }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ shipment: data });
  } catch (error: unknown) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { error } = await supabase
      .from('shipments')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
