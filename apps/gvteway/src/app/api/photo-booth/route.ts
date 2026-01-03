export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { logger } from '@ghxstship/config';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Schema for capturing photos - uses 3NF tables from 0051 migration
const photoSchema = z.object({
  booth_id: z.string().uuid(),
  template_id: z.string().uuid().optional(),
  original_url: z.string().url(),
  processed_url: z.string().url().optional(),
  thumbnail_url: z.string().url().optional(),
  is_public: z.boolean().default(false),
  organization_id: z.string().uuid(),
});

// GET /api/photo-booth - List photos, templates, or booth configs from 3NF tables
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');
    const boothId = searchParams.get('booth_id');
    const type = searchParams.get('type');

    // Get templates from photo_booth_templates (3NF)
    if (type === 'templates') {
      const { data: templates, error } = await supabase
        .from('photo_booth_templates')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) {
        logger.error('Error fetching photo booth templates:', error);
        return NextResponse.json({ templates: [] });
      }
      return NextResponse.json({ templates });
    }

    // Get booth configs from photo_booth_configs (3NF)
    if (type === 'booths') {
      let query = supabase
        .from('photo_booth_configs')
        .select(`
          *,
          event:legend_events!event_id(id, name),
          venue:legend_places!venue_id(id, name)
        `)
        .eq('is_active', true);

      if (eventId) {
        query = query.eq('event_id', eventId);
      }

      const { data: booths, error } = await query;

      if (error) {
        logger.error('Error fetching photo booth configs:', error);
        return NextResponse.json({ booths: [] });
      }
      return NextResponse.json({ booths });
    }

    // Get photos from photo_booth_photos (3NF)
    let query = supabase
      .from('photo_booth_photos')
      .select(`
        *,
        creator:legend_people!creator_id(id, display_name, avatar_url),
        template:photo_booth_templates!template_id(id, name, thumbnail_url),
        booth:photo_booth_configs!booth_id(id, name, event_id)
      `)
      .order('created_at', { ascending: false });

    if (boothId) {
      query = query.eq('booth_id', boothId);
    }

    const { data: photos, error } = await query.limit(100);
    
    if (error) {
      logger.error('Error fetching photo booth photos:', error);
      return NextResponse.json({ photos: [] });
    }

    return NextResponse.json({ photos });
  } catch (error) {
    logger.error('Error in GET /api/photo-booth:', error instanceof Error ? error : undefined);
    return NextResponse.json({ photos: [], templates: [], booths: [] });
  }
}

// POST /api/photo-booth - Capture photo, share, or create template using 3NF tables
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const action = body.action;

    if (action === 'capture') {
      const validated = photoSchema.parse(body.data);

      // Generate share code
      const shareCode = `pb_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

      const { data: photo, error } = await supabase
        .from('photo_booth_photos')
        .insert({
          organization_id: validated.organization_id,
          booth_id: validated.booth_id,
          template_id: validated.template_id,
          original_url: validated.original_url,
          processed_url: validated.processed_url,
          thumbnail_url: validated.thumbnail_url,
          is_public: validated.is_public,
          share_code: shareCode,
          status: 'approved',
        })
        .select()
        .single();

      if (error) {
        logger.error('Error capturing photo:', error);
        return NextResponse.json({ error: 'Failed to capture photo', details: error.message }, { status: 500 });
      }
      return NextResponse.json({ photo }, { status: 201 });
    }

    if (action === 'share') {
      const { photo_id } = body;

      // Increment share count
      const { data: photo, error } = await supabase
        .from('photo_booth_photos')
        .update({ 
          share_count: supabase.rpc('increment', { row_id: photo_id, column_name: 'share_count' })
        })
        .eq('id', photo_id)
        .select('share_code')
        .single();

      if (error) {
        logger.error('Error sharing photo:', error);
        return NextResponse.json({ error: 'Failed to share photo' }, { status: 500 });
      }

      return NextResponse.json({ success: true, share_code: photo?.share_code });
    }

    if (action === 'create_template') {
      const { name, description, template_type, image_url, thumbnail_url, organization_id, settings } = body.data;

      const { data: template, error } = await supabase
        .from('photo_booth_templates')
        .insert({
          organization_id,
          name,
          description,
          template_type: template_type || 'frame',
          image_url,
          thumbnail_url,
          settings: settings || {},
          is_active: true,
        })
        .select()
        .single();

      if (error) {
        logger.error('Error creating template:', error);
        return NextResponse.json({ error: 'Failed to create template', details: error.message }, { status: 500 });
      }
      return NextResponse.json({ template }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    logger.error('Error in POST /api/photo-booth:', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/photo-booth - Delete photo from photo_booth_photos (3NF)
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('photo_booth_photos')
      .delete()
      .eq('id', id);

    if (error) {
      logger.error('Error deleting photo:', error);
      return NextResponse.json({ error: 'Failed to delete photo' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error in DELETE /api/photo-booth:', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
