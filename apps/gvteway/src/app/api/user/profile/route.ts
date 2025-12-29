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

    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    // Fetch user location
    const { data: location } = await supabase
      .from('user_locations')
      .select('*')
      .eq('user_id', userId)
      .eq('is_primary', true)
      .single();

    // Fetch user roles
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);

    // Fetch role names separately
    let roleNames: string[] = [];
    if (roles && roles.length > 0) {
      const roleIds = roles.map((r: { role: string | null }) => r.role).filter((r): r is string => r !== null);
      if (roleIds.length > 0) {
        const { data: roleData } = await supabase
          .from('roles')
          .select('name')
          .in('id', roleIds);
        roleNames = roleData?.map(r => r.name).filter(Boolean) as string[] || [];
      }
    }

    return NextResponse.json({
      user: {
        id: profile?.id,
        firstName: profile?.first_name,
        lastName: profile?.last_name,
        email: profile?.email,
        phone: profile?.phone,
        avatar_url: profile?.avatar_url,
        bio: profile?.bio,
        city: location?.city,
        state: location?.state,
        country: location?.country,
        timezone: location?.timezone,
        roles: roleNames,
        created_at: profile?.created_at,
        updated_at: profile?.updated_at,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, first_name, last_name, phone, bio, avatar_url, location } = body;

    if (!user_id) {
      return NextResponse.json({ error: 'user_id required' }, { status: 400 });
    }

    // Update profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .update({
        first_name,
        last_name,
        phone,
        bio,
        avatar_url,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user_id)
      .select()
      .single();

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    // Update location if provided
    if (location) {
      const { error: locationError } = await supabase
        .from('user_locations')
        .upsert({
          user_id,
          city: location.city,
          state: location.state,
          country: location.country,
          postal_code: location.postal_code,
          timezone: location.timezone,
          is_primary: true,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      if (locationError) {
        return NextResponse.json({ error: locationError.message }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: true,
      user: profile,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
