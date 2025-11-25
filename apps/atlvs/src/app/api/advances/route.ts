import { NextRequest, NextResponse } from 'next/server';
import { apiRoute } from '@ghxstship/config/middleware';
import { PlatformRole } from '@ghxstship/config/roles';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const GET = apiRoute(
  async (request: NextRequest) => {
    try {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const { searchParams } = new URL(request.url);
      
      const status = searchParams.get('status');
      const projectId = searchParams.get('project_id');
      const priority = searchParams.get('priority'); // high, medium, low based on cost
      const limit = parseInt(searchParams.get('limit') || '50');
      const offset = parseInt(searchParams.get('offset') || '0');

      let query = supabase
        .from('production_advances')
        .select(`
          *,
          organization:organizations(id, name, slug),
          project:projects(id, name, code),
          submitter:platform_users!submitter_id(id, full_name, email),
          reviewed_by_user:platform_users!reviewed_by(id, full_name, email),
          items:production_advance_items(
            id,
            item_name,
            description,
            quantity,
            unit,
            unit_cost,
            total_cost,
            notes,
            catalog_item:production_advancing_catalog(
              item_id,
              category,
              subcategory
            )
          )
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      // Filter by status (default to submitted/under_review for ATLVS review queue)
      if (status) {
        query = query.eq('status', status);
      } else {
        // Default: show advances needing review
        query = query.in('status', ['submitted', 'under_review']);
      }

      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      const { data, error, count } = await query;

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Apply priority filtering if requested
      let filteredData = data;
      if (priority && data) {
        filteredData = data.filter((advance: any) => {
          const cost = advance.estimated_cost || 0;
          if (priority === 'high') return cost >= 10000;
          if (priority === 'medium') return cost >= 1000 && cost < 10000;
          if (priority === 'low') return cost < 1000;
          return true;
        });
      }

      return NextResponse.json({ 
        advances: filteredData,
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
    roles: [
      PlatformRole.ATLVS_TEAM_MEMBER,
      PlatformRole.ATLVS_ADMIN,
    ],
    rateLimit: { maxRequests: 100, windowMs: 60000 },
    audit: { action: 'advances:list', resource: 'advances' },
  }
);
