import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@ghxstship/config';

// Resume/portfolio database with search
export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const skills = searchParams.get('skills');
    const experience = searchParams.get('min_experience');
    const search = searchParams.get('search');

    let query = supabase.from('resumes').select(`
      *, user:platform_users(first_name, last_name, email)
    `).eq('searchable', true);

    if (search) query = query.or(`title.ilike.%${search}%,summary.ilike.%${search}%`);

    const { data, error } = await query.order('updated_at', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    let filtered = data;
    if (skills) {
      const skillList = skills.split(',');
      filtered = data?.filter(r => r.skills?.some((s: string) => skillList.includes(s)));
    }
    if (experience) {
      filtered = filtered?.filter(r => (r.years_experience || 0) >= parseInt(experience));
    }

    return NextResponse.json({ resumes: filtered });
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
    const { title, summary, skills, experience, education, certifications, portfolio_url, resume_url } = body;

    const { data, error } = await supabase.from('resumes').upsert({
      user_id: user.id, title, summary, skills: skills || [],
      experience: experience || [], education: education || [],
      certifications: certifications || [], portfolio_url, resume_url,
      searchable: true, updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ resume: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}
