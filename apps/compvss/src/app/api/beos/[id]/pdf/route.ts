export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { withAuth, PlatformRole, logger } from '@ghxstship/config';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const COMPVSS_ROLES = [
  PlatformRole.COMPVSS_ADMIN, PlatformRole.COMPVSS_TEAM_MEMBER, PlatformRole.COMPVSS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    
    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden - COMPVSS access required' }, { status: 403 });
    }

    const { id: beoId } = await params;

    const { data: beo, error } = await supabase
      .from('beos')
      .select('*, booking:bookings(*, client:clients(*), venue:venues(*))')
      .eq('id', beoId)
      .single();

    if (error || !beo) {
      return NextResponse.json({ error: 'BEO not found' }, { status: 404 });
    }

    const sections = beo.sections as Record<string, unknown>;
    const htmlContent = generateBEOHtml(beo, sections);

    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `inline; filename="BEO-${beo.id}.html"`,
      },
    });
  } catch (error) {
    logger.error('Error in GET /api/beos/[id]/pdf:', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ error: 'Failed to generate BEO PDF' }, { status: 500 });
  }
}

function generateBEOHtml(beo: Record<string, unknown>, sections: Record<string, unknown>): string {
  const eventDetails = sections.event_details as Record<string, unknown> || {};
  const clientInfo = sections.client_info as Record<string, unknown> || {};
  const venueInfo = sections.venue_info as Record<string, unknown> || {};

  return `
<!DOCTYPE html>
<html>
<head>
  <title>BEO - ${beo.title}</title>
  <style>
    :root {
      --pdf-text-primary: hsl(0, 0%, 20%);
      --pdf-text-secondary: hsl(0, 0%, 33%);
      --pdf-text-muted: hsl(0, 0%, 40%);
      --pdf-border: hsl(0, 0%, 80%);
      --pdf-surface: hsl(0, 0%, 96%);
      --pdf-accent: hsl(48, 100%, 50%);
    }
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; color: var(--pdf-text-primary); }
    h1 { color: var(--pdf-text-primary); border-bottom: 2px solid var(--pdf-text-primary); padding-bottom: 10px; }
    h2 { color: var(--pdf-text-secondary); margin-top: 30px; }
    .section { margin-bottom: 20px; padding: 15px; background: var(--pdf-surface); border-radius: 5px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .label { font-weight: bold; color: var(--pdf-text-muted); }
    .value { color: var(--pdf-text-primary); }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid var(--pdf-border); font-size: 12px; color: var(--pdf-text-muted); }
    @media print { body { padding: 0; } .section { break-inside: avoid; } }
  </style>
</head>
<body>
  <h1>${beo.title}</h1>
  <p>Version ${beo.version} | Status: ${beo.status} | Date: ${beo.event_date}</p>
  
  <div class="section">
    <h2>Event Details</h2>
    <div class="grid">
      <div><span class="label">Event Name:</span> <span class="value">${eventDetails.name || 'N/A'}</span></div>
      <div><span class="label">Date:</span> <span class="value">${eventDetails.date || 'N/A'}</span></div>
      <div><span class="label">Time:</span> <span class="value">${eventDetails.start_time || ''} - ${eventDetails.end_time || ''}</span></div>
      <div><span class="label">Guest Count:</span> <span class="value">${eventDetails.guest_count || 'N/A'}</span></div>
      <div><span class="label">Event Type:</span> <span class="value">${eventDetails.event_type || 'N/A'}</span></div>
    </div>
  </div>

  <div class="section">
    <h2>Client Information</h2>
    <div class="grid">
      <div><span class="label">Company/Name:</span> <span class="value">${clientInfo.name || 'N/A'}</span></div>
      <div><span class="label">Contact:</span> <span class="value">${clientInfo.contact || 'N/A'}</span></div>
      <div><span class="label">Email:</span> <span class="value">${clientInfo.email || 'N/A'}</span></div>
      <div><span class="label">Phone:</span> <span class="value">${clientInfo.phone || 'N/A'}</span></div>
    </div>
  </div>

  <div class="section">
    <h2>Venue Information</h2>
    <div class="grid">
      <div><span class="label">Venue:</span> <span class="value">${venueInfo.name || 'N/A'}</span></div>
      <div><span class="label">Address:</span> <span class="value">${venueInfo.address || 'N/A'}</span></div>
    </div>
  </div>

  <div class="footer">
    <p>Generated by COMPVSS | BEO ID: ${beo.id}</p>
  </div>
</body>
</html>
  `;
}
