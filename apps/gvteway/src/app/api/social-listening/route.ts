import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Social listening and sentiment monitoring
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');
    const hashtag = searchParams.get('hashtag');
    const period = searchParams.get('period') || '7d';

    let query = supabase.from('social_mentions').select('*');

    if (eventId) query = query.eq('event_id', eventId);
    if (hashtag) query = query.contains('hashtags', [hashtag]);

    const { data, error } = await query.order('posted_at', { ascending: false }).limit(500);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Analyze sentiment
    const sentimentAnalysis = analyzeSentiment(data || []);
    const topHashtags = getTopHashtags(data || []);
    const engagementMetrics = calculateEngagement(data || []);

    return NextResponse.json({
      mentions: data?.slice(0, 100),
      total_mentions: data?.length || 0,
      sentiment: sentimentAnalysis,
      top_hashtags: topHashtags,
      engagement: engagementMetrics,
      trending_topics: getTrendingTopics(data || [])
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch social data' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { action, event_id, keywords, hashtags } = body;

    if (action === 'create_monitor') {
      const { data, error } = await supabase.from('social_monitors').insert({
        event_id, keywords: keywords || [], hashtags: hashtags || [],
        status: 'active', created_at: new Date().toISOString()
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ monitor: data }, { status: 201 });
    }

    if (action === 'generate_report') {
      const { data: mentions } = await supabase.from('social_mentions').select('*').eq('event_id', event_id);

      const report = {
        event_id,
        generated_at: new Date().toISOString(),
        total_mentions: mentions?.length || 0,
        sentiment: analyzeSentiment(mentions || []),
        top_hashtags: getTopHashtags(mentions || []),
        engagement: calculateEngagement(mentions || []),
        recommendations: generateRecommendations(mentions || [])
      };

      return NextResponse.json({ report });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}

function analyzeSentiment(mentions: any[]): any {
  let positive = 0, negative = 0, neutral = 0;

  mentions.forEach(m => {
    if (m.sentiment_score > 0.3) positive++;
    else if (m.sentiment_score < -0.3) negative++;
    else neutral++;
  });

  const total = mentions.length || 1;
  return {
    positive: Math.round((positive / total) * 100),
    negative: Math.round((negative / total) * 100),
    neutral: Math.round((neutral / total) * 100),
    overall: positive > negative ? 'positive' : negative > positive ? 'negative' : 'neutral'
  };
}

function getTopHashtags(mentions: any[]): any[] {
  const counts: Record<string, number> = {};
  mentions.forEach(m => {
    (m.hashtags || []).forEach((h: string) => {
      counts[h] = (counts[h] || 0) + 1;
    });
  });

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([tag, count]) => ({ tag, count }));
}

function calculateEngagement(mentions: any[]): any {
  const totalLikes = mentions.reduce((s, m) => s + (m.likes || 0), 0);
  const totalShares = mentions.reduce((s, m) => s + (m.shares || 0), 0);
  const totalComments = mentions.reduce((s, m) => s + (m.comments || 0), 0);

  return { likes: totalLikes, shares: totalShares, comments: totalComments, total: totalLikes + totalShares + totalComments };
}

function getTrendingTopics(mentions: any[]): string[] {
  const topics: Record<string, number> = {};
  mentions.forEach(m => {
    (m.topics || []).forEach((t: string) => {
      topics[t] = (topics[t] || 0) + 1;
    });
  });

  return Object.entries(topics).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([t]) => t);
}

function generateRecommendations(mentions: any[]): string[] {
  const recommendations: string[] = [];
  const sentiment = analyzeSentiment(mentions);

  if (sentiment.negative > 30) {
    recommendations.push('High negative sentiment detected - consider addressing common complaints');
  }
  if (mentions.length < 50) {
    recommendations.push('Low social engagement - consider increasing promotional activities');
  }

  return recommendations;
}
