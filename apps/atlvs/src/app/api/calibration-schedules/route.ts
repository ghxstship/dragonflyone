import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const scheduleSchema = z.object({
  asset_id: z.string().uuid().optional(),
  component_id: z.string().uuid().optional(),
  calibration_standard_id: z.string().uuid().optional(),
  calibration_type: z.string().min(1).max(100),
  frequency_days: z.number().int().positive(),
  last_calibration_date: z.string().optional(),
  next_calibration_date: z.string(),
  tolerance_range: z.record(z.any()).optional(),
  calibration_points: z.array(z.any()).optional(),
  required_equipment: z.array(z.string()).optional(),
  certified_technician_required: z.boolean().default(false),
  estimated_duration_hours: z.number().optional(),
  estimated_cost: z.number().optional(),
  priority: z.enum(['critical', 'high', 'normal', 'low']).default('normal'),
  notification_days_before: z.number().int().default(30),
  notes: z.string().optional(),
}).refine(data => data.asset_id || data.component_id, {
  message: 'Either asset_id or component_id must be provided',
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const asset_id = searchParams.get('asset_id');
    const component_id = searchParams.get('component_id');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const upcoming_days = searchParams.get('upcoming_days');
    const overdue_only = searchParams.get('overdue_only') === 'true';

    let query = supabase
      .from('calibration_schedules')
      .select(`
        *,
        asset:assets(id, name, asset_tag, category),
        component:serialized_components(id, serial_number, component_type),
        standard:calibration_standards(id, name, code, governing_body)
      `);

    if (asset_id) {
      query = query.eq('asset_id', asset_id);
    }
    if (component_id) {
      query = query.eq('component_id', component_id);
    }
    if (status) {
      query = query.eq('status', status);
    }
    if (priority) {
      query = query.eq('priority', priority);
    }
    if (overdue_only) {
      query = query.eq('status', 'overdue');
    }
    if (upcoming_days) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + parseInt(upcoming_days));
      query = query.lte('next_calibration_date', futureDate.toISOString().split('T')[0]);
    }

    const { data, error } = await query.order('next_calibration_date', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error fetching calibration schedules:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calibration schedules' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = scheduleSchema.parse(body);

    const { data, error } = await supabase
      .from('calibration_schedules')
      .insert({
        ...validated,
        status: 'scheduled',
      })
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
    console.error('Error creating calibration schedule:', error);
    return NextResponse.json(
      { error: 'Failed to create calibration schedule' },
      { status: 500 }
    );
  }
}
