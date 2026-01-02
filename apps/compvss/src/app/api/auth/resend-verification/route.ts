export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase, logger } from '@ghxstship/config';
import { z } from 'zod';

const resendSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const body = await request.json();
    const { email } = resendSchema.parse(body);

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://compvss.ghxstship.com';

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${baseUrl}/auth/callback?type=signup`,
      },
    });

    if (error) {
      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          { error: 'Too many attempts. Please try again later.' },
          { status: 429 }
        );
      }
      logger.error('Resend verification error:', error);
    }

    // Always return success to prevent email enumeration
    return NextResponse.json({
      success: true,
      message: 'If an account exists with this email, a verification email has been sent.',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }
    logger.error('Resend verification error:', error);
    return NextResponse.json(
      { error: 'Failed to resend verification email' },
      { status: 500 }
    );
  }
}
