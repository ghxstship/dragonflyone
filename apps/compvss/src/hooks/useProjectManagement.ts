'use client';

import { useState, useCallback } from 'react';

export interface Project {
  id: string;
  name: string;
  code: string;
  phase: string;
  budget: number;
  crew_count?: number;
  start_date?: string;
  event_date?: string;
}

export interface ProjectFilters {
  phase: string;
  searchQuery: string;
  sortBy: 'name' | 'budget' | 'event_date';
  sortOrder: 'asc' | 'desc';
}

export function useProjectManagement(initialProjects: Project[] = []) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [filters, setFilters] = useState<ProjectFilters>({
    phase: 'all',
    searchQuery: '',
    sortBy: 'event_date',
    sortOrder: 'asc',
  });
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const filteredProjects = projects.filter(project => {
    const matchesPhase = filters.phase === 'all' || project.phase === filters.phase;
    const matchesSearch = 
      filters.searchQuery === '' ||
      project.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
      project.code.toLowerCase().includes(filters.searchQuery.toLowerCase());

    return matchesPhase && matchesSearch;
  }).sort((a, b) => {
    let comparison = 0;

    switch (filters.sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'budget':
        comparison = a.budget - b.budget;
        break;
      case 'event_date':
        if (a.event_date && b.event_date) {
          comparison = new Date(a.event_date).getTime() - new Date(b.event_date).getTime();
        }
        break;
    }

    return filters.sortOrder === 'asc' ? comparison : -comparison;
  });

  const addProject = useCallback((project: Project) => {
    setProjects(prev => [...prev, project]);
  }, []);

  const updateProject = useCallback((id: string, updates: Partial<Project>) => {
    setProjects(prev =>
      prev.map(project =>
        project.id === id ? { ...project, ...updates } : project
      )
    );
  }, []);

  const deleteProject = useCallback((id: string) => {
    setProjects(prev => prev.filter(project => project.id !== id));
  }, []);

  const updateFilter = useCallback((key: keyof ProjectFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const getProjectStats = useCallback(() => {
    const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
    const activeProjects = projects.filter(p => p.phase === 'active').length;
    const avgBudget = projects.length > 0 ? totalBudget / projects.length : 0;

    return {
      totalProjects: projects.length,
      activeProjects,
      totalBudget,
      avgBudget,
    };
  }, [projects]);

  return {
    projects: filteredProjects,
    allProjects: projects,
    filters,
    selectedProject,
    setSelectedProject,
    addProject,
    updateProject,
    deleteProject,
    updateFilter,
    stats: getProjectStats(),
  };
}
