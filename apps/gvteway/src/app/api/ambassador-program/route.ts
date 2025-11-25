import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Ambassador and superfan programs with rewards
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const artistId = searchParams.get('artist_id');

    // Get user's ambassador status
    const { data: ambassadorStatus } = await supabase.from('ambassadors').select(`
      *, artist:artists(id, name), tier:ambassador_tiers(name, perks, commission_rate)
    `).eq('user_id', user.id);

    // Get available programs
    let programsQuery = supabase.from('ambassador_programs').select(`
      *, artist:artists(id, name), tiers:ambassador_tiers(id, name, requirements, perks)
    `).eq('status', 'active');

    if (artistId) programsQuery = programsQuery.eq('artist_id', artistId);

    const { data: programs } = await programsQuery;

    // Get user's referral stats
    const { data: referrals } = await supabase.from('ambassador_referrals').select('*')
      .eq('ambassador_id', user.id);

    const totalEarnings = referrals?.reduce((s, r) => s + (r.commission_earned || 0), 0) || 0;
    const totalReferrals = referrals?.length || 0;

    return NextResponse.json({
      ambassador_status: ambassadorStatus,
      available_programs: programs,
      stats: {
        total_referrals: totalReferrals,
        total_earnings: totalEarnings,
        pending_earnings: referrals?.filter(r => r.status === 'pending').reduce((s, r) => s + (r.commission_earned || 0), 0) || 0
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch ambassador data' }, { status: 500 });
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

    if (action === 'apply') {
      const { program_id, application_text, social_links } = body;

      const { data, error } = await supabase.from('ambassador_applications').insert({
        program_id, user_id: user.id, application_text,
        social_links: social_links || [], status: 'pending',
        applied_at: new Date().toISOString()
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ application: data }, { status: 201 });
    }

    if (action === 'generate_link') {
      const { program_id } = body;

      // Check if user is an ambassador
      const { data: ambassador } = await supabase.from('ambassadors').select('*')
        .eq('user_id', user.id).eq('program_id', program_id).single();

      if (!ambassador) {
        return NextResponse.json({ error: 'Not an ambassador for this program' }, { status: 403 });
      }

      const referralCode = `AMB-${user.id.substring(0, 8)}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

      const { data, error } = await supabase.from('ambassador_links').insert({
        ambassador_id: ambassador.id, referral_code: referralCode,
        created_at: new Date().toISOString()
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ link: data, referral_code: referralCode }, { status: 201 });
    }

    if (action === 'track_referral') {
      const { referral_code, order_id, order_amount } = body;

      const { data: link } = await supabase.from('ambassador_links').select(`
        *, ambassador:ambassadors(*, tier:ambassador_tiers(commission_rate))
      `).eq('referral_code', referral_code).single();

      if (!link) return NextResponse.json({ error: 'Invalid referral code' }, { status: 400 });

      const commissionRate = link.ambassador?.tier?.commission_rate || 0.05;
      const commission = order_amount * commissionRate;

      await supabase.from('ambassador_referrals').insert({
        ambassador_id: link.ambassador_id, link_id: link.id,
        order_id, order_amount, commission_earned: commission,
        status: 'pending'
      });

      return NextResponse.json({ success: true, commission });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
