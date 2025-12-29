export const dynamic = 'force-dynamic';

import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const createReferralSchema = z.object({
  action: z.literal('create'),
  referrer_id: z.string().uuid(),
  referred_name: z.string().min(1),
  referred_email: z.string().email(),
  referred_company: z.string().optional(),
  notes: z.string().optional(),
});

const convertReferralSchema = z.object({
  action: z.literal('convert'),
  referral_id: z.string().uuid(),
  deal_id: z.string().uuid(),
  reward_amount: z.number().positive(),
});

const payRewardSchema = z.object({
  action: z.literal('pay_reward'),
  referral_id: z.string().uuid(),
  payment_method: z.string(),
  payment_reference: z.string().optional(),
});

const referralActionSchema = z.discriminatedUnion('action', [createReferralSchema, convertReferralSchema, payRewardSchema]);

// Referral tracking and rewards program
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
    const referrerId = searchParams.get('referrer_id');

    let query = supabase.from('referrals').select(`
      *, referrer:contacts!referrer_id(id, name, company),
      referred:contacts!referred_id(id, name, company),
      deal:deals(id, name, value, status)
    `);

    if (referrerId) query = query.eq('referrer_id', referrerId);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

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
    const validatedData = referralActionSchema.parse(body);
    const { action } = validatedData;

    if (action === 'create') {
      const { referrer_id, referred_name, referred_email, referred_company, notes } = validatedData;

      // Create referred contact
      const { data: contact } = await supabase.from('contacts').insert({
        name: referred_name, email: referred_email, company: referred_company,
        source: 'referral', type: 'lead'
      }).select().single();

      const { data, error } = await supabase.from('referrals').insert({
        referrer_id, referred_id: contact?.id, status: 'pending',
        notes, created_by: user.id
      }).select().single();

      if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
      return NextResponse.json({ referral: data }, { status: 201 });
    }

    if (action === 'convert') {
      const { referral_id, deal_id, reward_amount } = validatedData;

      await supabase.from('referrals').update({
        status: 'converted', deal_id, reward_amount,
        reward_status: 'pending', converted_at: new Date().toISOString()
      }).eq('id', referral_id);

      return NextResponse.json({ success: true });
    }

    if (action === 'pay_reward') {
      const { referral_id, payment_method, payment_reference } = validatedData;

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
