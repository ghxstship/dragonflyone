import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, crewIds } = body;

    const assignment = {
      id: `assign_${Date.now()}`,
      projectId,
      crewIds,
      assignedAt: new Date().toISOString(),
      assignedBy: 'current_user',
    };

    return NextResponse.json(assignment, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to assign crew' },
      { status: 500 }
    );
  }
}
