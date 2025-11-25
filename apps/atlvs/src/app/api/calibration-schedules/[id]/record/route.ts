import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const recordSchema = z.object({
  calibration_date: z.string(),
  performed_by: z.string().max(255).optional(),
  technician_certification: z.string().max(255).optional(),
  calibration_lab: z.string().max(255).optional(),
  lab_accreditation: z.string().max(255).optional(),
  reference_standards_used: z.array(z.object({
    name: z.string(),
    serial_number: z.string().optional(),
    calibration_due: z.string().optional(),
  })).optional(),
  measurements_before: z.record(z.any()).optional(),
  measurements_after: z.record(z.any()).optional(),
  adjustments_made: z.array(z.object({
    parameter: z.string(),
    before_value: z.string().optional(),
    after_value: z.string().optional(),
    notes: z.string().optional(),
  })).optional(),
  result: z.enum(['pass', 'fail', 'pass_with_adjustments', 'out_of_tolerance', 'unable_to_calibrate']),
  deviation_from_standard: z.number().optional(),
  uncertainty_measurement: z.number().optional(),
  certificate_number: z.string().max(100).optional(),
  certificate_url: z.string().url().optional(),
  expiration_date: z.string().optional(),
  environmental_conditions: z.object({
    temperature: z.number().optional(),
    humidity: z.number().optional(),
    pressure: z.number().optional(),
  }).optional(),
  notes: z.string().optional(),
  attachments: z.array(z.object({
    name: z.string(),
    url: z.string(),
    type: z.string().optional(),
  })).optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validated = recordSchema.parse(body);

    // Get the schedule to determine asset/component
    const { data: schedule, error: scheduleError } = await supabase
      .from('calibration_schedules')
      .select('asset_id, component_id, calibration_type, frequency_days')
      .eq('id', params.id)
      .single();

    if (scheduleError || !schedule) {
      return NextResponse.json(
        { error: 'Calibration schedule not found' },
        { status: 404 }
      );
    }

    // Create calibration record
    const { data: record, error: recordError } = await supabase
      .from('calibration_records')
      .insert({
        schedule_id: params.id,
        asset_id: schedule.asset_id,
        component_id: schedule.component_id,
        calibration_type: schedule.calibration_type,
        ...validated,
      })
      .select()
      .single();

    if (recordError) throw recordError;

    // Calculate next calibration date
    const calibrationDate = new Date(validated.calibration_date);
    const nextDate = new Date(calibrationDate);
    nextDate.setDate(nextDate.getDate() + schedule.frequency_days);

    // Update schedule with new dates and status
    const { error: updateError } = await supabase
      .from('calibration_schedules')
      .update({
        last_calibration_date: validated.calibration_date,
        next_calibration_date: nextDate.toISOString().split('T')[0],
        status: 'scheduled',
      })
      .eq('id', params.id);

    if (updateError) throw updateError;

    return NextResponse.json({ data: record }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error recording calibration:', error);
    return NextResponse.json(
      { error: 'Failed to record calibration' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabase
      .from('calibration_records')
      .select('*')
      .eq('schedule_id', params.id)
      .order('calibration_date', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error fetching calibration records:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calibration records' },
      { status: 500 }
    );
  }
}
