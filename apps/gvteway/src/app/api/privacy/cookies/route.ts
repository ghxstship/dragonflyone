import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const cookieConsentSchema = z.object({
  session_id: z.string().min(1),
  necessary: z.boolean().default(true),
  functional: z.boolean().default(false),
  analytics: z.boolean().default(false),
  advertising: z.boolean().default(false),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const session_id = searchParams.get('session_id');

    if (!session_id) {
      return NextResponse.json(
        { error: 'session_id is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('cookie_consent')
      .select('necessary, functional, analytics, advertising, consented_at, updated_at')
      .eq('session_id', session_id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    if (!data) {
      // Return default consent (only necessary cookies)
      return NextResponse.json({
        data: {
          necessary: true,
          functional: false,
          analytics: false,
          advertising: false,
          consented: false,
        },
      });
    }

    return NextResponse.json({
      data: {
        ...data,
        consented: true,
      },
    });
  } catch (error) {
    console.error('Get cookie consent error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cookie consent' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = cookieConsentSchema.parse(body);

    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip');
    const userAgent = request.headers.get('user-agent');

    // Try to get user_id if authenticated
    let userId = null;
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
      if (user) {
        const { data: platformUser } = await supabase
          .from('platform_users')
          .select('id')
          .eq('auth_user_id', user.id)
          .single();
        userId = platformUser?.id;
      }
    }

    // Detect country from IP (simplified - in production use a geo-IP service)
    const countryCode = request.headers.get('cf-ipcountry') || null;

    const { data, error } = await supabase
      .from('cookie_consent')
      .upsert({
        session_id: validated.session_id,
        user_id: userId,
        necessary: validated.necessary,
        functional: validated.functional,
        analytics: validated.analytics,
        advertising: validated.advertising,
        ip_address: ipAddress,
        user_agent: userAgent,
        country_code: countryCode,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'session_id',
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Save cookie consent error:', error);
    return NextResponse.json(
      { error: 'Failed to save cookie consent' },
      { status: 500 }
    );
  }
}
