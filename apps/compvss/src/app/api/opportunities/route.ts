import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@ghxstship/config';
import { apiRoute } from '@ghxstship/config/middleware';
import { PlatformRole } from '@ghxstship/config/roles';
import { z } from 'zod';

const OpportunitySchema = z.object({
  title: z.string().min(1),
  type: z.enum(['rfp', 'job', 'gig', 'contract', 'freelance']),
  description: z.string(),
  location: z.string(),
  location_type: z.enum(['onsite', 'remote', 'hybrid']).optional(),
  department: z.string().optional(),
  client_name: z.string().optional(),
  project_id: z.string().uuid().optional(),
  event_id: z.string().uuid().optional(),
  compensation_type: z.enum(['salary', 'hourly', 'daily', 'project', 'negotiable']).optional(),
  compensation_min: z.number().nonnegative().optional(),
  compensation_max: z.number().nonnegative().optional(),
  compensation_currency: z.string().default('USD'),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  deadline: z.string().optional(),
  requirements: z.array(z.string()).optional(),
  skills_required: z.array(z.string()).optional(),
  experience_level: z.enum(['entry', 'mid', 'senior', 'lead', 'executive']).optional(),
  is_urgent: z.boolean().default(false),
});

export const GET = apiRoute(
  async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url);
      const type = searchParams.get('type');
      const location = searchParams.get('location');
      const status = searchParams.get('status');
      const search = searchParams.get('search');
      const experienceLevel = searchParams.get('experience_level');
      const isUrgent = searchParams.get('is_urgent') === 'true';

      let query = supabase
        .from('opportunities')
        .select(`
          *,
          project:projects(id, name),
          event:events(id, name, start_date),
          applications:opportunity_applications(count),
          created_by_user:platform_users!created_by(id, full_name)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (type && type !== 'all') {
        query = query.eq('type', type);
      }
      if (location) {
        query = query.ilike('location', `%${location}%`);
      }
      if (status && status !== 'all') {
        query = query.eq('status', status);
      }
      if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
      }
      if (experienceLevel) {
        query = query.eq('experience_level', experienceLevel);
      }
      if (isUrgent) {
        query = query.eq('is_urgent', true);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching opportunities:', error);
        return NextResponse.json(
          { error: 'Failed to fetch opportunities', details: error.message },
          { status: 500 }
        );
      }

      interface OpportunityRecord {
        id: string;
        type: string;
        status: string;
        is_urgent: boolean;
        deadline: string;
        [key: string]: unknown;
      }
      const opportunities = (data || []) as unknown as OpportunityRecord[];

      const now = new Date();
      const summary = {
        total: opportunities.length,
        by_type: {
          rfp: opportunities.filter(o => o.type === 'rfp').length,
          job: opportunities.filter(o => o.type === 'job').length,
          gig: opportunities.filter(o => o.type === 'gig').length,
          contract: opportunities.filter(o => o.type === 'contract').length,
          freelance: opportunities.filter(o => o.type === 'freelance').length,
        },
        by_status: {
          open: opportunities.filter(o => o.status === 'open').length,
          filled: opportunities.filter(o => o.status === 'filled').length,
          closed: opportunities.filter(o => o.status === 'closed').length,
        },
        urgent_count: opportunities.filter(o => o.is_urgent).length,
        expiring_soon: opportunities.filter(o => {
          if (!o.deadline) return false;
          const deadline = new Date(o.deadline);
          const daysUntil = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
          return daysUntil > 0 && daysUntil <= 7;
        }).length,
      };

      return NextResponse.json({ opportunities: data, summary });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch opportunities';
      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
  },
  {
    auth: false,
    rateLimit: { maxRequests: 200, windowMs: 60000 },
  }
);

export const POST = apiRoute(
  async (request: NextRequest, context: { validated: z.infer<typeof OpportunitySchema>; user?: { id: string } }) => {
    try {
      const validatedData = context.validated;
      const userId = context.user?.id || '00000000-0000-0000-0000-000000000000';

      const { data: opportunity, error } = await supabase
        .from('opportunities')
        .insert({
          ...validatedData,
          status: 'open',
          is_active: true,
          created_by: userId,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating opportunity:', error);
        return NextResponse.json(
          { error: 'Failed to create opportunity', details: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json(opportunity, { status: 201 });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create opportunity';
      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
  },
  {
    auth: true,
    roles: [PlatformRole.COMPVSS_ADMIN],
    validation: OpportunitySchema,
    rateLimit: { maxRequests: 30, windowMs: 60000 },
    audit: { action: 'opportunity:create', resource: 'opportunities' },
  }
);

export async function PATCH(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const body = await request.json();
    const { opportunity_id, action, updates } = body;
    const userId = body.user_id || '00000000-0000-0000-0000-000000000000';

    if (!opportunity_id) {
      return NextResponse.json({ error: 'opportunity_id is required' }, { status: 400 });
    }

    if (action === 'apply') {
      // Check if already applied
      const { data: existing } = await supabase
        .from('opportunity_applications')
        .select('id')
        .eq('opportunity_id', opportunity_id)
        .eq('applicant_id', userId)
        .single();

      if (existing) {
        return NextResponse.json({ error: 'Already applied to this opportunity' }, { status: 409 });
      }

      const { data: application, error } = await supabase
        .from('opportunity_applications')
        .insert({
          opportunity_id,
          applicant_id: userId,
          cover_letter: updates?.cover_letter,
          resume_url: updates?.resume_url,
          status: 'pending',
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json(
          { error: 'Failed to apply', details: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, application });
    }

    if (action === 'close') {
      const { error } = await supabase
        .from('opportunities')
        .update({ status: 'closed', closed_at: new Date().toISOString() })
        .eq('id', opportunity_id);

      if (error) {
        return NextResponse.json(
          { error: 'Failed to close opportunity', details: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, message: 'Opportunity closed' });
    }

    if (action === 'fill') {
      const { error } = await supabase
        .from('opportunities')
        .update({ status: 'filled', filled_at: new Date().toISOString() })
        .eq('id', opportunity_id);

      if (error) {
        return NextResponse.json(
          { error: 'Failed to mark as filled', details: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, message: 'Opportunity marked as filled' });
    }

    // Regular update
    if (updates) {
      const { data, error } = await supabase
        .from('opportunities')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', opportunity_id)
        .select()
        .single();

      if (error) {
        return NextResponse.json(
          { error: 'Failed to update opportunity', details: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, opportunity: data });
    }

    return NextResponse.json({ error: 'No action specified' }, { status: 400 });
  } catch (error) {
    console.error('Error in PATCH /api/opportunities:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
