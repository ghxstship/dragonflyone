export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PaymentScheduleSchema = z.object({
  organization_id: z.string().uuid(),
  booking_id: z.string().uuid().optional().nullable(),
  invoice_id: z.string().uuid().optional().nullable(),
  name: z.string().optional(),
  deposit_percentage: z.number().min(0).max(100).default(50),
  late_fee_percentage: z.number().min(0).max(100).default(0),
  late_fee_grace_days: z.number().int().min(0).default(0),
  auto_reminder: z.boolean().default(true),
  milestones: z.array(z.object({
    milestone_name: z.string(),
    due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    amount: z.number().min(0),
    percentage: z.number().min(0).max(100).optional(),
    description: z.string().optional(),
  })).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organization_id');
    const bookingId = searchParams.get('booking_id');
    const invoiceId = searchParams.get('invoice_id');
    const upcoming = searchParams.get('upcoming') === 'true';

    let query = supabase
      .from('payment_schedules')
      .select(`
        *,
        booking:bookings(id, booking_number, event_name, event_date, total_amount, contact:contacts(id, first_name, last_name, email)),
        invoice:venue_invoices(id, invoice_number, total, balance_due),
        milestones:payment_milestones(*)
      `)
      .order('created_at', { ascending: false });

    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }
    if (bookingId) {
      query = query.eq('booking_id', bookingId);
    }
    if (invoiceId) {
      query = query.eq('invoice_id', invoiceId);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let schedules = data || [];

    // If upcoming filter, get schedules with pending milestones
    if (upcoming) {
      const today = new Date().toISOString().split('T')[0];
      const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      schedules = schedules.filter(schedule => 
        schedule.milestones?.some((m: { status: string; due_date: string }) => 
          m.status === 'pending' && m.due_date >= today && m.due_date <= thirtyDaysFromNow
        )
      );
    }

    return NextResponse.json({ schedules });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch payment schedules' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = PaymentScheduleSchema.parse(body);
    const { milestones, ...scheduleData } = validatedData;

    // Create payment schedule
    const { data: schedule, error: scheduleError } = await supabase
      .from('payment_schedules')
      .insert(scheduleData)
      .select()
      .single();

    if (scheduleError) {
      return NextResponse.json({ error: scheduleError.message }, { status: 500 });
    }

    // Create milestones if provided
    if (milestones && milestones.length > 0) {
      const milestonesWithScheduleId = milestones.map((m, index) => ({
        schedule_id: schedule.id,
        ...m,
        sort_order: index,
      }));

      const { error: milestonesError } = await supabase
        .from('payment_milestones')
        .insert(milestonesWithScheduleId);

      if (milestonesError) {
        console.error('Failed to create milestones:', milestonesError);
      }

      // Create reminders for auto_reminder schedules
      if (scheduleData.auto_reminder) {
        const reminders = [];
        for (const milestone of milestonesWithScheduleId) {
          const dueDate = new Date(milestone.due_date);
          
          // 7 days before reminder
          const sevenDaysBefore = new Date(dueDate);
          sevenDaysBefore.setDate(sevenDaysBefore.getDate() - 7);
          if (sevenDaysBefore > new Date()) {
            reminders.push({
              schedule_id: schedule.id,
              reminder_type: '7_days',
              scheduled_for: sevenDaysBefore.toISOString(),
            });
          }

          // 3 days before reminder
          const threeDaysBefore = new Date(dueDate);
          threeDaysBefore.setDate(threeDaysBefore.getDate() - 3);
          if (threeDaysBefore > new Date()) {
            reminders.push({
              schedule_id: schedule.id,
              reminder_type: '3_days',
              scheduled_for: threeDaysBefore.toISOString(),
            });
          }
        }

        if (reminders.length > 0) {
          await supabase
            .from('payment_reminders')
            .insert(reminders);
        }
      }
    }

    // Fetch complete schedule with milestones
    const { data: completeSchedule } = await supabase
      .from('payment_schedules')
      .select('*, milestones:payment_milestones(*)')
      .eq('id', schedule.id)
      .single();

    return NextResponse.json({ schedule: completeSchedule }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create payment schedule' }, { status: 500 });
  }
}
