import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

export async function POST(
  request: NextRequest,
  { params }: { params: { provider: string } }
) {
  try {
    const supabase = getSupabaseClient();
    const provider = params.provider as 'google' | 'apple';
    
    if (!['google', 'apple'].includes(provider)) {
      return NextResponse.json(
        { error: 'Invalid OAuth provider' },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://gvteway.ghxstship.com';
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
