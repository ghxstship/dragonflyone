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

const ATLVS_ADMIN_ROLES = [
  PlatformRole.ATLVS_ADMIN,
  PlatformRole.ATLVS_SUPER_ADMIN,
  PlatformRole.LEGEND_SUPER_ADMIN,
];

const opportunitySchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  contact_id: z.string().uuid().optional(),
  company_id: z.string().uuid().optional(),
  value: z.number().positive().optional(),
  currency: z.string().default('USD'),
  probability: z.number().min(0).max(100).optional(),
  expected_close_date: z.string().datetime().optional(),
  source: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

// GET /api/opportunities - List sales opportunities (deals)
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    
    const status = searchParams.get('status');
    const ownerId = searchParams.get('owner_id');
    const source = searchParams.get('source');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('deals')
      .select(`
        *,
        contact:legend_people(id, first_name, last_name, email),
        company:legend_organizations(id, name),
        owner:platform_users(id, email)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }
    if (ownerId) {
      query = query.eq('owner_id', ownerId);
    }
    if (source) {
      query = query.eq('source', source);
    }

    const { data, error, count } = await query;

    if (error) {
      if (error.message?.includes('does not exist') || error.code === '42P01') {
        return NextResponse.json({ 
          opportunities: [], 
          total: 0, 
          limit, 
          offset,
          summary: { total: 0, by_status: {}, total_value: 0, weighted_value: 0 }
        });
      }
      logger.error('Error fetching opportunities:', error);
      return NextResponse.json({ error: 'Failed to fetch opportunities' }, { status: 500 });
    }

    const opportunities = data || [];
    const summary = {
      total: count || 0,
      by_status: opportunities.reduce((acc, o) => {
        acc[o.status] = (acc[o.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      total_value: opportunities.reduce((sum, o) => sum + (o.value || 0), 0),
      weighted_value: opportunities.reduce((sum, o) => {
        const prob = (o.probability || 0) / 100;
        return sum + (o.value || 0) * prob;
      }, 0),
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

    const supabase = getSupabaseClient();
    const body = await request.json();
    const validated = opportunitySchema.parse(body);

    const { data: opportunity, error } = await supabase
      .from('deals')
      .insert({
        organization_id: body.organization_id || '00000000-0000-0000-0000-000000000001',
        title: validated.title,
        description: validated.description,
        contact_id: validated.contact_id,
        company_id: validated.company_id,
        value: validated.value,
        currency: validated.currency,
        probability: validated.probability,
        expected_close_date: validated.expected_close_date,
        source: validated.source,
        tags: validated.tags,
        status: 'lead',
        owner_id: authResult.user?.id,
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

    const supabase = getSupabaseClient();
    const body = await request.json();
    const { opportunity_id, updates, action } = body;

    if (!opportunity_id) {
      return NextResponse.json({ error: 'opportunity_id is required' }, { status: 400 });
    }

    // Handle status transitions
    if (action === 'qualify') {
      updates.status = 'qualified';
    } else if (action === 'propose') {
      updates.status = 'proposal';
    } else if (action === 'win') {
      updates.status = 'won';
      updates.actual_close_date = new Date().toISOString();
    } else if (action === 'lose') {
      updates.status = 'lost';
      updates.actual_close_date = new Date().toISOString();
    }

    const { data: opportunity, error } = await supabase
      .from('deals')
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

// DELETE /api/opportunities - Delete opportunity
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ADMIN_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const opportunityId = searchParams.get('id');

    if (!opportunityId) {
      return NextResponse.json({ error: 'Opportunity ID required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('deals')
      .delete()
      .eq('id', opportunityId);

    if (error) {
      return NextResponse.json({ error: 'Failed to delete opportunity' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Opportunity deleted' });
  } catch (error) {
    logger.error('Error in DELETE /api/opportunities:', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
