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
  event_id: z.string().uuid().optional(),
  department_id: z.string().uuid().optional(),
  required_skills: z.array(z.string()).optional(),
  required_certifications: z.array(z.string()).optional(),
  positions_available: z.number().int().min(1).default(1),
  hourly_rate: z.number().positive().optional(),
  start_date: z.string().datetime(),
  end_date: z.string().datetime(),
  application_deadline: z.string().datetime().optional(),
  location: z.string().optional(),
});

// GET /api/subcontractor-opportunities - List opportunities
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    
    const eventId = searchParams.get('event_id');
    const departmentId = searchParams.get('department_id');
    const status = searchParams.get('status');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Query bid_opportunities table
    let query = supabase
      .from('bid_opportunities')
      .select(`
        *,
        event:legend_events(id, name, start_date, end_date),
        department:legend_departments(id, name)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (eventId) {
      query = query.eq('event_id', eventId);
    }
    if (departmentId) {
      query = query.eq('department_id', departmentId);
    }
    if (status) {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query;

    if (error) {
      if (error.message?.includes('does not exist') || error.code === '42P01') {
        return NextResponse.json({ 
          opportunities: [], 
          total: 0, 
          limit, 
          offset,
          summary: { total: 0, open: 0, closed: 0, filled: 0 }
        });
      }
      logger.error('Error fetching subcontractor opportunities:', error);
      return NextResponse.json({ error: 'Failed to fetch opportunities' }, { status: 500 });
    }

    const opportunities = data || [];
    const summary = {
      total: count || 0,
      open: opportunities.filter(o => o.status === 'open').length,
      closed: opportunities.filter(o => o.status === 'closed').length,
      filled: opportunities.filter(o => o.status === 'filled').length,
      total_positions: opportunities.reduce((sum, o) => sum + (o.positions_available || 0), 0),
    };

    return NextResponse.json({ opportunities, total: count, limit, offset, summary });
  } catch (error) {
    logger.error('Error in GET /api/subcontractor-opportunities:', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/subcontractor-opportunities - Create opportunity
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
        event_id: validated.event_id,
        department_id: validated.department_id,
        required_skills: validated.required_skills,
        required_certifications: validated.required_certifications,
        positions_available: validated.positions_available,
        hourly_rate: validated.hourly_rate,
        start_date: validated.start_date,
        end_date: validated.end_date,
        application_deadline: validated.application_deadline,
        location: validated.location,
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
    logger.error('Error in POST /api/subcontractor-opportunities:', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/subcontractor-opportunities - Update opportunity
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
    logger.error('Error in PATCH /api/subcontractor-opportunities:', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/subcontractor-opportunities - Close/delete opportunity
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
    logger.error('Error in DELETE /api/subcontractor-opportunities:', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
