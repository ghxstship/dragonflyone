import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: rules, error } = await supabase
      .from('protection_rules')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching protection rules:', error);
      return NextResponse.json({ error: 'Failed to fetch rules' }, { status: 500 });
    }

    // Transform to match the expected format
    const transformedRules = (rules || []).map(rule => ({
      id: rule.id,
      name: rule.rule_config?.name || `${rule.rule_type} Rule`,
      description: rule.rule_config?.description || '',
      type: rule.rule_type,
      action: rule.rule_config?.action || 'flag',
      threshold: rule.rule_config?.threshold,
      enabled: rule.is_active,
    }));

    return NextResponse.json({ rules: transformedRules });
  } catch (error) {
    console.error('Error in protection rules API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
