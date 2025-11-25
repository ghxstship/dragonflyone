import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Validation schema
const referralCodeSchema = z.object({
  code_type: z.enum(['personal', 'promotional', 'influencer', 'partner', 'campaign']).default('personal'),
  display_name: z.string().optional(),
  description: z.string().optional(),
  referrer_reward_type: z.enum(['percentage', 'fixed_amount', 'credits', 'points', 'custom']),
  referrer_reward_value: z.number().positive(),
  referee_reward_type: z.enum(['percentage', 'fixed_amount', 'credits', 'points', 'custom']),
  referee_reward_value: z.number().positive(),
  usage_limit: z.number().int().positive().optional(),
  min_purchase_amount: z.number().optional(),
  valid_until: z.string().optional(),
});

const createReferralSchema = z.object({
  referral_code: z.string(),
  referee_email: z.string().email().optional(),
  referee_phone: z.string().optional(),
  referee_name: z.string().optional(),
  source: z.string().optional(),
  campaign_id: z.string().optional(),
});

// GET /api/referrals - Get user's referral program data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const type = searchParams.get('type'); // 'codes', 'referrals', 'rewards', 'stats'

    if (!userId) {
      return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 }
      );
    }

    if (type === 'codes') {
      // Get user's referral codes
      const { data: codes, error } = await supabase
        .from('referral_codes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        return NextResponse.json(
          { error: 'Failed to fetch referral codes', details: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({ codes });
    }

    if (type === 'referrals') {
      // Get referrals made by this user
      const { data: referrals, error } = await supabase
        .from('referrals')
        .select(`
          *,
          code:referral_codes(code, display_name),
          referee:platform_users!referee_id(id, full_name, email)
        `)
        .eq('referrer_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        return NextResponse.json(
          { error: 'Failed to fetch referrals', details: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({ referrals });
    }

    if (type === 'rewards') {
      // Get user's rewards
      const { data: rewards, error } = await supabase
        .from('referral_rewards')
        .select(`
          *,
          referral:referrals(
            referee_name,
            referee_email,
            referee:platform_users!referee_id(full_name)
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        return NextResponse.json(
          { error: 'Failed to fetch rewards', details: error.message },
          { status: 500 }
        );
      }

      const summary = {
        total_earned: rewards.reduce((sum, r) => 
          ['issued', 'redeemed'].includes(r.status) ? sum + Number(r.reward_value) : sum, 0
        ),
        pending: rewards.filter(r => r.status === 'pending').length,
        available: rewards.filter(r => r.status === 'issued').length,
        redeemed: rewards.filter(r => r.status === 'redeemed').length,
      };

      return NextResponse.json({ rewards, summary });
    }

    if (type === 'stats') {
      // Get comprehensive stats
      const { data: stats } = await supabase.rpc('get_user_referral_stats', {
        p_user_id: userId,
      });

      return NextResponse.json({ stats: stats?.[0] || {} });
    }

    // Default: return everything
    const [codesRes, referralsRes, rewardsRes, statsRes] = await Promise.all([
      supabase.from('referral_codes').select('*').eq('user_id', userId),
      supabase.from('referrals').select('*').eq('referrer_id', userId),
      supabase.from('referral_rewards').select('*').eq('user_id', userId),
      supabase.rpc('get_user_referral_stats', { p_user_id: userId }),
    ]);

    return NextResponse.json({
      codes: codesRes.data || [],
      referrals: referralsRes.data || [],
      rewards: rewardsRes.data || [],
      stats: statsRes.data?.[0] || {},
    });
  } catch (error) {
    console.error('Error in GET /api/referrals:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/referrals - Create referral code or register referral
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'create_code') {
      return await createReferralCode(body);
    } else if (action === 'register_referral') {
      return await registerReferral(body);
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "create_code" or "register_referral"' },
        { status: 400 }
      );
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error in POST /api/referrals:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper: Create referral code
async function createReferralCode(body: any) {
  const validated = referralCodeSchema.parse(body);
  const userId = body.user_id;

  if (!userId) {
    return NextResponse.json(
      { error: 'user_id is required' },
      { status: 400 }
    );
  }

  // Generate unique code
  const { data: code } = await supabase.rpc('generate_referral_code');

  // Create referral code
  const { data, error } = await supabase
    .from('referral_codes')
    .insert([
      {
        ...validated,
        user_id: userId,
        code: code,
        is_active: true,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating referral code:', error);
    return NextResponse.json(
      { error: 'Failed to create referral code', details: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(data, { status: 201 });
}

// Helper: Register referral
async function registerReferral(body: any) {
  const validated = createReferralSchema.parse(body);

  // Get referral code
  const { data: code, error: codeError } = await supabase
    .from('referral_codes')
    .select('*')
    .eq('code', validated.referral_code)
    .eq('is_active', true)
    .single();

  if (codeError || !code) {
    return NextResponse.json(
      { error: 'Invalid or inactive referral code' },
      { status: 404 }
    );
  }

  // Check usage limit
  if (code.usage_limit && code.usage_count >= code.usage_limit) {
    return NextResponse.json(
      { error: 'Referral code usage limit reached' },
      { status: 400 }
    );
  }

  // Check validity period
  if (code.valid_until && new Date(code.valid_until) < new Date()) {
    return NextResponse.json(
      { error: 'Referral code has expired' },
      { status: 400 }
    );
  }

  // Create referral
  const { data: referral, error } = await supabase
    .from('referrals')
    .insert([
      {
        referral_code_id: code.id,
        referrer_id: code.user_id,
        referee_email: validated.referee_email,
        referee_phone: validated.referee_phone,
        referee_name: validated.referee_name,
        source: validated.source || 'web',
        campaign_id: validated.campaign_id,
        status: 'pending',
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating referral:', error);
    return NextResponse.json(
      { error: 'Failed to register referral', details: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    referral,
    message: 'Referral registered successfully',
    referee_reward: {
      type: code.referee_reward_type,
      value: code.referee_reward_value,
    },
  }, { status: 201 });
}

// PATCH /api/referrals - Update referral status or redeem reward
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, referral_id, reward_id, user_id } = body;

    if (action === 'signup') {
      // Mark referral as signed up
      if (!referral_id || !user_id) {
        return NextResponse.json(
          { error: 'referral_id and user_id are required' },
          { status: 400 }
        );
      }

      await supabase.rpc('process_referral_signup', {
        p_referral_id: referral_id,
        p_referee_user_id: user_id,
      });

      return NextResponse.json({ success: true, message: 'Referral signup processed' });
    }

    if (action === 'qualify') {
      // Qualify referral after purchase
      const { purchase_amount, order_id } = body;

      if (!referral_id || !purchase_amount || !order_id) {
        return NextResponse.json(
          { error: 'referral_id, purchase_amount, and order_id are required' },
          { status: 400 }
        );
      }

      await supabase.rpc('qualify_referral', {
        p_referral_id: referral_id,
        p_purchase_amount: purchase_amount,
        p_order_id: order_id,
      });

      return NextResponse.json({ success: true, message: 'Referral qualified' });
    }

    if (action === 'redeem_reward') {
      // Redeem a reward
      if (!reward_id) {
        return NextResponse.json(
          { error: 'reward_id is required' },
          { status: 400 }
        );
      }

      const { error } = await supabase
        .from('referral_rewards')
        .update({
          status: 'redeemed',
          redeemed_at: new Date().toISOString(),
        })
        .eq('id', reward_id)
        .eq('status', 'issued'); // Can only redeem issued rewards

      if (error) {
        return NextResponse.json(
          { error: 'Failed to redeem reward', details: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, message: 'Reward redeemed' });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in PATCH /api/referrals:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
