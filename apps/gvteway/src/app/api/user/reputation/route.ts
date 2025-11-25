import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const KARMA_LEVELS = [
  { level: 1, name: 'Newcomer', min: 0 },
  { level: 2, name: 'Regular', min: 100 },
  { level: 3, name: 'Contributor', min: 500 },
  { level: 4, name: 'Trusted', min: 1500 },
  { level: 5, name: 'Expert', min: 5000 },
  { level: 6, name: 'Master', min: 15000 },
  { level: 7, name: 'Legend', min: 50000 },
];

const ACHIEVEMENTS = [
  { id: 'first_review', name: 'First Review', description: 'Write your first review', icon: '✍️', karma_reward: 10, type: 'reviews', total: 1 },
  { id: 'review_10', name: 'Reviewer', description: 'Write 10 reviews', icon: '📝', karma_reward: 50, type: 'reviews', total: 10 },
  { id: 'review_50', name: 'Critic', description: 'Write 50 reviews', icon: '🎭', karma_reward: 200, type: 'reviews', total: 50 },
  { id: 'helpful_10', name: 'Helpful', description: 'Receive 10 helpful votes', icon: '👍', karma_reward: 25, type: 'helpful', total: 10 },
  { id: 'helpful_100', name: 'Very Helpful', description: 'Receive 100 helpful votes', icon: '🌟', karma_reward: 100, type: 'helpful', total: 100 },
  { id: 'events_5', name: 'Event Goer', description: 'Attend 5 events', icon: '🎫', karma_reward: 25, type: 'events', total: 5 },
  { id: 'events_25', name: 'Regular', description: 'Attend 25 events', icon: '🎪', karma_reward: 100, type: 'events', total: 25 },
  { id: 'events_100', name: 'Superfan', description: 'Attend 100 events', icon: '👑', karma_reward: 500, type: 'events', total: 100 },
  { id: 'streak_7', name: 'Week Streak', description: 'Log in 7 days in a row', icon: '🔥', karma_reward: 15, type: 'streak', total: 7 },
  { id: 'streak_30', name: 'Month Streak', description: 'Log in 30 days in a row', icon: '💪', karma_reward: 50, type: 'streak', total: 30 },
];

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

    // Get user's karma
    const { data: karmaData } = await supabase
      .from('user_karma')
      .select('total_karma')
      .eq('user_id', user.id)
      .single();

    const totalKarma = karmaData?.total_karma || 0;

    // Get current level
    let currentLevel = KARMA_LEVELS[0];
    let nextLevel = KARMA_LEVELS[1];
    for (let i = KARMA_LEVELS.length - 1; i >= 0; i--) {
      if (totalKarma >= KARMA_LEVELS[i].min) {
        currentLevel = KARMA_LEVELS[i];
        nextLevel = KARMA_LEVELS[i + 1] || null;
        break;
      }
    }

    // Get rank percentile
    const { count: totalUsers } = await supabase
      .from('user_karma')
      .select('*', { count: 'exact', head: true });

    const { count: usersBelow } = await supabase
      .from('user_karma')
      .select('*', { count: 'exact', head: true })
      .lt('total_karma', totalKarma);

    const rankPercentile = totalUsers ? Math.round((1 - (usersBelow || 0) / totalUsers) * 100) : 50;

    // Get helpful votes
    const { count: helpfulVotes } = await supabase
      .from('review_votes')
      .select('*', { count: 'exact', head: true })
      .eq('review_user_id', user.id)
      .eq('vote_type', 'helpful');

    // Get contribution counts
    const { count: reviewsCount } = await supabase
      .from('reviews')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    const { count: answersCount } = await supabase
      .from('community_answers')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    const { count: eventsAttended } = await supabase
      .from('tickets')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'used');

    // Get karma transactions
    const { data: transactions } = await supabase
      .from('karma_transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    // Get earned achievements
    const { data: earnedAchievements } = await supabase
      .from('user_achievements')
      .select('achievement_id, earned_at')
      .eq('user_id', user.id);

    const earnedIds = new Set(earnedAchievements?.map(a => a.achievement_id) || []);

    // Map achievements with progress
    const achievements = ACHIEVEMENTS.map(achievement => {
      let progress = 0;
      switch (achievement.type) {
        case 'reviews':
          progress = reviewsCount || 0;
          break;
        case 'helpful':
          progress = helpfulVotes || 0;
          break;
        case 'events':
          progress = eventsAttended || 0;
          break;
      }

      const earned = earnedAchievements?.find(a => a.achievement_id === achievement.id);

      return {
        ...achievement,
        progress: Math.min(progress, achievement.total),
        earned_at: earned?.earned_at || null,
      };
    });

    return NextResponse.json({
      stats: {
        total_karma: totalKarma,
        level: currentLevel.level,
        level_name: currentLevel.name,
        next_level_karma: nextLevel?.min || null,
        rank_percentile: rankPercentile,
        helpful_votes: helpfulVotes || 0,
        reviews_count: reviewsCount || 0,
        answers_count: answersCount || 0,
        events_attended: eventsAttended || 0,
      },
      transactions: transactions?.map(tx => ({
        id: tx.id,
        amount: tx.amount,
        type: tx.type,
        description: tx.description,
        created_at: tx.created_at,
      })) || [],
      achievements,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
