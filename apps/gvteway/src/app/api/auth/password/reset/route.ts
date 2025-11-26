import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resetRequestSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = resetRequestSchema.parse(body);

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://gvteway.ghxstship.com';
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${baseUrl}/auth/reset-password`,
    });

    if (error) {
      // Don't reveal if email exists or not
      console.error('Password reset error:', error);
    }

    // Always return success to prevent email enumeration
    return NextResponse.json({
      message: 'If an account exists with this email, a password reset link has been sent.',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }
    console.error('Password reset error:', error);
    return NextResponse.json(
      { error: 'Password reset request failed' },
      { status: 500 }
    );
  }
}
