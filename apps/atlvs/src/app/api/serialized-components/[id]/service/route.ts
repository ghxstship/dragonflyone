import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const serviceSchema = z.object({
  service_type: z.enum(['repair', 'maintenance', 'calibration', 'firmware_update', 'inspection', 'replacement', 'refurbishment']),
  service_date: z.string(),
  service_provider: z.string().max(255).optional(),
  technician_name: z.string().max(255).optional(),
  description: z.string().optional(),
  parts_replaced: z.array(z.object({
    part_name: z.string(),
    part_number: z.string().optional(),
    quantity: z.number().optional(),
  })).optional(),
  labor_hours: z.number().optional(),
  cost: z.number().optional(),
  currency: z.string().length(3).default('USD'),
  invoice_number: z.string().max(100).optional(),
  warranty_claim: z.boolean().default(false),
  next_service_date: z.string().optional(),
  service_notes: z.string().optional(),
  attachments: z.array(z.object({
    name: z.string(),
    url: z.string(),
    type: z.string().optional(),
  })).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createAdminClient();
  try {
    const { searchParams } = new URL(request.url);
    const service_type = searchParams.get('service_type');
    const from_date = searchParams.get('from_date');
    const to_date = searchParams.get('to_date');

    let query = supabase
      .from('component_service_history')
      .select('*')
      .eq('component_id', params.id);

    if (service_type) {
      query = query.eq('service_type', service_type);
    }
    if (from_date) {
      query = query.gte('service_date', from_date);
    }
    if (to_date) {
      query = query.lte('service_date', to_date);
    }

    const { data, error } = await query.order('service_date', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error fetching service history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch service history' },
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
    const validated = serviceSchema.parse(body);

    // Verify component exists
    const { data: component } = await supabase
      .from('serialized_components')
      .select('id')
      .eq('id', params.id)
      .single();

    if (!component) {
      return NextResponse.json(
        { error: 'Component not found' },
        { status: 404 }
      );
    }

    const { data, error } = await supabase
      .from('component_service_history')
      .insert({
        component_id: params.id,
        ...validated,
      })
      .select()
      .single();

    if (error) throw error;

    // Update component condition if service was repair/refurbishment
    if (['repair', 'refurbishment'].includes(validated.service_type)) {
      await supabase
        .from('serialized_components')
        .update({ 
          condition: 'good',
          status: 'active',
        })
        .eq('id', params.id);
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating service record:', error);
    return NextResponse.json(
      { error: 'Failed to create service record' },
      { status: 500 }
    );
  }
}
