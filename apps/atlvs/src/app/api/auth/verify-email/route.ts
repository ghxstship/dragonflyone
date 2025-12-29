export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const verifyEmailSchema = z.object({
  token: z.string().min(1),
  type: z.enum(['signup', 'email']).optional(),
});

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const body = await request.json();
    const validatedData = verifyEmailSchema.parse(body);
    const { token, type } = validatedData;

    const { error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: (type as 'signup' | 'email') || 'signup',
    });

    if (error) {
      if (error.message.includes('expired')) {
        return NextResponse.json(
          { error: 'Verification link has expired. Please request a new one.' },
          { status: 400 }
        );
      }
      return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    logger.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'Email verification failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const type = searchParams.get('type') || 'signup';
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://atlvs.ghxstship.com';

  if (!token) {
    return NextResponse.redirect(`${baseUrl}/auth/signin?error=missing_token`);
  }

  try {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: type as 'signup' | 'email',
    });

    if (error) {
      return NextResponse.redirect(`${baseUrl}/auth/signin?error=${encodeURIComponent(error.message)}`);
    }

    return NextResponse.redirect(`${baseUrl}/auth/signin?verified=true`);
  } catch (error) {
    return NextResponse.redirect(`${baseUrl}/auth/signin?error=verification_failed`);
  }
}
