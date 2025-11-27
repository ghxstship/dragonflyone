import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@ghxstship/config';

export async function POST(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        onboarding_completed: true,
        onboarding_step: 5,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (profileError) {
      console.error('Profile update error:', profileError);
      return NextResponse.json({ error: 'Failed to complete onboarding' }, { status: 500 });
    }

    await supabase.from('audit_logs').insert({
      action: 'onboarding_completed',
      resource_type: 'user',
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      user_agent: request.headers.get('user-agent'),
      metadata: { 
        platform: 'compvss',
        user_id: user.id,
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Onboarding completed successfully',
      redirectTo: '/dashboard'
    });
  } catch (error) {
    console.error('Complete onboarding error:', error);
    return NextResponse.json({ error: 'Failed to complete onboarding' }, { status: 500 });
  }
}
