export async function fetchCrew(orgId: string, filters?: { department?: string; availability?: string }) {
  const params = new URLSearchParams({ organization_id: orgId });
  if (filters?.department) params.append('department', filters.department);
  if (filters?.availability) params.append('availability', filters.availability);
  
  const res = await fetch(`/api/crew?${params}`);
  if (!res.ok) throw new Error('Failed to fetch crew');
  return res.json();
}

export async function fetchProjects(orgId: string, filters?: { phase?: string }) {
  const params = new URLSearchParams({ organization_id: orgId });
  if (filters?.phase) params.append('phase', filters.phase);
  
  const res = await fetch(`/api/projects?${params}`);
  if (!res.ok) throw new Error('Failed to fetch projects');
  return res.json();
}

export async function createProject(data: {
  name: string;
  client: string;
  type: string;
  venue: string;
  load_in_date: string;
  event_date: string;
  load_out_date: string;
  budget: number;
  notes?: string;
}) {
  const res = await fetch('/api/projects/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create project');
  return res.json();
}

export async function assignCrew(data: {
  project_id: string;
  crew_ids: string[];
}) {
  const res = await fetch('/api/crew/assign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to assign crew');
  return res.json();
}
