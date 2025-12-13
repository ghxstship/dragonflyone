export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const SettingsSchema = z.object({
  user_id: z.string().uuid(),
  theme: z.enum(['light', 'dark', 'system']).optional(),
  language: z.string().optional(),
  currency: z.string().optional(),
  timezone: z.string().optional(),
  date_format: z.string().optional(),
  time_format: z.enum(['12h', '24h']).optional(),
  email_notifications: z.record(z.boolean()).optional(),
  push_notifications: z.record(z.boolean()).optional(),
  sms_notifications: z.record(z.boolean()).optional(),
  accessibility: z.record(z.boolean()).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json({ error: 'user_id required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No settings found, return defaults
        return NextResponse.json({
          settings: {
            user_id: userId,
            theme: 'system',
            language: 'en',
            currency: 'USD',
            timezone: 'America/New_York',
            date_format: 'MM/DD/YYYY',
            time_format: '12h',
            email_notifications: {
              marketing: true,
              order_updates: true,
              event_reminders: true,
              price_alerts: true,
              newsletter: true,
            },
            push_notifications: {
              enabled: true,
              order_updates: true,
              event_reminders: true,
              price_alerts: true,
              messages: true,
            },
            sms_notifications: {
              enabled: false,
              order_updates: false,
              event_reminders: false,
            },
            accessibility: {
              reduce_motion: false,
              high_contrast: false,
              screen_reader_optimized: false,
            },
          },
        });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ settings: data });
  } catch (error: unknown) {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = SettingsSchema.parse(body);

    const { data, error } = await supabase
      .from('user_settings')
      .upsert(validatedData, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ settings: data }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 422 });
    }
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, ...updates } = body;

    if (!user_id) {
      return NextResponse.json({ error: 'user_id required' }, { status: 400 });
    }

    const updateData = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('user_settings')
      .update(updateData)
      .eq('user_id', user_id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Settings don't exist, create them
        const { data: newData, error: insertError } = await supabase
          .from('user_settings')
          .insert({ user_id, ...updates })
          .select()
          .single();

        if (insertError) {
          return NextResponse.json({ error: insertError.message }, { status: 500 });
        }
        return NextResponse.json({ settings: newData });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ settings: data });
  } catch (error: unknown) {
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
