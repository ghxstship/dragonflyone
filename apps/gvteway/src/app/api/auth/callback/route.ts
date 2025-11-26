import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://gvteway.ghxstship.com';

  if (error) {
    console.error('OAuth error:', error, errorDescription);
    return NextResponse.redirect(`${baseUrl}/auth/signin?error=${encodeURIComponent(errorDescription || error)}`);
  }

  if (!code) {
    return NextResponse.redirect(`${baseUrl}/auth/signin?error=missing_code`);
  }

  try {
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error('Code exchange error:', exchangeError);
      return NextResponse.redirect(`${baseUrl}/auth/signin?error=${encodeURIComponent(exchangeError.message)}`);
    }

    const { data: platformUser } = await supabase
      .from('platform_users')
      .select('id')
      .eq('auth_user_id', data.user.id)
      .single();

    if (!platformUser) {
      await supabase
        .from('platform_users')
        .insert({
          auth_user_id: data.user.id,
          email: data.user.email || '',
          full_name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0],
          avatar_url: data.user.user_metadata?.avatar_url,
          platform_roles: ['GVTEWAY_MEMBER'],
          status: 'active',
        });

      await supabase.from('audit_logs').insert({
        action: 'oauth_signup',
        resource_type: 'auth',
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        user_agent: request.headers.get('user-agent'),
        metadata: { email: data.user.email, platform: 'gvteway', provider: data.user.app_metadata?.provider },
      });

      return NextResponse.redirect(`${baseUrl}/onboarding`);
    }

    await supabase.from('audit_logs').insert({
      user_id: platformUser.id,
      action: 'oauth_signin',
      resource_type: 'auth',
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      user_agent: request.headers.get('user-agent'),
      metadata: { email: data.user.email, platform: 'gvteway', provider: data.user.app_metadata?.provider },
    });

    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('id', data.user.id)
      .single();

    if (!profile?.onboarding_completed) {
      return NextResponse.redirect(`${baseUrl}/onboarding`);
    }

    return NextResponse.redirect(`${baseUrl}/dashboard`);
  } catch (err) {
    console.error('Callback error:', err);
    return NextResponse.redirect(`${baseUrl}/auth/signin?error=callback_failed`);
  }
}
