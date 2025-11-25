import { NextRequest, NextResponse } from 'next/server';
import { syncProjectToEvent } from '@ghxstship/config/supabase-integration';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, orgSlug, eventData } = body;

    if (!projectId || !orgSlug) {
      return NextResponse.json(
        { error: 'Missing required fields: projectId, orgSlug' },
        { status: 400 }
      );
    }

    const result = await syncProjectToEvent({
      projectId,
      orgSlug,
      eventData: eventData || {},
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Project to event sync API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
