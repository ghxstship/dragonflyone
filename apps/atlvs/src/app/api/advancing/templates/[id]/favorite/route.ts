import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { log } from '@ghxstship/config';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const favoriteSchema = z.object({
  user_id: z.string().uuid(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = createAdminClient();
  const { id } = await params;
  
  try {
    let userId: string | undefined;
    
    try {
      const payload = await request.json();
      const validatedData = favoriteSchema.parse(payload);
      userId = validatedData.user_id;
    } catch {
      // No body provided, check query params
      userId = request.nextUrl.searchParams.get('user_id') || undefined;
    }

    if (!userId) {
      return NextResponse.json({ error: 'user_id is required in body or query params' }, { status: 400 });
    }

    const { error } = await supabase
      .from('user_favorites')
      .insert({
        person_id: userId,
        entity_type: 'advance_template',
        entity_id: id,
      });

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ message: 'Already favorited' });
      }
      log.error('Failed to add template to favorites:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Template added to favorites' });
  } catch (error) {
    log.error('Unexpected error adding template to favorites:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = createAdminClient();
  const { id } = await params;
  
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('user_favorites')
      .delete()
      .eq('person_id', userId)
      .eq('entity_type', 'advance_template')
      .eq('entity_id', id);

    if (error) {
      log.error('Failed to remove template from favorites:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Template removed from favorites' });
  } catch (error) {
    log.error('Unexpected error removing template from favorites:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
