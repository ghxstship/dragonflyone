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

// Schema for subcontractor opportunities - uses 3NF subcontractor_opportunities table from 0052 migration
const opportunitySchema = z.object({
  organization_id: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().optional(),
  opportunity_type: z.enum(['labor', 'equipment', 'services', 'transport', 'catering', 'security', 'other']),
  event_id: z.string().uuid().optional(),
  project_id: z.string().uuid().optional(),
  required_skills: z.array(z.string()).optional(),
  certifications_required: z.array(z.string()).optional(),
  experience_level: z.enum(['entry', 'intermediate', 'senior', 'expert']).optional(),
  positions_available: z.number().int().min(1).default(1),
  budget_min: z.number().positive().optional(),
  budget_max: z.number().positive().optional(),
  rate_type: z.enum(['hourly', 'daily', 'fixed', 'negotiable']).optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  application_deadline: z.string().optional(),
  location: z.string().optional(),
  is_remote: z.boolean().default(false),
  contact_name: z.string().optional(),
  contact_email: z.string().email().optional(),
  terms_conditions: z.string().optional(),
});

// GET /api/subcontractor-opportunities - List opportunities from subcontractor_opportunities (3NF table)
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    
    const eventId = searchParams.get('event_id');
    const opportunityType = searchParams.get('type');
    const status = searchParams.get('status');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Query subcontractor_opportunities - 3NF table
    let query = supabase
      .from('subcontractor_opportunities')
      .select(`
        *,
        event:legend_events!event_id(id, name, start_datetime),
        project:projects!project_id(id, name),
        applications:subcontractor_applications(count)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (eventId) {
      query = query.eq('event_id', eventId);
    }
    if (opportunityType) {
      query = query.eq('opportunity_type', opportunityType);
    }
    if (status) {
      query = query.eq('status', status);
    } else {
      query = query.in('status', ['open', 'reviewing']);
    }

    const { data, error, count } = await query;

    if (error) {
      logger.error('Error fetching subcontractor opportunities:', error);
      return NextResponse.json({ 
        opportunities: [], 
        total: 0, 
        limit, 
        offset,
        summary: { total: 0, open: 0, reviewing: 0, awarded: 0, closed: 0 }
      });
    }

    const opportunities = data || [];
    const summary = {
      total: count || 0,
      open: opportunities.filter(o => o.status === 'open').length,
      reviewing: opportunities.filter(o => o.status === 'reviewing').length,
      awarded: opportunities.filter(o => o.status === 'awarded').length,
      closed: opportunities.filter(o => o.status === 'closed').length,
      total_positions: opportunities.reduce((sum, o) => sum + (o.positions_available || 0), 0),
      positions_filled: opportunities.reduce((sum, o) => sum + (o.positions_filled || 0), 0),
    };

    return NextResponse.json({ opportunities, total: count, limit, offset, summary });
  } catch (error) {
    logger.error('Error in GET /api/subcontractor-opportunities:', error instanceof Error ? error : undefined);
    return NextResponse.json({ 
      opportunities: [], 
      total: 0, 
      limit: 50, 
      offset: 0,
      summary: { total: 0, open: 0, reviewing: 0, awarded: 0, closed: 0 }
    });
  }
}

// POST /api/subcontractor-opportunities - Create opportunity using subcontractor_opportunities (3NF table)
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
      .from('subcontractor_opportunities')
      .insert({
        organization_id: validated.organization_id,
        event_id: validated.event_id,
        project_id: validated.project_id,
        title: validated.title,
        description: validated.description,
        opportunity_type: validated.opportunity_type,
        required_skills: validated.required_skills || [],
        certifications_required: validated.certifications_required || [],
        experience_level: validated.experience_level,
        positions_available: validated.positions_available,
        positions_filled: 0,
        budget_min: validated.budget_min,
        budget_max: validated.budget_max,
        rate_type: validated.rate_type,
        start_date: validated.start_date,
        end_date: validated.end_date,
        application_deadline: validated.application_deadline,
        location: validated.location,
        is_remote: validated.is_remote,
        contact_name: validated.contact_name,
        contact_email: validated.contact_email,
        terms_conditions: validated.terms_conditions,
        status: 'draft',
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

// PATCH /api/subcontractor-opportunities - Update opportunity using subcontractor_opportunities (3NF table)
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
    const { opportunity_id, action, updates } = body;

    if (!opportunity_id) {
      return NextResponse.json({ error: 'opportunity_id is required' }, { status: 400 });
    }

    // Publish action
    if (action === 'publish') {
      const { data: opportunity, error } = await supabase
        .from('subcontractor_opportunities')
        .update({
          status: 'open',
          published_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', opportunity_id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: 'Failed to publish opportunity' }, { status: 500 });
      }

      return NextResponse.json({ success: true, opportunity, message: 'Opportunity published' });
    }

    // Close action
    if (action === 'close') {
      const { data: opportunity, error } = await supabase
        .from('subcontractor_opportunities')
        .update({
          status: 'closed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', opportunity_id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: 'Failed to close opportunity' }, { status: 500 });
      }

      return NextResponse.json({ success: true, opportunity, message: 'Opportunity closed' });
    }

    // General update
    if (updates) {
      const { data: opportunity, error } = await supabase
        .from('subcontractor_opportunities')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', opportunity_id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: 'Failed to update opportunity' }, { status: 500 });
      }

      return NextResponse.json({ success: true, opportunity });
    }

    return NextResponse.json({ error: 'No action specified' }, { status: 400 });
  } catch (error) {
    logger.error('Error in PATCH /api/subcontractor-opportunities:', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/subcontractor-opportunities - Close/cancel opportunity using subcontractor_opportunities (3NF table)
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
      .from('subcontractor_opportunities')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('id', opportunityId);

    if (error) {
      return NextResponse.json({ error: 'Failed to cancel opportunity' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Opportunity cancelled' });
  } catch (error) {
    logger.error('Error in DELETE /api/subcontractor-opportunities:', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
