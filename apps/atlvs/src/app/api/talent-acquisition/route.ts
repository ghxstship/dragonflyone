import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';
import { apiRoute } from '@ghxstship/config/middleware';
import { PlatformRole } from '@ghxstship/config/roles';

const jobPostingSchema = z.object({
  title: z.string().min(1),
  department: z.string(),
  location: z.string(),
  employment_type: z.enum(['full_time', 'part_time', 'contract', 'freelance', 'intern']),
  experience_level: z.enum(['entry', 'mid', 'senior', 'lead', 'executive']),
  description: z.string(),
  responsibilities: z.array(z.string()),
  requirements: z.array(z.string()),
  salary_range_min: z.number().optional(),
  salary_range_max: z.number().optional(),
  benefits: z.array(z.string()).optional(),
  remote_policy: z.enum(['onsite', 'hybrid', 'remote']).optional(),
  status: z.enum(['draft', 'active', 'paused', 'closed']).default('draft')
});

const candidateSchema = z.object({
  job_posting_id: z.string().uuid(),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  resume_url: z.string().url().optional(),
  portfolio_url: z.string().url().optional(),
  linkedin_url: z.string().url().optional(),
  cover_letter: z.string().optional(),
  years_experience: z.number().optional(),
  current_company: z.string().optional(),
  current_title: z.string().optional(),
  source: z.enum(['direct', 'referral', 'agency', 'linkedin', 'indeed', 'other']).optional(),
  referrer_id: z.string().uuid().optional()
});

// GET - List job postings or candidates
export const GET = apiRoute(
  async (request: NextRequest) => {
    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const job_id = searchParams.get('job_id');
    const status = searchParams.get('status');

    if (type === 'candidates') {
      let query = supabase
        .from('candidates')
        .select(`
          *,
          job_postings (
            id,
            title,
            department
          ),
          interviews (
            id,
            interview_date,
            status,
            feedback
          )
        `)
        .order('created_at', { ascending: false });

      if (job_id) {
        query = query.eq('job_posting_id', job_id);
      }

      if (status) {
        query = query.eq('stage', status);
      }

      const { data, error } = await query;

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ candidates: data });
    }

    // List job postings
    let query = supabase
      .from('job_postings')
      .select(`
        *,
        candidates (count)
      `)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ job_postings: data });
  },
  {
    auth: true,
    roles: [PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER],
    audit: { action: 'talent:list', resource: 'talent_acquisition' }
  }
);

// POST - Create job posting or add candidate
export const POST = apiRoute(
  async (request: NextRequest, context: any) => {
    const supabase = createAdminClient();
    const body = await request.json();
    const { type } = body;

    if (type === 'candidate') {
      const validated = candidateSchema.parse(body.data);

      // Create candidate application
      const { data: candidate, error } = await supabase
        .from('candidates')
        .insert({
          ...validated,
          stage: 'applied',
          applied_at: new Date().toISOString(),
          source: validated.source || 'direct'
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Track referral if applicable
      if (validated.referrer_id) {
        await supabase.from('referrals').insert({
          referrer_id: validated.referrer_id,
          candidate_id: candidate.id,
          job_posting_id: validated.job_posting_id,
          status: 'pending'
        });
      }

      // Send confirmation email (placeholder)
      // await sendApplicationConfirmation(candidate.email);

      return NextResponse.json({
        candidate,
        message: 'Application submitted successfully'
      }, { status: 201 });
    }

    // Create job posting
    const validated = jobPostingSchema.parse(body.data || body);

    const { data: posting, error } = await supabase
      .from('job_postings')
      .insert({
        ...validated,
        created_by: context.user.id,
        posted_at: validated.status === 'active' ? new Date().toISOString() : null
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      posting,
      message: 'Job posting created successfully'
    }, { status: 201 });
  },
  {
    auth: true,
    audit: { action: 'talent:create', resource: 'talent_acquisition' }
  }
);

// PUT - Update candidate stage or job posting
export const PUT = apiRoute(
  async (request: NextRequest) => {
    const body = await request.json();
    const { id, type, action, updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    if (type === 'candidate') {
      if (action === 'move_stage') {
        const { stage, notes } = updates;
        
        const { data, error } = await supabase
          .from('candidates')
          .update({
            stage,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .select()
          .single();

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Log stage change
        await supabase.from('candidate_activity').insert({
          candidate_id: id,
          activity_type: 'stage_change',
          old_value: data.stage,
          new_value: stage,
          notes
        });

        return NextResponse.json({
          candidate: data,
          message: 'Candidate stage updated'
        });
      }

      if (action === 'schedule_interview') {
        const { interview_date, interview_type, interviewer_ids, notes } = updates;

        const { data: interview, error } = await supabase
          .from('interviews')
          .insert({
            candidate_id: id,
            interview_date,
            interview_type,
            interviewer_ids,
            notes,
            status: 'scheduled'
          })
          .select()
          .single();

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Update candidate stage to interviewing
        await supabase
          .from('candidates')
          .update({ stage: 'interviewing' })
          .eq('id', id);

        // Send calendar invites (placeholder)
        // await sendInterviewInvites(interview);

        return NextResponse.json({
          interview,
          message: 'Interview scheduled successfully'
        });
      }

      // General candidate update
      const { data, error } = await supabase
        .from('candidates')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ candidate: data });
    }

    // Update job posting
    const { data, error } = await supabase
      .from('job_postings')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ posting: data });
  },
  {
    auth: true,
    roles: [PlatformRole.ATLVS_ADMIN],
    audit: { action: 'talent:update', resource: 'talent_acquisition' }
  }
);

// DELETE - Archive job posting or reject candidate
export const DELETE = apiRoute(
  async (request: NextRequest) => {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const type = searchParams.get('type');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    if (type === 'candidate') {
      const { error } = await supabase
        .from('candidates')
        .update({
          stage: 'rejected',
          rejected_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ message: 'Candidate rejected' });
    }

    // Close job posting
    const { error } = await supabase
      .from('job_postings')
      .update({
        status: 'closed',
        closed_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Job posting closed' });
  },
  {
    auth: true,
    roles: [PlatformRole.ATLVS_ADMIN],
    audit: { action: 'talent:delete', resource: 'talent_acquisition' }
  }
);
