import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}


// Lazy getter for supabase client - only accessed at runtime
const supabase = new Proxy({} as ReturnType<typeof getSupabaseClient>, {
  get(_target, prop) {
    return (getSupabaseClient() as any)[prop];
  }
});

const platformSpecs = {
  instagram: {
    post: { maxLength: 2200, imageRatio: '1:1', videoMaxLength: 60 },
    story: { maxLength: 2200, imageRatio: '9:16', videoMaxLength: 15 },
    reel: { maxLength: 2200, imageRatio: '9:16', videoMaxLength: 90 },
  },
  twitter: {
    post: { maxLength: 280, imageRatio: '16:9', videoMaxLength: 140 },
  },
  facebook: {
    post: { maxLength: 63206, imageRatio: '1.91:1', videoMaxLength: 240 },
    story: { maxLength: 63206, imageRatio: '9:16', videoMaxLength: 20 },
  },
  tiktok: {
    video: { maxLength: 2200, imageRatio: '9:16', videoMaxLength: 180 },
  },
  linkedin: {
    post: { maxLength: 3000, imageRatio: '1.91:1', videoMaxLength: 600 },
  },
};

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (type === 'specs') {
      return NextResponse.json({ platform_specs: platformSpecs });
    }

    if (type === 'best_times') {
      const bestTimes = {
        instagram: { weekday: ['11:00', '14:00', '19:00'], weekend: ['10:00', '14:00'] },
        twitter: { weekday: ['08:00', '12:00', '17:00'], weekend: ['09:00', '12:00'] },
        facebook: { weekday: ['09:00', '13:00', '16:00'], weekend: ['12:00', '13:00'] },
        tiktok: { weekday: ['07:00', '12:00', '19:00'], weekend: ['09:00', '12:00', '19:00'] },
        linkedin: { weekday: ['07:30', '12:00', '17:00'], weekend: [] },
      };
      return NextResponse.json({ best_posting_times: bestTimes });
    }

    return NextResponse.json({ platform_specs: platformSpecs });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const { content, target_platforms } = body;

    const optimizations: Record<string, any> = {};

    for (const platform of target_platforms) {
      const specs = platformSpecs[platform as keyof typeof platformSpecs];
      if (!specs) continue;

      const postSpec = (specs as any).post || Object.values(specs)[0];
      const optimized: any = {
        platform,
        original_length: content.length,
        max_length: postSpec.maxLength,
        needs_truncation: content.length > postSpec.maxLength,
        recommended_ratio: postSpec.imageRatio,
      };

      if (content.length > postSpec.maxLength) {
        optimized.truncated_content = content.substring(0, postSpec.maxLength - 3) + '...';
        optimized.characters_over = content.length - postSpec.maxLength;
      } else {
        optimized.optimized_content = content;
      }

      // Extract hashtags
      const hashtags = content.match(/#\w+/g) || [];
      optimized.hashtag_count = hashtags.length;

      // Platform-specific recommendations
      if (platform === 'instagram') {
        optimized.recommendations = [
          hashtags.length < 5 ? 'Add more hashtags (5-30 recommended)' : null,
          'Include a call-to-action',
          'Use line breaks for readability',
        ].filter(Boolean);
      } else if (platform === 'twitter') {
        optimized.recommendations = [
          hashtags.length > 2 ? 'Reduce hashtags (1-2 recommended)' : null,
          content.length > 250 ? 'Consider shortening for better engagement' : null,
        ].filter(Boolean);
      } else if (platform === 'linkedin') {
        optimized.recommendations = [
          'Start with a hook',
          'Use professional tone',
          hashtags.length > 5 ? 'Reduce hashtags (3-5 recommended)' : null,
        ].filter(Boolean);
      }

      optimizations[platform] = optimized;
    }

    return NextResponse.json({ optimizations });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
