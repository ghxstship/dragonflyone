export async function fetchDeals(orgId: string) {
  const res = await fetch(`/api/deals?organization_id=${orgId}`);
  if (!res.ok) throw new Error('Failed to fetch deals');
  return res.json();
}

export async function fetchProjects(orgId: string) {
  const res = await fetch(`/api/projects?organization_id=${orgId}`);
  if (!res.ok) throw new Error('Failed to fetch projects');
  return res.json();
}

export async function fetchAssets(orgId: string) {
  const res = await fetch(`/api/assets?organization_id=${orgId}`);
  if (!res.ok) throw new Error('Failed to fetch assets');
  return res.json();
}

export async function fetchContacts(orgId: string) {
  const res = await fetch(`/api/contacts?organization_id=${orgId}`);
  if (!res.ok) throw new Error('Failed to fetch contacts');
  return res.json();
}

export async function fetchEmployees(orgId: string) {
  const res = await fetch(`/api/employees?organization_id=${orgId}`);
  if (!res.ok) throw new Error('Failed to fetch employees');
  return res.json();
}
