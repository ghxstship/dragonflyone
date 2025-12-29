import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const createPricingRuleSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  rule_type: z.enum(['base', 'seasonal', 'event_type', 'day_of_week', 'time_of_day', 'minimum_spend', 'discount', 'surcharge']),
  price: z.number().optional(),
  percentage: z.number().optional(),
  price_unit: z.string().optional(),
  applies_to: z.array(z.string()).optional(),
  conditions: z.record(z.unknown()).optional(),
  priority: z.number().default(0),
  is_active: z.boolean().default(true),
  valid_from: z.string().optional(),
  valid_to: z.string().optional(),
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

    const { searchParams } = new URL(request.url);
    const ruleType = searchParams.get('rule_type');
    const isActive = searchParams.get('is_active');
    const spaceId = searchParams.get('space_id');

    // Get user from auth header
    const token = authHeader?.replace('Bearer ', '');

    let organizationId: string | null = null;

    if (token) {
      const { data: { user } } = await supabaseAdmin.auth.getUser(token);
      if (user) {
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('organization_id')
          .eq('id', user.id)
          .single();
        organizationId = profile?.organization_id;
      }
    }

    let query = supabaseAdmin
      .from('pricing_rules')
      .select('*')
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false });

    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }

    if (ruleType) {
      query = query.eq('rule_type', ruleType);
    }

    if (isActive !== null && isActive !== undefined) {
      query = query.eq('is_active', isActive === 'true');
    }

    if (spaceId) {
      query = query.contains('applies_to', [spaceId]);
    }

    const { data: rules, error } = await query;

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch pricing rules' }, { status: 500 });
    }

    return NextResponse.json({
      rules: rules || [],
      total: rules?.length || 0,
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
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

    const body = await request.json();

    // Validate input
    const parseResult = createPricingRuleSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const input = parseResult.data;

    // Get user from auth header
    const token = authHeader?.replace('Bearer ', '');

    let organizationId: string | null = null;
    let userId: string | null = null;

    if (token) {
      const { data: { user } } = await supabaseAdmin.auth.getUser(token);
      if (user) {
        userId = user.id;
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('organization_id')
          .eq('id', user.id)
          .single();
        organizationId = profile?.organization_id;
      }
    }

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 401 });
    }

    const { data: rule, error } = await supabaseAdmin
      .from('pricing_rules')
      .insert({
        organization_id: organizationId,
        name: input.name,
        description: input.description,
        rule_type: input.rule_type,
        price: input.price,
        percentage: input.percentage,
        price_unit: input.price_unit,
        applies_to: input.applies_to,
        conditions: input.conditions,
        priority: input.priority,
        is_active: input.is_active,
        valid_from: input.valid_from,
        valid_to: input.valid_to,
        created_by: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to create pricing rule' }, { status: 500 });
    }

    return NextResponse.json({ rule }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
