import { NextRequest, NextResponse } from 'next/server';
import { handleDealToProjectHandoff } from '@ghxstship/config/supabase-integration';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { dealId, orgSlug, autoCreateProject = true } = body;

    if (!dealId || !orgSlug) {
      return NextResponse.json(
        { error: 'Missing required fields: dealId, orgSlug' },
        { status: 400 }
      );
    }

    const result = await handleDealToProjectHandoff({
      dealId,
      orgSlug,
      autoCreateProject,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Deal to project handoff API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
