export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { withAuth, PlatformRole, logger } from '@ghxstship/config';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const GVTEWAY_ROLES = [
  PlatformRole.GVTEWAY_ADMIN, PlatformRole.GVTEWAY_MEMBER, PlatformRole.GVTEWAY_MEMBER_PLUS,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN,
];

const addPaymentMethodSchema = z.object({
  type: z.enum(['card', 'bank', 'crypto']),
  last_four: z.string().length(4),
  brand: z.string().optional(),
  expiry_month: z.number().min(1).max(12).optional(),
  expiry_year: z.number().optional(),
  is_default: z.boolean().default(false),
});

export async function GET(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    
    const userRoles = authResult.user?.platformRoles || [];
    if (!GVTEWAY_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden - GVTEWAY access required' }, { status: 403 });
    }

    const userId = authResult.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false });

    if (error) {
      logger.error('Error fetching payment methods:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data || [] });
  } catch (error) {
    logger.error('Error in GET /api/wallet/payment-methods:', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ error: 'Failed to fetch payment methods' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    
    const userId = authResult.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    const body = await request.json();
    const validationResult = addPaymentMethodSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({ error: 'Validation failed', details: validationResult.error.errors }, { status: 400 });
    }

    if (validationResult.data.is_default) {
      await supabase
        .from('payment_methods')
        .update({ is_default: false })
        .eq('user_id', userId);
    }

    const { data, error } = await supabase
      .from('payment_methods')
      .insert({ ...validationResult.data, user_id: userId })
      .select()
      .single();

    if (error) {
      logger.error('Error adding payment method:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    logger.error('Error in POST /api/wallet/payment-methods:', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ error: 'Failed to add payment method' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    
    const userId = authResult.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const paymentMethodId = searchParams.get('id');

    if (!paymentMethodId) {
      return NextResponse.json({ error: 'Payment method ID required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('payment_methods')
      .delete()
      .eq('id', paymentMethodId)
      .eq('user_id', userId);

    if (error) {
      logger.error('Error deleting payment method:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    logger.error('Error in DELETE /api/wallet/payment-methods:', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ error: 'Failed to delete payment method' }, { status: 500 });
  }
}
