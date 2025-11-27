import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@ghxstship/config';

export async function POST(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const body = await request.json();
    const { token, type } = body;

    if (!token) {
      return NextResponse.json({ error: 'Verification token required' }, { status: 400 });
    }

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
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json({ error: 'Email verification failed' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const type = searchParams.get('type') || 'signup';
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://compvss.ghxstship.com';

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
