export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@ghxstship/config/supabase-types';

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json({ error: 'user_id required' }, { status: 400 });
    }

    // Fetch user points
    const { data: userPoints, error: pointsError } = await supabase
      .from('user_points')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (pointsError && pointsError.code !== 'PGRST116') {
      return NextResponse.json({ error: pointsError.message }, { status: 500 });
    }

    // Fetch available rewards
    const { data: rewards, error: rewardsError } = await supabase
      .from('rewards')
      .select('*')
      .eq('is_active', true)
      .order('points_required', { ascending: true });

    if (rewardsError) {
      return NextResponse.json({ error: rewardsError.message }, { status: 500 });
    }

    // Fetch user's reward redemptions
    const { data: userRewards, error: userRewardsError } = await supabase
      .from('user_rewards')
      .select('*, rewards(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (userRewardsError) {
      return NextResponse.json({ error: userRewardsError.message }, { status: 500 });
    }

    // Fetch recent point activities
    const { data: activities, error: activitiesError } = await supabase
      .from('point_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (activitiesError) {
      return NextResponse.json({ error: activitiesError.message }, { status: 500 });
    }

    const response = {
      user_id: userId,
      points: userPoints?.available_points || 0,
      tier: userPoints?.tier || 'bronze',
      lifetime_points: userPoints?.lifetime_points || 0,
      rewards: rewards?.map(r => ({
        id: r.id,
        name: r.name,
        description: r.description,
        points_required: r.points_required,
        reward_type: r.reward_type,
        available: (userPoints?.available_points || 0) >= (r.points_required || 0),
      })) || [],
      user_rewards: userRewards || [],
      activities: activities?.map(a => ({
        id: a.id,
        action: a.description,
        points: a.points,
        date: a.created_at,
        transaction_type: a.transaction_type,
      })) || [],
    };

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch rewards' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, reward_id, action, points, description } = body;

    if (!user_id) {
      return NextResponse.json({ error: 'user_id required' }, { status: 400 });
    }

    if (action === 'redeem') {
      if (!reward_id) {
        return NextResponse.json({ error: 'reward_id required for redemption' }, { status: 400 });
      }

      // Get reward details
      const { data: reward, error: rewardError } = await supabase
        .from('rewards')
        .select('*')
        .eq('id', reward_id)
        .single();

      if (rewardError || !reward) {
        return NextResponse.json({ error: 'Reward not found' }, { status: 404 });
      }

      // Get user points
      const { data: userPoints, error: pointsError } = await supabase
        .from('user_points')
        .select('*')
        .eq('user_id', user_id)
        .single();

      if (pointsError || !userPoints) {
        return NextResponse.json({ error: 'User points not found' }, { status: 404 });
      }

      if ((userPoints.available_points || 0) < (reward.points_required || 0)) {
        return NextResponse.json({ error: 'Insufficient points' }, { status: 400 });
      }

      // Deduct points
      const { error: updateError } = await supabase
        .from('user_points')
        .update({
          available_points: (userPoints.available_points || 0) - (reward.points_required || 0),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user_id);

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }

      // Record redemption
      const { data: redemption, error: redemptionError } = await supabase
        .from('user_rewards')
        .insert({
          user_id,
          reward_id,
          status: 'redeemed',
          redeemed_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (redemptionError) {
        return NextResponse.json({ error: redemptionError.message }, { status: 500 });
      }

      // Record transaction
      await supabase.from('point_transactions').insert({
        user_id,
        points: -(reward.points_required || 0),
        transaction_type: 'redemption',
        description: `Redeemed: ${reward.name}`,
        reference_type: 'reward',
        reference_id: reward_id,
      });

      return NextResponse.json({
        success: true,
        message: 'Reward redeemed successfully',
        redemption,
        remaining_points: (userPoints.available_points || 0) - (reward.points_required || 0),
      });
    } else if (action === 'earn') {
      // Earn points
      const earnPoints = points || 0;
      const earnDescription = description || 'Points earned';

      // Get or create user points record
      const { data: existingPoints } = await supabase
        .from('user_points')
        .select('*')
        .eq('user_id', user_id)
        .single();

      if (existingPoints) {
        const { error: updateError } = await supabase
          .from('user_points')
          .update({
            available_points: (existingPoints.available_points || 0) + earnPoints,
            total_points: (existingPoints.total_points || 0) + earnPoints,
            lifetime_points: (existingPoints.lifetime_points || 0) + earnPoints,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user_id);

        if (updateError) {
          return NextResponse.json({ error: updateError.message }, { status: 500 });
        }
      } else {
        const { error: insertError } = await supabase
          .from('user_points')
          .insert({
            user_id,
            available_points: earnPoints,
            total_points: earnPoints,
            lifetime_points: earnPoints,
            tier: 'bronze',
          });

        if (insertError) {
          return NextResponse.json({ error: insertError.message }, { status: 500 });
        }
      }

      // Record transaction
      await supabase.from('point_transactions').insert({
        user_id,
        points: earnPoints,
        transaction_type: 'earn',
        description: earnDescription,
      });

      return NextResponse.json({
        success: true,
        message: 'Points earned successfully',
        points_earned: earnPoints,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process reward action' }, { status: 500 });
  }
}
