import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Fetch site surveys
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');
    const venueId = searchParams.get('venue_id');

    let query = supabase
      .from('site_surveys')
      .select(`
        *,
        project:projects(id, name),
        venue:venues(id, name, address),
        conducted_by:platform_users!conducted_by(id, email, first_name, last_name),
        photos:site_survey_photos(*),
        measurements:site_survey_measurements(*),
        issues:site_survey_issues(*)
      `);

    if (projectId) query = query.eq('project_id', projectId);
    if (venueId) query = query.eq('venue_id', venueId);

    const { data, error } = await query.order('survey_date', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ surveys: data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch surveys' },
      { status: 500 }
    );
  }
}

// POST - Create site survey
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
    const {
      project_id,
      venue_id,
      survey_date,
      survey_type, // 'initial', 'technical', 'safety', 'final'
      attendees,
      venue_contact,
      access_points,
      loading_docks,
      power_specs,
      rigging_points,
      stage_dimensions,
      audience_capacity,
      backstage_areas,
      dressing_rooms,
      catering_facilities,
      parking_info,
      wifi_info,
      safety_notes,
      general_notes,
      photos,
      measurements,
      issues,
    } = body;

    // Create survey
    const { data: survey, error: surveyError } = await supabase
      .from('site_surveys')
      .insert({
        project_id,
        venue_id,
        survey_date: survey_date || new Date().toISOString(),
        survey_type,
        attendees: attendees || [],
        venue_contact,
        access_points: access_points || [],
        loading_docks: loading_docks || [],
        power_specs,
        rigging_points: rigging_points || [],
        stage_dimensions,
        audience_capacity,
        backstage_areas: backstage_areas || [],
        dressing_rooms: dressing_rooms || [],
        catering_facilities,
        parking_info,
        wifi_info,
        safety_notes,
        general_notes,
        status: 'draft',
        conducted_by: user.id,
      })
      .select()
      .single();

    if (surveyError) {
      return NextResponse.json({ error: surveyError.message }, { status: 500 });
    }

    // Add photos
    if (photos && photos.length > 0) {
      const photoRecords = photos.map((photo: any) => ({
        survey_id: survey.id,
        url: photo.url,
        caption: photo.caption,
        category: photo.category,
        location: photo.location,
        taken_at: photo.taken_at || new Date().toISOString(),
      }));

      await supabase.from('site_survey_photos').insert(photoRecords);
    }

    // Add measurements
    if (measurements && measurements.length > 0) {
      const measurementRecords = measurements.map((m: any) => ({
        survey_id: survey.id,
        area: m.area,
        measurement_type: m.measurement_type,
        value: m.value,
        unit: m.unit,
        notes: m.notes,
      }));

      await supabase.from('site_survey_measurements').insert(measurementRecords);
    }

    // Add issues
    if (issues && issues.length > 0) {
      const issueRecords = issues.map((issue: any) => ({
        survey_id: survey.id,
        title: issue.title,
        description: issue.description,
        severity: issue.severity, // 'low', 'medium', 'high', 'critical'
        category: issue.category,
        photo_url: issue.photo_url,
        resolution_required: issue.resolution_required || false,
        status: 'open',
      }));

      await supabase.from('site_survey_issues').insert(issueRecords);
    }

    return NextResponse.json({ survey }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create survey' },
      { status: 500 }
    );
  }
}

// PATCH - Update survey or resolve issues
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

    const body = await request.json();
    const { survey_id, issue_id, action, ...updateData } = body;

    if (issue_id) {
      // Update issue
      const { error } = await supabase
        .from('site_survey_issues')
        .update({
          ...updateData,
          resolved_by: updateData.status === 'resolved' ? user.id : null,
          resolved_at: updateData.status === 'resolved' ? new Date().toISOString() : null,
        })
        .eq('id', issue_id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    if (action === 'finalize') {
      // Check all critical issues are resolved
      const { data: openIssues } = await supabase
        .from('site_survey_issues')
        .select('id')
        .eq('survey_id', survey_id)
        .eq('severity', 'critical')
        .eq('status', 'open');

      if (openIssues && openIssues.length > 0) {
        return NextResponse.json({
          error: 'Cannot finalize: critical issues remain open',
          open_critical_issues: openIssues.length,
        }, { status: 400 });
      }

      await supabase
        .from('site_surveys')
        .update({
          status: 'finalized',
          finalized_at: new Date().toISOString(),
          finalized_by: user.id,
        })
        .eq('id', survey_id);

      return NextResponse.json({ success: true });
    }

    // Default: update survey
    const { error } = await supabase
      .from('site_surveys')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', survey_id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update survey' },
      { status: 500 }
    );
  }
}
