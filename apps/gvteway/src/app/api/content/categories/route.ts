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

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    // Get content counts by type
    const { data, error } = await supabase
      .from('exclusive_content')
      .select('type')
      .lte('release_date', new Date().toISOString());

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Count by type
    const counts: Record<string, number> = {};
    data?.forEach(item => {
      counts[item.type] = (counts[item.type] || 0) + 1;
    });

    const categories = [
      { id: 'video', name: 'Videos', icon: '🎬', count: counts['video'] || 0 },
      { id: 'audio', name: 'Audio', icon: '🎵', count: counts['audio'] || 0 },
      { id: 'photo_gallery', name: 'Photo Galleries', icon: '📸', count: counts['photo_gallery'] || 0 },
      { id: 'behind_the_scenes', name: 'Behind the Scenes', icon: '🎭', count: counts['behind_the_scenes'] || 0 },
      { id: 'document', name: 'Documents', icon: '📄', count: counts['document'] || 0 },
    ].filter(c => c.count > 0);

    return NextResponse.json({ categories });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
