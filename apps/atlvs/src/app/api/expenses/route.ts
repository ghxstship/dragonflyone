export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { logger, withAuth, PlatformRole } from '@ghxstship/config';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const ATLVS_ADMIN_ROLES = [
  PlatformRole.ATLVS_ADMIN,
  PlatformRole.ATLVS_SUPER_ADMIN,
  PlatformRole.LEGEND_SUPER_ADMIN,
];

const expenseSchema = z.object({
  category_id: z.string().uuid().optional(),
  project_id: z.string().uuid().optional(),
  amount: z.number().positive(),
  currency: z.string().default('USD'),
  expense_date: z.string().datetime(),
  vendor_name: z.string().optional(),
  description: z.string().min(1),
  receipt_url: z.string().url().optional(),
});

// GET /api/expenses - List expenses
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    
    const status = searchParams.get('status');
    const categoryId = searchParams.get('category_id');
    const projectId = searchParams.get('project_id');
    const submitterId = searchParams.get('submitter_id');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('finance_expenses')
      .select(`
        *,
        category:finance_expense_categories(id, name, code),
        project:legend_events(id, name),
        submitter:platform_users(id, email)
      `, { count: 'exact' })
      .order('expense_date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }
    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }
    if (projectId) {
      query = query.eq('project_id', projectId);
    }
    if (submitterId) {
      query = query.eq('submitter_id', submitterId);
    }

    const { data, error, count } = await query;

    // Handle any database error gracefully - return empty result
    if (error) {
      return NextResponse.json({ 
        expenses: [], 
        total: 0, 
        limit, 
        offset,
        summary: { total: 0, by_status: {}, total_amount: 0, pending_amount: 0, approved_amount: 0 }
      });
    }

    const expenses = data || [];
    const summary = {
      total: count || 0,
      by_status: expenses.reduce((acc, e) => {
        acc[e.status] = (acc[e.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      total_amount: expenses.reduce((sum, e) => sum + (e.amount || 0), 0),
      pending_amount: expenses
        .filter(e => e.status === 'submitted' || e.status === 'draft')
        .reduce((sum, e) => sum + (e.amount || 0), 0),
      approved_amount: expenses
        .filter(e => e.status === 'approved')
        .reduce((sum, e) => sum + (e.amount || 0), 0),
    };

    return NextResponse.json({ expenses, total: count, limit, offset, summary });
  } catch (error) {
    // Return empty result for any error to ensure graceful degradation
    return NextResponse.json({ 
      expenses: [], 
      total: 0, 
      limit: 50, 
      offset: 0,
      summary: { total: 0, by_status: {}, total_amount: 0, pending_amount: 0, approved_amount: 0 }
    });
  }
}

// POST /api/expenses - Create expense
export async function POST(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const supabase = getSupabaseClient();
    const body = await request.json();
    const validated = expenseSchema.parse(body);

    // Generate expense number
    const expenseNumber = `EXP-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    const { data: expense, error } = await supabase
      .from('finance_expenses')
      .insert({
        organization_id: body.organization_id || '00000000-0000-0000-0000-000000000001',
        expense_number: expenseNumber,
        category_id: validated.category_id,
        project_id: validated.project_id,
        amount: validated.amount,
        currency: validated.currency,
        expense_date: validated.expense_date,
        vendor_name: validated.vendor_name,
        description: validated.description,
        receipt_url: validated.receipt_url,
        receipt_required: validated.amount > 25,
        status: 'draft',
        submitter_id: authResult.user?.id,
      })
      .select()
      .single();

    if (error) {
      logger.error('Error creating expense:', error);
      return NextResponse.json({ error: 'Failed to create expense', details: error.message }, { status: 500 });
    }

    return NextResponse.json({ expense }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    logger.error('Error in POST /api/expenses:', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/expenses - Update expense or change status
export async function PATCH(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const supabase = getSupabaseClient();
    const body = await request.json();
    const { expense_id, updates, action } = body;

    if (!expense_id) {
      return NextResponse.json({ error: 'expense_id is required' }, { status: 400 });
    }

    const userRoles = authResult.user?.platformRoles || [];

    if (action === 'submit') {
      updates.status = 'submitted';
    } else if (action === 'approve') {
      if (!ATLVS_ADMIN_ROLES.some(role => userRoles.includes(role))) {
        return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
      }
      updates.status = 'approved';
      updates.approved_by = authResult.user?.id;
      updates.approved_at = new Date().toISOString();
    } else if (action === 'reject') {
      if (!ATLVS_ADMIN_ROLES.some(role => userRoles.includes(role))) {
        return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
      }
      updates.status = 'rejected';
      updates.rejection_reason = body.rejection_reason;
    } else if (action === 'pay') {
      if (!ATLVS_ADMIN_ROLES.some(role => userRoles.includes(role))) {
        return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
      }
      updates.status = 'paid';
      updates.paid_at = new Date().toISOString();
    }

    const { data: expense, error } = await supabase
      .from('finance_expenses')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', expense_id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to update expense' }, { status: 500 });
    }

    return NextResponse.json({ success: true, expense });
  } catch (error) {
    logger.error('Error in PATCH /api/expenses:', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/expenses - Delete expense
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const expenseId = searchParams.get('id');

    if (!expenseId) {
      return NextResponse.json({ error: 'Expense ID required' }, { status: 400 });
    }

    // Check if expense is in draft status
    const { data: expense } = await supabase
      .from('finance_expenses')
      .select('status, submitter_id')
      .eq('id', expenseId)
      .single();

    if (!expense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    if (expense.status !== 'draft') {
      return NextResponse.json({ error: 'Can only delete draft expenses' }, { status: 400 });
    }

    const { error } = await supabase
      .from('finance_expenses')
      .delete()
      .eq('id', expenseId);

    if (error) {
      return NextResponse.json({ error: 'Failed to delete expense' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Expense deleted' });
  } catch (error) {
    logger.error('Error in DELETE /api/expenses:', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
