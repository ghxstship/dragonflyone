import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@ghxstship/config';

export async function POST(
  request: NextRequest,
  { params }: { params: { provider: string } }
) {
  const supabase = getServerSupabase();
  try {
    const provider = params.provider as 'google' | 'apple';
    
    if (!['google', 'apple'].includes(provider)) {
      return NextResponse.json(
        { error: 'Invalid OAuth provider' },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://compvss.ghxstship.com';
    const redirectTo = `${baseUrl}/auth/callback?type=oauth`;

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
        queryParams: provider === 'google' ? {
          access_type: 'offline',
          prompt: 'consent',
        } : undefined,
      },
    });

    if (error) {
      console.error('OAuth error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ url: data.url });
  } catch (error) {
    console.error('OAuth error:', error);
    return NextResponse.json({ error: 'OAuth initialization failed' }, { status: 500 });
  }
}
