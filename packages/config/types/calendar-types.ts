// Master Calendar Types and Constants
// Separated from useMasterCalendar hook to allow import in non-React contexts

// Calendar source types
export type CalendarSourceType =
  | 'crm_meeting' | 'crm_call' | 'crm_task' | 'crm_reminder' | 'crm_deadline'
  | 'venue_booking' | 'venue_hold' | 'venue_block' | 'venue_maintenance'
  | 'production_event' | 'production_rehearsal' | 'production_soundcheck'
  | 'production_load_in' | 'production_load_out' | 'production_strike'
  | 'show_performance' | 'show_set_time' | 'show_cue' | 'run_of_show_entry'
  | 'project_milestone' | 'project_deadline' | 'contract_deadline' | 'advancing_deadline'
  | 'crew_shift' | 'crew_assignment' | 'crew_availability'
  | 'external_google' | 'external_outlook' | 'external_apple' | 'external_ical'
  | 'personal' | 'holiday' | 'other';

export type CalendarEventStatus =
  | 'draft' | 'tentative' | 'scheduled' | 'confirmed'
  | 'in_progress' | 'completed' | 'cancelled' | 'no_show';

export type CalendarVisibility = 'public' | 'organization' | 'team' | 'private';

export interface MasterCalendarEvent {
  id: string;
  organization_id: string;
  created_by?: string;
  assigned_to?: string;
  title: string;
  description?: string;
  start_datetime: string;
  end_datetime: string;
  all_day: boolean;
  timezone: string;
  setup_start?: string;
  breakdown_end?: string;
  source_type: CalendarSourceType;
  source_id?: string;
  source_table?: string;
  external_id?: string;
  status: CalendarEventStatus;
  visibility: CalendarVisibility;
  location?: string;
  venue_id?: string;
  space_id?: string;
  is_virtual: boolean;
  meeting_url?: string;
  meeting_provider?: string;
  event_id?: string;
  project_id?: string;
  production_id?: string;
  contact_id?: string;
  deal_id?: string;
  booking_id?: string;
  attendees?: Array<{
    user_id?: string;
    email: string;
    name?: string;
    response_status?: 'pending' | 'accepted' | 'declined' | 'tentative';
  }>;
  guest_count?: number;
  linked_contact?: string;
  linked_deal?: string;
  department?: string;
  responsible?: string;
  cue_number?: string;
  cue_type?: string;
  artist_id?: string;
  artist_name?: string;
  stage?: string;
  is_recurring: boolean;
  recurrence_rule?: string;
  recurrence_parent_id?: string;
  recurrence_exception_dates?: string[];
  reminder_minutes?: number[];
  color?: string;
  icon?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  notes?: string;
  internal_notes?: string;
  last_synced_at?: string;
  sync_status: string;
  sync_error?: string;
  sync_version: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  // Joined relations
  venue?: { id: string; name: string };
  space?: { id: string; name: string };
  project?: { id: string; name: string };
  production?: { id: string; name: string };
  contact?: { id: string; first_name: string; last_name: string; email: string };
  creator?: { id: string; email: string };
  assignee?: { id: string; email: string };
}

export interface MasterCalendarFilters {
  start_date?: string;
  end_date?: string;
  source_types?: CalendarSourceType[];
  venue_id?: string;
  project_id?: string;
  production_id?: string;
  status?: CalendarEventStatus[];
  visibility?: CalendarVisibility;
  assigned_to?: string;
  limit?: number;
  offset?: number;
}

// Source type display labels
export const SOURCE_TYPE_LABELS: Record<CalendarSourceType, string> = {
  crm_meeting: 'Meeting',
  crm_call: 'Call',
  crm_task: 'Task',
  crm_reminder: 'Reminder',
  crm_deadline: 'Deadline',
  venue_booking: 'Venue Booking',
  venue_hold: 'Hold',
  venue_block: 'Block',
  venue_maintenance: 'Maintenance',
  production_event: 'Production Event',
  production_rehearsal: 'Rehearsal',
  production_soundcheck: 'Soundcheck',
  production_load_in: 'Load In',
  production_load_out: 'Load Out',
  production_strike: 'Strike',
  show_performance: 'Performance',
  show_set_time: 'Set Time',
  show_cue: 'Cue',
  run_of_show_entry: 'Run of Show',
  project_milestone: 'Milestone',
  project_deadline: 'Project Deadline',
  contract_deadline: 'Contract Deadline',
  advancing_deadline: 'Advancing Deadline',
  crew_shift: 'Crew Shift',
  crew_assignment: 'Assignment',
  crew_availability: 'Availability',
  external_google: 'Google Calendar',
  external_outlook: 'Outlook',
  external_apple: 'Apple Calendar',
  external_ical: 'iCal',
  personal: 'Personal',
  holiday: 'Holiday',
  other: 'Other',
};

// Source type colors for UI
export const SOURCE_TYPE_COLORS: Record<CalendarSourceType, string> = {
  crm_meeting: 'bg-blue-500',
  crm_call: 'bg-green-500',
  crm_task: 'bg-yellow-500',
  crm_reminder: 'bg-orange-500',
  crm_deadline: 'bg-red-500',
  venue_booking: 'bg-purple-500',
  venue_hold: 'bg-purple-300',
  venue_block: 'bg-muted',
  venue_maintenance: 'bg-muted',
  production_event: 'bg-primary',
  production_rehearsal: 'bg-primary/80',
  production_soundcheck: 'bg-primary/60',
  production_load_in: 'bg-accent',
  production_load_out: 'bg-accent/80',
  production_strike: 'bg-accent/60',
  show_performance: 'bg-secondary',
  show_set_time: 'bg-secondary/80',
  show_cue: 'bg-secondary/60',
  run_of_show_entry: 'bg-secondary/40',
  project_milestone: 'bg-info',
  project_deadline: 'bg-error',
  contract_deadline: 'bg-error/80',
  advancing_deadline: 'bg-warning',
  crew_shift: 'bg-teal-500',
  crew_assignment: 'bg-teal-400',
  crew_availability: 'bg-teal-300',
  external_google: 'bg-blue-600',
  external_outlook: 'bg-blue-700',
  external_apple: 'bg-muted',
  external_ical: 'bg-muted',
  personal: 'bg-pink-500',
  holiday: 'bg-red-400',
  other: 'bg-muted',
};

// Status labels
export const STATUS_LABELS: Record<CalendarEventStatus, string> = {
  draft: 'Draft',
  tentative: 'Tentative',
  scheduled: 'Scheduled',
  confirmed: 'Confirmed',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
  no_show: 'No Show',
};

// Status colors
export const STATUS_COLORS: Record<CalendarEventStatus, string> = {
  draft: 'bg-muted',
  tentative: 'bg-yellow-400',
  scheduled: 'bg-blue-400',
  confirmed: 'bg-green-500',
  in_progress: 'bg-primary',
  completed: 'bg-success',
  cancelled: 'bg-error',
  no_show: 'bg-error/60',
};
