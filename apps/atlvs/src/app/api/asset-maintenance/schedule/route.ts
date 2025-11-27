import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const MaintenanceScheduleSchema = z.object({
  asset_id: z.string().uuid(),
  maintenance_type: z.enum(['preventive', 'inspection', 'calibration', 'cleaning', 'repair', 'certification']),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'semi_annual', 'annual', 'custom']),
  custom_interval_days: z.number().optional(),
  next_due_date: z.string(),
  estimated_duration_hours: z.number().optional(),
  estimated_cost: z.number().optional(),
  assigned_to: z.string().uuid().optional(),
  instructions: z.string().optional(),
  checklist: z.array(z.string()).optional(),
  notify_days_before: z.number().default(7),
});

// GET /api/asset-maintenance/schedule - Get maintenance schedules
export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const assetId = searchParams.get('asset_id');
    const action = searchParams.get('action');
    const status = searchParams.get('status');

    if (action === 'upcoming') {
      // Get upcoming maintenance tasks
      const daysAhead = parseInt(searchParams.get('days') || '30');
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + daysAhead);

      const { data: upcoming } = await supabase
        .from('maintenance_schedules')
        .select(`
          *,
          asset:assets(id, name, asset_type, serial_number, location)
        `)
        .lte('next_due_date', futureDate.toISOString())
        .eq('is_active', true)
        .order('next_due_date');

      return NextResponse.json({ upcoming: upcoming || [] });
    }

    if (action === 'overdue') {
      // Get overdue maintenance
      const { data: overdue } = await supabase
        .from('maintenance_schedules')
        .select(`
          *,
          asset:assets(id, name, asset_type, serial_number, location)
        `)
        .lt('next_due_date', new Date().toISOString())
        .eq('is_active', true)
        .order('next_due_date');

      return NextResponse.json({ overdue: overdue || [] });
    }

    if (action === 'calendar') {
      // Get maintenance calendar view
      const startDate = searchParams.get('start_date') || new Date().toISOString().slice(0, 10);
      const endDate = searchParams.get('end_date') || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

      const { data: schedules } = await supabase
        .from('maintenance_schedules')
        .select(`
          *,
          asset:assets(id, name, asset_type)
        `)
        .gte('next_due_date', startDate)
        .lte('next_due_date', endDate)
        .eq('is_active', true)
        .order('next_due_date');

      // Group by date
      const calendar: Record<string, any[]> = {};
      schedules?.forEach(s => {
        const date = s.next_due_date.slice(0, 10);
        if (!calendar[date]) calendar[date] = [];
        calendar[date].push(s);
      });

      return NextResponse.json({ calendar });
    }

    if (action === 'history' && assetId) {
      // Get maintenance history for an asset
      const { data: history } = await supabase
        .from('maintenance_logs')
        .select('*')
        .eq('asset_id', assetId)
        .order('completed_at', { ascending: false })
        .limit(50);

      return NextResponse.json({ history: history || [] });
    }

    if (assetId) {
      // Get schedules for specific asset
      const { data: schedules } = await supabase
        .from('maintenance_schedules')
        .select('*')
        .eq('asset_id', assetId)
        .eq('is_active', true)
        .order('next_due_date');

      return NextResponse.json({ schedules: schedules || [] });
    }

    // Default: Get all active schedules
    let query = supabase
      .from('maintenance_schedules')
      .select(`
        *,
        asset:assets(id, name, asset_type, serial_number, location)
      `)
      .eq('is_active', true)
      .order('next_due_date');

    if (status === 'overdue') {
      query = query.lt('next_due_date', new Date().toISOString());
    } else if (status === 'upcoming') {
      const weekAhead = new Date();
      weekAhead.setDate(weekAhead.getDate() + 7);
      query = query.gte('next_due_date', new Date().toISOString()).lte('next_due_date', weekAhead.toISOString());
    }

    const { data: schedules } = await query;

    // Get summary stats
    const now = new Date();
    const overdueCount = schedules?.filter(s => new Date(s.next_due_date) < now).length || 0;
    const upcomingWeek = schedules?.filter(s => {
      const due = new Date(s.next_due_date);
      return due >= now && due <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    }).length || 0;

    return NextResponse.json({
      schedules: schedules || [],
      summary: {
        total: schedules?.length || 0,
        overdue: overdueCount,
        upcoming_week: upcomingWeek,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch maintenance schedules' }, { status: 500 });
  }
}

// POST /api/asset-maintenance/schedule - Create schedule or log maintenance
export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const action = body.action || 'create_schedule';

    if (action === 'create_schedule') {
      const validated = MaintenanceScheduleSchema.parse(body);

      const { data: schedule, error } = await supabase
        .from('maintenance_schedules')
        .insert({
          ...validated,
          is_active: true,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ schedule }, { status: 201 });
    } else if (action === 'complete_maintenance') {
      const { 
        schedule_id, 
        asset_id, 
        notes, 
        actual_duration_hours, 
        actual_cost,
        checklist_completed,
        issues_found,
        parts_replaced,
      } = body;

      // Log the completed maintenance
      const { data: log, error: logError } = await supabase
        .from('maintenance_logs')
        .insert({
          schedule_id,
          asset_id,
          maintenance_type: body.maintenance_type,
          notes,
          actual_duration_hours,
          actual_cost,
          checklist_completed,
          issues_found,
          parts_replaced,
          completed_by: user.id,
          completed_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (logError) {
        return NextResponse.json({ error: logError.message }, { status: 500 });
      }

      // Update schedule with next due date
      if (schedule_id) {
        const { data: schedule } = await supabase
          .from('maintenance_schedules')
          .select('frequency, custom_interval_days')
          .eq('id', schedule_id)
          .single();

        if (schedule) {
          const nextDueDate = calculateNextDueDate(schedule.frequency, schedule.custom_interval_days);

          await supabase
            .from('maintenance_schedules')
            .update({
              next_due_date: nextDueDate,
              last_completed_at: new Date().toISOString(),
              last_completed_by: user.id,
            })
            .eq('id', schedule_id);
        }
      }

      // Update asset maintenance status
      await supabase
        .from('assets')
        .update({
          last_maintenance_date: new Date().toISOString(),
          maintenance_status: 'completed',
        })
        .eq('id', asset_id);

      return NextResponse.json({ log }, { status: 201 });
    } else if (action === 'skip_maintenance') {
      const { schedule_id, reason } = body;

      // Log the skip
      await supabase.from('maintenance_logs').insert({
        schedule_id,
        status: 'skipped',
        notes: reason,
        completed_by: user.id,
        completed_at: new Date().toISOString(),
      });

      // Update schedule with next due date
      const { data: schedule } = await supabase
        .from('maintenance_schedules')
        .select('frequency, custom_interval_days')
        .eq('id', schedule_id)
        .single();

      if (schedule) {
        const nextDueDate = calculateNextDueDate(schedule.frequency, schedule.custom_interval_days);

        await supabase
          .from('maintenance_schedules')
          .update({ next_due_date: nextDueDate })
          .eq('id', schedule_id);
      }

      return NextResponse.json({ success: true });
    } else if (action === 'send_reminders') {
      // Send reminders for upcoming maintenance
      const daysAhead = body.days_ahead || 7;
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + daysAhead);

      const { data: upcoming } = await supabase
        .from('maintenance_schedules')
        .select(`
          *,
          asset:assets(id, name)
        `)
        .lte('next_due_date', futureDate.toISOString())
        .gte('next_due_date', new Date().toISOString())
        .eq('is_active', true);

      const reminders = [];

      for (const schedule of upcoming || []) {
        const daysUntilDue = Math.ceil(
          (new Date(schedule.next_due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );

        if (daysUntilDue <= schedule.notify_days_before) {
          const recipientId = schedule.assigned_to || user.id;

          await supabase.from('unified_notifications').insert({
            user_id: recipientId,
            title: 'Maintenance Reminder',
            message: `${schedule.maintenance_type} maintenance for "${schedule.asset?.name}" is due in ${daysUntilDue} days`,
            type: daysUntilDue <= 1 ? 'warning' : 'info',
            priority: daysUntilDue <= 1 ? 'high' : 'normal',
            source_platform: 'atlvs',
            source_entity_type: 'maintenance_schedule',
            source_entity_id: schedule.id,
            link: `/assets/${schedule.asset_id}/maintenance`,
          });

          reminders.push({
            schedule_id: schedule.id,
            asset_name: schedule.asset?.name,
            days_until_due: daysUntilDue,
          });
        }
      }

      return NextResponse.json({
        reminders_sent: reminders.length,
        reminders,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

// PATCH /api/asset-maintenance/schedule - Update schedule
export async function PATCH(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const scheduleId = searchParams.get('schedule_id');

    if (!scheduleId) {
      return NextResponse.json({ error: 'Schedule ID required' }, { status: 400 });
    }

    const body = await request.json();

    const { data: schedule, error } = await supabase
      .from('maintenance_schedules')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', scheduleId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ schedule });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update schedule' }, { status: 500 });
  }
}

// DELETE /api/asset-maintenance/schedule - Delete schedule
export async function DELETE(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const scheduleId = searchParams.get('schedule_id');

    if (!scheduleId) {
      return NextResponse.json({ error: 'Schedule ID required' }, { status: 400 });
    }

    // Soft delete
    const { error } = await supabase
      .from('maintenance_schedules')
      .update({ is_active: false })
      .eq('id', scheduleId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete schedule' }, { status: 500 });
  }
}

// Helper function to calculate next due date
function calculateNextDueDate(frequency: string, customDays?: number): string {
  const now = new Date();

  switch (frequency) {
    case 'daily':
      now.setDate(now.getDate() + 1);
      break;
    case 'weekly':
      now.setDate(now.getDate() + 7);
      break;
    case 'monthly':
      now.setMonth(now.getMonth() + 1);
      break;
    case 'quarterly':
      now.setMonth(now.getMonth() + 3);
      break;
    case 'semi_annual':
      now.setMonth(now.getMonth() + 6);
      break;
    case 'annual':
      now.setFullYear(now.getFullYear() + 1);
      break;
    case 'custom':
      now.setDate(now.getDate() + (customDays || 30));
      break;
    default:
      now.setMonth(now.getMonth() + 1);
  }

  return now.toISOString();
}
