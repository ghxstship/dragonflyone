export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ATLVS_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

const ATLVS_ADMIN_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

const PaymentSchema = z.object({
  invoice_id: z.string().uuid().optional(),
  client_id: z.string().uuid().optional(),
  vendor_id: z.string().uuid().optional(),
  amount: z.number().positive(),
  currency: z.string().default('USD'),
  payment_method: z.enum(['card', 'bank', 'wallet', 'crypto', 'cash', 'check', 'wire']),
  status: z.enum(['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled']).default('pending'),
  payment_date: z.string().optional(),
  reference_number: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    
    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden - ATLVS access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const paymentMethod = searchParams.get('payment_method');
    const invoiceId = searchParams.get('invoice_id');
    const clientId = searchParams.get('client_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('finance_payments')
      .select(`
        *,
        invoice:finance_invoices(id, invoice_number, total_amount)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    if (paymentMethod && paymentMethod !== 'all') {
      query = query.eq('payment_method', paymentMethod);
    }
    if (invoiceId) {
      query = query.eq('invoice_id', invoiceId);
    }
    if (clientId) {
      query = query.eq('client_id', clientId);
    }
    if (startDate) {
      query = query.gte('payment_date', startDate);
    }
    if (endDate) {
      query = query.lte('payment_date', endDate);
    }

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const payments = data || [];
    const summary = {
      total: count || 0,
      total_amount: payments.reduce((sum, p) => sum + (p.amount || 0), 0),
      by_status: {
        pending: payments.filter(p => p.status === 'pending').length,
        processing: payments.filter(p => p.status === 'processing').length,
        completed: payments.filter(p => p.status === 'completed').length,
        failed: payments.filter(p => p.status === 'failed').length,
        refunded: payments.filter(p => p.status === 'refunded').length,
      },
      by_method: {
        card: payments.filter(p => p.payment_method === 'card').length,
        bank: payments.filter(p => p.payment_method === 'bank').length,
        check: payments.filter(p => p.payment_method === 'check').length,
        wire: payments.filter(p => p.payment_method === 'wire').length,
        cash: payments.filter(p => p.payment_method === 'cash').length,
      },
    };

    return NextResponse.json({
      payments,
      summary,
      pagination: { limit, offset, total: count || 0 },
    });
  } catch (error: unknown) {
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    
    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ADMIN_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = PaymentSchema.parse(body);

    const { data, error } = await supabase
      .from('finance_payments')
      .insert({
        ...validatedData,
        payment_date: validatedData.payment_date || new Date().toISOString().split('T')[0],
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ payment: data }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    logger.error('Error in POST /api/payments:', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 });
  }
}
