export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@ghxstship/config';

// Critical path analysis and risk identification
export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');

    if (!projectId) return NextResponse.json({ error: 'Project ID required' }, { status: 400 });

    // Get all tasks with dependencies
    const { data: tasks } = await supabase.from('project_tasks').select(`
      *, dependencies:task_dependencies(dependency_id)
    `).eq('project_id', projectId);

    if (!tasks) return NextResponse.json({ error: 'No tasks found' }, { status: 404 });

    // Calculate critical path
    const criticalPath = calculateCriticalPath(tasks);
    const risks = identifyRisks(tasks, criticalPath);

    // Get project timeline
    const { data: project } = await supabase.from('projects').select('start_date, end_date').eq('id', projectId).single();

    return NextResponse.json({
      critical_path: criticalPath,
      risks,
      total_duration: criticalPath.reduce((s, t) => s + t.duration, 0),
      slack_analysis: calculateSlack(tasks, criticalPath),
      project_timeline: project
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to analyze critical path' }, { status: 500 });
  }
}

function calculateCriticalPath(tasks: unknown[]): unknown[] {
  // Build task graph
  const taskMap = new Map(tasks.map(t => [t.id, { ...t, earliestStart: 0, earliestFinish: 0, latestStart: Infinity, latestFinish: Infinity }]));

  // Forward pass - calculate earliest times
  const sorted = topologicalSort(tasks);
  for (const task of sorted) {
    const t = taskMap.get(task.id)!;
    const deps = task.dependencies?.map((d: Record<string, unknown>) => taskMap.get(d.dependency_id)) || [];
    
    if (deps.length > 0) {
      t.earliestStart = Math.max(...deps.map((d: Record<string, unknown>) => d?.earliestFinish || 0));
    }
    t.earliestFinish = t.earliestStart + (t.duration || 1);
  }

  // Find project end time
  const projectEnd = Math.max(...Array.from(taskMap.values()).map(t => t.earliestFinish));

  // Backward pass - calculate latest times
  for (const task of sorted.reverse()) {
    const t = taskMap.get(task.id)!;
    interface TaskDependency { dependency_id: string }
    const successors = tasks.filter(s => s.dependencies?.some((d: TaskDependency) => d.dependency_id === task.id));
    
    if (successors.length === 0) {
      t.latestFinish = projectEnd;
    } else {
      t.latestFinish = Math.min(...successors.map(s => taskMap.get(s.id)?.latestStart || projectEnd));
    }
    t.latestStart = t.latestFinish - (t.duration || 1);
  }

  // Critical path = tasks with zero slack
  const criticalTasks = Array.from(taskMap.values())
    .filter(t => Math.abs(t.latestStart - t.earliestStart) < 0.001)
    .sort((a, b) => a.earliestStart - b.earliestStart);

  return criticalTasks.map(t => ({
    id: t.id,
    name: t.name,
    duration: t.duration,
    start: t.earliestStart,
    finish: t.earliestFinish,
    is_critical: true
  }));
}

interface SortableTask { id: string; dependencies?: { dependency_id: string }[] }
function topologicalSort(tasks: SortableTask[]): SortableTask[] {
  const visited = new Set();
  const result: SortableTask[] = [];

  function visit(task: SortableTask) {
    if (visited.has(task.id)) return;
    visited.add(task.id);
    
    const deps = task.dependencies || [];
    for (const dep of deps) {
      const depTask = tasks.find((t: SortableTask) => t.id === dep.dependency_id);
      if (depTask) visit(depTask);
    }
    result.push(task);
  }

  for (const task of tasks) {
    visit(task);
  }

  return result;
}

function identifyRisks(tasks: unknown[], criticalPath: unknown[]): unknown[] {
  const risks: unknown[] = [];
  const criticalIds = new Set(criticalPath.map(t => t.id));

  for (const task of tasks) {
    if (criticalIds.has(task.id)) {
      // Critical tasks are high risk
      if (task.status === 'delayed' || task.status === 'blocked') {
        risks.push({
          task_id: task.id,
          task_name: task.name,
          risk_level: 'high',
          reason: 'Critical path task is delayed/blocked',
          impact: 'Project completion date at risk'
        });
      }
    }

    // Check for resource conflicts
    if (task.assigned_to && tasks.filter(t => t.assigned_to === task.assigned_to && t.id !== task.id).length > 2) {
      risks.push({
        task_id: task.id,
        task_name: task.name,
        risk_level: 'medium',
        reason: 'Resource over-allocation',
        impact: 'Potential delays due to resource constraints'
      });
    }
  }

  return risks;
}

function calculateSlack(tasks: unknown[], criticalPath: unknown[]): unknown[] {
  const criticalIds = new Set(criticalPath.map(t => t.id));
  
  return tasks.filter(t => !criticalIds.has(t.id)).map(t => ({
    task_id: t.id,
    task_name: t.name,
    slack_days: t.latestStart - t.earliestStart || 0
  }));
}
