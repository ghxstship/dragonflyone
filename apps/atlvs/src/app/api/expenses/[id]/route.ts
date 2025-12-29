export const dynamic = 'force-dynamic';

import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const updateExpenseSchema = z.object({
  user_id: z.string().uuid().optional(),
  description: z.string().optional(),
  amount: z.number().positive().optional(),
  category: z.string().optional(),
  project_id: z.string().uuid().optional(),
  client_id: z.string().uuid().optional(),
  receipt_url: z.string().url().optional(),
  notes: z.string().optional(),
  expense_date: z.string().optional(),
  vendor: z.string().optional(),
  payment_method: z.string().optional(),
});

// GET /api/expenses/[id] - Get single expense
const ATLVS_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createAdminClient();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = params;

    const { data: expense, error } = await supabase
      .from('expenses')
      .select(`
        *,
        project:projects(id, name, project_code, client_id),
        submitted_by_user:platform_users!submitted_by(id, full_name, email),
        approved_by_user:platform_users!approved_by(id, full_name),
        client:clients(id, name)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Expense not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to fetch expense', details: error.message },
        { status: 500 }
      );
    }

    // Fetch activity history
    const { data: history } = await supabase
      .from('expense_activity_log')
      .select(`
        *,
        user:platform_users(id, full_name)
      `)
      .eq('expense_id', id)
      .order('created_at', { ascending: false });

    return NextResponse.json({
      ...expense,
      history: history || [],
    });
  } catch (error) {
    logger.error('Error in GET /api/expenses/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/expenses/[id] - Update expense
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createAdminClient();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = params;
    const body = await request.json();
    const validatedData = updateExpenseSchema.parse(body);
    const userId = validatedData.user_id || '00000000-0000-0000-0000-000000000000';

    // Check if expense exists and is editable
    const { data: existingExpense, error: fetchError } = await supabase
      .from('expenses')
      .select('id, status')
      .eq('id', id)
      .single();

    if (fetchError || !existingExpense) {
      return NextResponse.json(
        { error: 'Expense not found' },
        { status: 404 }
      );
    }

    // Only allow editing draft or rejected expenses
    if (!['draft', 'rejected'].includes(existingExpense.status)) {
      return NextResponse.json(
        { error: `Cannot edit expense in ${existingExpense.status} status` },
        { status: 400 }
      );
    }

    const { user_id: submittedUserId, ...updates } = body;

    // Validate that the submitter matches the expense owner (if provided)
    if (submittedUserId && submittedUserId !== existingExpense.user_id) {
      return NextResponse.json(
        { error: 'Cannot change expense ownership' },
        { status: 403 }
      );
    }

    const { data: updatedExpense, error: updateError } = await supabase
      .from('expenses')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update expense', details: updateError.message },
        { status: 500 }
      );
    }

    // Log activity
    await supabase.from('expense_activity_log').insert({
      expense_id: id,
      activity_type: 'updated',
      user_id: userId,
      description: 'Expense updated',
    });

    return NextResponse.json(updatedExpense);
  } catch (error) {
    logger.error('Error in PUT /api/expenses/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/expenses/[id] - Delete expense
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createAdminClient();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = params;

    // Check if expense exists and can be deleted
    const { data: expense, error: fetchError } = await supabase
      .from('expenses')
      .select('id, status, expense_number')
      .eq('id', id)
      .single();

    if (fetchError || !expense) {
      return NextResponse.json(
        { error: 'Expense not found' },
        { status: 404 }
      );
    }

    // Only allow deleting draft expenses
    if (expense.status !== 'draft') {
      return NextResponse.json(
        { error: 'Only draft expenses can be deleted' },
        { status: 400 }
      );
    }

    // Delete activity log
    await supabase
      .from('expense_activity_log')
      .delete()
      .eq('expense_id', id);

    // Delete expense
    const { error: deleteError } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);

    if (deleteError) {
      return NextResponse.json(
        { error: 'Failed to delete expense', details: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Expense ${expense.expense_number} deleted`,
    });
  } catch (error) {
    logger.error('Error in DELETE /api/expenses/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
