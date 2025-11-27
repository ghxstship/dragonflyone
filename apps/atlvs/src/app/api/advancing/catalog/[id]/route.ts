// apps/atlvs/src/app/api/advancing/catalog/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * GET /api/advancing/catalog/[id]
 * Get details of a specific catalog item
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createAdminClient();
  try {
    const { id } = params;

    const { data, error } = await supabase
      .from('production_advancing_catalog')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Catalog item not found' },
          { status: 404 }
        );
      }

      console.error('Error fetching catalog item:', error);
      return NextResponse.json(
        { error: 'Failed to fetch catalog item', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
