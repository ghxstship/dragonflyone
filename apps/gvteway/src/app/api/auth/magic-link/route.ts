import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}


// Lazy getter for supabase client - only accessed at runtime
const supabase = new Proxy({} as ReturnType<typeof getSupabaseClient>, {
  get(_target, prop) {
    return (getSupabaseClient() as any)[prop];
  }
});

const magicLinkSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const { email } = magicLinkSchema.parse(body);

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://gvteway.ghxstship.com';
    const redirectTo = `${baseUrl}/auth/callback?type=magiclink`;

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo,
      },
    });

    if (error) {
      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          { error: 'Too many attempts. Please try again later.' },
          { status: 429 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Magic link sent to your email'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }
    console.error('Magic link error:', error);
    return NextResponse.json({ error: 'Failed to send magic link' }, { status: 500 });
  }
}
