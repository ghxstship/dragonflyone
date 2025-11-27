import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@ghxstship/config';

// Salary/rate transparency options
export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const location = searchParams.get('location');
    const experience = searchParams.get('experience');

    let query = supabase.from('salary_data').select('*');

    if (role) query = query.ilike('role_title', `%${role}%`);
    if (location) query = query.ilike('location', `%${location}%`);
    if (experience) query = query.eq('experience_level', experience);

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

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
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { action } = body;

    if (action === 'submit') {
      const { role_title, company_type, location, experience_level, salary_amount, hourly_rate, benefits, year } = body;

      const { data, error } = await supabase.from('salary_data').insert({
        role_title, company_type, location, experience_level,
        salary_amount, hourly_rate, benefits: benefits || [],
        year: year || new Date().getFullYear(), submitted_by: user.id, verified: false
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ submission: data }, { status: 201 });
    }

    if (action === 'set_opportunity_range') {
      const { opportunity_id, min_salary, max_salary, min_rate, max_rate, show_salary } = body;

      await supabase.from('opportunities').update({
        min_salary, max_salary, min_rate, max_rate, show_salary
      }).eq('id', opportunity_id);

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
