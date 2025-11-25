import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const expenseSchema = z.object({
  project_id: z.string().uuid().optional(),
  category: z.enum([
    'travel', 'meals', 'lodging', 'transportation', 'equipment', 
    'supplies', 'entertainment', 'communication', 'professional_services',
    'marketing', 'office', 'other'
  ]),
  description: z.string().min(1),
  amount: z.number().positive(),
  currency: z.string().default('USD'),
  expense_date: z.string(),
  vendor_name: z.string().optional(),
  receipt_url: z.string().url().optional(),
  notes: z.string().optional(),
  is_billable: z.boolean().default(false),
  client_id: z.string().uuid().optional(),
  tags: z.array(z.string()).optional(),
});

// GET /api/expenses - List all expenses
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const projectId = searchParams.get('project_id');
    const submittedBy = searchParams.get('submitted_by');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    let query = supabase
      .from('expenses')
      .select(`
        *,
        project:projects(id, name, project_code),
        submitted_by_user:platform_users!submitted_by(id, full_name, email),
        approved_by_user:platform_users!approved_by(id, full_name),
        client:clients(id, name)
      `)
      .order('expense_date', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }
    if (projectId) {
      query = query.eq('project_id', projectId);
    }
    if (submittedBy) {
      query = query.eq('submitted_by', submittedBy);
    }
    if (startDate) {
      query = query.gte('expense_date', startDate);
    }
    if (endDate) {
      query = query.lte('expense_date', endDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching expenses:', error);
      return NextResponse.json(
        { error: 'Failed to fetch expenses', details: error.message },
        { status: 500 }
      );
    }

    // Type assertion
    interface ExpenseRecord {
      id: string;
      status: string;
      amount: number;
      category: string;
      is_billable: boolean;
      [key: string]: unknown;
    }
    const expenses = (data || []) as unknown as ExpenseRecord[];

    // Calculate summary statistics
    const summary = {
      total: expenses.length,
      by_status: {
        draft: expenses.filter(e => e.status === 'draft').length,
        pending_approval: expenses.filter(e => e.status === 'pending_approval').length,
        approved: expenses.filter(e => e.status === 'approved').length,
        rejected: expenses.filter(e => e.status === 'rejected').length,
        reimbursed: expenses.filter(e => e.status === 'reimbursed').length,
      },
      by_category: expenses.reduce((acc, e) => {
        acc[e.category] = (acc[e.category] || 0) + e.amount;
        return acc;
      }, {} as Record<string, number>),
      total_amount: expenses.reduce((sum, e) => sum + e.amount, 0),
      pending_amount: expenses
        .filter(e => e.status === 'pending_approval')
        .reduce((sum, e) => sum + e.amount, 0),
      approved_amount: expenses
        .filter(e => e.status === 'approved')
        .reduce((sum, e) => sum + e.amount, 0),
      billable_amount: expenses
        .filter(e => e.is_billable)
        .reduce((sum, e) => sum + e.amount, 0),
    };

    return NextResponse.json({
      expenses: data,
      summary,
    });
  } catch (error) {
    console.error('Error in GET /api/expenses:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/expenses - Create new expense
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = expenseSchema.parse(body);

    // TODO: Get from auth session
    const organizationId = body.organization_id || '00000000-0000-0000-0000-000000000000';
    const userId = body.user_id || '00000000-0000-0000-0000-000000000000';

    // Generate expense number
    const { data: expenseNumber } = await supabase.rpc('generate_expense_number', {
      org_id: organizationId,
    });

    // Create expense
    const { data: expense, error: expenseError } = await supabase
      .from('expenses')
      .insert({
        expense_number: expenseNumber,
        organization_id: organizationId,
        submitted_by: userId,
        project_id: validated.project_id,
        category: validated.category,
        description: validated.description,
        amount: validated.amount,
        currency: validated.currency,
        expense_date: validated.expense_date,
        vendor_name: validated.vendor_name,
        receipt_url: validated.receipt_url,
        notes: validated.notes,
        is_billable: validated.is_billable,
        client_id: validated.client_id,
        tags: validated.tags,
        status: 'draft',
      })
      .select(`
        *,
        project:projects(id, name),
        submitted_by_user:platform_users!submitted_by(id, full_name)
      `)
      .single();

    if (expenseError) {
      console.error('Error creating expense:', expenseError);
      return NextResponse.json(
        { error: 'Failed to create expense', details: expenseError.message },
        { status: 500 }
      );
    }

    // Log activity
    await supabase.from('expense_activity_log').insert({
      expense_id: expense.id,
      activity_type: 'created',
      user_id: userId,
      description: 'Expense created',
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error in POST /api/expenses:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/expenses - Submit for approval or bulk actions
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { expense_ids, action } = body;
    const userId = body.user_id || '00000000-0000-0000-0000-000000000000';

    if (!expense_ids || !Array.isArray(expense_ids) || expense_ids.length === 0) {
      return NextResponse.json(
        { error: 'expense_ids array is required' },
        { status: 400 }
      );
    }

    if (action === 'submit') {
      // Submit expenses for approval
      const { data, error } = await supabase
        .from('expenses')
        .update({
          status: 'pending_approval',
          submitted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .in('id', expense_ids)
        .eq('status', 'draft')
        .select();

      if (error) {
        return NextResponse.json(
          { error: 'Failed to submit expenses', details: error.message },
          { status: 500 }
        );
      }

      // Log activity for each expense
      for (const expenseId of expense_ids) {
        await supabase.from('expense_activity_log').insert({
          expense_id: expenseId,
          activity_type: 'submitted',
          user_id: userId,
          description: 'Expense submitted for approval',
        });
      }

      return NextResponse.json({
        success: true,
        message: `${data?.length || 0} expenses submitted for approval`,
        expenses: data,
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in PATCH /api/expenses:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
