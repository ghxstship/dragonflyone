export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase, withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const createOpportunitySchema = z.object({
  action: z.literal('create'),
  company_id: z.string().uuid(),
  title: z.string().min(1),
  partnership_type: z.string(),
  description: z.string().optional(),
  requirements: z.array(z.string()).optional(),
  benefits: z.array(z.string()).optional(),
  deadline: z.string().optional(),
});

const applySchema = z.object({
  action: z.literal('apply'),
  opportunity_id: z.string().uuid(),
  company_id: z.string().uuid(),
  proposal: z.string(),
  contact_info: z.record(z.unknown()).optional(),
});

const updateStatusSchema = z.object({
  action: z.literal('update_status'),
  application_id: z.string().uuid(),
  status: z.string(),
  feedback: z.string().optional(),
});

const partnershipActionSchema = z.union([createOpportunitySchema, applySchema, updateStatusSchema]);

// Partnership and collaboration opportunities
const COMPVSS_ROLES = [
  PlatformRole.COMPVSS_ADMIN, PlatformRole.COMPVSS_TEAM_MEMBER, PlatformRole.COMPVSS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status') || 'open';

    let query = supabase.from('partnership_opportunities').select(`
      *, company:companies(name, logo_url),
      applications:partnership_applications(count)
    `);

    if (type) query = query.eq('partnership_type', type);
    if (status !== 'all') query = query.eq('status', status);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

    return NextResponse.json({ opportunities: data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const validatedData = partnershipActionSchema.parse(body);
    const { action } = validatedData;

    if (action === 'create') {
      const { company_id, title, partnership_type, description, requirements, benefits, deadline } = validatedData as z.infer<typeof createOpportunitySchema>;

      const { data, error } = await supabase.from('partnership_opportunities').insert({
        company_id, title, partnership_type, description,
        requirements: requirements || [], benefits: benefits || [],
        deadline, status: 'open', created_by: user.id
      }).select().single();

      if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
      return NextResponse.json({ opportunity: data }, { status: 201 });
    }

    if (action === 'apply') {
      const { opportunity_id, company_id, proposal, contact_info } = validatedData as z.infer<typeof applySchema>;

      const { data, error } = await supabase.from('partnership_applications').insert({
        opportunity_id, company_id, proposal, contact_info,
        status: 'submitted', submitted_by: user.id
      }).select().single();

      if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
      return NextResponse.json({ application: data }, { status: 201 });
    }

    if (action === 'update_status') {
      const { application_id, status, feedback } = validatedData as z.infer<typeof updateStatusSchema>;

      await supabase.from('partnership_applications').update({
        status, feedback, reviewed_at: new Date().toISOString()
      }).eq('id', application_id);

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
