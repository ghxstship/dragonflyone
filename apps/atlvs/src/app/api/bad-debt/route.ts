import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

// Validation schemas
const writeOffSchema = z.object({
  invoice_id: z.string().uuid(),
  write_off_amount: z.number().positive(),
  write_off_reason: z.enum(['uncollectible', 'bankruptcy', 'dispute_settled', 'statute_of_limitations', 'customer_deceased', 'other']),
  notes: z.string().optional(),
  approved_by: z.string().uuid(),
});

const reserveSchema = z.object({
  client_id: z.string().uuid().optional(),
  invoice_id: z.string().uuid().optional(),
  reserve_amount: z.number().positive(),
  reserve_percentage: z.number().min(0).max(100).optional(),
  reason: z.string(),
});

// GET - Get bad debt and write-off data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'write_offs' | 'reserves' | 'aging_analysis' | 'recovery'
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    if (type === 'write_offs') {
      // Get write-off history
      let query = supabase
        .from('bad_debt_write_offs')
        .select(`
          *,
          invoice:client_invoices(id, invoice_number, amount, client_id),
          approver:platform_users(id, first_name, last_name)
        `)
        .order('write_off_date', { ascending: false });

      if (startDate) query = query.gte('write_off_date', startDate);
      if (endDate) query = query.lte('write_off_date', endDate);

      const { data: writeOffs, error } = await query;

      if (error) throw error;

      // Group by reason
      const byReason = writeOffs?.reduce((acc: Record<string, { count: number; total: number }>, w) => {
        if (!acc[w.write_off_reason]) acc[w.write_off_reason] = { count: 0, total: 0 };
        acc[w.write_off_reason].count++;
        acc[w.write_off_reason].total += w.write_off_amount;
        return acc;
      }, {});

      return NextResponse.json({
        write_offs: writeOffs,
        by_reason: byReason,
        total_written_off: writeOffs?.reduce((sum, w) => sum + w.write_off_amount, 0) || 0,
      });
    }

    if (type === 'reserves') {
      // Get bad debt reserves (allowance for doubtful accounts)
      const { data: reserves, error } = await supabase
        .from('bad_debt_reserves')
        .select(`
          *,
          client:contacts(id, first_name, last_name),
          invoice:client_invoices(id, invoice_number, amount)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const totalReserve = reserves?.reduce((sum, r) => sum + r.reserve_amount, 0) || 0;

      return NextResponse.json({
        reserves,
        total_reserve: totalReserve,
      });
    }

    if (type === 'aging_analysis') {
      // Get aging analysis with bad debt probability
      const { data: invoices, error } = await supabase
        .from('client_invoices')
        .select(`
          id,
          invoice_number,
          amount,
          due_date,
          status,
          client:contacts(id, first_name, last_name)
        `)
        .in('status', ['sent', 'partial', 'overdue']);

      if (error) throw error;

      const today = new Date();
      const agingBuckets = {
        current: { count: 0, amount: 0, reserve_rate: 0.01 },
        days_1_30: { count: 0, amount: 0, reserve_rate: 0.02 },
        days_31_60: { count: 0, amount: 0, reserve_rate: 0.05 },
        days_61_90: { count: 0, amount: 0, reserve_rate: 0.10 },
        days_91_120: { count: 0, amount: 0, reserve_rate: 0.25 },
        over_120: { count: 0, amount: 0, reserve_rate: 0.50 },
      };

      invoices?.forEach(inv => {
        const dueDate = new Date(inv.due_date);
        const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (24 * 60 * 60 * 1000));

        if (daysOverdue <= 0) {
          agingBuckets.current.count++;
          agingBuckets.current.amount += inv.amount;
        } else if (daysOverdue <= 30) {
          agingBuckets.days_1_30.count++;
          agingBuckets.days_1_30.amount += inv.amount;
        } else if (daysOverdue <= 60) {
          agingBuckets.days_31_60.count++;
          agingBuckets.days_31_60.amount += inv.amount;
        } else if (daysOverdue <= 90) {
          agingBuckets.days_61_90.count++;
          agingBuckets.days_61_90.amount += inv.amount;
        } else if (daysOverdue <= 120) {
          agingBuckets.days_91_120.count++;
          agingBuckets.days_91_120.amount += inv.amount;
        } else {
          agingBuckets.over_120.count++;
          agingBuckets.over_120.amount += inv.amount;
        }
      });

      // Calculate recommended reserve
      let recommendedReserve = 0;
      Object.values(agingBuckets).forEach(bucket => {
        recommendedReserve += bucket.amount * bucket.reserve_rate;
      });

      return NextResponse.json({
        aging_buckets: agingBuckets,
        total_outstanding: Object.values(agingBuckets).reduce((sum, b) => sum + b.amount, 0),
        recommended_reserve: Math.round(recommendedReserve * 100) / 100,
      });
    }

    if (type === 'recovery') {
      // Get recovered bad debts
      const { data: recoveries, error } = await supabase
        .from('bad_debt_recoveries')
        .select(`
          *,
          write_off:bad_debt_write_offs(id, invoice_id, write_off_amount)
        `)
        .order('recovery_date', { ascending: false });

      if (error) throw error;

      const totalRecovered = recoveries?.reduce((sum, r) => sum + r.recovery_amount, 0) || 0;

      return NextResponse.json({
        recoveries,
        total_recovered: totalRecovered,
      });
    }

    // Default: return summary
    const currentYear = new Date().getFullYear();
    const [writeOffsResult, reservesResult, recoveriesResult] = await Promise.all([
      supabase.from('bad_debt_write_offs').select('write_off_amount').gte('write_off_date', `${currentYear}-01-01`),
      supabase.from('bad_debt_reserves').select('reserve_amount').eq('status', 'active'),
      supabase.from('bad_debt_recoveries').select('recovery_amount').gte('recovery_date', `${currentYear}-01-01`),
    ]);

    return NextResponse.json({
      summary: {
        ytd_write_offs: writeOffsResult.data?.reduce((sum, w) => sum + w.write_off_amount, 0) || 0,
        current_reserve: reservesResult.data?.reduce((sum, r) => sum + r.reserve_amount, 0) || 0,
        ytd_recoveries: recoveriesResult.data?.reduce((sum, r) => sum + r.recovery_amount, 0) || 0,
      },
    });
  } catch (error: any) {
    console.error('Bad debt error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create write-off, reserve, or recovery
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action;

    if (action === 'write_off') {
      const validated = writeOffSchema.parse(body.data);

      // Get invoice details
      const { data: invoice } = await supabase
        .from('client_invoices')
        .select('amount, status')
        .eq('id', validated.invoice_id)
        .single();

      if (!invoice) {
        return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
      }

      // Create write-off record
      const { data: writeOff, error } = await supabase
        .from('bad_debt_write_offs')
        .insert({
          ...validated,
          write_off_date: new Date().toISOString(),
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Update invoice status
      await supabase
        .from('client_invoices')
        .update({
          status: 'written_off',
          written_off_amount: validated.write_off_amount,
          written_off_date: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', validated.invoice_id);

      // Create ledger entry for write-off
      await supabase.from('ledger_entries').insert({
        entry_date: new Date().toISOString(),
        description: `Bad debt write-off - Invoice ${validated.invoice_id}`,
        debit: validated.write_off_amount,
        credit: 0,
        account_type: 'expense',
        reference_type: 'write_off',
        reference_id: writeOff.id,
        created_at: new Date().toISOString(),
      });

      return NextResponse.json({ write_off: writeOff }, { status: 201 });
    }

    if (action === 'create_reserve') {
      const validated = reserveSchema.parse(body.data);

      const { data: reserve, error } = await supabase
        .from('bad_debt_reserves')
        .insert({
          ...validated,
          status: 'active',
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ reserve }, { status: 201 });
    }

    if (action === 'record_recovery') {
      const { write_off_id, recovery_amount, recovery_method, notes } = body.data;

      const { data: recovery, error } = await supabase
        .from('bad_debt_recoveries')
        .insert({
          write_off_id,
          recovery_amount,
          recovery_method,
          notes,
          recovery_date: new Date().toISOString(),
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Create ledger entry for recovery
      await supabase.from('ledger_entries').insert({
        entry_date: new Date().toISOString(),
        description: `Bad debt recovery`,
        debit: 0,
        credit: recovery_amount,
        account_type: 'revenue',
        reference_type: 'recovery',
        reference_id: recovery.id,
        created_at: new Date().toISOString(),
      });

      return NextResponse.json({ recovery }, { status: 201 });
    }

    if (action === 'adjust_reserve') {
      const { reserve_id, new_amount, reason } = body.data;

      const { data: reserve } = await supabase
        .from('bad_debt_reserves')
        .select('reserve_amount')
        .eq('id', reserve_id)
        .single();

      const adjustment = new_amount - (reserve?.reserve_amount || 0);

      await supabase
        .from('bad_debt_reserves')
        .update({
          reserve_amount: new_amount,
          updated_at: new Date().toISOString(),
        })
        .eq('id', reserve_id);

      // Log adjustment
      await supabase.from('bad_debt_reserve_adjustments').insert({
        reserve_id,
        previous_amount: reserve?.reserve_amount,
        new_amount,
        adjustment_amount: adjustment,
        reason,
        created_at: new Date().toISOString(),
      });

      return NextResponse.json({ success: true, adjustment });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    console.error('Bad debt error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH - Update reserve
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    const { data: reserve, error } = await supabase
      .from('bad_debt_reserves')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ reserve });
  } catch (error: any) {
    console.error('Bad debt error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Release reserve
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('bad_debt_reserves')
      .update({ status: 'released', updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Bad debt error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
