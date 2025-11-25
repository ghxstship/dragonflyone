import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST - Verify student/military/senior discount eligibility
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      discount_type, // 'student', 'military', 'senior', 'first_responder'
      verification_data,
      event_id,
    } = body;

    // Check if user already has verified status
    const { data: existingVerification } = await supabase
      .from('discount_verifications')
      .select('*')
      .eq('user_id', user.id)
      .eq('discount_type', discount_type)
      .eq('status', 'verified')
      .gte('expires_at', new Date().toISOString())
      .single();

    if (existingVerification) {
      return NextResponse.json({
        verified: true,
        discount_type,
        discount_percent: getDiscountPercent(discount_type),
        expires_at: existingVerification.expires_at,
      });
    }

    // Create verification request
    const { data: verification, error } = await supabase
      .from('discount_verifications')
      .insert({
        user_id: user.id,
        discount_type,
        verification_method: verification_data.method, // 'sheerid', 'id.me', 'manual'
        verification_id: verification_data.verification_id,
        status: 'pending',
        submitted_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // For demo purposes, auto-verify (in production, integrate with SheerID or ID.me)
    if (verification_data.method === 'demo') {
      const expiresAt = new Date();
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);

      await supabase
        .from('discount_verifications')
        .update({
          status: 'verified',
          verified_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString(),
        })
        .eq('id', verification.id);

      return NextResponse.json({
        verified: true,
        discount_type,
        discount_percent: getDiscountPercent(discount_type),
        expires_at: expiresAt.toISOString(),
      });
    }

    return NextResponse.json({
      verification_id: verification.id,
      status: 'pending',
      message: 'Verification submitted. You will be notified once verified.',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 500 }
    );
  }
}

function getDiscountPercent(type: string): number {
  switch (type) {
    case 'student': return 15;
    case 'military': return 20;
    case 'senior': return 10;
    case 'first_responder': return 15;
    default: return 0;
  }
}

// GET - Check user's verified discounts
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: verifications, error } = await supabase
      .from('discount_verifications')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'verified')
      .gte('expires_at', new Date().toISOString());

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const discounts = verifications.map(v => ({
      type: v.discount_type,
      discount_percent: getDiscountPercent(v.discount_type),
      expires_at: v.expires_at,
    }));

    return NextResponse.json({ discounts });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch discounts' },
      { status: 500 }
    );
  }
}
