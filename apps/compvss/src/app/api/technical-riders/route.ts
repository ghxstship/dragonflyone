export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase, withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const createRiderSchema = z.object({
  project_id: z.string().uuid().optional(),
  artist_id: z.string().uuid().optional(),
  rider_type: z.string(),
  title: z.string().optional(),
  version: z.string().optional(),
  effective_date: z.string().optional(),
  items: z.array(z.object({
    category: z.string(),
    item_name: z.string(),
    quantity: z.number().optional(),
    specifications: z.string().optional(),
    is_required: z.boolean().optional(),
    is_provided: z.boolean().optional(),
    substitute_allowed: z.boolean().optional(),
    substitute_notes: z.string().optional(),
  })).optional(),
  stage_plot_url: z.string().optional(),
  input_list_url: z.string().optional(),
  patch_list_url: z.string().optional(),
  notes: z.array(z.record(z.unknown())).optional(),
});

const updateRiderSchema = z.object({
  rider_id: z.string().uuid().optional(),
  item_id: z.string().uuid().optional(),
  action: z.string().optional(),
  status: z.string().optional(),
});

// GET - Fetch technical riders
const COMPVSS_ROLES = [
  PlatformRole.COMPVSS_ADMIN, PlatformRole.COMPVSS_TEAM_MEMBER, PlatformRole.COMPVSS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');
    const artistId = searchParams.get('artist_id');
    const type = searchParams.get('type'); // 'audio', 'lighting', 'video', 'backline', 'hospitality'

    let query = supabase
      .from('technical_riders')
      .select(`
        *,
        project:projects(id, name),
        artist:artists(id, name),
        created_by:platform_users!created_by(id, email, first_name, last_name),
        items:rider_items(*),
        notes:rider_notes(*)
      `);

    if (projectId) query = query.eq('project_id', projectId);
    if (artistId) query = query.eq('artist_id', artistId);
    if (type) query = query.eq('rider_type', type);

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    }

    return NextResponse.json({ riders: data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch riders' },
      { status: 500 }
    );
  }
}

// POST - Create technical rider
export async function POST(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const userId = authResult.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createRiderSchema.parse(body);
    const {
      project_id,
      artist_id,
      rider_type,
      title,
      version,
      effective_date,
      items,
      stage_plot_url,
      input_list_url,
      patch_list_url,
      notes,
    } = validatedData;

    // Create rider
    const { data: rider, error: riderError } = await supabase
      .from('technical_riders')
      .insert({
        project_id,
        artist_id,
        rider_type,
        title: title || `${rider_type} Rider`,
        version: version || '1.0',
        effective_date: effective_date || new Date().toISOString(),
        stage_plot_url,
        input_list_url,
        patch_list_url,
        status: 'draft',
        created_by: userId,
      })
      .select()
      .single();

    if (riderError) {
      return NextResponse.json({ error: riderError.message }, { status: 500 });
    }

    // Add items
    interface RiderItem { category: string; item_name: string; quantity?: number; specifications?: string; is_required?: boolean; is_provided?: boolean; substitute_allowed?: boolean; substitute_notes?: string }
    if (items && items.length > 0) {
      const itemRecords = items.map((item: RiderItem, index: number) => ({
        rider_id: rider.id,
        category: item.category,
        item_name: item.item_name,
        quantity: item.quantity || 1,
        specifications: item.specifications,
        is_required: item.is_required !== false,
        is_provided: item.is_provided || false,
        substitute_allowed: item.substitute_allowed || false,
        substitute_notes: item.substitute_notes,
        order_index: index,
      }));

      await supabase.from('rider_items').insert(itemRecords);
    }

    // Add notes
    if (notes && notes.length > 0) {
      const noteRecords = notes.map((note: Record<string, unknown>) => ({
        rider_id: rider.id,
        section: note.section,
        content: note.content,
        priority: note.priority || 'normal',
      }));

      await supabase.from('rider_notes').insert(noteRecords);
    }

    return NextResponse.json({ rider }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create rider' },
      { status: 500 }
    );
  }
}

// PATCH - Update rider or mark items as provided
export async function PATCH(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const userId = authResult.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = updateRiderSchema.parse(body);
    const { rider_id, item_id, action, ...updateData } = validatedData;

    if (item_id) {
      // Update item
      const { error } = await supabase
        .from('rider_items')
        .update(updateData)
        .eq('id', item_id);

      if (error) {
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    if (action === 'approve') {
      await supabase
        .from('technical_riders')
        .update({
          status: 'approved',
          approved_by: userId,
          approved_at: new Date().toISOString(),
        })
        .eq('id', rider_id);

      return NextResponse.json({ success: true });
    }

    if (action === 'distribute') {
      await supabase
        .from('technical_riders')
        .update({
          status: 'distributed',
          distributed_at: new Date().toISOString(),
        })
        .eq('id', rider_id);

      // Routed to departments via workflow

      return NextResponse.json({ success: true });
    }

    // Default: update rider
    const { error } = await supabase
      .from('technical_riders')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', rider_id);

    if (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update rider' },
      { status: 500 }
    );
  }
}
