import { NextRequest, NextResponse } from 'next/server';
import { supabase, fromDynamic } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const tables = searchParams.get('tables')?.split(',') || [
      'projects',
      'contacts',
      'deals',
      'assets',
    ];
    const limit = parseInt(searchParams.get('limit') || '10');

    const results: Record<string, unknown[]> = {};

    for (const table of tables) {
      let queryBuilder = fromDynamic(supabase, table).select('*').limit(limit);

      switch (table) {
        case 'projects':
          queryBuilder = queryBuilder.or(
            `name.ilike.%${query}%,description.ilike.%${query}%`
          );
          break;
        case 'contacts':
          queryBuilder = queryBuilder.or(
            `name.ilike.%${query}%,email.ilike.%${query}%,company.ilike.%${query}%`
          );
          break;
        case 'deals':
          queryBuilder = queryBuilder.or(
            `title.ilike.%${query}%,description.ilike.%${query}%`
          );
          break;
        case 'assets':
          queryBuilder = queryBuilder.or(
            `name.ilike.%${query}%,description.ilike.%${query}%,asset_tag.ilike.%${query}%`
          );
          break;
        default:
          queryBuilder = queryBuilder.ilike('name', `%${query}%`);
      }

      const { data, error } = await queryBuilder;
      if (!error && data) {
        results[table] = data;
      }
    }

    const totalResults = Object.values(results).reduce(
      (sum, arr) => sum + arr.length,
      0
    );

    return NextResponse.json({
      query,
      totalResults,
      results,
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
