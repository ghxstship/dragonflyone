import { NextRequest, NextResponse } from 'next/server';
import { apiRoute } from '@ghxstship/config/middleware';
import { PlatformRole } from '@ghxstship/config/roles';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const GET = apiRoute(
  async (request: NextRequest, context: any) => {
    try {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const { id } = context.params;

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
        return NextResponse.json({ error: error.message }, { status: 404 });
      }

      return NextResponse.json({ advance: data });
    } catch (error: any) {
      return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
  },
  {
    auth: true,
    roles: [PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_ADMIN],
    rateLimit: { maxRequests: 100, windowMs: 60000 },
    audit: { action: 'advances:view', resource: 'advances' },
  }
);
