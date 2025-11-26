import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const type = searchParams.get('type');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://atlvs.ghxstship.com';

  // Handle OAuth errors
  if (error) {
    console.error('OAuth error:', error, errorDescription);
    return NextResponse.redirect(`${baseUrl}/auth/signin?error=${encodeURIComponent(errorDescription || error)}`);
  }

  if (!code) {
    return NextResponse.redirect(`${baseUrl}/auth/signin?error=missing_code`);
  }

  try {
    // Exchange code for session
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error('Code exchange error:', exchangeError);
      return NextResponse.redirect(`${baseUrl}/auth/signin?error=${encodeURIComponent(exchangeError.message)}`);
    }

    // Check if platform user exists
    const { data: platformUser } = await supabase
      .from('platform_users')
      .select('id, onboarding_completed')
      .eq('auth_user_id', data.user.id)
      .single();

    // Create platform user if doesn't exist (first OAuth sign-in)
    if (!platformUser) {
      const { error: createError } = await supabase
        .from('platform_users')
        .insert({
          auth_user_id: data.user.id,
          email: data.user.email || '',
          full_name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0],
          avatar_url: data.user.user_metadata?.avatar_url,
          platform_roles: ['ATLVS_VIEWER'],
          status: 'active',
        });

      if (createError) {
        console.error('Failed to create platform user:', createError);
      }

      // Log OAuth sign-up
      await supabase.from('audit_logs').insert({
        action: 'oauth_signup',
        resource_type: 'auth',
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        user_agent: request.headers.get('user-agent'),
        metadata: { 
          email: data.user.email, 
          platform: 'atlvs',
          provider: data.user.app_metadata?.provider,
        },
      });

      // Redirect to onboarding for new users
      return NextResponse.redirect(`${baseUrl}/onboarding`);
    }

    // Log OAuth sign-in
    await supabase.from('audit_logs').insert({
      user_id: platformUser.id,
      action: 'oauth_signin',
      resource_type: 'auth',
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      user_agent: request.headers.get('user-agent'),
      metadata: { 
        email: data.user.email, 
        platform: 'atlvs',
        provider: data.user.app_metadata?.provider,
      },
    });

    // Check onboarding status
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('id', data.user.id)
      .single();

    if (!profile?.onboarding_completed) {
      return NextResponse.redirect(`${baseUrl}/onboarding`);
    }

    // Redirect to dashboard
    return NextResponse.redirect(`${baseUrl}/dashboard`);
  } catch (err) {
    console.error('Callback error:', err);
    return NextResponse.redirect(`${baseUrl}/auth/signin?error=callback_failed`);
  }
}
