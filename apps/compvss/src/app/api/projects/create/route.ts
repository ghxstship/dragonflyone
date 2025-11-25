import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const project = {
      id: `proj_${Date.now()}`,
      ...body,
      createdAt: new Date().toISOString(),
      status: 'planning',
      progress: 0,
    };

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}
