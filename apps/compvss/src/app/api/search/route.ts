import { NextRequest, NextResponse } from 'next/server';
import { createBrowserClient } from '@ghxstship/config';

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey) as any;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const type = searchParams.get('type') || 'all';
    const limit = parseInt(searchParams.get('limit') || '20');

    const results: Record<string, unknown[]> = {};

    if (type === 'all' || type === 'crew') {
      const { data } = await supabase
        .from('platform_users')
        .select('id, email, full_name, skills, certifications')
        .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
        .limit(limit);
      if (data) results.crew = data;
    }

    if (type === 'all' || type === 'projects') {
      const { data } = await supabase
        .from('projects')
        .select('*')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(limit);
      if (data) results.projects = data;
    }

    if (type === 'all' || type === 'assets') {
      const { data } = await supabase
        .from('assets')
        .select('*')
        .or(`name.ilike.%${query}%,asset_tag.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(limit);
      if (data) results.assets = data;
    }

    if (type === 'all' || type === 'venues') {
      const { data } = await supabase
        .from('venues')
        .select('*')
        .or(`name.ilike.%${query}%,city.ilike.%${query}%,state.ilike.%${query}%`)
        .limit(limit);
      if (data) results.venues = data;
    }

    const totalResults = Object.values(results).reduce(
      (sum, arr) => sum + arr.length,
      0
    );

    return NextResponse.json({
      query,
      type,
      totalResults,
      results,
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
