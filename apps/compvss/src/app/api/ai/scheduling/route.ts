import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

function getSupabaseClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(supabaseUrl, supabaseKey);
}

interface CrewMember {
  id: string;
  name: string;
  skills: string[];
  availability: string[];
  hourly_rate: number;
  rating: number;
  location: string;
}

interface Shift {
  id: string;
  project_id: string;
  role: string;
  required_skills: string[];
  start_time: string;
  end_time: string;
  location: string;
}

interface Assignment {
  shift_id: string;
  crew_id: string;
  score: number;
  reasons: string[];
}

// GET /api/ai/scheduling - AI-powered scheduling optimization
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const projectId = searchParams.get('project_id');

    if (action === 'optimize' && projectId) {
      // Get project shifts
      const { data: shifts } = await supabase
        .from('project_shifts')
        .select('*')
        .eq('project_id', projectId)
        .eq('status', 'open')
        .order('start_time');

      // Get available crew
      const { data: crew } = await supabase
        .from('crew_profiles')
        .select(`
          id, user_id, skills, hourly_rate, location,
          user:platform_users!user_id(first_name, last_name),
          performance:crew_performance_summary(average_rating)
        `)
        .eq('is_available', true);

      // Get crew availability
      const { data: availability } = await supabase
        .from('crew_availability')
        .select('crew_id, available_date, start_time, end_time')
        .in('crew_id', crew?.map(c => c.id) || []);

      // Build availability map
      const availabilityMap: Record<string, string[]> = {};
      availability?.forEach(a => {
        if (!availabilityMap[a.crew_id]) availabilityMap[a.crew_id] = [];
        availabilityMap[a.crew_id].push(a.available_date);
      });

      // Transform crew data
      const crewMembers: CrewMember[] = (crew || []).map(c => ({
        id: c.id,
        name: `${(c.user as any)?.first_name} ${(c.user as any)?.last_name}`,
        skills: c.skills || [],
        availability: availabilityMap[c.id] || [],
        hourly_rate: c.hourly_rate || 0,
        rating: (c.performance as any)?.average_rating || 3,
        location: c.location || '',
      }));

      // Optimize assignments
      const assignments = optimizeSchedule(shifts || [], crewMembers);

      // Calculate metrics
      const metrics = calculateScheduleMetrics(assignments, shifts || [], crewMembers);

      return NextResponse.json({
        assignments,
        metrics,
        unassigned_shifts: shifts?.filter(s => !assignments.find(a => a.shift_id === s.id)).length || 0,
      });
    }

    if (action === 'conflicts') {
      // Detect scheduling conflicts
      const { data: assignments } = await supabase
        .from('crew_assignments')
        .select(`
          id, crew_id, start_time, end_time,
          project:compvss_projects(name)
        `)
        .gte('start_time', new Date().toISOString());

      const conflicts = detectConflicts(assignments || []);

      return NextResponse.json({ conflicts });
    }

    if (action === 'recommendations' && projectId) {
      // Get shift requirements
      const { data: shifts } = await supabase
        .from('project_shifts')
        .select('*')
        .eq('project_id', projectId)
        .eq('status', 'open');

      // Get top crew for each shift
      const recommendations = [];

      for (const shift of shifts || []) {
        const { data: matchingCrew } = await supabase
          .from('crew_profiles')
          .select(`
            id, skills, hourly_rate,
            user:platform_users!user_id(first_name, last_name),
            performance:crew_performance_summary(average_rating)
          `)
          .eq('is_available', true)
          .contains('skills', shift.required_skills || [])
          .limit(5);

        recommendations.push({
          shift_id: shift.id,
          shift_role: shift.role,
          recommended_crew: matchingCrew?.map(c => ({
            crew_id: c.id,
            name: `${(c.user as any)?.first_name} ${(c.user as any)?.last_name}`,
            match_score: calculateMatchScore(c, shift),
            rating: (c.performance as any)?.average_rating || 0,
            hourly_rate: c.hourly_rate,
          })).sort((a, b) => b.match_score - a.match_score) || [],
        });
      }

      return NextResponse.json({ recommendations });
    }

    if (action === 'workload_balance') {
      // Analyze crew workload distribution
      const { data: assignments } = await supabase
        .from('crew_assignments')
        .select(`
          crew_id, start_time, end_time,
          crew:platform_users!crew_id(first_name, last_name)
        `)
        .gte('start_time', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .lte('start_time', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString());

      // Calculate hours per crew
      const workload: Record<string, { name: string; hours: number; shifts: number }> = {};

      assignments?.forEach(a => {
        if (!workload[a.crew_id]) {
          workload[a.crew_id] = {
            name: `${(a.crew as any)?.first_name} ${(a.crew as any)?.last_name}`,
            hours: 0,
            shifts: 0,
          };
        }

        const hours = (new Date(a.end_time).getTime() - new Date(a.start_time).getTime()) / (1000 * 60 * 60);
        workload[a.crew_id].hours += hours;
        workload[a.crew_id].shifts++;
      });

      const workloadArray = Object.entries(workload).map(([id, data]) => ({
        crew_id: id,
        ...data,
      }));

      const avgHours = workloadArray.length > 0
        ? workloadArray.reduce((sum, w) => sum + w.hours, 0) / workloadArray.length
        : 0;

      return NextResponse.json({
        workload: workloadArray.sort((a, b) => b.hours - a.hours),
        average_hours: avgHours,
        overworked: workloadArray.filter(w => w.hours > avgHours * 1.5),
        underutilized: workloadArray.filter(w => w.hours < avgHours * 0.5),
      });
    }

    if (action === 'forecast_needs') {
      // Forecast staffing needs based on upcoming projects
      const { data: projects } = await supabase
        .from('compvss_projects')
        .select('id, name, start_date, end_date, crew_size, status')
        .in('status', ['planned', 'active'])
        .gte('start_date', new Date().toISOString())
        .lte('start_date', new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString());

      // Group by week
      const weeklyNeeds: Record<string, { projects: number; crew_needed: number }> = {};

      projects?.forEach(p => {
        const week = getWeekKey(new Date(p.start_date));
        if (!weeklyNeeds[week]) weeklyNeeds[week] = { projects: 0, crew_needed: 0 };
        weeklyNeeds[week].projects++;
        weeklyNeeds[week].crew_needed += p.crew_size || 5;
      });

      // Get available crew count
      const { count: availableCrew } = await supabase
        .from('crew_profiles')
        .select('id', { count: 'exact' })
        .eq('is_available', true);

      return NextResponse.json({
        weekly_forecast: Object.entries(weeklyNeeds).map(([week, data]) => ({
          week,
          ...data,
          gap: Math.max(0, data.crew_needed - (availableCrew || 0)),
        })),
        total_available_crew: availableCrew || 0,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to optimize schedule' }, { status: 500 });
  }
}

// POST /api/ai/scheduling - Apply optimized schedule
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const action = body.action || 'apply';

    if (action === 'apply') {
      const { assignments, project_id } = body;

      // Create assignments
      const assignmentRecords = assignments.map((a: Assignment) => ({
        project_id,
        shift_id: a.shift_id,
        crew_id: a.crew_id,
        status: 'assigned',
        assigned_by: user.id,
        assignment_score: a.score,
      }));

      const { data: created, error } = await supabase
        .from('crew_assignments')
        .insert(assignmentRecords)
        .select();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Update shift statuses
      const shiftIds = assignments.map((a: Assignment) => a.shift_id);
      await supabase
        .from('project_shifts')
        .update({ status: 'filled' })
        .in('id', shiftIds);

      // Notify crew members
      for (const assignment of assignments) {
        await supabase.from('unified_notifications').insert({
          user_id: assignment.crew_id,
          title: 'New Shift Assignment',
          message: 'You have been assigned to a new shift',
          type: 'info',
          priority: 'normal',
          source_platform: 'compvss',
          source_entity_type: 'shift_assignment',
          source_entity_id: assignment.shift_id,
        });
      }

      return NextResponse.json({
        created: created?.length || 0,
        assignments: created,
      });
    } else if (action === 'swap') {
      const { assignment1_id, assignment2_id } = body;

      // Get both assignments
      const { data: assignments } = await supabase
        .from('crew_assignments')
        .select('*')
        .in('id', [assignment1_id, assignment2_id]);

      if (!assignments || assignments.length !== 2) {
        return NextResponse.json({ error: 'Assignments not found' }, { status: 404 });
      }

      // Swap crew members
      await supabase
        .from('crew_assignments')
        .update({ crew_id: assignments[1].crew_id })
        .eq('id', assignment1_id);

      await supabase
        .from('crew_assignments')
        .update({ crew_id: assignments[0].crew_id })
        .eq('id', assignment2_id);

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to apply schedule' }, { status: 500 });
  }
}

// Optimization algorithm using Hungarian method approximation
function optimizeSchedule(shifts: Shift[], crew: CrewMember[]): Assignment[] {
  const assignments: Assignment[] = [];
  const assignedCrew = new Set<string>();
  const assignedShifts = new Set<string>();

  // Sort shifts by start time
  const sortedShifts = [...shifts].sort((a, b) =>
    new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  );

  for (const shift of sortedShifts) {
    if (assignedShifts.has(shift.id)) continue;

    // Score all available crew for this shift
    const scores: { crew: CrewMember; score: number; reasons: string[] }[] = [];

    for (const member of crew) {
      if (assignedCrew.has(member.id)) continue;

      const { score, reasons } = scoreCrewForShift(member, shift);
      if (score > 0) {
        scores.push({ crew: member, score, reasons });
      }
    }

    // Sort by score and assign best match
    scores.sort((a, b) => b.score - a.score);

    if (scores.length > 0) {
      const best = scores[0];
      assignments.push({
        shift_id: shift.id,
        crew_id: best.crew.id,
        score: best.score,
        reasons: best.reasons,
      });
      assignedCrew.add(best.crew.id);
      assignedShifts.add(shift.id);
    }
  }

  return assignments;
}

function scoreCrewForShift(crew: CrewMember, shift: Shift): { score: number; reasons: string[] } {
  let score = 50; // Base score
  const reasons: string[] = [];

  // Skill match (0-30 points)
  const requiredSkills = shift.required_skills || [];
  const matchedSkills = requiredSkills.filter(s => crew.skills.includes(s));
  const skillScore = requiredSkills.length > 0
    ? (matchedSkills.length / requiredSkills.length) * 30
    : 15;
  score += skillScore;
  if (matchedSkills.length === requiredSkills.length) {
    reasons.push('All required skills matched');
  }

  // Rating bonus (0-15 points)
  const ratingScore = (crew.rating / 5) * 15;
  score += ratingScore;
  if (crew.rating >= 4.5) {
    reasons.push('Top-rated crew member');
  }

  // Location proximity (0-10 points)
  if (crew.location === shift.location) {
    score += 10;
    reasons.push('Same location');
  }

  // Availability check
  const shiftDate = new Date(shift.start_time).toISOString().slice(0, 10);
  if (!crew.availability.includes(shiftDate)) {
    score = 0; // Not available
  }

  return { score: Math.round(score), reasons };
}

function calculateMatchScore(crew: any, shift: any): number {
  let score = 50;

  const requiredSkills = shift.required_skills || [];
  const crewSkills = crew.skills || [];
  const matchedSkills = requiredSkills.filter((s: string) => crewSkills.includes(s));

  score += requiredSkills.length > 0 ? (matchedSkills.length / requiredSkills.length) * 30 : 15;
  score += ((crew.performance as any)?.average_rating || 3) / 5 * 20;

  return Math.round(score);
}

function calculateScheduleMetrics(assignments: Assignment[], shifts: Shift[], crew: CrewMember[]): any {
  const totalShifts = shifts.length;
  const assignedShifts = assignments.length;
  const avgScore = assignments.length > 0
    ? assignments.reduce((sum, a) => sum + a.score, 0) / assignments.length
    : 0;

  const uniqueCrew = new Set(assignments.map(a => a.crew_id)).size;

  return {
    fill_rate: totalShifts > 0 ? Math.round((assignedShifts / totalShifts) * 100) : 0,
    average_match_score: Math.round(avgScore),
    crew_utilized: uniqueCrew,
    total_crew_available: crew.length,
  };
}

function detectConflicts(assignments: any[]): any[] {
  const conflicts: any[] = [];
  const crewAssignments: Record<string, any[]> = {};

  assignments.forEach(a => {
    if (!crewAssignments[a.crew_id]) crewAssignments[a.crew_id] = [];
    crewAssignments[a.crew_id].push(a);
  });

  Object.entries(crewAssignments).forEach(([crewId, crewShifts]) => {
    for (let i = 0; i < crewShifts.length; i++) {
      for (let j = i + 1; j < crewShifts.length; j++) {
        const a = crewShifts[i];
        const b = crewShifts[j];

        const aStart = new Date(a.start_time).getTime();
        const aEnd = new Date(a.end_time).getTime();
        const bStart = new Date(b.start_time).getTime();
        const bEnd = new Date(b.end_time).getTime();

        if ((aStart < bEnd && aEnd > bStart)) {
          conflicts.push({
            crew_id: crewId,
            assignment1: a,
            assignment2: b,
            type: 'overlap',
          });
        }
      }
    }
  });

  return conflicts;
}

function getWeekKey(date: Date): string {
  const year = date.getFullYear();
  const oneJan = new Date(year, 0, 1);
  const weekNum = Math.ceil(((date.getTime() - oneJan.getTime()) / 86400000 + oneJan.getDay() + 1) / 7);
  return `${year}-W${weekNum.toString().padStart(2, '0')}`;
}
