import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

// Referral program management
export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employee_id');

    if (employeeId) {
      const { data } = await supabase.from('employee_referrals').select(`
        *, candidate:candidates(first_name, last_name, status),
        position:positions(title)
      `).eq('referrer_id', employeeId).order('created_at', { ascending: false });

      // Calculate stats
      const hired = data?.filter(r => r.candidate?.status === 'hired').length || 0;
      const pending = data?.filter(r => r.candidate?.status === 'pending').length || 0;
      const totalBonus = data?.filter(r => r.bonus_paid).reduce((s, r) => s + (r.bonus_amount || 0), 0) || 0;

      return NextResponse.json({
        referrals: data,
        stats: { total: data?.length || 0, hired, pending, total_bonus: totalBonus }
      });
    }

    // Get program settings
    const { data: settings } = await supabase.from('referral_program_settings').select('*').single();

    // Get leaderboard
    const { data: leaderboard } = await supabase.from('employee_referrals').select(`
      referrer_id, referrer:employees(first_name, last_name)
    `).eq('status', 'hired');

    return NextResponse.json({ settings, leaderboard });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { action } = body;

    if (action === 'submit_referral') {
      const { position_id, candidate_name, candidate_email, candidate_phone, resume_url, relationship, notes } = body;

      // Create candidate
      const { data: candidate } = await supabase.from('candidates').insert({
        first_name: candidate_name.split(' ')[0],
        last_name: candidate_name.split(' ').slice(1).join(' '),
        email: candidate_email, phone: candidate_phone,
        resume_url, source: 'referral', status: 'new'
      }).select().single();

      // Create referral record
      const { data, error } = await supabase.from('employee_referrals').insert({
        referrer_id: user.id, candidate_id: candidate?.id, position_id,
        relationship, notes, status: 'submitted'
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ referral: data }, { status: 201 });
    }

    if (action === 'update_status') {
      const { referral_id, status } = body;

      await supabase.from('employee_referrals').update({ status }).eq('id', referral_id);

      // If hired, trigger bonus
      if (status === 'hired') {
        const { data: settings } = await supabase.from('referral_program_settings').select('bonus_amount').single();
        await supabase.from('employee_referrals').update({
          bonus_amount: settings?.bonus_amount, bonus_eligible_date: new Date().toISOString()
        }).eq('id', referral_id);
      }

      return NextResponse.json({ success: true });
    }

    if (action === 'pay_bonus') {
      const { referral_id } = body;

      await supabase.from('employee_referrals').update({
        bonus_paid: true, bonus_paid_date: new Date().toISOString()
      }).eq('id', referral_id);

      return NextResponse.json({ success: true });
    }

    if (action === 'update_settings') {
      const { bonus_amount, waiting_period_days, eligible_positions } = body;

      await supabase.from('referral_program_settings').upsert({
        id: 1, bonus_amount, waiting_period_days, eligible_positions
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
