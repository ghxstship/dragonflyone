import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@ghxstship/config';
import { z } from 'zod';
import { apiRoute } from '@ghxstship/config/middleware';
import { PlatformRole } from '@ghxstship/config/roles';

const maintenanceScheduleSchema = z.object({
  asset_id: z.string().uuid(),
  maintenance_type: z.enum(['preventive', 'corrective', 'predictive', 'inspection', 'calibration']),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'annually', 'usage_based']),
  frequency_value: z.number().optional(), // For usage-based (e.g., every 100 hours)
  description: z.string(),
  estimated_duration_hours: z.number().positive(),
  assigned_to: z.string().uuid().optional(),
  checklist: z.array(z.object({
    item: z.string(),
    required: z.boolean().default(true)
  })).optional(),
  parts_required: z.array(z.object({
    part_name: z.string(),
    quantity: z.number().positive(),
    estimated_cost: z.number().optional()
  })).optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  active: z.boolean().default(true)
});

const maintenanceLogSchema = z.object({
  schedule_id: z.string().uuid(),
  asset_id: z.string().uuid(),
  performed_by: z.string().uuid(),
  completed_at: z.string(),
  duration_hours: z.number().positive(),
  checklist_completed: z.array(z.object({
    item: z.string(),
    completed: z.boolean(),
    notes: z.string().optional()
  })),
  parts_used: z.array(z.object({
    part_name: z.string(),
    quantity: z.number(),
    cost: z.number().optional()
  })).optional(),
  issues_found: z.string().optional(),
  recommendations: z.string().optional(),
  next_maintenance_date: z.string().optional(),
  status: z.enum(['completed', 'partially_completed', 'failed']).default('completed')
});

// GET - List maintenance schedules or logs
export const GET = apiRoute(
  async (request: NextRequest) => {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const asset_id = searchParams.get('asset_id');
    const status = searchParams.get('status');
    const upcoming_days = searchParams.get('upcoming_days');

    if (type === 'logs') {
      let query = supabase
        .from('maintenance_logs')
        .select(`
          *,
          assets (
            id,
            name,
            asset_type,
            serial_number
          ),
          performer:performed_by (
            id,
            first_name,
            last_name,
            email
          ),
          maintenance_schedules (
            id,
            maintenance_type,
            frequency
          )
        `)
        .order('completed_at', { ascending: false });

      if (asset_id) {
        query = query.eq('asset_id', asset_id);
      }

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ logs: data });
    }

    if (type === 'upcoming') {
      const days = parseInt(upcoming_days || '30');
      const today = new Date();
      const futureDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);

      const { data, error } = await supabase
        .from('maintenance_schedules')
        .select(`
          *,
          assets (
            id,
            name,
            asset_type,
            location,
            status
          ),
          assigned:assigned_to (
            id,
            first_name,
            last_name
          ),
          last_maintenance:maintenance_logs (
            completed_at,
            status
          )
        `)
        .eq('active', true)
        .order('next_due_date', { ascending: true });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Calculate next due dates based on frequency
      const upcoming = data?.filter((schedule: any) => {
        const nextDue = calculateNextDueDate(schedule);
        return nextDue && nextDue <= futureDate;
      });

      return NextResponse.json({ schedules: upcoming });
    }

    // List all maintenance schedules
    let query = supabase
      .from('maintenance_schedules')
      .select(`
        *,
        assets (
          id,
          name,
          asset_type,
          status
        ),
        assigned:assigned_to (
          id,
          first_name,
          last_name
        )
      `)
      .order('created_at', { ascending: false });

    if (asset_id) {
      query = query.eq('asset_id', asset_id);
    }

    if (status === 'active') {
      query = query.eq('active', true);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ schedules: data });
  },
  {
    auth: true,
    roles: [PlatformRole.COMPVSS_ADMIN, PlatformRole.COMPVSS_TEAM_MEMBER],
    audit: { action: 'maintenance:list', resource: 'maintenance' }
  }
);

// POST - Create schedule or log maintenance
export const POST = apiRoute(
  async (request: NextRequest, context: any) => {
    const body = await request.json();
    const { action } = body;

    if (action === 'log_maintenance') {
      const validated = maintenanceLogSchema.parse(body.data);

      // Create maintenance log
      const { data: log, error } = await supabase
        .from('maintenance_logs')
        .insert({
          ...validated,
          logged_by: context.user.id
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Update asset status and usage metrics
      await supabase
        .from('assets')
        .update({
          last_maintenance_date: validated.completed_at,
          maintenance_count: (supabase as any).raw('maintenance_count + 1')
        })
        .eq('id', validated.asset_id);

      // Update schedule next due date
      if (validated.next_maintenance_date) {
        await supabase
          .from('maintenance_schedules')
          .update({
            next_due_date: validated.next_maintenance_date,
            last_completed_at: validated.completed_at
          })
          .eq('id', validated.schedule_id);
      }

      return NextResponse.json({
        log,
        message: 'Maintenance logged successfully'
      }, { status: 201 });
    }

    // Create maintenance schedule
    const validated = maintenanceScheduleSchema.parse(body.data || body);

    // Calculate first due date
    const firstDueDate = calculateNextDueDate({
      frequency: validated.frequency,
      frequency_value: validated.frequency_value
    });

    const { data: schedule, error } = await supabase
      .from('maintenance_schedules')
      .insert({
        ...validated,
        next_due_date: firstDueDate,
        created_by: context.user.id
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      schedule,
      message: 'Maintenance schedule created successfully'
    }, { status: 201 });
  },
  {
    auth: true,
    roles: [PlatformRole.COMPVSS_ADMIN],
    audit: { action: 'maintenance:create', resource: 'maintenance' }
  }
);

// Helper function to calculate next due date
function calculateNextDueDate(schedule: any): Date | null {
  const now = new Date();
  const lastCompleted = schedule.last_completed_at ? new Date(schedule.last_completed_at) : now;

  switch (schedule.frequency) {
    case 'daily':
      return new Date(lastCompleted.getTime() + 24 * 60 * 60 * 1000);
    case 'weekly':
      return new Date(lastCompleted.getTime() + 7 * 24 * 60 * 60 * 1000);
    case 'monthly':
      const monthly = new Date(lastCompleted);
      monthly.setMonth(monthly.getMonth() + 1);
      return monthly;
    case 'quarterly':
      const quarterly = new Date(lastCompleted);
      quarterly.setMonth(quarterly.getMonth() + 3);
      return quarterly;
    case 'annually':
      const annually = new Date(lastCompleted);
      annually.setFullYear(annually.getFullYear() + 1);
      return annually;
    case 'usage_based':
      // This would require tracking asset usage hours
      return null;
    default:
      return null;
  }
}

// PUT - Update schedule or reschedule
export const PUT = apiRoute(
  async (request: NextRequest) => {
    const body = await request.json();
    const { id, updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('maintenance_schedules')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ schedule: data });
  },
  {
    auth: true,
    roles: [PlatformRole.COMPVSS_ADMIN],
    audit: { action: 'maintenance:update', resource: 'maintenance' }
  }
);

// DELETE - Deactivate schedule
export const DELETE = apiRoute(
  async (request: NextRequest) => {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('maintenance_schedules')
      .update({ active: false })
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Maintenance schedule deactivated' });
  },
  {
    auth: true,
    roles: [PlatformRole.COMPVSS_ADMIN],
    audit: { action: 'maintenance:delete', resource: 'maintenance' }
  }
);
