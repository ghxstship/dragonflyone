import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const refreshSchema = z.object({
  refresh_token: z.string(),
});

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const body = await request.json();
    const { refresh_token } = refreshSchema.parse(body);

    const { data, error } = await supabase.auth.refreshSession({
      refresh_token,
    });

    if (error) {
      return NextResponse.json(
        { error: 'Session refresh failed' },
        { status: 401 }
      );
    }

    if (!data.session) {
      return NextResponse.json(
        { error: 'No session returned' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Refresh error:', error);
    return NextResponse.json(
      { error: 'Session refresh failed' },
      { status: 500 }
    );
  }
}
