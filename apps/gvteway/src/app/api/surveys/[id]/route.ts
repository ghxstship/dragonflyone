import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('surveys')
      .select(`
        *,
        events (
          id,
          title,
          date,
          image
        ),
        survey_questions (
          id,
          type,
          question,
          required,
          options,
          min_label,
          max_label,
          order_index
        )
      `)
      .eq('id', params.id)
      .eq('is_active', true)
      .single();

    if (error) {
      return NextResponse.json({ error: 'Survey not found' }, { status: 404 });
    }

    // Check if survey has expired
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Survey has expired' }, { status: 410 });
    }

    const survey = {
      id: data.id,
      event_id: data.event_id,
      event_title: (data.events as any)?.title,
      event_date: (data.events as any)?.date,
      event_image: (data.events as any)?.image,
      title: data.title,
      description: data.description,
      questions: ((data.survey_questions as any[]) || [])
        .sort((a, b) => a.order_index - b.order_index)
        .map(q => ({
          id: q.id,
          type: q.type,
          question: q.question,
          required: q.required,
          options: q.options,
          min_label: q.min_label,
          max_label: q.max_label,
        })),
      expires_at: data.expires_at,
    };

    return NextResponse.json({ survey });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
