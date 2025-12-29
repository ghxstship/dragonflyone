import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const createDealSchema = z.object({
  name: z.string().min(1),
  client_id: z.string().uuid().optional(),
  contact_name: z.string().optional(),
  contact_email: z.string().email().optional(),
  contact_phone: z.string().optional(),
  stage: z.enum(['lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost']).default('lead'),
  value: z.number().min(0).optional(),
  probability: z.number().min(0).max(100).optional(),
  expected_close_date: z.string().optional(),
  source: z.string().optional(),
  notes: z.string().optional(),
  assigned_to: z.string().uuid().optional(),
});

const ATLVS_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function GET(request: NextRequest) {
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);

    const stage = searchParams.get('stage');
    const assignedTo = searchParams.get('assigned_to');
    const clientId = searchParams.get('client_id');
    const minValue = searchParams.get('min_value');
    const maxValue = searchParams.get('max_value');
    const sortBy = searchParams.get('sort_by') || 'created_at';
    const sortOrder = searchParams.get('sort_order') || 'desc';

    let query = supabase
      .from('pipeline_deals')
      .select(`
        id,
        name,
        client_id,
        client:clients(id, name, email),
        contact_name,
        contact_email,
        contact_phone,
        stage,
        value,
        probability,
        expected_close_date,
        source,
        notes,
        assigned_to,
        assignee:profiles(id, full_name, email),
        created_at,
        updated_at
      `);

    if (stage) {
      query = query.eq('stage', stage);
    }
    if (assignedTo) {
      query = query.eq('assigned_to', assignedTo);
    }
    if (clientId) {
      query = query.eq('client_id', clientId);
    }
    if (minValue) {
      query = query.gte('value', parseFloat(minValue));
    }
    if (maxValue) {
      query = query.lte('value', parseFloat(maxValue));
    }

    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    const { data: deals, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch deals' },
        { status: 500 }
      );
    }

    // Calculate pipeline summary
    const stageGroups: Record<string, typeof deals> = {};
    deals?.forEach((deal) => {
      if (!stageGroups[deal.stage]) {
        stageGroups[deal.stage] = [];
      }
      stageGroups[deal.stage].push(deal);
    });

    const summary = {
      total_deals: deals?.length || 0,
      total_value: deals?.reduce((sum, d) => sum + (d.value || 0), 0) || 0,
      weighted_value: deals?.reduce((sum, d) => sum + ((d.value || 0) * (d.probability || 0) / 100), 0) || 0,
      by_stage: Object.entries(stageGroups).map(([stage, stageDeals]) => ({
        stage,
        count: stageDeals.length,
        value: stageDeals.reduce((sum, d) => sum + (d.value || 0), 0),
      })),
    };

    return NextResponse.json({
      deals: deals || [],
      summary,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = createAdminClient();

    const body = await request.json();
    const validatedData = createDealSchema.parse(body);

    // Generate deal number
    const { count } = await supabase
      .from('pipeline_deals')
      .select('id', { count: 'exact', head: true });

    const dealNumber = `DEAL-${String((count || 0) + 1).padStart(5, '0')}`;

    const { data: deal, error } = await supabase
      .from('pipeline_deals')
      .insert({
        deal_number: dealNumber,
        name: validatedData.name,
        client_id: validatedData.client_id || null,
        contact_name: validatedData.contact_name || null,
        contact_email: validatedData.contact_email || null,
        contact_phone: validatedData.contact_phone || null,
        stage: validatedData.stage,
        value: validatedData.value || 0,
        probability: validatedData.probability || 0,
        expected_close_date: validatedData.expected_close_date || null,
        source: validatedData.source || null,
        notes: validatedData.notes || null,
        assigned_to: validatedData.assigned_to || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to create deal' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      deal,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
