export const dynamic = 'force-dynamic';

import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const ATLVS_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function GET(request: NextRequest) {
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { searchParams } = new URL(request.url);
    
    const organizationId = searchParams.get('organization_id');

    let query = supabase
      .from('client_portal_access')
      .select(`
        id,
        contact_id,
        booking_id,
        permissions,
        expires_at,
        is_active,
        last_login_at,
        created_at,
        contact:contacts(
          id,
          first_name,
          last_name,
          email,
          company
        )
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform data for frontend consumption
    const accesses = (data || []).map((access) => {
      const contact = access.contact as { 
        first_name?: string; 
        last_name?: string; 
        email?: string;
        company?: string;
      } | null;
      
      // Calculate status based on expiry and activity
      let status: 'active' | 'pending' | 'expired' = 'active';
      if (access.expires_at && new Date(access.expires_at) < new Date()) {
        status = 'expired';
      } else if (!access.last_login_at) {
        status = 'pending';
      }

      return {
        id: access.id,
        client_name: contact 
          ? `${contact.first_name || ''} ${contact.last_name || ''}`.trim() || contact.company || 'Unknown'
          : 'Unknown',
        client_email: contact?.email || '',
        status,
        last_login: access.last_login_at,
        events_count: 0, // Will be populated separately if needed
        created_at: access.created_at,
      };
    });

    // Get event counts for each access
    const contactIds = accesses.map(a => {
      const accessData = data?.find(d => d.id === a.id);
      return accessData?.contact_id;
    }).filter(Boolean);

    if (contactIds.length > 0) {
      const { data: bookingCounts } = await supabase
        .from('legend_events')
        .select('contact_id')
        .in('contact_id', contactIds);

      if (bookingCounts) {
        const countMap = bookingCounts.reduce((acc, b) => {
          acc[b.contact_id] = (acc[b.contact_id] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        accesses.forEach((access) => {
          const accessData = data?.find(d => d.id === access.id);
          if (accessData?.contact_id) {
            access.events_count = countMap[accessData.contact_id] || 0;
          }
        });
      }
    }

    return NextResponse.json({ accesses });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
