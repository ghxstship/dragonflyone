import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

// GET - Fetch project dependencies and detect conflicts
export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');

    // Fetch all dependencies
    let query = supabase
      .from('project_dependencies')
      .select(`
        *,
        source_project:projects!source_project_id(id, name, status, start_date, end_date),
        target_project:projects!target_project_id(id, name, status, start_date, end_date)
      `);

    if (projectId) {
      query = query.or(`source_project_id.eq.${projectId},target_project_id.eq.${projectId}`);
    }

    const { data: dependencies, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Detect conflicts
    const conflicts = detectConflicts(dependencies);

    // Build dependency graph for visualization
    const graph = buildDependencyGraph(dependencies);

    // Calculate critical path
    const criticalPath = calculateCriticalPath(dependencies);

    return NextResponse.json({
      dependencies,
      conflicts,
      graph,
      critical_path: criticalPath,
      stats: {
        total_dependencies: dependencies.length,
        blocking_dependencies: dependencies.filter(d => d.dependency_type === 'blocking').length,
        conflicts_count: conflicts.length,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch dependencies' },
      { status: 500 }
    );
  }
}

// POST - Create project dependency
export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
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
    const {
      source_project_id,
      target_project_id,
      dependency_type, // 'blocking', 'soft', 'resource', 'milestone'
      description,
      lag_days, // Days between source completion and target start
      resource_ids, // For resource dependencies
    } = body;

    // Check for circular dependencies
    const isCircular = await checkCircularDependency(source_project_id, target_project_id);
    if (isCircular) {
      return NextResponse.json(
        { error: 'This would create a circular dependency' },
        { status: 400 }
      );
    }

    const { data: dependency, error } = await supabase
      .from('project_dependencies')
      .insert({
        source_project_id,
        target_project_id,
        dependency_type,
        description,
        lag_days: lag_days || 0,
        resource_ids: resource_ids || [],
        status: 'active',
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Check for new conflicts
    const { data: allDeps } = await supabase
      .from('project_dependencies')
      .select(`
        *,
        source_project:projects!source_project_id(id, name, status, start_date, end_date),
        target_project:projects!target_project_id(id, name, status, start_date, end_date)
      `);

    const conflicts = detectConflicts(allDeps || []);

    return NextResponse.json({
      dependency,
      new_conflicts: conflicts.filter(c => 
        c.dependency_ids.includes(dependency.id)
      ),
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create dependency' },
      { status: 500 }
    );
  }
}

// DELETE - Remove dependency
export async function DELETE(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const dependencyId = searchParams.get('id');

    if (!dependencyId) {
      return NextResponse.json({ error: 'Dependency ID required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('project_dependencies')
      .delete()
      .eq('id', dependencyId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete dependency' },
      { status: 500 }
    );
  }
}

function detectConflicts(dependencies: any[]): any[] {
  const conflicts: any[] = [];

  for (const dep of dependencies) {
    if (!dep.source_project || !dep.target_project) continue;

    // Check date conflicts for blocking dependencies
    if (dep.dependency_type === 'blocking') {
      const sourceEnd = new Date(dep.source_project.end_date);
      const targetStart = new Date(dep.target_project.start_date);
      const lagDays = dep.lag_days || 0;

      sourceEnd.setDate(sourceEnd.getDate() + lagDays);

      if (sourceEnd > targetStart) {
        conflicts.push({
          type: 'schedule_conflict',
          dependency_ids: [dep.id],
          source_project: dep.source_project,
          target_project: dep.target_project,
          message: `${dep.target_project.name} starts before ${dep.source_project.name} completes`,
          days_overlap: Math.ceil((sourceEnd.getTime() - targetStart.getTime()) / (1000 * 60 * 60 * 24)),
        });
      }
    }

    // Check resource conflicts
    if (dep.dependency_type === 'resource' && dep.resource_ids?.length > 0) {
      // Find other dependencies using same resources in overlapping timeframes
      const overlapping = dependencies.filter(other => 
        other.id !== dep.id &&
        other.resource_ids?.some((r: string) => dep.resource_ids.includes(r)) &&
        datesOverlap(dep.source_project, other.source_project)
      );

      if (overlapping.length > 0) {
        conflicts.push({
          type: 'resource_conflict',
          dependency_ids: [dep.id, ...overlapping.map(o => o.id)],
          resource_ids: dep.resource_ids,
          message: `Resource conflict between ${dep.source_project.name} and ${overlapping.map(o => o.source_project.name).join(', ')}`,
        });
      }
    }
  }

  return conflicts;
}

function datesOverlap(project1: any, project2: any): boolean {
  if (!project1 || !project2) return false;
  const start1 = new Date(project1.start_date);
  const end1 = new Date(project1.end_date);
  const start2 = new Date(project2.start_date);
  const end2 = new Date(project2.end_date);
  return start1 <= end2 && start2 <= end1;
}

function buildDependencyGraph(dependencies: any[]): any {
  const nodes = new Map<string, any>();
  const edges: any[] = [];

  for (const dep of dependencies) {
    if (dep.source_project && !nodes.has(dep.source_project.id)) {
      nodes.set(dep.source_project.id, {
        id: dep.source_project.id,
        name: dep.source_project.name,
        status: dep.source_project.status,
      });
    }
    if (dep.target_project && !nodes.has(dep.target_project.id)) {
      nodes.set(dep.target_project.id, {
        id: dep.target_project.id,
        name: dep.target_project.name,
        status: dep.target_project.status,
      });
    }

    if (dep.source_project && dep.target_project) {
      edges.push({
        source: dep.source_project.id,
        target: dep.target_project.id,
        type: dep.dependency_type,
      });
    }
  }

  return {
    nodes: Array.from(nodes.values()),
    edges,
  };
}

function calculateCriticalPath(dependencies: any[]): any[] {
  // Simplified critical path - return blocking dependencies chain
  const blocking = dependencies.filter(d => d.dependency_type === 'blocking');
  return blocking.map(d => ({
    from: d.source_project?.name,
    to: d.target_project?.name,
    lag_days: d.lag_days,
  }));
}

async function checkCircularDependency(sourceId: string, targetId: string): Promise<boolean> {
  // Check if adding this dependency would create a cycle
  const { data: existingDeps } = await supabase
    .from('project_dependencies')
    .select('source_project_id, target_project_id')
    .eq('status', 'active');

  if (!existingDeps) return false;

  // Build adjacency list
  const graph = new Map<string, string[]>();
  for (const dep of existingDeps) {
    if (!graph.has(dep.source_project_id)) {
      graph.set(dep.source_project_id, []);
    }
    graph.get(dep.source_project_id)!.push(dep.target_project_id);
  }

  // Add proposed dependency
  if (!graph.has(sourceId)) {
    graph.set(sourceId, []);
  }
  graph.get(sourceId)!.push(targetId);

  // DFS to detect cycle
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  function hasCycle(node: string): boolean {
    visited.add(node);
    recursionStack.add(node);

    const neighbors = graph.get(node) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (hasCycle(neighbor)) return true;
      } else if (recursionStack.has(neighbor)) {
        return true;
      }
    }

    recursionStack.delete(node);
    return false;
  }

  return hasCycle(sourceId);
}
