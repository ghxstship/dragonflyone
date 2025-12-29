'use client';

/**
 * Unified People Query Hook
 * Single source of truth for all person types: contacts, employees, crew, artists, volunteers, candidates
 * Maps to legend_people table with profile extension joins
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createBrowserClient } from '@supabase/ssr';

const createClient = () => createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Person types based on profile extensions
export type PersonType = 'all' | 'contact' | 'employee' | 'crew' | 'artist' | 'volunteer' | 'candidate';

export interface Person {
  id: string;
  organization_id: string;
  first_name: string;
  last_name: string;
  display_name: string;
  preferred_name: string | null;
  email: string | null;
  phone: string | null;
  mobile: string | null;
  avatar_url: string | null;
  bio: string | null;
  title: string | null;
  platform_user_id: string | null;
  status: 'active' | 'inactive' | 'pending' | 'archived' | 'draft';
  tags: string[];
  metadata: Record<string, unknown>;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Computed fields for unified view
  person_types: PersonType[];
  primary_type: PersonType;
  company?: string;
  // Profile data (loaded on detail view)
  employee_profile?: EmployeeProfile | null;
  crew_profile?: CrewProfile | null;
  artist_profile?: ArtistProfile | null;
  contact_profile?: ContactProfile | null;
  volunteer_profile?: VolunteerProfile | null;
  candidate_profile?: CandidateProfile | null;
}

export interface EmployeeProfile {
  id: string;
  person_id: string;
  employee_number: string | null;
  hire_date: string | null;
  termination_date: string | null;
  employment_type: 'full_time' | 'part_time' | 'contract' | 'intern' | 'temp' | null;
  position_id: string | null;
  department_id: string | null;
  team_id: string | null;
  manager_id: string | null;
  salary: number | null;
  salary_currency: string;
  pay_frequency: 'hourly' | 'weekly' | 'biweekly' | 'monthly' | 'annual' | null;
  work_location_id: string | null;
  is_remote: boolean;
}

export interface CrewProfile {
  id: string;
  person_id: string;
  crew_type: string | null;
  department: string | null;
  position: string | null;
  skills: string[];
  certifications: unknown[];
  union_affiliation: string | null;
  union_local: string | null;
  hourly_rate: number | null;
  day_rate: number | null;
  overtime_rate: number | null;
  rate_currency: string;
  availability_status: string;
  travel_willing: boolean;
  equipment_owned: unknown[];
  portfolio_url: string | null;
  rating: number | null;
  rating_count: number;
}

export interface ArtistProfile {
  id: string;
  person_id: string;
  stage_name: string | null;
  artist_type: string | null;
  genres: string[];
  bio_short: string | null;
  bio_long: string | null;
  hometown: string | null;
  country: string | null;
  website: string | null;
  spotify_url: string | null;
  instagram_handle: string | null;
  booking_email: string | null;
  management_company: string | null;
  performance_fee_min: number | null;
  performance_fee_max: number | null;
  fee_currency: string;
  is_verified: boolean;
}

export interface ContactProfile {
  id: string;
  person_id: string;
  contact_type: string | null;
  company: string | null;
  job_title: string | null;
  department: string | null;
  source: string | null;
  lead_status: string | null;
  lead_score: number | null;
  last_contacted_at: string | null;
  next_follow_up_at: string | null;
  preferred_contact_method: string | null;
  do_not_contact: boolean;
  subscribed_to_newsletter: boolean;
  subscribed_to_marketing: boolean;
  linkedin_url: string | null;
  lifetime_value: number | null;
}

export interface VolunteerProfile {
  id: string;
  person_id: string;
  volunteer_type: string | null;
  skills: string[];
  interests: string[];
  t_shirt_size: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  background_check_status: string | null;
  total_hours_volunteered: number;
  events_volunteered: number;
  rating: number | null;
}

export interface CandidateProfile {
  id: string;
  person_id: string;
  application_date: string | null;
  position_applied: string | null;
  resume_url: string | null;
  current_stage: string;
  expected_salary_min: number | null;
  expected_salary_max: number | null;
  available_start_date: string | null;
  willing_to_relocate: boolean;
  years_experience: number | null;
}

export interface PeopleFilters {
  search?: string;
  type?: PersonType;
  status?: string;
  tags?: string[];
  organizationId?: string;
}

// Query keys
export const peopleKeys = {
  all: ['people'] as const,
  lists: () => [...peopleKeys.all, 'list'] as const,
  list: (filters: PeopleFilters) => [...peopleKeys.lists(), filters] as const,
  details: () => [...peopleKeys.all, 'detail'] as const,
  detail: (id: string) => [...peopleKeys.details(), id] as const,
  profiles: (id: string) => [...peopleKeys.detail(id), 'profiles'] as const,
};

// Fetch people with optional type filtering
async function fetchPeople(filters: PeopleFilters): Promise<Person[]> {
  const supabase = createClient();
  
  // Base query with profile existence checks
  let query = supabase
    .from('legend_people')
    .select(`
      *,
      people_profile_contact(id),
      people_profile_employee(id),
      people_profile_crew(id),
      people_profile_artist(id),
      people_profile_volunteer(id),
      people_profile_candidate(id)
    `)
    .order('display_name', { ascending: true });

  if (filters.organizationId) {
    query = query.eq('organization_id', filters.organizationId);
  }

  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  if (filters.tags && filters.tags.length > 0) {
    query = query.contains('tags', filters.tags);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  // Transform data to include computed fields
  let people = (data || []).map((person: Record<string, unknown>) => {
    const types: PersonType[] = [];
    
    if (person.people_profile_contact) types.push('contact');
    if (person.people_profile_employee) types.push('employee');
    if (person.people_profile_crew) types.push('crew');
    if (person.people_profile_artist) types.push('artist');
    if (person.people_profile_volunteer) types.push('volunteer');
    if (person.people_profile_candidate) types.push('candidate');
    
    // Default to contact if no profiles
    if (types.length === 0) types.push('contact');

    return {
      id: person.id as string,
      organization_id: person.organization_id as string,
      first_name: person.first_name as string,
      last_name: person.last_name as string,
      display_name: person.display_name as string,
      preferred_name: person.preferred_name as string | null,
      email: person.email as string | null,
      phone: person.phone as string | null,
      mobile: person.mobile as string | null,
      avatar_url: person.avatar_url as string | null,
      bio: person.bio as string | null,
      title: person.title as string | null,
      platform_user_id: person.platform_user_id as string | null,
      status: person.status as Person['status'],
      tags: (person.tags as string[]) || [],
      metadata: (person.metadata as Record<string, unknown>) || {},
      notes: person.notes as string | null,
      created_at: person.created_at as string,
      updated_at: person.updated_at as string,
      person_types: types,
      primary_type: types[0],
    } as Person;
  });

  // Filter by type if specified
  if (filters.type && filters.type !== 'all') {
    people = people.filter(p => p.person_types.includes(filters.type!));
  }

  // Client-side search filtering
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    people = people.filter(person => 
      person.display_name.toLowerCase().includes(searchLower) ||
      (person.email && person.email.toLowerCase().includes(searchLower)) ||
      (person.title && person.title.toLowerCase().includes(searchLower))
    );
  }

  return people;
}

// Fetch single person with all profiles
async function fetchPerson(id: string): Promise<Person> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('legend_people')
    .select(`
      *,
      people_profile_contact(*),
      people_profile_employee(*),
      people_profile_crew(*),
      people_profile_artist(*),
      people_profile_volunteer(*),
      people_profile_candidate(*)
    `)
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const types: PersonType[] = [];
  if (data.people_profile_contact) types.push('contact');
  if (data.people_profile_employee) types.push('employee');
  if (data.people_profile_crew) types.push('crew');
  if (data.people_profile_artist) types.push('artist');
  if (data.people_profile_volunteer) types.push('volunteer');
  if (data.people_profile_candidate) types.push('candidate');
  if (types.length === 0) types.push('contact');

  return {
    ...data,
    person_types: types,
    primary_type: types[0],
    contact_profile: data.people_profile_contact,
    employee_profile: data.people_profile_employee,
    crew_profile: data.people_profile_crew,
    artist_profile: data.people_profile_artist,
    volunteer_profile: data.people_profile_volunteer,
    candidate_profile: data.people_profile_candidate,
  } as Person;
}

// Create person
interface CreatePersonInput {
  organization_id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  mobile?: string;
  title?: string;
  bio?: string;
  status?: Person['status'];
  tags?: string[];
  notes?: string;
  // Initial profile type
  initial_type?: PersonType;
}

async function createPerson(input: CreatePersonInput): Promise<Person> {
  const supabase = createClient();
  
  const { initial_type, ...personData } = input;
  
  const { data, error } = await supabase
    .from('legend_people')
    .insert(personData)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  // Create initial profile if specified
  if (initial_type && initial_type !== 'all') {
    const profileTable = `people_profile_${initial_type}`;
    await supabase
      .from(profileTable)
      .insert({ person_id: data.id });
  }

  return {
    ...data,
    person_types: [initial_type || 'contact'],
    primary_type: initial_type || 'contact',
  } as Person;
}

// Update person
interface UpdatePersonInput {
  id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  title?: string;
  bio?: string;
  status?: Person['status'];
  tags?: string[];
  notes?: string;
}

async function updatePerson(input: UpdatePersonInput): Promise<Person> {
  const supabase = createClient();
  
  const { id, ...updates } = input;
  
  const { data, error } = await supabase
    .from('legend_people')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Person;
}

// Delete person
async function deletePerson(id: string): Promise<void> {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('legend_people')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
}

// Add profile to person
async function addProfile(personId: string, profileType: PersonType): Promise<void> {
  if (profileType === 'all') return;
  
  const supabase = createClient();
  const profileTable = `people_profile_${profileType}`;
  
  const { error } = await supabase
    .from(profileTable)
    .insert({ person_id: personId });

  if (error && !error.message.includes('duplicate')) {
    throw new Error(error.message);
  }
}

// Remove profile from person
async function removeProfile(personId: string, profileType: PersonType): Promise<void> {
  if (profileType === 'all') return;
  
  const supabase = createClient();
  const profileTable = `people_profile_${profileType}`;
  
  const { error } = await supabase
    .from(profileTable)
    .delete()
    .eq('person_id', personId);

  if (error) {
    throw new Error(error.message);
  }
}

// ============================================================================
// HOOKS
// ============================================================================

// List people with filters
export function usePeopleQuery(filters: PeopleFilters = {}) {
  return useQuery({
    queryKey: peopleKeys.list(filters),
    queryFn: () => fetchPeople(filters),
    staleTime: 60000, // 1 minute
  });
}

// Get single person with all profiles
export function usePersonQuery(id: string) {
  return useQuery({
    queryKey: peopleKeys.detail(id),
    queryFn: () => fetchPerson(id),
    enabled: !!id,
  });
}

// Create person mutation
export function useCreatePerson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPerson,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: peopleKeys.all });
    },
  });
}

// Update person mutation
export function useUpdatePerson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePerson,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: peopleKeys.all });
      queryClient.setQueryData(peopleKeys.detail(data.id), data);
    },
  });
}

// Delete person mutation
export function useDeletePerson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePerson,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: peopleKeys.all });
    },
  });
}

// Add profile mutation
export function useAddProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ personId, profileType }: { personId: string; profileType: PersonType }) =>
      addProfile(personId, profileType),
    onSuccess: (_, { personId }) => {
      queryClient.invalidateQueries({ queryKey: peopleKeys.detail(personId) });
      queryClient.invalidateQueries({ queryKey: peopleKeys.lists() });
    },
  });
}

// Remove profile mutation
export function useRemoveProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ personId, profileType }: { personId: string; profileType: PersonType }) =>
      removeProfile(personId, profileType),
    onSuccess: (_, { personId }) => {
      queryClient.invalidateQueries({ queryKey: peopleKeys.detail(personId) });
      queryClient.invalidateQueries({ queryKey: peopleKeys.lists() });
    },
  });
}

// Stats hook
export function usePeopleStats(filters: PeopleFilters = {}) {
  const { data: people = [] } = usePeopleQuery(filters);
  
  return {
    total: people.length,
    active: people.filter(p => p.status === 'active').length,
    inactive: people.filter(p => p.status === 'inactive').length,
    pending: people.filter(p => p.status === 'pending').length,
    byType: {
      contact: people.filter(p => p.person_types.includes('contact')).length,
      employee: people.filter(p => p.person_types.includes('employee')).length,
      crew: people.filter(p => p.person_types.includes('crew')).length,
      artist: people.filter(p => p.person_types.includes('artist')).length,
      volunteer: people.filter(p => p.person_types.includes('volunteer')).length,
      candidate: people.filter(p => p.person_types.includes('candidate')).length,
    },
  };
}
