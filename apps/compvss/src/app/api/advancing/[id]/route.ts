import { NextRequest, NextResponse } from 'next/server';
import { apiRoute } from '@ghxstship/config/middleware';
import { PlatformRole } from '@ghxstship/config/roles';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const updateAdvanceSchema = z.object({
  status: z.enum(['draft', 'submitted', 'cancelled']).optional(),
  team_workspace: z.string().optional(),
  activation_name: z.string().optional(),
  estimated_cost: z.number().optional(),
});

export const GET = apiRoute(
  async (request: NextRequest, context: any) => {
    try {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const { id } = context.params;

      const { data, error } = await supabase
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
            notes,
            catalog_item_id,
            catalog_item:production_advancing_catalog(
              item_id,
              item_name,
              category,
              subcategory,
              standard_unit
            )
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }

      return NextResponse.json({ advance: data });
    } catch (error: any) {
      return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
  },
  {
    auth: true,
    roles: [PlatformRole.COMPVSS_ADMIN, PlatformRole.COMPVSS_TEAM_MEMBER],
    rateLimit: { maxRequests: 100, windowMs: 60000 },
    audit: { action: 'advancing:view', resource: 'advancing' },
  }
);

export const PATCH = apiRoute(
  async (request: NextRequest, context: any) => {
    try {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const { id } = context.params;
      const payload = context.validated;
      const userId = context.user?.id;

      // Check if advance exists and user has permission
      const { data: existingAdvance, error: fetchError } = await supabase
        .from('production_advances')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError || !existingAdvance) {
        return NextResponse.json({ error: 'Advance not found' }, { status: 404 });
      }

      // Only allow submitter to update draft or admins to update any
      const isSubmitter = existingAdvance.submitter_id === userId;
      const isAdmin = context.roles?.includes(PlatformRole.COMPVSS_ADMIN);
      
      if (!isAdmin && (!isSubmitter || existingAdvance.status !== 'draft')) {
        return NextResponse.json({ error: 'Not authorized to update this advance' }, { status: 403 });
      }

      // Update advance
      const updates: any = {};
      if (payload.team_workspace) updates.team_workspace = payload.team_workspace;
      if (payload.activation_name) updates.activation_name = payload.activation_name;
      if (payload.estimated_cost !== undefined) updates.estimated_cost = payload.estimated_cost;
      
      if (payload.status) {
        updates.status = payload.status;
        if (payload.status === 'submitted') {
          updates.submitted_at = new Date().toISOString();
        }
      }

      const { data, error } = await supabase
        .from('production_advances')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          items:production_advance_items(*)
        `)
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ advance: data });
    } catch (error: any) {
      return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
  },
  {
    auth: true,
    roles: [PlatformRole.COMPVSS_TEAM_MEMBER, PlatformRole.COMPVSS_ADMIN],
    validation: updateAdvanceSchema,
    rateLimit: { maxRequests: 50, windowMs: 60000 },
    audit: { action: 'advancing:update', resource: 'advancing' },
  }
);

export const DELETE = apiRoute(
  async (request: NextRequest, context: any) => {
    try {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const { id } = context.params;
      const userId = context.user?.id;

      // Check if advance exists
      const { data: existingAdvance, error: fetchError } = await supabase
        .from('production_advances')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError || !existingAdvance) {
        return NextResponse.json({ error: 'Advance not found' }, { status: 404 });
      }

      // Only allow deletion of draft advances by submitter or admin
      if (existingAdvance.status !== 'draft') {
        return NextResponse.json({ error: 'Can only delete draft advances' }, { status: 400 });
      }

      const isSubmitter = existingAdvance.submitter_id === userId;
      const isAdmin = context.roles?.includes(PlatformRole.COMPVSS_ADMIN);
      
      if (!isAdmin && !isSubmitter) {
        return NextResponse.json({ error: 'Not authorized to delete this advance' }, { status: 403 });
      }

      // Delete advance (items will cascade delete)
      const { error } = await supabase
        .from('production_advances')
        .delete()
        .eq('id', id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ message: 'Advance deleted successfully' });
    } catch (error: any) {
      return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
  },
  {
    auth: true,
    roles: [PlatformRole.COMPVSS_TEAM_MEMBER, PlatformRole.COMPVSS_ADMIN],
    rateLimit: { maxRequests: 30, windowMs: 60000 },
    audit: { action: 'advancing:delete', resource: 'advancing' },
  }
);
