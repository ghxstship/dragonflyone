import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const ForumSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  category: z.string(),
  created_by: z.string(),
});

export async function GET(request: NextRequest) {
  try {
    const mockForums = [
      {
        id: '1',
        title: 'ULTRA MUSIC FESTIVAL DISCUSSIONS',
        posts: 1247,
        members: 8934,
        lastActive: '2 min ago',
        trending: true,
        category: 'Events',
      },
      {
        id: '2',
        title: 'TICKET EXCHANGE & TRADES',
        posts: 892,
        members: 5621,
        lastActive: '15 min ago',
        trending: false,
        category: 'Tickets',
      },
      {
        id: '3',
        title: 'ARTIST MEET & GREETS',
        posts: 634,
        members: 3456,
        lastActive: '1 hour ago',
        trending: true,
        category: 'Artists',
      },
    ];

    return NextResponse.json({ forums: mockForums, total: mockForums.length });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch forums' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = ForumSchema.parse(body);

    const newForum = {
      id: String(Math.floor(Math.random() * 10000)),
      ...validatedData,
      posts: 0,
      members: 1,
      lastActive: 'Just now',
      trending: false,
      created_at: new Date().toISOString(),
    };

    return NextResponse.json(newForum, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create forum' }, { status: 500 });
  }
}
