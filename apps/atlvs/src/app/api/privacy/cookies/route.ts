import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * GET /api/privacy/cookies
 * Retrieves cookie consent preferences for a session
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'session_id is required' },
        { status: 400 }
      );
    }

    // If no service key, return default (not consented)
    if (!supabaseServiceKey) {
      return NextResponse.json({
        data: {
          necessary: true,
          functional: false,
          analytics: false,
          advertising: false,
          consented: false,
          consented_at: null,
        },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data, error } = await supabase
      .from('cookie_consent')
      .select('*')
      .eq('session_id', sessionId)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows found, which is fine
      console.error('Error fetching cookie consent:', error);
      return NextResponse.json(
        { error: 'Failed to fetch consent' },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json({
        data: {
          necessary: true,
          functional: false,
          analytics: false,
          advertising: false,
          consented: false,
          consented_at: null,
        },
      });
    }

    return NextResponse.json({
      data: {
        necessary: data.necessary ?? true,
        functional: data.functional ?? false,
        analytics: data.analytics ?? false,
        advertising: data.advertising ?? false,
        consented: true,
        consented_at: data.consented_at,
      },
    });
  } catch (error) {
    console.error('Cookie consent GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/privacy/cookies
 * Saves cookie consent preferences for a session
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { session_id, necessary, functional, analytics, advertising } = body;

    if (!session_id) {
      return NextResponse.json(
        { error: 'session_id is required' },
        { status: 400 }
      );
    }

    // If no service key, just acknowledge the request
    if (!supabaseServiceKey) {
      return NextResponse.json({
        success: true,
        message: 'Consent acknowledged (local storage only)',
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const consentData = {
      session_id,
      necessary: necessary ?? true,
      functional: functional ?? false,
      analytics: analytics ?? false,
      advertising: advertising ?? false,
      consented_at: new Date().toISOString(),
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
      user_agent: request.headers.get('user-agent') || null,
    };

    const { error } = await supabase
      .from('cookie_consent')
      .upsert(consentData, { onConflict: 'session_id' });

    if (error) {
      console.error('Error saving cookie consent:', error);
      // Don't fail the request - local storage will still work
      return NextResponse.json({
        success: true,
        message: 'Consent saved locally',
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Consent saved successfully',
    });
  } catch (error) {
    console.error('Cookie consent POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
