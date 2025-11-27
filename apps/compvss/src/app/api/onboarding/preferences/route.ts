import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const preferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).default('system'),
  language: z.string().default('en'),
  timezone: z.string().default('America/New_York'),
  emailNotifications: z.boolean().default(true),
  pushNotifications: z.boolean().default(true),
  marketingEmails: z.boolean().default(false),
});

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = preferencesSchema.parse(body);

    const { error: settingsError } = await supabase
      .from('user_settings')
      .upsert({
        user_id: user.id,
        theme: validated.theme,
        language: validated.language,
        timezone: validated.timezone,
        email_notifications: {
          marketing: validated.marketingEmails,
          order_updates: validated.emailNotifications,
          event_reminders: validated.emailNotifications,
        },
        push_notifications: {
          enabled: validated.pushNotifications,
          order_updates: validated.pushNotifications,
          event_reminders: validated.pushNotifications,
        },
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      });

    if (settingsError) {
      console.error('Settings update error:', settingsError);
      return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 });
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        preferences: {
          theme: validated.theme,
          language: validated.language,
          timezone: validated.timezone,
        },
        onboarding_step: 4,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (profileError) {
      console.error('Profile update error:', profileError);
    }

    return NextResponse.json({ success: true, step: 'preferences' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Preferences update error:', error);
    return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 });
  }
}
