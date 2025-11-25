import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Skills inventory matrix and certification tracking
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employee_id');
    const skill = searchParams.get('skill');
    const department = searchParams.get('department');

    let query = supabase.from('employee_skills').select(`
      *, employee:employees(id, first_name, last_name, department)
    `);

    if (employeeId) query = query.eq('employee_id', employeeId);
    if (skill) query = query.eq('skill_name', skill);

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Build skills matrix
    const matrix: Record<string, Record<string, number>> = {};
    const allSkills = new Set<string>();

    data?.forEach(s => {
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

    return NextResponse.json({
      skills: data,
      matrix,
      all_skills: Array.from(allSkills),
      certifications: certs,
      expiring_soon: expiringSoon
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch skills' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { type } = body;

    if (type === 'skill') {
      const { employee_id, skill_name, proficiency_level, years_experience, notes } = body;
      const { data, error } = await supabase.from('employee_skills').upsert({
        employee_id, skill_name, proficiency_level, years_experience, notes,
        last_assessed: new Date().toISOString()
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ skill: data }, { status: 201 });
    }

    if (type === 'certification') {
      const { employee_id, cert_name, issuing_org, issue_date, expiry_date, credential_id, document_url } = body;
      const { data, error } = await supabase.from('certifications').insert({
        employee_id, cert_name, issuing_org, issue_date, expiry_date, credential_id, document_url,
        status: 'active'
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ certification: data }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}
