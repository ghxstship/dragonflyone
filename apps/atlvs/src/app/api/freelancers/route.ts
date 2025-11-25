import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Freelancer/gig worker database with rating system
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const skill = searchParams.get('skill');
    const minRating = searchParams.get('min_rating');
    const available = searchParams.get('available');

    let query = supabase.from('freelancers').select(`
      *, ratings:freelancer_ratings(score, review, project:projects(name))
    `);

    if (skill) query = query.contains('skills', [skill]);
    if (minRating) query = query.gte('average_rating', parseFloat(minRating));
    if (available === 'true') query = query.eq('is_available', true);

    const { data, error } = await query.order('average_rating', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Get all unique skills
    const allSkills = new Set<string>();
    data?.forEach(f => f.skills?.forEach((s: string) => allSkills.add(s)));

    return NextResponse.json({
      freelancers: data,
      skills: Array.from(allSkills),
      total: data?.length || 0
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch freelancers' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { name, email, phone, skills, hourly_rate, day_rate, portfolio_url, bio, location } = body;

    const { data, error } = await supabase.from('freelancers').insert({
      name, email, phone, skills: skills || [], hourly_rate, day_rate,
      portfolio_url, bio, location, is_available: true, average_rating: 0,
      created_by: user.id
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ freelancer: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create freelancer' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { id, action, project_id, score, review } = body;

    if (action === 'rate') {
      await supabase.from('freelancer_ratings').insert({
        freelancer_id: id, project_id, score, review, rated_by: user.id
      });

      // Update average rating
      const { data: ratings } = await supabase.from('freelancer_ratings').select('score').eq('freelancer_id', id);
      const avgRating = ratings ? ratings.reduce((s, r) => s + r.score, 0) / ratings.length : 0;

      await supabase.from('freelancers').update({
        average_rating: Math.round(avgRating * 10) / 10, total_reviews: ratings?.length || 0
      }).eq('id', id);

      return NextResponse.json({ success: true, new_rating: avgRating });
    }

    const { error } = await supabase.from('freelancers').update(body).eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
