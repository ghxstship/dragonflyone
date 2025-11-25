import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Referral tracking and rewards program
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const referrerId = searchParams.get('referrer_id');

    let query = supabase.from('referrals').select(`
      *, referrer:contacts!referrer_id(id, name, company),
      referred:contacts!referred_id(id, name, company),
      deal:deals(id, name, value, status)
    `);

    if (referrerId) query = query.eq('referrer_id', referrerId);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Calculate rewards
    const totalRewards = data?.reduce((s, r) => s + (r.reward_amount || 0), 0) || 0;
    const pendingRewards = data?.filter(r => r.reward_status === 'pending').reduce((s, r) => s + (r.reward_amount || 0), 0) || 0;

    return NextResponse.json({
      referrals: data,
      summary: {
        total: data?.length || 0,
        converted: data?.filter(r => r.status === 'converted').length || 0,
        pending: data?.filter(r => r.status === 'pending').length || 0,
        total_rewards: totalRewards,
        pending_rewards: pendingRewards
      }
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

    if (action === 'create') {
      const { referrer_id, referred_name, referred_email, referred_company, notes } = body;

      // Create referred contact
      const { data: contact } = await supabase.from('contacts').insert({
        name: referred_name, email: referred_email, company: referred_company,
        source: 'referral', type: 'lead'
      }).select().single();

      const { data, error } = await supabase.from('referrals').insert({
        referrer_id, referred_id: contact?.id, status: 'pending',
        notes, created_by: user.id
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ referral: data }, { status: 201 });
    }

    if (action === 'convert') {
      const { referral_id, deal_id, reward_amount } = body;

      await supabase.from('referrals').update({
        status: 'converted', deal_id, reward_amount,
        reward_status: 'pending', converted_at: new Date().toISOString()
      }).eq('id', referral_id);

      return NextResponse.json({ success: true });
    }

    if (action === 'pay_reward') {
      const { referral_id, payment_method, payment_reference } = body;

      await supabase.from('referrals').update({
        reward_status: 'paid', reward_paid_at: new Date().toISOString(),
        payment_method, payment_reference
      }).eq('id', referral_id);

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
