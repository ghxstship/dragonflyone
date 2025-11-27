import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@ghxstship/config';
import { z } from 'zod';

const VideoSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  category_id: z.string().uuid(),
  video_url: z.string(),
  thumbnail_url: z.string().optional(),
  duration_seconds: z.number().optional(),
  difficulty_level: z.enum(['beginner', 'intermediate', 'advanced']).default('beginner'),
  tags: z.array(z.string()).optional(),
  transcript: z.string().optional(),
  is_required: z.boolean().default(false),
  roles: z.array(z.string()).optional(),
  departments: z.array(z.string()).optional(),
});

// GET /api/training-videos - Get training videos
export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get('video_id');
    const categoryId = searchParams.get('category_id');
    const action = searchParams.get('action');

    if (action === 'categories') {
      const { data: categories } = await supabase
        .from('training_categories')
        .select(`
          *,
          videos:training_videos(count)
        `)
        .order('sort_order');

      return NextResponse.json({ categories: categories || [] });
    }

    if (action === 'my_progress') {
      // Get user's training progress
      const { data: progress } = await supabase
        .from('training_progress')
        .select(`
          *,
          video:training_videos(id, title, duration_seconds, is_required)
        `)
        .eq('user_id', user.id);

      const { data: requiredVideos } = await supabase
        .from('training_videos')
        .select('id')
        .eq('is_required', true)
        .eq('status', 'published');

      const completedRequired = progress?.filter(p => 
        p.completed && requiredVideos?.some(v => v.id === p.video_id)
      ).length || 0;

      return NextResponse.json({
        progress: progress || [],
        summary: {
          total_watched: progress?.length || 0,
          completed: progress?.filter(p => p.completed).length || 0,
          required_total: requiredVideos?.length || 0,
          required_completed: completedRequired,
          completion_rate: requiredVideos?.length 
            ? (completedRequired / requiredVideos.length * 100).toFixed(1) 
            : 100,
        },
      });
    }

    if (action === 'required') {
      // Get required training for user
      const { data: userProfile } = await supabase
        .from('platform_users')
        .select('department, role')
        .eq('id', user.id)
        .single();

      let query = supabase
        .from('training_videos')
        .select('*')
        .eq('is_required', true)
        .eq('status', 'published');

      if (userProfile?.role) {
        query = query.or(`roles.cs.{${userProfile.role}},roles.is.null`);
      }
      if (userProfile?.department) {
        query = query.or(`departments.cs.{${userProfile.department}},departments.is.null`);
      }

      const { data: required } = await query;

      // Get completion status
      const { data: progress } = await supabase
        .from('training_progress')
        .select('video_id, completed')
        .eq('user_id', user.id);

      const videosWithStatus = required?.map(video => ({
        ...video,
        completed: progress?.some(p => p.video_id === video.id && p.completed) || false,
      }));

      return NextResponse.json({ required: videosWithStatus || [] });
    }

    if (action === 'search') {
      const query = searchParams.get('q');
      if (!query) {
        return NextResponse.json({ error: 'Search query required' }, { status: 400 });
      }

      const { data: results } = await supabase
        .from('training_videos')
        .select(`
          id, title, description, thumbnail_url, duration_seconds,
          category:training_categories(name)
        `)
        .eq('status', 'published')
        .or(`title.ilike.%${query}%,description.ilike.%${query}%,tags.cs.{${query}}`)
        .limit(20);

      return NextResponse.json({ results: results || [] });
    }

    if (videoId) {
      const { data: video } = await supabase
        .from('training_videos')
        .select(`
          *,
          category:training_categories(id, name),
          quiz:training_quizzes(*)
        `)
        .eq('id', videoId)
        .single();

      if (!video) {
        return NextResponse.json({ error: 'Video not found' }, { status: 404 });
      }

      // Get user's progress
      const { data: progress } = await supabase
        .from('training_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('video_id', videoId)
        .single();

      // Increment view count
      await supabase
        .from('training_videos')
        .update({ view_count: (video.view_count || 0) + 1 })
        .eq('id', videoId);

      return NextResponse.json({
        video,
        progress: progress || { watched_seconds: 0, completed: false },
      });
    }

    if (categoryId) {
      const { data: videos } = await supabase
        .from('training_videos')
        .select('*')
        .eq('category_id', categoryId)
        .eq('status', 'published')
        .order('sort_order');

      return NextResponse.json({ videos: videos || [] });
    }

    // Default: Get all published videos
    const { data: videos } = await supabase
      .from('training_videos')
      .select(`
        id, title, description, thumbnail_url, duration_seconds, difficulty_level, is_required,
        category:training_categories(id, name)
      `)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(50);

    return NextResponse.json({ videos: videos || [] });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch training videos' }, { status: 500 });
  }
}

// POST /api/training-videos - Create video or track progress
export async function POST(request: NextRequest) {
  const supabase = getServerSupabase();
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
    const action = body.action || 'create';

    if (action === 'create') {
      const validated = VideoSchema.parse(body);

      const { data: video, error } = await supabase
        .from('training_videos')
        .insert({
          ...validated,
          status: 'draft',
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ video }, { status: 201 });
    } else if (action === 'update_progress') {
      const { video_id, watched_seconds, completed } = body;

      const { data: progress, error } = await supabase
        .from('training_progress')
        .upsert({
          user_id: user.id,
          video_id,
          watched_seconds,
          completed: completed || false,
          last_watched_at: new Date().toISOString(),
          completed_at: completed ? new Date().toISOString() : null,
        }, { onConflict: 'user_id,video_id' })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ progress });
    } else if (action === 'complete_video') {
      const { video_id } = body;

      // Mark as completed
      const { data: progress, error } = await supabase
        .from('training_progress')
        .upsert({
          user_id: user.id,
          video_id,
          completed: true,
          completed_at: new Date().toISOString(),
          last_watched_at: new Date().toISOString(),
        }, { onConflict: 'user_id,video_id' })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Check if video has a quiz
      const { data: quiz } = await supabase
        .from('training_quizzes')
        .select('id')
        .eq('video_id', video_id)
        .single();

      return NextResponse.json({
        progress,
        has_quiz: !!quiz,
        quiz_id: quiz?.id,
      });
    } else if (action === 'submit_quiz') {
      const { quiz_id, answers } = body;

      // Get quiz questions
      const { data: questions } = await supabase
        .from('training_quiz_questions')
        .select('id, correct_answer')
        .eq('quiz_id', quiz_id);

      if (!questions) {
        return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
      }

      // Calculate score
      let correct = 0;
      questions.forEach(q => {
        if (answers[q.id] === q.correct_answer) {
          correct++;
        }
      });

      const score = (correct / questions.length) * 100;
      const passed = score >= 70;

      // Save result
      const { data: result, error } = await supabase
        .from('training_quiz_results')
        .insert({
          quiz_id,
          user_id: user.id,
          score,
          passed,
          answers,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        result,
        score,
        passed,
        correct_count: correct,
        total_questions: questions.length,
      });
    } else if (action === 'create_category') {
      const { name, description, icon } = body;

      const { data: category, error } = await supabase
        .from('training_categories')
        .insert({
          name,
          description,
          icon,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ category }, { status: 201 });
    } else if (action === 'publish') {
      const { video_id } = body;

      const { data: video, error } = await supabase
        .from('training_videos')
        .update({
          status: 'published',
          published_at: new Date().toISOString(),
        })
        .eq('id', video_id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ video });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

// PATCH /api/training-videos - Update video
export async function PATCH(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get('video_id');

    if (!videoId) {
      return NextResponse.json({ error: 'Video ID required' }, { status: 400 });
    }

    const body = await request.json();

    const { data: video, error } = await supabase
      .from('training_videos')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', videoId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ video });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update video' }, { status: 500 });
  }
}

// DELETE /api/training-videos - Archive video
export async function DELETE(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get('video_id');

    if (!videoId) {
      return NextResponse.json({ error: 'Video ID required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('training_videos')
      .update({
        status: 'archived',
        archived_at: new Date().toISOString(),
      })
      .eq('id', videoId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to archive video' }, { status: 500 });
  }
}
