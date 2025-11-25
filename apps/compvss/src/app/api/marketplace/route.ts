import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ListingSchema = z.object({
  title: z.string(),
  type: z.enum(['gig', 'job', 'rfp', 'equipment_rental', 'service']),
  description: z.string(),
  category: z.string(),
  location: z.string(),
  location_type: z.enum(['onsite', 'remote', 'hybrid']).optional(),
  compensation: z.object({
    type: z.enum(['hourly', 'daily', 'project', 'salary', 'negotiable']),
    min: z.number().optional(),
    max: z.number().optional(),
    currency: z.string().default('USD'),
  }).optional(),
  requirements: z.array(z.string()).optional(),
  skills: z.array(z.string()).optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  deadline: z.string().optional(),
  is_featured: z.boolean().default(false),
});

// GET /api/marketplace - Browse marketplace listings
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const listingId = searchParams.get('listing_id');
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const location = searchParams.get('location');

    if (action === 'categories') {
      const { data: categories } = await supabase
        .from('marketplace_categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      return NextResponse.json({ categories: categories || [] });
    }

    if (action === 'featured') {
      const { data: featured } = await supabase
        .from('marketplace_listings')
        .select(`
          *,
          poster:platform_users!posted_by(first_name, last_name, avatar_url)
        `)
        .eq('status', 'active')
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(10);

      return NextResponse.json({ featured: featured || [] });
    }

    if (action === 'search') {
      const query = searchParams.get('q');
      if (!query) {
        return NextResponse.json({ error: 'Search query required' }, { status: 400 });
      }

      const { data: results } = await supabase
        .from('marketplace_listings')
        .select('id, title, type, category, location, compensation, created_at')
        .eq('status', 'active')
        .or(`title.ilike.%${query}%,description.ilike.%${query}%,skills.cs.{${query}}`)
        .order('created_at', { ascending: false })
        .limit(30);

      return NextResponse.json({ results: results || [] });
    }

    if (listingId) {
      const { data: listing } = await supabase
        .from('marketplace_listings')
        .select(`
          *,
          poster:platform_users!posted_by(id, first_name, last_name, avatar_url, company)
        `)
        .eq('id', listingId)
        .single();

      if (!listing) {
        return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
      }

      // Increment view count
      await supabase
        .from('marketplace_listings')
        .update({ view_count: (listing.view_count || 0) + 1 })
        .eq('id', listingId);

      // Get similar listings
      const { data: similar } = await supabase
        .from('marketplace_listings')
        .select('id, title, type, location, compensation')
        .eq('status', 'active')
        .eq('category', listing.category)
        .neq('id', listingId)
        .limit(5);

      return NextResponse.json({
        listing,
        similar: similar || [],
      });
    }

    // List all active listings
    let query = supabase
      .from('marketplace_listings')
      .select(`
        id, title, type, category, location, location_type, compensation, 
        skills, start_date, deadline, is_featured, created_at,
        poster:platform_users!posted_by(first_name, last_name)
      `)
      .eq('status', 'active')
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false });

    if (type) {
      query = query.eq('type', type);
    }
    if (category) {
      query = query.eq('category', category);
    }
    if (location) {
      query = query.ilike('location', `%${location}%`);
    }

    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    query = query.range(offset, offset + limit - 1);

    const { data: listings, count } = await query;

    return NextResponse.json({
      listings: listings || [],
      total: count || 0,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch marketplace' }, { status: 500 });
  }
}

// POST /api/marketplace - Create listing or apply
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const action = body.action || 'create';

    if (action === 'create') {
      const validated = ListingSchema.parse(body);

      const { data: listing, error } = await supabase
        .from('marketplace_listings')
        .insert({
          ...validated,
          status: 'active',
          posted_by: user.id,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ listing }, { status: 201 });
    } else if (action === 'apply') {
      const { listing_id, cover_letter, resume_url, portfolio_url, availability } = body;

      // Check if already applied
      const { data: existing } = await supabase
        .from('marketplace_applications')
        .select('id')
        .eq('listing_id', listing_id)
        .eq('applicant_id', user.id)
        .single();

      if (existing) {
        return NextResponse.json({ error: 'Already applied to this listing' }, { status: 400 });
      }

      const { data: application, error } = await supabase
        .from('marketplace_applications')
        .insert({
          listing_id,
          applicant_id: user.id,
          cover_letter,
          resume_url,
          portfolio_url,
          availability,
          status: 'pending',
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Notify listing owner
      const { data: listing } = await supabase
        .from('marketplace_listings')
        .select('posted_by, title')
        .eq('id', listing_id)
        .single();

      if (listing) {
        await supabase.from('unified_notifications').insert({
          user_id: listing.posted_by,
          title: 'New Application',
          message: `Someone applied to your listing: ${listing.title}`,
          type: 'info',
          priority: 'normal',
          source_platform: 'compvss',
          source_entity_type: 'marketplace_application',
          source_entity_id: application.id,
        });
      }

      return NextResponse.json({ application }, { status: 201 });
    } else if (action === 'save') {
      const { listing_id } = body;

      const { data: saved, error } = await supabase
        .from('marketplace_saved')
        .upsert({
          user_id: user.id,
          listing_id,
        }, { onConflict: 'user_id,listing_id' })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ saved });
    } else if (action === 'unsave') {
      const { listing_id } = body;

      await supabase
        .from('marketplace_saved')
        .delete()
        .eq('user_id', user.id)
        .eq('listing_id', listing_id);

      return NextResponse.json({ success: true });
    } else if (action === 'update_application') {
      const { application_id, status, notes } = body;

      const { data: application, error } = await supabase
        .from('marketplace_applications')
        .update({
          status,
          reviewer_notes: notes,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', application_id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Notify applicant
      await supabase.from('unified_notifications').insert({
        user_id: application.applicant_id,
        title: 'Application Update',
        message: `Your application status has been updated to: ${status}`,
        type: status === 'accepted' ? 'success' : 'info',
        priority: 'normal',
        source_platform: 'compvss',
        source_entity_type: 'marketplace_application',
        source_entity_id: application_id,
      });

      return NextResponse.json({ application });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

// PATCH /api/marketplace - Update listing
export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const listingId = searchParams.get('listing_id');

    if (!listingId) {
      return NextResponse.json({ error: 'Listing ID required' }, { status: 400 });
    }

    const body = await request.json();

    const { data: listing, error } = await supabase
      .from('marketplace_listings')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', listingId)
      .eq('posted_by', user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ listing });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update listing' }, { status: 500 });
  }
}

// DELETE /api/marketplace - Close listing
export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const listingId = searchParams.get('listing_id');

    if (!listingId) {
      return NextResponse.json({ error: 'Listing ID required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('marketplace_listings')
      .update({
        status: 'closed',
        closed_at: new Date().toISOString(),
      })
      .eq('id', listingId)
      .eq('posted_by', user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to close listing' }, { status: 500 });
  }
}
