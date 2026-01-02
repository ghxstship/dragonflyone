export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { logger, withAuth, PlatformRole } from '@ghxstship/config';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const COMPVSS_ADMIN_ROLES = [
  PlatformRole.COMPVSS_ADMIN,
  PlatformRole.LEGEND_SUPER_ADMIN,
];

const opportunitySchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  opportunity_type: z.enum(['job', 'contract', 'project', 'gig']).default('job'),
  event_id: z.string().uuid().optional(),
  department_id: z.string().uuid().optional(),
  positions: z.number().int().min(1).default(1),
  compensation_type: z.enum(['hourly', 'daily', 'fixed', 'negotiable']).default('hourly'),
  compensation_amount: z.number().positive().optional(),
  start_date: z.string().datetime(),
  end_date: z.string().datetime().optional(),
  location: z.string().optional(),
  requirements: z.array(z.string()).optional(),
  benefits: z.array(z.string()).optional(),
});

// GET /api/opportunities - List crew opportunities
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    
    const opportunityType = searchParams.get('type');
    const departmentId = searchParams.get('department_id');
    const status = searchParams.get('status');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Query bid_opportunities table
    let query = supabase
      .from('bid_opportunities')
      .select(`
        *,
        event:legend_events(id, name, start_date, end_date, venue:venues(name, city)),
        department:legend_departments(id, name)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (opportunityType) {
      query = query.eq('opportunity_type', opportunityType);
    }
    if (departmentId) {
      query = query.eq('department_id', departmentId);
    }
    if (status) {
      query = query.eq('status', status);
    } else {
      query = query.neq('status', 'closed');
    }

    const { data, error, count } = await query;

    if (error) {
      if (error.message?.includes('does not exist') || error.code === '42P01') {
        return NextResponse.json({ 
          opportunities: [], 
          total: 0, 
          limit, 
          offset,
          summary: { total: 0, open: 0, by_type: {}, by_department: {} }
        });
      }
      logger.error('Error fetching opportunities:', error);
      return NextResponse.json({ error: 'Failed to fetch opportunities' }, { status: 500 });
    }

    const opportunities = data || [];
    const summary = {
      total: count || 0,
      open: opportunities.filter(o => o.status === 'open').length,
      by_type: opportunities.reduce((acc, o) => {
        const type = o.opportunity_type || 'other';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      by_department: opportunities.reduce((acc, o) => {
        const dept = (o.department as { name?: string } | null)?.name || 'General';
        acc[dept] = (acc[dept] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      total_positions: opportunities.reduce((sum, o) => sum + (o.positions || 0), 0),
    };

    return NextResponse.json({ opportunities, total: count, limit, offset, summary });
  } catch (error) {
    logger.error('Error in GET /api/opportunities:', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/opportunities - Create opportunity
export async function POST(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ADMIN_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const supabase = getSupabaseClient();
    const body = await request.json();
    const validated = opportunitySchema.parse(body);

    const { data: opportunity, error } = await supabase
      .from('bid_opportunities')
      .insert({
        organization_id: body.organization_id || '00000000-0000-0000-0000-000000000001',
        title: validated.title,
        description: validated.description,
        opportunity_type: validated.opportunity_type,
        event_id: validated.event_id,
        department_id: validated.department_id,
        positions: validated.positions,
        compensation_type: validated.compensation_type,
        compensation_amount: validated.compensation_amount,
        start_date: validated.start_date,
        end_date: validated.end_date,
        location: validated.location,
        requirements: validated.requirements,
        benefits: validated.benefits,
        status: 'open',
        created_by: authResult.user?.id,
      })
      .select()
      .single();

    if (error) {
      logger.error('Error creating opportunity:', error);
      return NextResponse.json({ error: 'Failed to create opportunity', details: error.message }, { status: 500 });
    }

    return NextResponse.json({ opportunity }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    logger.error('Error in POST /api/opportunities:', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/opportunities - Update opportunity
export async function PATCH(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ADMIN_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = getSupabaseClient();
    const body = await request.json();
    const { opportunity_id, updates } = body;

    if (!opportunity_id) {
      return NextResponse.json({ error: 'opportunity_id is required' }, { status: 400 });
    }

    const { data: opportunity, error } = await supabase
      .from('bid_opportunities')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', opportunity_id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to update opportunity' }, { status: 500 });
    }

    return NextResponse.json({ success: true, opportunity });
  } catch (error) {
    logger.error('Error in PATCH /api/opportunities:', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/opportunities - Close opportunity
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ADMIN_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const opportunityId = searchParams.get('id');

    if (!opportunityId) {
      return NextResponse.json({ error: 'Opportunity ID required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('bid_opportunities')
      .update({ status: 'closed', updated_at: new Date().toISOString() })
      .eq('id', opportunityId);

    if (error) {
      return NextResponse.json({ error: 'Failed to close opportunity' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Opportunity closed' });
  } catch (error) {
    logger.error('Error in DELETE /api/opportunities:', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
