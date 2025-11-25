import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

// Validation schemas
const deferredRevenueSchema = z.object({
  client_id: z.string().uuid(),
  project_id: z.string().uuid().optional(),
  contract_id: z.string().uuid().optional(),
  invoice_id: z.string().uuid().optional(),
  total_amount: z.number().positive(),
  currency: z.string().default('USD'),
  recognition_method: z.enum(['straight_line', 'milestone', 'percentage_completion', 'deliverable']),
  start_date: z.string().datetime(),
  end_date: z.string().datetime(),
  description: z.string().optional(),
  milestones: z.array(z.object({
    name: z.string(),
    percentage: z.number().min(0).max(100),
    target_date: z.string().datetime().optional(),
  })).optional(),
});

const recognitionSchema = z.object({
  deferred_revenue_id: z.string().uuid(),
  amount: z.number().positive(),
  recognition_date: z.string().datetime(),
  milestone_id: z.string().uuid().optional(),
  notes: z.string().optional(),
});

// GET - Get deferred revenue data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'schedules' | 'pending' | 'recognized' | 'forecast' | 'waterfall'
    const clientId = searchParams.get('client_id');
    const projectId = searchParams.get('project_id');
    const asOfDate = searchParams.get('as_of_date') || new Date().toISOString();

    if (type === 'schedules') {
      // Get all deferred revenue schedules
      let query = supabase
        .from('deferred_revenue')
        .select(`
          *,
          client:contacts(id, first_name, last_name, organization_id),
          project:projects(id, name),
          recognitions:revenue_recognitions(id, amount, recognition_date)
        `)
        .order('start_date', { ascending: true });

      if (clientId) query = query.eq('client_id', clientId);
      if (projectId) query = query.eq('project_id', projectId);

      const { data: schedules, error } = await query;

      if (error) throw error;

      // Calculate recognized and remaining amounts
      const enrichedSchedules = schedules?.map(schedule => {
        const recognitions = (schedule.recognitions as any[]) || [];
        const recognizedAmount = recognitions.reduce((sum, r) => sum + r.amount, 0);
        const remainingAmount = schedule.total_amount - recognizedAmount;
        const percentRecognized = (recognizedAmount / schedule.total_amount) * 100;

        return {
          ...schedule,
          recognized_amount: recognizedAmount,
          remaining_amount: remainingAmount,
          percent_recognized: Math.round(percentRecognized * 100) / 100,
          status: remainingAmount <= 0 ? 'fully_recognized' : 
                  new Date(schedule.end_date) < new Date() ? 'overdue' : 'active',
        };
      });

      return NextResponse.json({ schedules: enrichedSchedules });
    }

    if (type === 'pending') {
      // Get pending recognition amounts
      const { data: schedules, error } = await supabase
        .from('deferred_revenue')
        .select(`
          *,
          client:contacts(id, first_name, last_name),
          project:projects(id, name),
          recognitions:revenue_recognitions(amount)
        `)
        .lte('start_date', asOfDate)
        .gte('end_date', new Date(new Date(asOfDate).getTime() - 365 * 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      const pendingItems = schedules?.map(schedule => {
        const recognizedAmount = (schedule.recognitions as any[])?.reduce((sum, r) => sum + r.amount, 0) || 0;
        const remainingAmount = schedule.total_amount - recognizedAmount;

        // Calculate expected recognition based on method
        let expectedRecognition = 0;
        const startDate = new Date(schedule.start_date);
        const endDate = new Date(schedule.end_date);
        const asOf = new Date(asOfDate);
        const totalDays = (endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000);
        const elapsedDays = Math.max(0, (asOf.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));

        if (schedule.recognition_method === 'straight_line') {
          expectedRecognition = (schedule.total_amount / totalDays) * elapsedDays;
        }

        const pendingRecognition = Math.max(0, expectedRecognition - recognizedAmount);

        return {
          ...schedule,
          recognized_amount: recognizedAmount,
          remaining_amount: remainingAmount,
          expected_recognition: Math.round(expectedRecognition * 100) / 100,
          pending_recognition: Math.round(pendingRecognition * 100) / 100,
        };
      }).filter(s => s.pending_recognition > 0);

      const totalPending = pendingItems?.reduce((sum, s) => sum + s.pending_recognition, 0) || 0;

      return NextResponse.json({
        pending_items: pendingItems,
        total_pending: totalPending,
        as_of_date: asOfDate,
      });
    }

    if (type === 'recognized') {
      // Get recognition history
      const startDate = searchParams.get('start_date') || new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();
      const endDate = searchParams.get('end_date') || new Date().toISOString();

      const { data: recognitions, error } = await supabase
        .from('revenue_recognitions')
        .select(`
          *,
          deferred_revenue:deferred_revenue(id, description, client_id, project_id)
        `)
        .gte('recognition_date', startDate)
        .lte('recognition_date', endDate)
        .order('recognition_date', { ascending: false });

      if (error) throw error;

      // Group by month
      const byMonth = recognitions?.reduce((acc: Record<string, number>, r) => {
        const month = r.recognition_date.substring(0, 7);
        acc[month] = (acc[month] || 0) + r.amount;
        return acc;
      }, {});

      return NextResponse.json({
        recognitions,
        by_month: byMonth,
        total: recognitions?.reduce((sum, r) => sum + r.amount, 0) || 0,
      });
    }

    if (type === 'forecast') {
      // Get revenue recognition forecast
      const months = parseInt(searchParams.get('months') || '12');
      const { data: schedules, error } = await supabase
        .from('deferred_revenue')
        .select(`
          *,
          recognitions:revenue_recognitions(amount)
        `)
        .gte('end_date', new Date().toISOString());

      if (error) throw error;

      // Generate monthly forecast
      const forecast: Record<string, number> = {};
      const today = new Date();

      for (let i = 0; i < months; i++) {
        const forecastDate = new Date(today.getFullYear(), today.getMonth() + i, 1);
        const monthKey = forecastDate.toISOString().substring(0, 7);
        forecast[monthKey] = 0;
      }

      schedules?.forEach(schedule => {
        const recognizedAmount = (schedule.recognitions as any[])?.reduce((sum, r) => sum + r.amount, 0) || 0;
        const remainingAmount = schedule.total_amount - recognizedAmount;
        
        if (remainingAmount <= 0) return;

        const startDate = new Date(Math.max(new Date(schedule.start_date).getTime(), today.getTime()));
        const endDate = new Date(schedule.end_date);
        const remainingDays = Math.max(1, (endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
        const dailyRate = remainingAmount / remainingDays;

        // Distribute remaining amount across future months
        for (let i = 0; i < months; i++) {
          const monthStart = new Date(today.getFullYear(), today.getMonth() + i, 1);
          const monthEnd = new Date(today.getFullYear(), today.getMonth() + i + 1, 0);
          const monthKey = monthStart.toISOString().substring(0, 7);

          if (monthEnd < startDate || monthStart > endDate) continue;

          const effectiveStart = new Date(Math.max(monthStart.getTime(), startDate.getTime()));
          const effectiveEnd = new Date(Math.min(monthEnd.getTime(), endDate.getTime()));
          const daysInMonth = (effectiveEnd.getTime() - effectiveStart.getTime()) / (24 * 60 * 60 * 1000);

          forecast[monthKey] = (forecast[monthKey] || 0) + (dailyRate * daysInMonth);
        }
      });

      // Round values
      Object.keys(forecast).forEach(key => {
        forecast[key] = Math.round(forecast[key] * 100) / 100;
      });

      return NextResponse.json({
        forecast,
        total_forecast: Object.values(forecast).reduce((sum, v) => sum + v, 0),
      });
    }

    if (type === 'waterfall') {
      // Get deferred revenue waterfall (balance over time)
      const { data: schedules, error } = await supabase
        .from('deferred_revenue')
        .select(`
          id,
          total_amount,
          start_date,
          end_date,
          recognitions:revenue_recognitions(amount, recognition_date)
        `);

      if (error) throw error;

      // Calculate monthly balances
      const months = 12;
      const waterfall: Array<{ month: string; opening: number; additions: number; recognized: number; closing: number }> = [];
      
      for (let i = -months + 1; i <= 0; i++) {
        const monthDate = new Date(new Date().getFullYear(), new Date().getMonth() + i, 1);
        const monthEnd = new Date(new Date().getFullYear(), new Date().getMonth() + i + 1, 0);
        const monthKey = monthDate.toISOString().substring(0, 7);

        let additions = 0;
        let recognized = 0;

        schedules?.forEach(schedule => {
          // Check if schedule started this month
          const scheduleStart = new Date(schedule.start_date);
          if (scheduleStart >= monthDate && scheduleStart <= monthEnd) {
            additions += schedule.total_amount;
          }

          // Sum recognitions for this month
          (schedule.recognitions as any[])?.forEach(r => {
            const recDate = new Date(r.recognition_date);
            if (recDate >= monthDate && recDate <= monthEnd) {
              recognized += r.amount;
            }
          });
        });

        const previousClosing = waterfall.length > 0 ? waterfall[waterfall.length - 1].closing : 0;
        
        waterfall.push({
          month: monthKey,
          opening: previousClosing,
          additions,
          recognized,
          closing: previousClosing + additions - recognized,
        });
      }

      return NextResponse.json({ waterfall });
    }

    // Default: return summary
    const { data: schedules, error } = await supabase
      .from('deferred_revenue')
      .select(`
        total_amount,
        recognitions:revenue_recognitions(amount)
      `);

    if (error) throw error;

    let totalDeferred = 0;
    let totalRecognized = 0;

    schedules?.forEach(s => {
      totalDeferred += s.total_amount;
      totalRecognized += (s.recognitions as any[])?.reduce((sum, r) => sum + r.amount, 0) || 0;
    });

    return NextResponse.json({
      summary: {
        total_deferred: totalDeferred,
        total_recognized: totalRecognized,
        remaining_balance: totalDeferred - totalRecognized,
        schedule_count: schedules?.length || 0,
      },
    });
  } catch (error: any) {
    console.error('Deferred revenue error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create schedule or recognize revenue
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action;

    if (action === 'create_schedule') {
      const validated = deferredRevenueSchema.parse(body.data);

      const { data: schedule, error } = await supabase
        .from('deferred_revenue')
        .insert({
          ...validated,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Create milestones if provided
      if (validated.milestones?.length) {
        const milestoneRecords = validated.milestones.map((m, idx) => ({
          deferred_revenue_id: schedule.id,
          name: m.name,
          percentage: m.percentage,
          amount: (validated.total_amount * m.percentage) / 100,
          target_date: m.target_date,
          sequence: idx + 1,
          status: 'pending',
          created_at: new Date().toISOString(),
        }));

        await supabase.from('deferred_revenue_milestones').insert(milestoneRecords);
      }

      return NextResponse.json({ schedule }, { status: 201 });
    }

    if (action === 'recognize_revenue') {
      const validated = recognitionSchema.parse(body.data);

      // Verify amount doesn't exceed remaining
      const { data: schedule } = await supabase
        .from('deferred_revenue')
        .select(`
          total_amount,
          recognitions:revenue_recognitions(amount)
        `)
        .eq('id', validated.deferred_revenue_id)
        .single();

      if (!schedule) {
        return NextResponse.json({ error: 'Schedule not found' }, { status: 404 });
      }

      const recognizedAmount = (schedule.recognitions as any[])?.reduce((sum, r) => sum + r.amount, 0) || 0;
      const remainingAmount = schedule.total_amount - recognizedAmount;

      if (validated.amount > remainingAmount) {
        return NextResponse.json({ 
          error: `Amount exceeds remaining balance of ${remainingAmount}` 
        }, { status: 400 });
      }

      const { data: recognition, error } = await supabase
        .from('revenue_recognitions')
        .insert({
          ...validated,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Update milestone if provided
      if (validated.milestone_id) {
        await supabase
          .from('deferred_revenue_milestones')
          .update({ 
            status: 'completed',
            completed_date: validated.recognition_date,
          })
          .eq('id', validated.milestone_id);
      }

      // Check if fully recognized
      const newRecognizedAmount = recognizedAmount + validated.amount;
      if (newRecognizedAmount >= schedule.total_amount) {
        await supabase
          .from('deferred_revenue')
          .update({ status: 'fully_recognized', updated_at: new Date().toISOString() })
          .eq('id', validated.deferred_revenue_id);
      }

      // Create ledger entry
      await supabase.from('ledger_entries').insert({
        entry_date: validated.recognition_date,
        description: `Revenue recognition - ${validated.notes || 'Deferred revenue'}`,
        debit: validated.amount,
        credit: 0,
        account_type: 'revenue',
        reference_type: 'revenue_recognition',
        reference_id: recognition.id,
        created_at: new Date().toISOString(),
      });

      return NextResponse.json({ recognition }, { status: 201 });
    }

    if (action === 'auto_recognize') {
      // Auto-recognize revenue for straight-line schedules
      const asOfDate = body.data.as_of_date || new Date().toISOString();

      const { data: schedules } = await supabase
        .from('deferred_revenue')
        .select(`
          *,
          recognitions:revenue_recognitions(amount, recognition_date)
        `)
        .eq('recognition_method', 'straight_line')
        .eq('status', 'active')
        .lte('start_date', asOfDate);

      const recognitions = [];

      for (const schedule of schedules || []) {
        const recognizedAmount = (schedule.recognitions as any[])?.reduce((sum, r) => sum + r.amount, 0) || 0;
        const startDate = new Date(schedule.start_date);
        const endDate = new Date(schedule.end_date);
        const asOf = new Date(asOfDate);
        
        const totalDays = (endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000);
        const elapsedDays = Math.min(totalDays, (asOf.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
        
        const expectedRecognition = (schedule.total_amount / totalDays) * elapsedDays;
        const toRecognize = Math.max(0, expectedRecognition - recognizedAmount);

        if (toRecognize > 0.01) {
          const { data: recognition } = await supabase
            .from('revenue_recognitions')
            .insert({
              deferred_revenue_id: schedule.id,
              amount: Math.round(toRecognize * 100) / 100,
              recognition_date: asOfDate,
              notes: 'Auto-recognized (straight-line)',
              created_at: new Date().toISOString(),
            })
            .select()
            .single();

          if (recognition) recognitions.push(recognition);
        }
      }

      return NextResponse.json({ 
        recognized_count: recognitions.length,
        total_recognized: recognitions.reduce((sum, r) => sum + r.amount, 0),
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    console.error('Deferred revenue error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH - Update schedule
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    const { data: schedule, error } = await supabase
      .from('deferred_revenue')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ schedule });
  } catch (error: any) {
    console.error('Deferred revenue error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Cancel schedule
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    // Check if any revenue has been recognized
    const { data: schedule } = await supabase
      .from('deferred_revenue')
      .select(`
        recognitions:revenue_recognitions(id)
      `)
      .eq('id', id)
      .single();

    if ((schedule?.recognitions as any[])?.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete schedule with recognized revenue' 
      }, { status: 400 });
    }

    const { error } = await supabase
      .from('deferred_revenue')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Deferred revenue error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
