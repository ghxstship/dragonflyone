export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase';
import { apiRoute } from '@ghxstship/config/middleware';
import { PlatformRole } from '@ghxstship/config/roles';

const UpdatePaymentSchema = z.object({
  amount: z.number().positive().optional(),
  status: z.enum(['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled']).optional(),
  payment_method: z.enum(['card', 'bank', 'wallet', 'crypto', 'cash', 'check', 'wire']).optional(),
  payment_date: z.string().optional(),
  reference_number: z.string().optional(),
  notes: z.string().optional(),
});

export const GET = apiRoute(
  async (request: NextRequest, context) => {
    const supabase = createAdminClient();
    const { id } = await context.params!;

    const { data, error } = await supabase
      .from('finance_payments')
      .select(`
        *,
        invoice:finance_invoices(id, invoice_number, total_amount, client_id)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ payment: data });
  },
  {
    auth: true,
    roles: [PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_SUPER_ADMIN],
    audit: { action: 'payment:view', resource: 'finance_payments' },
  }
);

export const PATCH = apiRoute(
  async (request: NextRequest, context) => {
    const supabase = createAdminClient();
    const { id } = await context.params!;
    const body = await request.json();

    const validationResult = UpdatePaymentSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const updateData = {
      ...validationResult.data,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('finance_payments')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ payment: data });
  },
  {
    auth: true,
    roles: [PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_SUPER_ADMIN],
    validation: UpdatePaymentSchema,
    audit: { action: 'payment:update', resource: 'finance_payments' },
  }
);

export const DELETE = apiRoute(
  async (request: NextRequest, context) => {
    const supabase = createAdminClient();
    const { id } = await context.params!;

    const { error } = await supabase
      .from('finance_payments')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  },
  {
    auth: true,
    roles: [PlatformRole.ATLVS_SUPER_ADMIN],
    audit: { action: 'payment:delete', resource: 'finance_payments' },
  }
);
