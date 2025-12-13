export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { apiRoute } from '@ghxstship/config/middleware';
import { PlatformRole } from '@ghxstship/config/roles';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

import { z } from 'zod';

const updateAdvanceSchema = z.object({
  status: z.enum(['draft', 'submitted', 'under_review', 'approved', 'in_progress', 'fulfilled', 'rejected', 'cancelled']).optional(),
  reviewer_notes: z.string().optional(),
  fulfillment_notes: z.string().optional(),
  estimated_cost: z.number().optional(),
  actual_cost: z.number().optional(),
});

export const GET = apiRoute(
  async (request: NextRequest, context: { params: Promise<Record<string, string>> }) => {
    try {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const { id } = await context.params;

      const { data, error } = await supabase
        .from('production_advances')
        .select(`
          *,
          organization:organizations(id, name, slug),
          project:projects(id, name, code, budget),
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
            catalog_item:production_advancing_catalog(
              item_id,
              item_name,
              category,
              subcategory,
              standard_unit,
              specifications
            )
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 404 });
      }

      return NextResponse.json({ advance: data });
    } catch (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    }
  },
  {
    auth: true,
    roles: [PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_ADMIN],
    rateLimit: { maxRequests: 100, windowMs: 60000 },
    audit: { action: 'advances:view', resource: 'advances' },
  }
);

export const PATCH = apiRoute(
  async (request: NextRequest, context: { params: Promise<Record<string, string>> }) => {
    try {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const { id } = await context.params;
      const body = await request.json();
      const updates = updateAdvanceSchema.parse(body);

      const updateData: Record<string, unknown> = {
        ...updates,
        updated_at: new Date().toISOString(),
      };

      if (updates.status === 'approved' || updates.status === 'rejected') {
        updateData.reviewed_at = new Date().toISOString();
      }

      if (updates.status === 'fulfilled') {
        updateData.fulfilled_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('production_advances')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ advance: data });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
      }
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  },
  {
    auth: true,
    roles: [PlatformRole.ATLVS_ADMIN],
    rateLimit: { maxRequests: 50, windowMs: 60000 },
    audit: { action: 'advances:update', resource: 'advances' },
  }
);

export const DELETE = apiRoute(
  async (request: NextRequest, context: { params: Promise<Record<string, string>> }) => {
    try {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const { id } = await context.params;

      // Check if advance can be deleted (only draft status)
      const { data: advance, error: fetchError } = await supabase
        .from('production_advances')
        .select('status')
        .eq('id', id)
        .single();

      if (fetchError || !advance) {
        return NextResponse.json({ error: 'Advance not found' }, { status: 404 });
      }

      if (advance.status !== 'draft') {
        return NextResponse.json({ error: 'Only draft advances can be deleted' }, { status: 400 });
      }

      // Delete items first
      await supabase.from('production_advance_items').delete().eq('advance_id', id);

      const { error: deleteError } = await supabase
        .from('production_advances')
        .delete()
        .eq('id', id);

      if (deleteError) {
        return NextResponse.json({ error: deleteError.message }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    } catch (error) {
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  },
  {
    auth: true,
    roles: [PlatformRole.ATLVS_ADMIN],
    rateLimit: { maxRequests: 20, windowMs: 60000 },
    audit: { action: 'advances:delete', resource: 'advances' },
  }
);
