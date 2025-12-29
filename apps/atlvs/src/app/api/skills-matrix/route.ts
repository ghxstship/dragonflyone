export const dynamic = 'force-dynamic';

import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const createSkillSchema = z.object({
  type: z.literal('skill'),
  employee_id: z.string().uuid(),
  skill_name: z.string().min(1),
  proficiency_level: z.number().min(1).max(5),
  years_experience: z.number().min(0).optional(),
  notes: z.string().optional(),
});

const createCertificationSchema = z.object({
  type: z.literal('certification'),
  employee_id: z.string().uuid(),
  cert_name: z.string().min(1),
  issuing_org: z.string().min(1),
  issue_date: z.string(),
  expiry_date: z.string().optional(),
  credential_id: z.string().optional(),
  document_url: z.string().url().optional(),
});

const createSchema = z.discriminatedUnion('type', [createSkillSchema, createCertificationSchema]);

// Skills inventory matrix and certification tracking
const ATLVS_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employee_id');
    const skill = searchParams.get('skill');
    const department = searchParams.get('department');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    const offset = (page - 1) * limit;

    let query = supabase.from('employee_skills').select(`
      id, skill_name, proficiency_level, certified, certification_date,
      employee:employees(id, first_name, last_name, department, department_id)
    `, { count: 'exact' });

    if (employeeId) query = query.eq('employee_id', employeeId);
    if (skill) query = query.eq('skill_name', skill);

    const { data, error, count } = await query.range(offset, offset + limit - 1);

    // Filter by department if specified (done in memory since it's a nested field)
    let filteredData = data;
    if (department && data) {
      filteredData = data.filter(s => s.employee?.department === department || s.employee?.department_id === department);
    }
    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

    // Build skills matrix
    const matrix: Record<string, Record<string, number>> = {};
    const allSkills = new Set<string>();

    filteredData?.forEach(s => {
      const empName = `${s.employee?.first_name} ${s.employee?.last_name}`;
      if (!matrix[empName]) matrix[empName] = {};
      matrix[empName][s.skill_name] = s.proficiency_level;
      allSkills.add(s.skill_name);
    });

    // Get certifications
    const { data: certs } = await supabase.from('certifications').select(`
      *, employee:employees(id, first_name, last_name)
    `).order('expiry_date', { ascending: true });

    const expiringSoon = certs?.filter(c => {
      const expiry = new Date(c.expiry_date);
      const daysUntil = (expiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      return daysUntil > 0 && daysUntil <= 90;
    }) || [];

    const totalCount = count || (filteredData?.length ?? 0);
    const pagination = {
      page,
      limit,
      total: totalCount,
      totalPages: Math.ceil(totalCount / limit),
      hasMore: offset + (filteredData?.length ?? 0) < totalCount,
    };

    return NextResponse.json({
      skills: filteredData,
      matrix,
      all_skills: Array.from(allSkills),
      certifications: certs,
      expiring_soon: expiringSoon,
      department_filter: department,
      pagination,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch skills' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const validatedData = createSchema.parse(body);
    const { type } = validatedData;

    if (type === 'skill') {
      const { employee_id, skill_name, proficiency_level, years_experience, notes } = validatedData;
      const { data, error } = await supabase.from('employee_skills').upsert({
        employee_id, skill_name, proficiency_level, years_experience, notes,
        last_assessed: new Date().toISOString()
      }).select().single();

      if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
      return NextResponse.json({ skill: data }, { status: 201 });
    }

    if (type === 'certification') {
      const { employee_id, cert_name, issuing_org, issue_date, expiry_date, credential_id, document_url } = validatedData;
      const { data, error } = await supabase.from('certifications').insert({
        employee_id, cert_name, issuing_org, issue_date, expiry_date, credential_id, document_url,
        status: 'active'
      }).select().single();

      if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
      return NextResponse.json({ certification: data }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}
