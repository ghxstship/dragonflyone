import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../supabase-types';

type Tables = Database['public']['Tables'];

// Type exports
export type LegendOrganization = Tables['legend_organizations']['Row'];
export type LegendPerson = Tables['legend_people']['Row'];
export type LegendPlace = Tables['legend_places']['Row'];
export type LegendEvent = Tables['legend_events']['Row'];
export type OrgsProfileVendor = Tables['orgs_profile_vendor']['Row'];
export type PeopleProfileEmployee = Tables['people_profile_employee']['Row'];
export type PeopleProfileCrew = Tables['people_profile_crew']['Row'];
export type PeopleProfileArtist = Tables['people_profile_artist']['Row'];
export type PlacesProfileVenue = Tables['places_profile_venue']['Row'];
export type EventsProfileActivation = Tables['events_profile_activation']['Row'];

// Query builders
export function vendorsQuery(supabase: SupabaseClient<Database>) {
  return supabase
    .from('legend_organizations')
    .select('*, orgs_profile_vendor!org_id(*)')
    .eq('org_type', 'vendor');
}

export function employeesQuery(supabase: SupabaseClient<Database>) {
  return supabase
    .from('legend_people')
    .select('*, people_profile_employee!person_id(*)');
}

export function crewQuery(supabase: SupabaseClient<Database>) {
  return supabase
    .from('legend_people')
    .select('*, people_profile_crew!person_id(*)');
}

export function artistsQuery(supabase: SupabaseClient<Database>) {
  return supabase
    .from('legend_people')
    .select('*, people_profile_artist!person_id(*)');
}

export function venuesQuery(supabase: SupabaseClient<Database>) {
  return supabase
    .from('legend_places')
    .select('*, places_profile_venue!place_id(*)')
    .eq('place_type', 'venue');
}

export function eventsQuery(supabase: SupabaseClient<Database>) {
  return supabase.from('legend_events').select('*');
}

export function productionsQuery(supabase: SupabaseClient<Database>) {
  return supabase
    .from('legend_events')
    .select('*')
    .eq('event_type', 'production');
}

export function activationsQuery(supabase: SupabaseClient<Database>) {
  return supabase
    .from('legend_events')
    .select('*, events_profile_activation!event_id(*)')
    .eq('event_type', 'activation');
}

// Constants
export const ORG_TYPES = {
  vendor: 'vendor',
  sponsor: 'sponsor',
  client: 'client',
  partner: 'partner',
  agency: 'agency',
} as const;

export const EVENT_TYPES = {
  event: 'event',
  production: 'production',
  show: 'show',
  activation: 'activation',
  meeting: 'meeting',
} as const;

export const PLACE_TYPES = {
  venue: 'venue',
  warehouse: 'warehouse',
  office: 'office',
} as const;
