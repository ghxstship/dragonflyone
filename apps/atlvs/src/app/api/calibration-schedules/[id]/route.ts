import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const updateSchema = z.object({
  calibration_standard_id: z.string().uuid().optional().nullable(),
  calibration_type: z.string().min(1).max(100).optional(),
  frequency_days: z.number().int().positive().optional(),
  last_calibration_date: z.string().optional().nullable(),
  next_calibration_date: z.string().optional(),
  tolerance_range: z.record(z.any()).optional(),
  calibration_points: z.array(z.any()).optional(),
  required_equipment: z.array(z.string()).optional(),
  certified_technician_required: z.boolean().optional(),
  estimated_duration_hours: z.number().optional().nullable(),
  estimated_cost: z.number().optional().nullable(),
  priority: z.enum(['critical', 'high', 'normal', 'low']).optional(),
  status: z.enum(['scheduled', 'overdue', 'in_progress', 'completed', 'skipped', 'suspended']).optional(),
  notification_days_before: z.number().int().optional(),
  notes: z.string().optional().nullable(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabase
      .from('calibration_schedules')
      .select(`
        *,
        asset:assets(id, name, asset_tag, category, status),
        component:serialized_components(id, serial_number, component_type, manufacturer, model),
        standard:calibration_standards(id, name, code, governing_body, requirements, tolerance_specs),
        records:calibration_records(
          id, calibration_date, performed_by, result, certificate_number, expiration_date
        )
      `)
      .eq('id', params.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Calibration schedule not found' },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error fetching calibration schedule:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calibration schedule' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validated = updateSchema.parse(body);

    const { data, error } = await supabase
      .from('calibration_schedules')
      .update(validated)
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Calibration schedule not found' },
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
    console.error('Error updating calibration schedule:', error);
    return NextResponse.json(
      { error: 'Failed to update calibration schedule' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await supabase
      .from('calibration_schedules')
      .delete()
      .eq('id', params.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting calibration schedule:', error);
    return NextResponse.json(
      { error: 'Failed to delete calibration schedule' },
      { status: 500 }
    );
  }
}
