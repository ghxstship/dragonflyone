import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/payroll/[id] - Get single payroll run with details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const { data: payrollRun, error } = await supabase
      .from('payroll_runs')
      .select(`
        *,
        created_by_user:platform_users!created_by(id, full_name),
        approved_by_user:platform_users!approved_by(id, full_name),
        payroll_items:payroll_items(
          *,
          employee:employees(id, first_name, last_name, employee_number, department_id)
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Payroll run not found' }, { status: 404 });
      }
      return NextResponse.json(
        { error: 'Failed to fetch payroll run', details: error.message },
        { status: 500 }
      );
    }

    // Fetch activity history
    const { data: history } = await supabase
      .from('payroll_activity_log')
      .select(`*, user:platform_users(id, full_name)`)
      .eq('payroll_run_id', id)
      .order('created_at', { ascending: false });

    return NextResponse.json({ ...payrollRun, history: history || [] });
  } catch (error) {
    console.error('Error in GET /api/payroll/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/payroll/[id] - Actions (submit, approve, process, etc.)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { action } = body;
    const userId = body.user_id || '00000000-0000-0000-0000-000000000000';

    const { data: payrollRun, error: fetchError } = await supabase
      .from('payroll_runs')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !payrollRun) {
      return NextResponse.json({ error: 'Payroll run not found' }, { status: 404 });
    }

    switch (action) {
      case 'submit': {
        if (payrollRun.status !== 'draft') {
          return NextResponse.json(
            { error: 'Only draft payroll runs can be submitted' },
            { status: 400 }
          );
        }

        const { error } = await supabase
          .from('payroll_runs')
          .update({
            status: 'pending_approval',
            submitted_at: new Date().toISOString(),
            submitted_by: userId,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id);

        if (error) {
          return NextResponse.json(
            { error: 'Failed to submit payroll run', details: error.message },
            { status: 500 }
          );
        }

        await supabase.from('payroll_activity_log').insert({
          payroll_run_id: id,
          activity_type: 'submitted',
          user_id: userId,
          description: 'Payroll run submitted for approval',
        });

        return NextResponse.json({ success: true, message: 'Payroll run submitted for approval' });
      }

      case 'approve': {
        if (payrollRun.status !== 'pending_approval') {
          return NextResponse.json(
            { error: 'Only pending payroll runs can be approved' },
            { status: 400 }
          );
        }

        const { error } = await supabase
          .from('payroll_runs')
          .update({
            status: 'approved',
            approved_at: new Date().toISOString(),
            approved_by: userId,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id);

        if (error) {
          return NextResponse.json(
            { error: 'Failed to approve payroll run', details: error.message },
            { status: 500 }
          );
        }

        await supabase.from('payroll_activity_log').insert({
          payroll_run_id: id,
          activity_type: 'approved',
          user_id: userId,
          description: 'Payroll run approved',
        });

        return NextResponse.json({ success: true, message: 'Payroll run approved' });
      }

      case 'process': {
        if (payrollRun.status !== 'approved') {
          return NextResponse.json(
            { error: 'Only approved payroll runs can be processed' },
            { status: 400 }
          );
        }

        // Update status to processing
        await supabase
          .from('payroll_runs')
          .update({
            status: 'processing',
            processed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', id);

        // Update all payroll items to paid
        await supabase
          .from('payroll_items')
          .update({ status: 'paid', paid_at: new Date().toISOString() })
          .eq('payroll_run_id', id);

        // Create ledger entries for payroll
        await supabase.from('ledger_entries').insert([
          {
            organization_id: payrollRun.organization_id,
            account_code: '5100', // Salaries Expense
            entry_type: 'debit',
            amount: payrollRun.total_gross,
            description: `Payroll ${payrollRun.run_number} - Gross wages`,
            reference_type: 'payroll',
            reference_id: id,
            entry_date: payrollRun.pay_date,
            created_by: userId,
          },
          {
            organization_id: payrollRun.organization_id,
            account_code: '2100', // Payroll Taxes Payable
            entry_type: 'credit',
            amount: payrollRun.total_taxes,
            description: `Payroll ${payrollRun.run_number} - Taxes withheld`,
            reference_type: 'payroll',
            reference_id: id,
            entry_date: payrollRun.pay_date,
            created_by: userId,
          },
          {
            organization_id: payrollRun.organization_id,
            account_code: '1000', // Cash
            entry_type: 'credit',
            amount: payrollRun.total_net,
            description: `Payroll ${payrollRun.run_number} - Net pay`,
            reference_type: 'payroll',
            reference_id: id,
            entry_date: payrollRun.pay_date,
            created_by: userId,
          },
        ]);

        // Update status to completed
        await supabase
          .from('payroll_runs')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', id);

        await supabase.from('payroll_activity_log').insert({
          payroll_run_id: id,
          activity_type: 'processed',
          user_id: userId,
          description: 'Payroll run processed and completed',
        });

        return NextResponse.json({ success: true, message: 'Payroll run processed' });
      }

      case 'cancel': {
        if (['completed', 'cancelled'].includes(payrollRun.status)) {
          return NextResponse.json(
            { error: `Cannot cancel payroll run in ${payrollRun.status} status` },
            { status: 400 }
          );
        }

        const { error } = await supabase
          .from('payroll_runs')
          .update({
            status: 'cancelled',
            cancelled_at: new Date().toISOString(),
            cancelled_by: userId,
            cancellation_reason: body.reason,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id);

        if (error) {
          return NextResponse.json(
            { error: 'Failed to cancel payroll run', details: error.message },
            { status: 500 }
          );
        }

        await supabase.from('payroll_activity_log').insert({
          payroll_run_id: id,
          activity_type: 'cancelled',
          user_id: userId,
          description: `Payroll run cancelled: ${body.reason || 'No reason provided'}`,
        });

        return NextResponse.json({ success: true, message: 'Payroll run cancelled' });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in PATCH /api/payroll/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/payroll/[id] - Delete payroll run
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const { data: payrollRun, error: fetchError } = await supabase
      .from('payroll_runs')
      .select('id, status, run_number')
      .eq('id', id)
      .single();

    if (fetchError || !payrollRun) {
      return NextResponse.json({ error: 'Payroll run not found' }, { status: 404 });
    }

    if (payrollRun.status !== 'draft') {
      return NextResponse.json(
        { error: 'Only draft payroll runs can be deleted' },
        { status: 400 }
      );
    }

    await supabase.from('payroll_items').delete().eq('payroll_run_id', id);
    await supabase.from('payroll_activity_log').delete().eq('payroll_run_id', id);
    
    const { error: deleteError } = await supabase.from('payroll_runs').delete().eq('id', id);

    if (deleteError) {
      return NextResponse.json(
        { error: 'Failed to delete payroll run', details: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Payroll run ${payrollRun.run_number} deleted`,
    });
  } catch (error) {
    console.error('Error in DELETE /api/payroll/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
