import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const shareSchema = z.object({
  platform: z.enum(['linkedin', 'twitter', 'facebook', 'email', 'copy_link', 'whatsapp', 'telegram', 'sms', 'other']),
  metadata: z.record(z.any()).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get opportunity details for sharing
    const { data: opportunity, error: oppError } = await supabase
      .from('opportunities')
      .select('id, title, description, location, type, company_name')
      .eq('id', params.id)
      .single();

    if (oppError || !opportunity) {
      return NextResponse.json(
        { error: 'Opportunity not found' },
        { status: 404 }
      );
    }

    // Get share templates
    const { data: templates } = await supabase
      .from('share_templates')
      .select('*')
      .eq('template_type', 'opportunity')
      .eq('is_active', true);

    // Get share stats
    const { data: stats } = await supabase
      .from('opportunity_shares')
      .select('platform, click_count, application_count')
      .eq('opportunity_id', params.id);

    const platformStats: Record<string, { shares: number; clicks: number; applications: number }> = {};
    (stats || []).forEach((s: { platform: string; click_count: number; application_count: number }) => {
      if (!platformStats[s.platform]) {
        platformStats[s.platform] = { shares: 0, clicks: 0, applications: 0 };
      }
      platformStats[s.platform].shares++;
      platformStats[s.platform].clicks += s.click_count;
      platformStats[s.platform].applications += s.application_count;
    });

    // Generate share URLs for each platform
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://compvss.ghxstship.com';
    const opportunityUrl = `${baseUrl}/opportunities/${params.id}`;

    const shareUrls = {
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(opportunityUrl)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(opportunityUrl)}&text=${encodeURIComponent(`Check out this opportunity: ${opportunity.title}`)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(opportunityUrl)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${opportunity.title} - ${opportunityUrl}`)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(opportunityUrl)}&text=${encodeURIComponent(opportunity.title)}`,
      email: `mailto:?subject=${encodeURIComponent(`Job Opportunity: ${opportunity.title}`)}&body=${encodeURIComponent(`Check out this opportunity:\n\n${opportunity.title}\n${opportunity.description || ''}\n\nApply here: ${opportunityUrl}`)}`,
    };

    return NextResponse.json({
      opportunity: {
        id: opportunity.id,
        title: opportunity.title,
        description: opportunity.description,
        location: opportunity.location,
        company: opportunity.company_name,
      },
      shareUrls,
      templates,
      stats: platformStats,
    });
  } catch (error) {
    console.error('Error getting share info:', error);
    return NextResponse.json(
      { error: 'Failed to get share info' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    let userId: string | null = null;

    if (authHeader) {
      const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
      userId = user?.id || null;
    }

    const body = await request.json();
    const validated = shareSchema.parse(body);

    // Verify opportunity exists
    const { data: opportunity } = await supabase
      .from('opportunities')
      .select('id')
      .eq('id', params.id)
      .single();

    if (!opportunity) {
      return NextResponse.json(
        { error: 'Opportunity not found' },
        { status: 404 }
      );
    }

    // Create share record
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://compvss.ghxstship.com';
    
    const { data: share, error } = await supabase
      .from('opportunity_shares')
      .insert({
        opportunity_id: params.id,
        shared_by: userId,
        platform: validated.platform,
        share_url: `${baseUrl}/opportunities/${params.id}`,
        metadata: validated.metadata || {},
      })
      .select()
      .single();

    if (error) throw error;

    // Generate tracked share URL
    const trackedUrl = `${baseUrl}/s/${share.tracking_code}`;

    return NextResponse.json({
      data: {
        ...share,
        tracked_url: trackedUrl,
      },
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating share:', error);
    return NextResponse.json(
      { error: 'Failed to create share' },
      { status: 500 }
    );
  }
}
