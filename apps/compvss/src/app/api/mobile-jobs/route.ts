import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@ghxstship/config';

// Mobile job search and application
export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const radius = parseFloat(searchParams.get('radius') || '50');
    const skills = searchParams.get('skills')?.split(',');
    const jobType = searchParams.get('type');

    let query = supabase.from('opportunities').select(`
      id, title, company, location, job_type, salary_range, posted_at, deadline,
      skills_required, latitude, longitude
    `).eq('status', 'open');

    if (jobType) query = query.eq('job_type', jobType);

    const { data, error } = await query.order('posted_at', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    let results: any[] = data || [];

    // Filter by location if coordinates provided
    if (lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);

      results = results.filter(job => {
        if (!job.latitude || !job.longitude) return true; // Include jobs without location
        const distance = calculateDistance(userLat, userLng, job.latitude, job.longitude);
        return distance <= radius;
      }).map(job => ({
        ...job,
        distance_km: job.latitude && job.longitude
          ? Math.round(calculateDistance(userLat, userLng, job.latitude, job.longitude) * 10) / 10
          : null
      }));

      // Sort by distance
      results.sort((a: any, b: any) => (a.distance_km || 999) - (b.distance_km || 999));
    }

    // Filter by skills if provided
    if (skills?.length) {
      results = results.filter(job =>
        skills.some(s => job.skills_required?.includes(s))
      );
    }

    return NextResponse.json({
      jobs: results,
      total: results.length,
      filters: { lat, lng, radius, skills, jobType }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to search' }, { status: 500 });
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

    if (action === 'quick_apply') {
      const { opportunity_id, use_saved_resume, cover_note } = body;

      // Get user's saved resume if using saved
      let resumeUrl = null;
      if (use_saved_resume) {
        const { data: resume } = await supabase.from('resumes').select('resume_url')
          .eq('user_id', user.id).single();
        resumeUrl = resume?.resume_url;
      }

      const { data, error } = await supabase.from('job_applications').insert({
        opportunity_id, applicant_id: user.id, resume_url: resumeUrl,
        cover_letter: cover_note, status: 'submitted',
        applied_via: 'mobile', submitted_at: new Date().toISOString()
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ application: data }, { status: 201 });
    }

    if (action === 'save_job') {
      const { opportunity_id } = body;

      await supabase.from('saved_jobs').upsert({
        user_id: user.id, opportunity_id, saved_at: new Date().toISOString()
      }, { onConflict: 'user_id,opportunity_id' });

      return NextResponse.json({ success: true });
    }

    if (action === 'unsave_job') {
      const { opportunity_id } = body;

      await supabase.from('saved_jobs').delete()
        .eq('user_id', user.id).eq('opportunity_id', opportunity_id);

      return NextResponse.json({ success: true });
    }

    if (action === 'get_saved_jobs') {
      const { data } = await supabase.from('saved_jobs').select(`
        *, opportunity:opportunities(id, title, company, location, deadline)
      `).eq('user_id', user.id).order('saved_at', { ascending: false });

      return NextResponse.json({ saved_jobs: data });
    }

    if (action === 'get_applications') {
      const { data } = await supabase.from('job_applications').select(`
        *, opportunity:opportunities(id, title, company)
      `).eq('applicant_id', user.id).order('submitted_at', { ascending: false });

      return NextResponse.json({ applications: data });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}

// Haversine formula for distance calculation
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}
