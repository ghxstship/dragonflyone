// apps/atlvs/src/app/api/advancing/requests/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const createAdvanceSchema = z.object({
  project_id: z.string().uuid().optional(),
  team_workspace: z.string().optional(),
  activation_name: z.string().optional(),
  items: z.array(
    z.object({
      catalog_item_id: z.string().uuid().optional(),
      item_name: z.string().min(1),
      description: z.string().optional(),
      quantity: z.number().positive(),
      unit: z.string().min(1),
      unit_cost: z.number().nonnegative().optional(),
      notes: z.string().optional(),
    })
  ).min(1),
  estimated_cost: z.number().nonnegative().optional(),
});

/**
 * GET /api/advancing/requests
 * List production advance requests with filters
 */
export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const searchParams = request.nextUrl.searchParams;

    // Extract filters
    const project_id = searchParams.get('project_id');
    const status = searchParams.get('status');
    const submitter_id = searchParams.get('submitter_id');
    const organization_id = searchParams.get('organization_id');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query
    let query = supabase
      .from('production_advances')
      .select(`
        *,
        project:projects(id, name, code),
        submitter:platform_users!production_advances_submitter_id_fkey(id, full_name, email),
        reviewed_by_user:platform_users!production_advances_reviewed_by_fkey(id, full_name, email),
        fulfilled_by_user:platform_users!production_advances_fulfilled_by_fkey(id, full_name, email),
        organization:organizations(id, name, slug)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (organization_id) {
      query = query.eq('organization_id', organization_id);
    }

    if (project_id) {
      query = query.eq('project_id', project_id);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (submitter_id) {
      query = query.eq('submitter_id', submitter_id);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching advances:', error);
      return NextResponse.json(
        { error: 'Failed to fetch advance requests', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data,
      count,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/advancing/requests
 * Create a new production advance request
 */
export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const body = await request.json();

    // Validate request body
    const validation = createAdvanceSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation error', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { items, ...advanceData } = validation.data;

    // Get submitter info (from auth or request)
    // For now, using a placeholder - this would come from the auth session
    const submitter_id = request.headers.get('x-user-id');
    const organization_id = request.headers.get('x-organization-id');

    if (!submitter_id || !organization_id) {
      return NextResponse.json(
        { error: 'Missing authentication headers' },
        { status: 401 }
      );
    }

    // Create the advance request
    const { data: advance, error: advanceError } = await supabase
      .from('production_advances')
      .insert({
        ...advanceData,
        organization_id,
        submitter_id,
        status: 'draft',
      })
      .select()
      .single();

    if (advanceError) {
      console.error('Error creating advance:', advanceError);
      return NextResponse.json(
        { error: 'Failed to create advance request', details: advanceError.message },
        { status: 500 }
      );
    }

    // Create advance items
    const advanceItems = items.map((item) => ({
      ...item,
      advance_id: advance.id,
      total_cost: item.unit_cost ? item.unit_cost * item.quantity : null,
    }));

    const { data: createdItems, error: itemsError } = await supabase
      .from('production_advance_items')
      .insert(advanceItems)
      .select();

    if (itemsError) {
      console.error('Error creating advance items:', itemsError);
      // Rollback: delete the advance
      await supabase.from('production_advances').delete().eq('id', (advance as any).id);

      return NextResponse.json(
        { error: 'Failed to create advance items', details: itemsError.message },
        { status: 500 }
      );
    }

    // Return the complete advance with items
    return NextResponse.json(
      {
        data: {
          ...advance,
          items: createdItems,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
