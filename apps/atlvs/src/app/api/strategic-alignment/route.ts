import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

// Validation schemas
const alignmentScoreSchema = z.object({
  project_id: z.string().uuid(),
  strategic_objective_id: z.string().uuid(),
  alignment_score: z.number().min(0).max(100),
  impact_score: z.number().min(0).max(100),
  effort_score: z.number().min(0).max(100),
  risk_score: z.number().min(0).max(100),
  notes: z.string().optional(),
  scored_by: z.string().uuid(),
});

const strategicObjectiveSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  category: z.enum(['growth', 'efficiency', 'innovation', 'customer', 'financial', 'operational', 'talent']),
  priority: z.enum(['critical', 'high', 'medium', 'low']),
  target_date: z.string().datetime().optional(),
  success_metrics: z.array(z.object({
    name: z.string(),
    target: z.number(),
    unit: z.string(),
  })).optional(),
  owner_id: z.string().uuid().optional(),
  parent_objective_id: z.string().uuid().optional(),
});

// GET - Get strategic alignment data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'objectives' | 'scores' | 'matrix' | 'dashboard'
    const projectId = searchParams.get('project_id');
    const objectiveId = searchParams.get('objective_id');
    const category = searchParams.get('category');

    if (type === 'objectives') {
      // Get strategic objectives
      let query = supabase
        .from('strategic_objectives')
        .select(`
          *,
          owner:platform_users(id, email, first_name, last_name),
          parent:strategic_objectives!parent_objective_id(id, name),
          children:strategic_objectives!parent_objective_id(id, name, priority)
        `)
        .order('priority', { ascending: true });

      if (category) {
        query = query.eq('category', category);
      }

      const { data: objectives, error } = await query;

      if (error) throw error;

      return NextResponse.json({ objectives });
    }

    if (type === 'scores' && projectId) {
      // Get alignment scores for a project
      const { data: scores, error } = await supabase
        .from('project_alignment_scores')
        .select(`
          *,
          objective:strategic_objectives(id, name, category, priority),
          scorer:platform_users(id, email, first_name, last_name)
        `)
        .eq('project_id', projectId);

      if (error) throw error;

      // Calculate composite score
      const compositeScore = scores?.length
        ? scores.reduce((acc, s) => {
            const weighted = (s.alignment_score * 0.4) + (s.impact_score * 0.3) + 
                           ((100 - s.effort_score) * 0.15) + ((100 - s.risk_score) * 0.15);
            return acc + weighted;
          }, 0) / scores.length
        : 0;

      return NextResponse.json({
        scores,
        composite_score: Math.round(compositeScore * 100) / 100,
        alignment_grade: getAlignmentGrade(compositeScore),
      });
    }

    if (type === 'matrix') {
      // Get full alignment matrix (projects x objectives)
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('id, name, status')
        .in('status', ['active', 'planning', 'in_progress']);

      if (projectsError) throw projectsError;

      const { data: objectives, error: objectivesError } = await supabase
        .from('strategic_objectives')
        .select('id, name, category, priority')
        .eq('status', 'active');

      if (objectivesError) throw objectivesError;

      const { data: scores, error: scoresError } = await supabase
        .from('project_alignment_scores')
        .select('project_id, strategic_objective_id, alignment_score, impact_score');

      if (scoresError) throw scoresError;

      // Build matrix
      const matrix = projects?.map(project => {
        const projectScores = scores?.filter(s => s.project_id === project.id) || [];
        const objectiveScores = objectives?.map(obj => {
          const score = projectScores.find(s => s.strategic_objective_id === obj.id);
          return {
            objective_id: obj.id,
            objective_name: obj.name,
            category: obj.category,
            alignment_score: score?.alignment_score || null,
            impact_score: score?.impact_score || null,
          };
        });

        const avgAlignment = projectScores.length
          ? projectScores.reduce((acc, s) => acc + s.alignment_score, 0) / projectScores.length
          : 0;

        return {
          project_id: project.id,
          project_name: project.name,
          project_status: project.status,
          scores: objectiveScores,
          average_alignment: Math.round(avgAlignment * 100) / 100,
        };
      });

      return NextResponse.json({ matrix, objectives });
    }

    if (type === 'dashboard') {
      // Get strategic alignment dashboard data
      const [objectivesResult, projectsResult, scoresResult] = await Promise.all([
        supabase
          .from('strategic_objectives')
          .select('id, name, category, priority, status')
          .eq('status', 'active'),
        supabase
          .from('projects')
          .select('id, name, status, budget')
          .in('status', ['active', 'planning', 'in_progress']),
        supabase
          .from('project_alignment_scores')
          .select('*'),
      ]);

      const objectives = objectivesResult.data || [];
      const projects = projectsResult.data || [];
      const scores = scoresResult.data || [];

      // Calculate category alignment
      const categoryAlignment = objectives.reduce((acc: Record<string, { total: number; count: number }>, obj) => {
        const objScores = scores.filter(s => s.strategic_objective_id === obj.id);
        if (!acc[obj.category]) {
          acc[obj.category] = { total: 0, count: 0 };
        }
        objScores.forEach(s => {
          acc[obj.category].total += s.alignment_score;
          acc[obj.category].count += 1;
        });
        return acc;
      }, {});

      const categoryAverages = Object.entries(categoryAlignment).map(([category, data]) => ({
        category,
        average_alignment: data.count > 0 ? Math.round((data.total / data.count) * 100) / 100 : 0,
        project_count: data.count,
      }));

      // Calculate priority distribution
      const priorityDistribution = objectives.reduce((acc: Record<string, number>, obj) => {
        acc[obj.priority] = (acc[obj.priority] || 0) + 1;
        return acc;
      }, {});

      // Top aligned projects
      const projectAlignments = projects.map(project => {
        const projectScores = scores.filter(s => s.project_id === project.id);
        const avgScore = projectScores.length
          ? projectScores.reduce((acc, s) => acc + s.alignment_score, 0) / projectScores.length
          : 0;
        return {
          project_id: project.id,
          project_name: project.name,
          average_alignment: Math.round(avgScore * 100) / 100,
          objectives_linked: projectScores.length,
        };
      }).sort((a, b) => b.average_alignment - a.average_alignment);

      // Unaligned projects (no scores)
      const unalignedProjects = projects.filter(p => 
        !scores.some(s => s.project_id === p.id)
      );

      // Overall alignment health
      const overallAlignment = scores.length
        ? scores.reduce((acc, s) => acc + s.alignment_score, 0) / scores.length
        : 0;

      return NextResponse.json({
        summary: {
          total_objectives: objectives.length,
          total_projects: projects.length,
          scored_relationships: scores.length,
          overall_alignment: Math.round(overallAlignment * 100) / 100,
          alignment_grade: getAlignmentGrade(overallAlignment),
          unaligned_projects: unalignedProjects.length,
        },
        category_alignment: categoryAverages,
        priority_distribution: priorityDistribution,
        top_aligned_projects: projectAlignments.slice(0, 10),
        unaligned_projects: unalignedProjects.map(p => ({ id: p.id, name: p.name })),
      });
    }

    // Default: return objectives summary
    const { data: objectives, error } = await supabase
      .from('strategic_objectives')
      .select('id, name, category, priority, status')
      .eq('status', 'active')
      .order('priority', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ objectives });
  } catch (error: any) {
    console.error('Strategic alignment error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create objective or score
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action; // 'create_objective' | 'score_alignment'

    if (action === 'create_objective') {
      const validated = strategicObjectiveSchema.parse(body.data);

      const { data: objective, error } = await supabase
        .from('strategic_objectives')
        .insert({
          ...validated,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ objective }, { status: 201 });
    }

    if (action === 'score_alignment') {
      const validated = alignmentScoreSchema.parse(body.data);

      // Check if score already exists
      const { data: existing } = await supabase
        .from('project_alignment_scores')
        .select('id')
        .eq('project_id', validated.project_id)
        .eq('strategic_objective_id', validated.strategic_objective_id)
        .single();

      if (existing) {
        // Update existing score
        const { data: score, error } = await supabase
          .from('project_alignment_scores')
          .update({
            ...validated,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;

        return NextResponse.json({ score, updated: true });
      }

      // Create new score
      const { data: score, error } = await supabase
        .from('project_alignment_scores')
        .insert({
          ...validated,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ score }, { status: 201 });
    }

    if (action === 'bulk_score') {
      // Score multiple objectives for a project at once
      const { project_id, scores, scored_by } = body.data;

      const scoreRecords = scores.map((s: any) => ({
        project_id,
        strategic_objective_id: s.objective_id,
        alignment_score: s.alignment_score,
        impact_score: s.impact_score || 50,
        effort_score: s.effort_score || 50,
        risk_score: s.risk_score || 50,
        notes: s.notes,
        scored_by,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      const { data: insertedScores, error } = await supabase
        .from('project_alignment_scores')
        .upsert(scoreRecords, {
          onConflict: 'project_id,strategic_objective_id',
        })
        .select();

      if (error) throw error;

      return NextResponse.json({ scores: insertedScores }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    console.error('Strategic alignment error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH - Update objective or score
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, type, ...updates } = body;

    if (type === 'objective') {
      const { data: objective, error } = await supabase
        .from('strategic_objectives')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ objective });
    }

    if (type === 'score') {
      const { data: score, error } = await supabase
        .from('project_alignment_scores')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ score });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error: any) {
    console.error('Strategic alignment error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Remove objective or score
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const type = searchParams.get('type'); // 'objective' | 'score'

    if (!id || !type) {
      return NextResponse.json({ error: 'id and type are required' }, { status: 400 });
    }

    if (type === 'objective') {
      // Soft delete - set status to archived
      const { error } = await supabase
        .from('strategic_objectives')
        .update({ status: 'archived', updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    } else if (type === 'score') {
      const { error } = await supabase
        .from('project_alignment_scores')
        .delete()
        .eq('id', id);

      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Strategic alignment error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Helper function to get alignment grade
function getAlignmentGrade(score: number): string {
  if (score >= 90) return 'A+';
  if (score >= 85) return 'A';
  if (score >= 80) return 'A-';
  if (score >= 75) return 'B+';
  if (score >= 70) return 'B';
  if (score >= 65) return 'B-';
  if (score >= 60) return 'C+';
  if (score >= 55) return 'C';
  if (score >= 50) return 'C-';
  if (score >= 45) return 'D+';
  if (score >= 40) return 'D';
  return 'F';
}
