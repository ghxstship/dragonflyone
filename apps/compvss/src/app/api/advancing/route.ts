import { NextRequest, NextResponse } from 'next/server';
import { apiRoute } from '@ghxstship/config/middleware';
import { PlatformRole } from '@ghxstship/config/roles';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const createAdvanceSchema = z.object({
  project_id: z.string().uuid().optional(),
  team_workspace: z.string().optional(),
  activation_name: z.string().optional(),
  items: z.array(z.object({
    catalog_item_id: z.string().uuid().optional(),
    item_name: z.string(),
    description: z.string().optional(),
    quantity: z.number().positive(),
    unit: z.string(),
    unit_cost: z.number().optional(),
    notes: z.string().optional(),
  })),
  estimated_cost: z.number().optional(),
});

export const GET = apiRoute(
  async (request: NextRequest) => {
    try {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const { searchParams } = new URL(request.url);
      
      const projectId = searchParams.get('project_id');
      const status = searchParams.get('status');
      const submitterId = searchParams.get('submitter_id');
      const limit = parseInt(searchParams.get('limit') || '50');
      const offset = parseInt(searchParams.get('offset') || '0');

      let query = supabase
        .from('production_advances')
        .select(`
          *,
          project:projects(id, name, code),
          submitter:platform_users!submitter_id(id, full_name, email),
          reviewed_by_user:platform_users!reviewed_by(id, full_name, email),
          fulfilled_by_user:platform_users!fulfilled_by(id, full_name, email),
          items:production_advance_items(
            id,
            item_name,
            description,
            quantity,
            unit,
            unit_cost,
            total_cost,
            quantity_fulfilled,
            fulfillment_status,
            catalog_item_id
          )
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      if (status) {
        query = query.eq('status', status);
      }
      
      if (submitterId) {
        query = query.eq('submitter_id', submitterId);
      }

      const { data, error, count } = await query;

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ 
        advances: data, 
        total: count,
        limit,
        offset
      });
    } catch (error: any) {
      return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
  },
  {
    auth: true,
    roles: [PlatformRole.COMPVSS_ADMIN, PlatformRole.COMPVSS_TEAM_MEMBER],
    rateLimit: { maxRequests: 100, windowMs: 60000 },
    audit: { action: 'advancing:list', resource: 'advancing' },
  }
);

export const POST = apiRoute(
  async (request: NextRequest, context: any) => {
    try {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const payload = context.validated;
      const userId = context.user?.id;
      const orgId = context.organization?.id;

      if (!userId || !orgId) {
        return NextResponse.json({ error: 'User or organization not found' }, { status: 401 });
      }

      // Calculate total cost from items
      const totalCost = payload.items.reduce((sum: number, item: any) => {
        return sum + ((item.unit_cost || 0) * item.quantity);
      }, 0);

      // Create the advance
      const { data: advance, error: advanceError } = await supabase
        .from('production_advances')
        .insert({
          organization_id: orgId,
          project_id: payload.project_id,
          team_workspace: payload.team_workspace,
          activation_name: payload.activation_name,
          submitter_id: userId,
          status: 'draft',
          estimated_cost: payload.estimated_cost || totalCost,
          currency: 'USD',
        })
        .select()
        .single();

      if (advanceError) {
        return NextResponse.json({ error: advanceError.message }, { status: 500 });
      }

      // Create advance items
      const items = payload.items.map((item: any) => ({
        advance_id: advance.id,
        catalog_item_id: item.catalog_item_id,
        item_name: item.item_name,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unit_cost: item.unit_cost,
        total_cost: item.unit_cost ? item.unit_cost * item.quantity : null,
        notes: item.notes,
      }));

      const { error: itemsError } = await supabase
        .from('production_advance_items')
        .insert(items);

      if (itemsError) {
        // Rollback advance if items fail
        await supabase.from('production_advances').delete().eq('id', advance.id);
        return NextResponse.json({ error: itemsError.message }, { status: 500 });
      }

      // Fetch complete advance with items
      const { data: completeAdvance } = await supabase
        .from('production_advances')
        .select(`
          *,
          items:production_advance_items(*)
        `)
        .eq('id', advance.id)
        .single();

      return NextResponse.json({ advance: completeAdvance }, { status: 201 });
    } catch (error: any) {
      return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
  },
  {
    auth: true,
    roles: [PlatformRole.COMPVSS_TEAM_MEMBER, PlatformRole.COMPVSS_ADMIN],
    validation: createAdvanceSchema,
    rateLimit: { maxRequests: 30, windowMs: 60000 },
    audit: { action: 'advancing:create', resource: 'advancing' },
  }
);
