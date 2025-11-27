import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient, fromDynamic } from '@/lib/supabase';

// Validation schema
const riskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  risk_code: z.string().optional(),
  risk_category: z.enum([
    'operational', 'financial', 'compliance', 'strategic', 'reputational',
    'technology', 'legal', 'environmental', 'human_resources', 'market'
  ]),
  risk_type: z.string().optional(),
  probability: z.enum(['very_low', 'low', 'medium', 'high', 'very_high']),
  impact: z.enum(['negligible', 'minor', 'moderate', 'major', 'critical']),
  status: z.enum(['identified', 'assessed', 'mitigated', 'accepted', 'transferred', 'closed', 'realized']).default('identified'),
  source: z.string().optional(),
  triggers: z.array(z.string()).optional(),
  affected_areas: z.array(z.string()).optional(),
  related_project_id: z.string().uuid().optional(),
  potential_cost_min: z.number().optional(),
  potential_cost_max: z.number().optional(),
  target_mitigation_date: z.string().optional(),
  review_frequency_days: z.number().default(90),
  department_id: z.string().uuid().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

// GET /api/risks - List all risks
export async function GET(request: NextRequest) {
  const supabaseAdmin = createAdminClient();
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const level = searchParams.get('level');
    const ownerId = searchParams.get('owner_id');
    const includeStrategies = searchParams.get('include_strategies') === 'true';

    let query = supabaseAdmin
      .from('risks')
      .select(`
        *,
        owner:platform_users!owner_id(id, full_name),
        department:departments(id, name),
        project:projects!related_project_id(id, name)
        ${includeStrategies ? `, strategies:risk_mitigation_strategies(*)` : ''}
      `)
      .order('risk_score', { ascending: false });

    // Apply filters
    if (category) {
      query = query.eq('risk_category', category);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (level) {
      query = query.eq('risk_level', level);
    }

    if (ownerId) {
      query = query.eq('owner_id', ownerId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching risks:', error);
      return NextResponse.json(
        { error: 'Failed to fetch risks', details: error.message },
        { status: 500 }
      );
    }

    // Type assertion for risks data
    interface RiskRow {
      risk_level: string;
      status: string;
      risk_category: string;
      potential_cost_max: number | null;
      last_reviewed_at: string | null;
      last_review_date: string | null;
      review_frequency_days: number | null;
    }
    const risks = (data as unknown as RiskRow[]) || [];

    // Calculate summary statistics
    const summary = {
      total: risks.length,
      by_level: {
        critical: risks.filter(r => r.risk_level === 'critical').length,
        high: risks.filter(r => r.risk_level === 'high').length,
        medium: risks.filter(r => r.risk_level === 'medium').length,
        low: risks.filter(r => r.risk_level === 'low').length,
      },
      by_status: {
        identified: risks.filter(r => r.status === 'identified').length,
        assessed: risks.filter(r => r.status === 'assessed').length,
        mitigated: risks.filter(r => r.status === 'mitigated').length,
        closed: risks.filter(r => r.status === 'closed').length,
      },
      by_category: risks.reduce((acc: Record<string, number>, r) => {
        acc[r.risk_category] = (acc[r.risk_category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      total_potential_cost: risks.reduce((sum, r) => sum + Number(r.potential_cost_max || 0), 0),
      requiring_review: risks.filter(r => {
        if (!r.last_review_date || !r.review_frequency_days) return true;
        const nextReview = new Date(r.last_review_date);
        nextReview.setDate(nextReview.getDate() + (r.review_frequency_days || 0));
        return nextReview <= new Date();
      }).length,
    };

    return NextResponse.json({
      risks: data,
      summary,
    });
  } catch (error) {
    console.error('Error in GET /api/risks:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/risks - Create new risk
export async function POST(request: NextRequest) {
  const supabaseAdmin = createAdminClient();
  try {
    const body = await request.json();

    // Validate input
    const validated = riskSchema.parse(body);

    // TODO: Get organization_id and user from auth session
    const organizationId = body.organization_id || '00000000-0000-0000-0000-000000000000';
    const userId = body.user_id || '00000000-0000-0000-0000-000000000000';

    const { data, error } = await supabaseAdmin
      .from('risks')
      .insert([
        {
          ...validated,
          organization_id: organizationId,
          created_by: userId,
          owner_id: body.owner_id || userId,
          identified_date: new Date().toISOString().split('T')[0],
        },
      ])
      .select(`
        *,
        owner:platform_users!owner_id(id, full_name),
        department:departments(id, name),
        project:projects!related_project_id(id, name)
      `)
      .single();

    if (error) {
      console.error('Error creating risk:', error);
      return NextResponse.json(
        { error: 'Failed to create risk', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error in POST /api/risks:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/risks - Bulk update risks
export async function PATCH(request: NextRequest) {
  const supabaseAdmin = createAdminClient();
  try {
    const body = await request.json();
    const { risk_ids, updates } = body;

    if (!risk_ids || !Array.isArray(risk_ids) || risk_ids.length === 0) {
      return NextResponse.json(
        { error: 'risk_ids array is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('risks')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .in('id', risk_ids)
      .select();

    if (error) {
      console.error('Error updating risks:', error);
      return NextResponse.json(
        { error: 'Failed to update risks', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      updated: data.length,
      risks: data,
    });
  } catch (error) {
    console.error('Error in PATCH /api/risks:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
