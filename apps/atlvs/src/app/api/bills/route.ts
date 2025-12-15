export const dynamic = 'force-dynamic';

import { logger } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const billSchema = z.object({
  vendor_id: z.string().uuid(),
  project_id: z.string().uuid().optional(),
  description: z.string().min(1),
  amount: z.number().positive(),
  currency: z.string().default('USD'),
  issue_date: z.string(),
  due_date: z.string(),
  category: z.enum([
    'equipment', 'labor', 'materials', 'services', 'venue', 
    'catering', 'transportation', 'insurance', 'permits', 'other'
  ]).optional(),
  reference_number: z.string().optional(),
  notes: z.string().optional(),
  attachments: z.array(z.string()).optional(),
});

// GET /api/bills - List all bills
export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const vendorId = searchParams.get('vendor_id');
    const projectId = searchParams.get('project_id');
    const overdue = searchParams.get('overdue') === 'true';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = (page - 1) * limit;

    let query = supabase
      .from('bills')
      .select(`
        *,
        vendor:vendors(id, name, vendor_code),
        project:projects(id, name, project_code)
      `, { count: 'exact' })
      .order('due_date', { ascending: true });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    if (vendorId) {
      query = query.eq('vendor_id', vendorId);
    }
    if (projectId) {
      query = query.eq('project_id', projectId);
    }
    if (overdue) {
      query = query
        .in('status', ['pending', 'partial'])
        .lt('due_date', new Date().toISOString().split('T')[0]);
    }

    const { data, error, count } = await query.range(offset, offset + limit - 1);

    if (error) {
      logger.error('Error fetching bills:', error);
      return NextResponse.json(
        { error: 'Failed to fetch bills', details: error.message },
        { status: 500 }
      );
    }

    interface BillRecord {
      id: string;
      status: string;
      amount: number;
      amount_paid: number;
      due_date: string;
      [key: string]: unknown;
    }
    const bills = (data || []) as unknown as BillRecord[];

    const now = new Date();
    const summary = {
      total: bills.length,
      by_status: {
        pending: bills.filter(b => b.status === 'pending').length,
        partial: bills.filter(b => b.status === 'partial').length,
        paid: bills.filter(b => b.status === 'paid').length,
        cancelled: bills.filter(b => b.status === 'cancelled').length,
      },
      total_billed: bills.reduce((sum, b) => sum + (b.amount || 0), 0),
      total_paid: bills.reduce((sum, b) => sum + (b.amount_paid || 0), 0),
      total_outstanding: bills
        .filter(b => ['pending', 'partial'].includes(b.status))
        .reduce((sum, b) => sum + ((b.amount || 0) - (b.amount_paid || 0)), 0),
      overdue_amount: bills
        .filter(b => new Date(b.due_date) < now && ['pending', 'partial'].includes(b.status))
        .reduce((sum, b) => sum + ((b.amount || 0) - (b.amount_paid || 0)), 0),
    };

    const totalCount = count || bills.length;
    const pagination = {
      page,
      limit,
      total: totalCount,
      totalPages: Math.ceil(totalCount / limit),
      hasMore: offset + bills.length < totalCount,
    };

    return NextResponse.json({ bills: data, summary, pagination });
  } catch (error) {
    logger.error('Error in GET /api/bills:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/bills - Create new bill
export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const body = await request.json();
    const validated = billSchema.parse(body);

    const organizationId = body.organization_id || '00000000-0000-0000-0000-000000000000';
    const userId = body.user_id || '00000000-0000-0000-0000-000000000000';

    // Generate bill number
    const { data: billNumber } = await supabase.rpc('generate_bill_number', {
      org_id: organizationId,
    });

    // Create bill
    const { data: bill, error: billError } = await supabase
      .from('bills')
      .insert({
        bill_number: billNumber || `BILL-${Date.now()}`,
        organization_id: organizationId,
        vendor_id: validated.vendor_id,
        project_id: validated.project_id,
        description: validated.description,
        amount: validated.amount,
        amount_paid: 0,
        currency: validated.currency,
        issue_date: validated.issue_date,
        due_date: validated.due_date,
        category: validated.category,
        reference_number: validated.reference_number,
        notes: validated.notes,
        status: 'pending',
        created_by: userId,
      })
      .select(`*, vendor:vendors(id, name)`)
      .single();

    if (billError) {
      logger.error('Error creating bill:', billError);
      return NextResponse.json(
        { error: 'Failed to create bill', details: billError.message },
        { status: 500 }
      );
    }

    // Log activity
    await supabase.from('bill_activity_log').insert({
      bill_id: bill.id,
      activity_type: 'created',
      user_id: userId,
      description: 'Bill created',
    }).catch(() => {
      // Activity log table may not exist yet
    });

    return NextResponse.json(bill, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    logger.error('Error in POST /api/bills:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
