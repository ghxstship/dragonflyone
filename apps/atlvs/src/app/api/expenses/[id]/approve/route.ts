import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const approvalSchema = z.object({
  user_id: z.string().uuid().optional(),
  notes: z.string().optional(),
  action: z.enum(['approve', 'reject']),
  rejection_reason: z.string().optional(),
});

// POST /api/expenses/[id]/approve - Approve or reject expense
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const validated = approvalSchema.parse(body);
    const userId = validated.user_id || '00000000-0000-0000-0000-000000000000';

    // Fetch current expense
    const { data: expense, error: fetchError } = await supabase
      .from('expenses')
      .select(`
        *,
        submitted_by_user:platform_users!submitted_by(id, full_name, email),
        project:projects(id, name, project_code)
      `)
      .eq('id', id)
      .single();

    if (fetchError || !expense) {
      return NextResponse.json(
        { error: 'Expense not found' },
        { status: 404 }
      );
    }

    // Validate status for approval
    if (expense.status !== 'pending_approval') {
      return NextResponse.json(
        { error: `Cannot process expense in ${expense.status} status. Must be pending_approval.` },
        { status: 400 }
      );
    }

    // Check approval authority
    const { data: approver } = await supabase
      .from('platform_users')
      .select('id, full_name, platform_roles, expense_approval_limit')
      .eq('id', userId)
      .single();

    if (!approver) {
      return NextResponse.json(
        { error: 'Approver not found' },
        { status: 404 }
      );
    }

    // Check if user has approval authority
    const hasApprovalRole = approver.platform_roles?.some((role: string) => 
      ['LEGEND_SUPER_ADMIN', 'LEGEND_ADMIN', 'ATLVS_SUPER_ADMIN', 'ATLVS_ADMIN'].includes(role)
    );

    const withinLimit = !approver.expense_approval_limit || expense.amount <= approver.expense_approval_limit;

    if (!hasApprovalRole && !withinLimit) {
      return NextResponse.json(
        { error: 'Insufficient approval authority for this expense amount' },
        { status: 403 }
      );
    }

    // Cannot approve own expenses (unless Legend role)
    const isLegend = approver.platform_roles?.some((role: string) => role.startsWith('LEGEND_'));
    if (expense.submitted_by === userId && !isLegend) {
      return NextResponse.json(
        { error: 'Cannot approve your own expense' },
        { status: 403 }
      );
    }

    if (validated.action === 'approve') {
      // Approve expense
      const { data: updatedExpense, error: updateError } = await supabase
        .from('expenses')
        .update({
          status: 'approved',
          approved_by: userId,
          approved_at: new Date().toISOString(),
          approval_notes: validated.notes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        return NextResponse.json(
          { error: 'Failed to approve expense', details: updateError.message },
          { status: 500 }
        );
      }

      // Create approval record
      await supabase.from('expense_approvals').insert({
        expense_id: id,
        approver_id: userId,
        action: 'approved',
        notes: validated.notes,
        amount_at_approval: expense.amount,
      });

      // Log activity
      await supabase.from('expense_activity_log').insert({
        expense_id: id,
        activity_type: 'approved',
        user_id: userId,
        description: `Expense approved by ${approver.full_name}`,
      });

      // Create ledger entry for approved expense
      await supabase.from('ledger_entries').insert({
        organization_id: expense.organization_id,
        account_code: '6000', // Expense account
        entry_type: 'debit',
        amount: expense.amount,
        description: `Expense ${expense.expense_number} - ${expense.description}`,
        reference_type: 'expense',
        reference_id: id,
        entry_date: expense.expense_date,
        created_by: userId,
        project_id: expense.project_id,
      });

      // If billable, also create accounts receivable entry
      if (expense.is_billable && expense.client_id) {
        await supabase.from('ledger_entries').insert({
          organization_id: expense.organization_id,
          account_code: '1200', // Accounts Receivable
          entry_type: 'debit',
          amount: expense.amount,
          description: `Billable expense ${expense.expense_number}`,
          reference_type: 'expense',
          reference_id: id,
          entry_date: expense.expense_date,
          created_by: userId,
          client_id: expense.client_id,
        });
      }

      // Send notification to submitter
      await supabase.from('notifications').insert({
        user_id: expense.submitted_by,
        type: 'expense_approved',
        title: 'Expense Approved',
        message: `Your expense ${expense.expense_number} for $${expense.amount} has been approved`,
        data: {
          expense_id: id,
          expense_number: expense.expense_number,
          amount: expense.amount,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Expense approved',
        expense: updatedExpense,
      });
    } else {
      // Reject expense
      if (!validated.rejection_reason) {
        return NextResponse.json(
          { error: 'Rejection reason is required' },
          { status: 400 }
        );
      }

      const { data: updatedExpense, error: updateError } = await supabase
        .from('expenses')
        .update({
          status: 'rejected',
          rejected_by: userId,
          rejected_at: new Date().toISOString(),
          rejection_reason: validated.rejection_reason,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        return NextResponse.json(
          { error: 'Failed to reject expense', details: updateError.message },
          { status: 500 }
        );
      }

      // Create rejection record
      await supabase.from('expense_approvals').insert({
        expense_id: id,
        approver_id: userId,
        action: 'rejected',
        notes: validated.rejection_reason,
        amount_at_approval: expense.amount,
      });

      // Log activity
      await supabase.from('expense_activity_log').insert({
        expense_id: id,
        activity_type: 'rejected',
        user_id: userId,
        description: `Expense rejected by ${approver.full_name}: ${validated.rejection_reason}`,
      });

      // Send notification to submitter
      await supabase.from('notifications').insert({
        user_id: expense.submitted_by,
        type: 'expense_rejected',
        title: 'Expense Rejected',
        message: `Your expense ${expense.expense_number} has been rejected: ${validated.rejection_reason}`,
        data: {
          expense_id: id,
          expense_number: expense.expense_number,
          amount: expense.amount,
          reason: validated.rejection_reason,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Expense rejected',
        expense: updatedExpense,
      });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error in POST /api/expenses/[id]/approve:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
