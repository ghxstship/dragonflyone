import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const scheduleSchema = z.object({
  name: z.string().min(1),
  report_type: z.string().min(1),
  parameters: z.record(z.any()).optional(),
  schedule_cron: z.string().min(1),
  timezone: z.string().default('UTC'),
  recipients: z.array(z.object({
    email: z.string().email(),
    name: z.string().optional(),
  })),
  delivery_channels: z.array(z.enum(['email', 'slack'])).default(['email']),
  format: z.enum(['pdf', 'csv', 'excel', 'json']).default('pdf'),
});

export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const reportId = searchParams.get('report_id');

    if (type === 'executions' && reportId) {
      const { data: executions, error } = await supabase
        .from('report_executions')
        .select('*')
        .eq('scheduled_report_id', reportId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return NextResponse.json({ executions });
    }

    const { data: reports, error } = await supabase
      .from('scheduled_reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const active = reports?.filter(r => r.status === 'active') || [];
    const paused = reports?.filter(r => r.status === 'paused') || [];

    return NextResponse.json({ reports, active_count: active.length, paused_count: paused.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const body = await request.json();
    const validated = scheduleSchema.parse(body);
    const createdBy = body.created_by;

    const { data: report, error } = await supabase
      .from('scheduled_reports')
      .insert({
        ...validated,
        status: 'active',
        created_by: createdBy,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ report }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const body = await request.json();
    const { id, action, ...updates } = body;

    if (action === 'pause') {
      const { data, error } = await supabase
        .from('scheduled_reports')
        .update({ status: 'paused' })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return NextResponse.json({ report: data });
    }

    if (action === 'resume') {
      const { data, error } = await supabase
        .from('scheduled_reports')
        .update({ status: 'active' })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return NextResponse.json({ report: data });
    }

    const { data, error } = await supabase
      .from('scheduled_reports')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ report: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const { error } = await supabase
      .from('scheduled_reports')
      .update({ status: 'disabled' })
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
