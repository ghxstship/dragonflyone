export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase, withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const submitSalarySchema = z.object({
  action: z.literal('submit'),
  role_title: z.string(),
  company_type: z.string().optional(),
  location: z.string().optional(),
  experience_level: z.string().optional(),
  salary_amount: z.number().optional(),
  hourly_rate: z.number().optional(),
  benefits: z.array(z.string()).optional(),
  year: z.number().optional(),
});

const setOpportunityRangeSchema = z.object({
  action: z.literal('set_opportunity_range'),
  opportunity_id: z.string().uuid(),
  min_salary: z.number().optional(),
  max_salary: z.number().optional(),
  min_rate: z.number().optional(),
  max_rate: z.number().optional(),
  show_salary: z.boolean().optional(),
});

const salaryActionSchema = z.union([submitSalarySchema, setOpportunityRangeSchema]);

// Salary/rate transparency options
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
    const role = searchParams.get('role');
    const location = searchParams.get('location');
    const experience = searchParams.get('experience');

    let query = supabase.from('salary_data').select('*');

    if (role) query = query.ilike('role_title', `%${role}%`);
    if (location) query = query.ilike('location', `%${location}%`);
    if (experience) query = query.eq('experience_level', experience);

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

    // Calculate aggregates
    const salaries = data?.map(d => d.salary_amount) || [];
    const rates = data?.map(d => d.hourly_rate).filter(Boolean) || [];

    return NextResponse.json({
      data,
      summary: {
        count: data?.length || 0,
        salary: {
          min: Math.min(...salaries),
          max: Math.max(...salaries),
          median: salaries.sort((a, b) => a - b)[Math.floor(salaries.length / 2)],
          average: salaries.reduce((a, b) => a + b, 0) / salaries.length
        },
        hourly_rate: rates.length ? {
          min: Math.min(...rates),
          max: Math.max(...rates),
          average: rates.reduce((a, b) => a + b, 0) / rates.length
        } : null
      }
    });
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

    const userId = authResult.user?.id;
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const validatedData = salaryActionSchema.parse(body);
    const { action } = validatedData;

    if (action === 'submit') {
      const { role_title, company_type, location, experience_level, salary_amount, hourly_rate, benefits, year } = validatedData as z.infer<typeof submitSalarySchema>;

      const { data, error } = await supabase.from('salary_data').insert({
        role_title, company_type, location, experience_level,
        salary_amount, hourly_rate, benefits: benefits || [],
        year: year || new Date().getFullYear(), submitted_by: userId, verified: false
      }).select().single();

      if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
      return NextResponse.json({ submission: data }, { status: 201 });
    }

    if (action === 'set_opportunity_range') {
      const { opportunity_id, min_salary, max_salary, min_rate, max_rate, show_salary } = validatedData as z.infer<typeof setOpportunityRangeSchema>;

      await supabase.from('deals').update({
        min_salary, max_salary, min_rate, max_rate, show_salary
      }).eq('id', opportunity_id);

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
