import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'No session' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Get user from token
    const { data: { user } } = await supabase.auth.getUser(token);
    
    if (user) {
      // Get platform user for audit log
      const { data: platformUser } = await supabase
        .from('platform_users')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      // Log sign-out activity
      if (platformUser) {
        await supabase.from('audit_logs').insert({
          user_id: platformUser.id,
          action: 'sign_out',
          resource_type: 'auth',
          ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
          user_agent: request.headers.get('user-agent'),
        });
      }
    }

    // Sign out the user
    const { error } = await supabase.auth.admin.signOut(token);

    if (error) {
      console.error('Sign out error:', error);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Sign out error:', error);
    return NextResponse.json(
      { error: 'Sign out failed' },
      { status: 500 }
    );
  }
}
