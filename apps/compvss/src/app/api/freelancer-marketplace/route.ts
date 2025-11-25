import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Freelancer marketplace with verified profiles
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const skills = searchParams.get('skills');
    const location = searchParams.get('location');
    const verified = searchParams.get('verified') === 'true';
    const available = searchParams.get('available') === 'true';

    let query = supabase.from('freelancers').select(`
      *, skills:freelancer_skills(skill, level),
      certifications:freelancer_certifications(name, verified, expiry_date),
      ratings:freelancer_ratings(rating, review)
    `).eq('profile_active', true);

    if (verified) query = query.eq('verified', true);
    if (location) query = query.ilike('location', `%${location}%`);

    const { data, error } = await query.order('rating_avg', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Filter by skills if specified
    let filtered = data;
    if (skills) {
      const skillList = skills.split(',');
      filtered = data?.filter(f => 
        f.skills?.some((s: any) => skillList.includes(s.skill))
      );
    }

    // Filter by availability
    if (available) {
      const now = new Date().toISOString();
      const { data: unavailable } = await supabase.from('freelancer_bookings').select('freelancer_id')
        .lte('start_date', now).gte('end_date', now);
      const unavailableIds = new Set(unavailable?.map(u => u.freelancer_id));
      filtered = filtered?.filter(f => !unavailableIds.has(f.id));
    }

    return NextResponse.json({
      freelancers: filtered?.map(f => ({
        ...f,
        avg_rating: f.ratings?.length ? f.ratings.reduce((s: number, r: any) => s + r.rating, 0) / f.ratings.length : null
      }))
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { action } = body;

    if (action === 'create_profile') {
      const { bio, hourly_rate, skills, location, portfolio_url } = body;

      const { data, error } = await supabase.from('freelancers').insert({
        user_id: user.id, bio, hourly_rate, location, portfolio_url,
        profile_active: true, verified: false
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      // Add skills
      if (skills?.length) {
        await supabase.from('freelancer_skills').insert(
          skills.map((s: any) => ({ freelancer_id: data.id, skill: s.skill, level: s.level || 'intermediate' }))
        );
      }

      return NextResponse.json({ profile: data }, { status: 201 });
    }

    if (action === 'request_verification') {
      const { freelancer_id, documents } = body;

      await supabase.from('verification_requests').insert({
        freelancer_id, documents: documents || [], status: 'pending',
        requested_at: new Date().toISOString()
      });

      return NextResponse.json({ success: true, message: 'Verification request submitted' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
