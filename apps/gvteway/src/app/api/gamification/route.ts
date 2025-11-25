import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Badge definitions
const BADGES = {
  first_event: { name: 'First Timer', description: 'Attended your first event', icon: '🎉', points: 50 },
  five_events: { name: 'Regular', description: 'Attended 5 events', icon: '⭐', points: 100 },
  twenty_events: { name: 'Superfan', description: 'Attended 20 events', icon: '🏆', points: 500 },
  streak_3: { name: 'On a Roll', description: '3 events in a row', icon: '🔥', points: 75 },
  streak_10: { name: 'Unstoppable', description: '10 event streak', icon: '💎', points: 300 },
  early_bird: { name: 'Early Bird', description: 'First 100 tickets purchased', icon: '🐦', points: 25 },
  reviewer: { name: 'Critic', description: 'Left 5 reviews', icon: '📝', points: 50 },
  social_butterfly: { name: 'Social Butterfly', description: 'Referred 3 friends', icon: '🦋', points: 100 },
  vip_member: { name: 'VIP', description: 'Became a VIP member', icon: '👑', points: 200 },
  genre_explorer: { name: 'Explorer', description: 'Attended 5 different genres', icon: '🧭', points: 150 },
};

// GET - Fetch user's gamification stats
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user's badges
    const { data: userBadges } = await supabase
      .from('user_badges')
      .select('*')
      .eq('user_id', user.id);

    // Fetch user's stats
    const { data: stats } = await supabase
      .from('user_gamification_stats')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Fetch leaderboard position
    const { data: leaderboard } = await supabase
      .from('user_gamification_stats')
      .select('user_id, total_points')
      .order('total_points', { ascending: false })
      .limit(100);

    const position = leaderboard?.findIndex(l => l.user_id === user.id) ?? -1;

    // Calculate level
    const totalPoints = stats?.total_points || 0;
    const level = calculateLevel(totalPoints);

    // Get available badges (not yet earned)
    const earnedBadgeIds = new Set(userBadges?.map(b => b.badge_id) || []);
    const availableBadges = Object.entries(BADGES)
      .filter(([id]) => !earnedBadgeIds.has(id))
      .map(([id, badge]) => ({ id, ...badge }));

    return NextResponse.json({
      stats: {
        total_points: totalPoints,
        level: level.level,
        level_name: level.name,
        points_to_next_level: level.pointsToNext,
        current_streak: stats?.current_streak || 0,
        longest_streak: stats?.longest_streak || 0,
        events_attended: stats?.events_attended || 0,
        reviews_written: stats?.reviews_written || 0,
        referrals_made: stats?.referrals_made || 0,
      },
      badges: userBadges?.map(ub => ({
        ...BADGES[ub.badge_id as keyof typeof BADGES],
        id: ub.badge_id,
        earned_at: ub.earned_at,
      })) || [],
      available_badges: availableBadges,
      leaderboard_position: position + 1,
      leaderboard: leaderboard?.slice(0, 10).map((l, i) => ({
        position: i + 1,
        user_id: l.user_id,
        points: l.total_points,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch gamification data' },
      { status: 500 }
    );
  }
}

// POST - Record activity and award points/badges
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { activity_type, metadata } = body;

    // Calculate points for activity
    const pointsMap: Record<string, number> = {
      event_checkin: 10,
      review_submitted: 15,
      referral_completed: 50,
      social_share: 5,
      profile_completed: 25,
      first_purchase: 20,
    };

    const points = pointsMap[activity_type] || 0;

    // Record activity
    await supabase.from('gamification_activities').insert({
      user_id: user.id,
      activity_type,
      points_earned: points,
      metadata,
    });

    // Update user stats
    const { data: currentStats } = await supabase
      .from('user_gamification_stats')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (currentStats) {
      await supabase
        .from('user_gamification_stats')
        .update({
          total_points: currentStats.total_points + points,
          [getStatField(activity_type)]: (currentStats[getStatField(activity_type)] || 0) + 1,
        })
        .eq('user_id', user.id);
    } else {
      await supabase.from('user_gamification_stats').insert({
        user_id: user.id,
        total_points: points,
        [getStatField(activity_type)]: 1,
      });
    }

    // Check for new badges
    const newBadges = await checkAndAwardBadges(user.id);

    return NextResponse.json({
      points_earned: points,
      new_badges: newBadges,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to record activity' },
      { status: 500 }
    );
  }
}

function calculateLevel(points: number): { level: number; name: string; pointsToNext: number } {
  const levels = [
    { threshold: 0, name: 'Newcomer' },
    { threshold: 100, name: 'Fan' },
    { threshold: 300, name: 'Enthusiast' },
    { threshold: 600, name: 'Devotee' },
    { threshold: 1000, name: 'Superfan' },
    { threshold: 2000, name: 'Legend' },
    { threshold: 5000, name: 'Icon' },
  ];

  let currentLevel = 0;
  for (let i = levels.length - 1; i >= 0; i--) {
    if (points >= levels[i].threshold) {
      currentLevel = i;
      break;
    }
  }

  const nextLevel = levels[currentLevel + 1];
  const pointsToNext = nextLevel ? nextLevel.threshold - points : 0;

  return {
    level: currentLevel + 1,
    name: levels[currentLevel].name,
    pointsToNext,
  };
}

function getStatField(activityType: string): string {
  const mapping: Record<string, string> = {
    event_checkin: 'events_attended',
    review_submitted: 'reviews_written',
    referral_completed: 'referrals_made',
  };
  return mapping[activityType] || 'total_activities';
}

async function checkAndAwardBadges(userId: string): Promise<string[]> {
  const newBadges: string[] = [];

  // Fetch current stats
  const { data: stats } = await supabase
    .from('user_gamification_stats')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (!stats) return newBadges;

  // Fetch existing badges
  const { data: existingBadges } = await supabase
    .from('user_badges')
    .select('badge_id')
    .eq('user_id', userId);

  const earnedBadgeIds = new Set(existingBadges?.map(b => b.badge_id) || []);

  // Check badge conditions
  const badgeConditions: Record<string, boolean> = {
    first_event: stats.events_attended >= 1,
    five_events: stats.events_attended >= 5,
    twenty_events: stats.events_attended >= 20,
    streak_3: stats.current_streak >= 3,
    streak_10: stats.current_streak >= 10,
    reviewer: stats.reviews_written >= 5,
    social_butterfly: stats.referrals_made >= 3,
  };

  for (const [badgeId, condition] of Object.entries(badgeConditions)) {
    if (condition && !earnedBadgeIds.has(badgeId)) {
      await supabase.from('user_badges').insert({
        user_id: userId,
        badge_id: badgeId,
        earned_at: new Date().toISOString(),
      });

      // Award badge points
      const badge = BADGES[badgeId as keyof typeof BADGES];
      if (badge) {
        await supabase
          .from('user_gamification_stats')
          .update({ total_points: stats.total_points + badge.points })
          .eq('user_id', userId);
      }

      newBadges.push(badgeId);
    }
  }

  return newBadges;
}
