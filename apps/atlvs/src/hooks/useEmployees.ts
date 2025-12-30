'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// =============================================================================
// EMPLOYEE HOOKS (3NF: legend_people + people_profile_employee)
// =============================================================================

interface Employee {
  id: string;
  user_id: string;
  full_name: string;
  first_name?: string;
  last_name?: string;
  email: string;
  department: string;
  department_id?: string;
  department_name?: string;
  position: string;
  role?: string;
  employment_type: 'full-time' | 'part-time' | 'contractor';
  hire_date: string;
  salary?: number;
  status: 'active' | 'on-leave' | 'on_leave' | 'terminated';
  manager_id?: string;
  created_at: string;
  updated_at: string;
}

// Transform 3NF data to Employee interface
function transformToEmployee(person: Record<string, unknown>): Employee {
  const profile = person.people_profile_employee as Record<string, unknown> | null;
  return {
    id: person.id as string,
    user_id: (person.platform_user_id as string) || '',
    full_name: `${person.first_name || ''} ${person.last_name || ''}`.trim(),
    first_name: person.first_name as string,
    last_name: person.last_name as string,
    email: person.email as string,
    department: (profile?.department_name as string) || '',
    department_id: profile?.department_id as string,
    position: (profile?.position_title as string) || '',
    role: profile?.position_title as string,
    employment_type: (profile?.employment_type as Employee['employment_type']) || 'full-time',
    hire_date: (profile?.hire_date as string) || person.created_at as string,
    salary: profile?.salary as number,
    status: (person.status as Employee['status']) || 'active',
    manager_id: profile?.manager_id as string,
    created_at: person.created_at as string,
    updated_at: person.updated_at as string,
  };
}

// Fetch all employees (3NF: legend_people + people_profile_employee)
export function useEmployees(filters?: { department?: string; status?: string }) {
  return useQuery({
    queryKey: ['employees', filters],
    queryFn: async () => {
      let query = supabase
        .from('legend_people')
        .select('*, people_profile_employee!person_id(*)')
        .not('people_profile_employee', 'is', null)
        .order('first_name', { ascending: true });

      if (filters?.status === 'active') {
        query = query.eq('status', 'active');
      } else if (filters?.status) {
        query = query.eq('status', 'inactive');
      }

      const { data, error } = await query;
      if (error) throw error;
      
      let employees = (data || []).map(transformToEmployee);
      
      if (filters?.department) {
        employees = employees.filter(e => e.department === filters.department);
      }
      
      return employees;
    },
  });
}

// Fetch single employee (3NF: legend_people + people_profile_employee)
export function useEmployee(id: string) {
  return useQuery({
    queryKey: ['employees', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('legend_people')
        .select('*, people_profile_employee!person_id(*)')
        .eq('id', id)
        .single();

      if (error) throw error;
      return transformToEmployee(data);
    },
    enabled: !!id,
  });
}

// Create employee (3NF: legend_people + people_profile_employee)
export function useCreateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (employee: Omit<Employee, 'id' | 'created_at' | 'updated_at'>) => {
      // Create person record - use valid legend_people status
      const status = employee.status === 'active' ? 'active' : 'inactive';
      const { data: person, error: personError } = await supabase
        .from('legend_people')
        .insert({
          organization_id: '00000000-0000-0000-0000-000000000000', // Default org
          first_name: employee.first_name || employee.full_name.split(' ')[0],
          last_name: employee.last_name || employee.full_name.split(' ').slice(1).join(' '),
          email: employee.email,
          platform_user_id: employee.user_id || null,
          status: status as 'active' | 'inactive',
        })
        .select()
        .single();

      if (personError) throw personError;

      // Create employee profile
      const { error: profileError } = await supabase
        .from('people_profile_employee')
        .insert({
          person_id: person.id,
          employment_type: employee.employment_type,
          hire_date: employee.hire_date,
          salary: employee.salary,
        });

      if (profileError) {
        await supabase.from('legend_people').delete().eq('id', person.id);
        throw profileError;
      }

      return person;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
}

// Update employee (3NF: legend_people + people_profile_employee)
export function useUpdateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Employee> & { id: string }) => {
      // Update person record
      const personUpdates: Record<string, unknown> = {};
      if (updates.first_name) personUpdates.first_name = updates.first_name;
      if (updates.last_name) personUpdates.last_name = updates.last_name;
      if (updates.email) personUpdates.email = updates.email;
      if (updates.status) personUpdates.status = updates.status;

      if (Object.keys(personUpdates).length > 0) {
        const { error } = await supabase
          .from('legend_people')
          .update(personUpdates)
          .eq('id', id);
        if (error) throw error;
      }

      // Update employee profile
      const profileUpdates: Record<string, unknown> = {};
      if (updates.employment_type) profileUpdates.employment_type = updates.employment_type;
      if (updates.hire_date) profileUpdates.hire_date = updates.hire_date;
      if (updates.salary) profileUpdates.salary = updates.salary;
      if (updates.position) profileUpdates.position_title = updates.position;
      if (updates.department) profileUpdates.department_name = updates.department;
      if (updates.manager_id) profileUpdates.manager_id = updates.manager_id;

      if (Object.keys(profileUpdates).length > 0) {
        const { error } = await supabase
          .from('people_profile_employee')
          .update(profileUpdates)
          .eq('person_id', id);
        if (error) throw error;
      }

      // Fetch updated record
      const { data, error } = await supabase
        .from('legend_people')
        .select('*, people_profile_employee!person_id(*)')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
}

// Delete employee (3NF: cascades via FK)
export function useDeleteEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('legend_people').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
}
