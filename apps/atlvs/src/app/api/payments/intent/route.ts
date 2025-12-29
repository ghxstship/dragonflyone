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
  PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

const intentSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().default('usd'),
  invoice_id: z.string().uuid().optional(),
  booking_id: z.string().uuid().optional(),
  description: z.string().optional(),
  metadata: z.record(z.string()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    
    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden - ATLVS access required' }, { status: 403 });
    }

    const body = await request.json();
    const validationResult = intentSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({ error: 'Validation failed', details: validationResult.error.errors }, { status: 400 });
    }

    const { amount, currency, invoice_id, booking_id, description, metadata } = validationResult.data;

    const { data: intent, error } = await supabase
      .from('payment_intents')
      .insert({
        amount,
        currency,
        invoice_id,
        booking_id,
        description,
        metadata: metadata || {},
        status: 'pending',
        created_by: authResult.user?.id,
      })
      .select()
      .single();

    if (error) {
      logger.error('Error creating payment intent:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      data: intent,
      client_secret: `pi_${intent.id}_secret_${Date.now()}`,
    }, { status: 201 });
  } catch (error) {
    logger.error('Error in POST /api/payments/intent:', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ error: 'Failed to create payment intent' }, { status: 500 });
  }
}
