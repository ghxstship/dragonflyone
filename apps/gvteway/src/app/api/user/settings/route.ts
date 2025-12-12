export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@ghxstship/config/supabase-types';

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json({ error: 'user_id required' }, { status: 400 });
    }

    // Fetch user preferences
    const { data: preferences, error: prefError } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (prefError && prefError.code !== 'PGRST116') {
      return NextResponse.json({ error: prefError.message }, { status: 500 });
    }

    // Fetch notification preferences
    const { data: notifications, error: notifError } = await supabase
      .from('user_notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (notifError && notifError.code !== 'PGRST116') {
      return NextResponse.json({ error: notifError.message }, { status: 500 });
    }

    return NextResponse.json({
      preferences: preferences || {
        theme: 'system',
        language: 'en',
        timezone: 'America/New_York',
        date_format: 'MM/DD/YYYY',
        time_format: '12h',
        currency: 'USD',
      },
      notifications: notifications || {
        email_enabled: true,
        push_enabled: true,
        sms_enabled: false,
        preferences: {},
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, preferences, notifications } = body;

    if (!user_id) {
      return NextResponse.json({ error: 'user_id required' }, { status: 400 });
    }

    // Update user preferences
    if (preferences) {
      const { error: prefError } = await supabase
        .from('user_preferences')
        .upsert({
          user_id,
          ...preferences,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      if (prefError) {
        return NextResponse.json({ error: prefError.message }, { status: 500 });
      }
    }

    // Update notification preferences
    if (notifications) {
      const { error: notifError } = await supabase
        .from('user_notification_preferences')
        .upsert({
          user_id,
          ...notifications,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      if (notifError) {
        return NextResponse.json({ error: notifError.message }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
