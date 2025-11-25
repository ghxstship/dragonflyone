# Hook Integration Examples

**Purpose:** Practical examples showing how to integrate the custom hooks into pages

---

## Pattern 1: Basic List Page

### Example: Projects List Page (ATLVS)

```typescript
// apps/atlvs/src/app/projects/page.tsx
'use client';

import { useProjects } from '@/hooks/useProjects';
import { Card, Button, Spinner, Alert } from '@ghxstship/ui';
import Link from 'next/link';

export default function ProjectsPage() {
  // 1. Use the hook - it handles all data fetching
  const { data: projects, isLoading, error } = useProjects();

  // 2. Handle loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  // 3. Handle error state
  if (error) {
    return (
      <Alert variant="error">
        <strong>Error loading projects:</strong> {error.message}
      </Alert>
    );
  }

  // 4. Render the data
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Projects</h1>
        <Link href="/projects/new">
          <Button>Create Project</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects?.map((project) => (
          <Card key={project.id} className="p-6">
            <h3 className="text-xl font-semibold">{project.name}</h3>
            <p className="text-gray-600 mt-2">{project.description}</p>
            <div className="mt-4 flex justify-between items-center">
              <span className="text-sm text-gray-500">
                Status: {project.status}
              </span>
              <Link href={`/projects/${project.id}`}>
                <Button variant="ghost" size="sm">View →</Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>

      {projects?.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-gray-500">No projects yet. Create your first one!</p>
        </Card>
      )}
    </div>
  );
}
```

---

## Pattern 2: Detail Page with Create/Update

### Example: Project Detail Page (ATLVS)

```typescript
// apps/atlvs/src/app/projects/[id]/page.tsx
'use client';

import { useProject, useUpdateProject, useDeleteProject } from '@/hooks/useProjects';
import { Button, Input, Field, Alert } from '@ghxstship/ui';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  
  // Fetch project data
  const { data: project, isLoading, error } = useProject(params.id);
  
  // Mutations
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  
  // Local state for editing
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active'
  });

  // Initialize form data when project loads
  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        description: project.description || '',
        status: project.status
      });
    }
  }, [project]);

  const handleUpdate = async () => {
    try {
      await updateProject.mutateAsync({
        id: params.id,
        ...formData
      });
      setIsEditing(false);
    } catch (err) {
      console.error('Update failed:', err);
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this project?')) {
      try {
        await deleteProject.mutateAsync(params.id);
        router.push('/projects');
      } catch (err) {
        console.error('Delete failed:', err);
      }
    }
  };

  if (isLoading) return <Spinner />;
  if (error) return <Alert variant="error">{error.message}</Alert>;
  if (!project) return <Alert variant="warning">Project not found</Alert>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{project.name}</h1>
        <div className="space-x-2">
          <Button 
            variant="outline"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Cancel' : 'Edit'}
          </Button>
          <Button 
            variant="outline" 
            onClick={handleDelete}
            disabled={deleteProject.isLoading}
          >
            Delete
          </Button>
        </div>
      </div>

      {isEditing ? (
        // Edit Mode
        <Card className="p-6 space-y-4">
          <Field label="Project Name">
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </Field>

          <Field label="Description">
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
            />
          </Field>

          <Field label="Status">
            <Select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="planning">Planning</option>
              <option value="active">Active</option>
              <option value="on-hold">On Hold</option>
              <option value="completed">Completed</option>
            </Select>
          </Field>

          <Button 
            onClick={handleUpdate} 
            disabled={updateProject.isLoading}
          >
            {updateProject.isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </Card>
      ) : (
        // View Mode
        <Card className="p-6">
          <dl className="space-y-4">
            <div>
              <dt className="font-semibold text-gray-700">Description</dt>
              <dd className="mt-1">{project.description}</dd>
            </div>
            <div>
              <dt className="font-semibold text-gray-700">Status</dt>
              <dd className="mt-1">
                <Badge variant={project.status}>{project.status}</Badge>
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-gray-700">Created</dt>
              <dd className="mt-1">{new Date(project.created_at).toLocaleDateString()}</dd>
            </div>
          </dl>
        </Card>
      )}
    </div>
  );
}
```

---

## Pattern 3: Dashboard with Multiple Hooks

### Example: Dashboard Page (COMPVSS)

```typescript
// apps/compvss/src/app/dashboard/page.tsx
'use client';

import { useProjects } from '@/hooks/useProjects';
import { useCrew } from '@/hooks/useCrew';
import { useSafetyIncidents } from '@/hooks/useSafety';
import { StatCard, Card } from '@ghxstship/ui';

export default function DashboardPage() {
  // Fetch data from multiple sources
  const { data: projects, isLoading: projectsLoading } = useProjects({ status: 'active' });
  const { data: crew, isLoading: crewLoading } = useCrew({ availability: 'available' });
  const { data: incidents, isLoading: incidentsLoading } = useSafetyIncidents({ 
    status: 'reported' 
  });

  const isLoading = projectsLoading || crewLoading || incidentsLoading;

  if (isLoading) {
    return <div className="grid grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <Card key={i} className="h-32 animate-pulse bg-gray-100" />
      ))}
    </div>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Operations Dashboard</h1>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Projects"
          value={projects?.length || 0}
          trend={{ value: 12, isPositive: true }}
          icon="📊"
        />
        <StatCard
          title="Available Crew"
          value={crew?.length || 0}
          subtitle="Ready to work"
          icon="👷"
        />
        <StatCard
          title="Safety Incidents"
          value={incidents?.length || 0}
          variant={incidents?.length > 0 ? 'warning' : 'success'}
          icon="⚠️"
        />
        <StatCard
          title="Equipment Status"
          value="94%"
          subtitle="Operational"
          icon="🔧"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Active Projects</h2>
          <div className="space-y-3">
            {projects?.slice(0, 5).map((project) => (
              <div key={project.id} className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{project.name}</p>
                  <p className="text-sm text-gray-500">{project.phase}</p>
                </div>
                <Badge variant={project.status}>{project.status}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Safety Alerts</h2>
          {incidents && incidents.length > 0 ? (
            <div className="space-y-3">
              {incidents.slice(0, 5).map((incident) => (
                <Alert key={incident.id} variant={incident.severity}>
                  <p className="font-medium">{incident.type}</p>
                  <p className="text-sm">{incident.description}</p>
                </Alert>
              ))}
            </div>
          ) : (
            <p className="text-green-600">✓ No active incidents</p>
          )}
        </Card>
      </div>
    </div>
  );
}
```

---

## Pattern 4: Form with Create

### Example: Create Crew Member (COMPVSS)

```typescript
// apps/compvss/src/app/crew/new/page.tsx
'use client';

import { useCreateCrewMember } from '@/hooks/useCrew';
import { Button, Input, Select, Field, Alert } from '@ghxstship/ui';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewCrewPage() {
  const router = useRouter();
  const createCrew = useCreateCrewMember();
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    role: '',
    department: '',
    rate: 0,
    availability: 'available' as const,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createCrew.mutateAsync({
        ...formData,
        user_id: 'temp-id', // This would come from auth
      });
      
      router.push('/crew');
    } catch (error) {
      console.error('Failed to create crew member:', error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Add Crew Member</h1>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Full Name" required>
            <Input
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              required
            />
          </Field>

          <Field label="Email" required>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </Field>

          <Field label="Phone">
            <Input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </Field>

          <Field label="Role" required>
            <Select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              required
            >
              <option value="">Select Role</option>
              <option value="rigger">Rigger</option>
              <option value="electrician">Electrician</option>
              <option value="technician">Audio Technician</option>
              <option value="lighting">Lighting Designer</option>
            </Select>
          </Field>

          <Field label="Department" required>
            <Select
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              required
            >
              <option value="">Select Department</option>
              <option value="production">Production</option>
              <option value="technical">Technical</option>
              <option value="logistics">Logistics</option>
            </Select>
          </Field>

          <Field label="Hourly Rate">
            <Input
              type="number"
              value={formData.rate}
              onChange={(e) => setFormData({ ...formData, rate: Number(e.target.value) })}
              min="0"
              step="0.01"
            />
          </Field>

          {createCrew.error && (
            <Alert variant="error">
              Failed to create crew member: {createCrew.error.message}
            </Alert>
          )}

          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={createCrew.isLoading}
            >
              {createCrew.isLoading ? 'Creating...' : 'Create Crew Member'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
```

---

## Pattern 5: Real-time Updates

### Example: Live Ticket Sales (GVTEWAY)

```typescript
// apps/gvteway/src/app/events/[id]/sales/page.tsx
'use client';

import { useTickets } from '@/hooks/useTickets';
import { useRealtime } from '@/hooks/useRealtime';
import { useState, useEffect } from 'react';

export default function EventSalesPage({ params }: { params: { id: string } }) {
  const { data: tickets, refetch } = useTickets({ event_id: params.id });
  const [liveCount, setLiveCount] = useState(0);

  // Subscribe to real-time ticket updates
  useRealtime({
    table: 'tickets',
    event: 'INSERT',
    filter: `event_id=eq.${params.id}`,
    callback: (payload) => {
      console.log('New ticket sold!', payload);
      refetch(); // Refresh ticket list
      setLiveCount(prev => prev + 1);
    }
  });

  useEffect(() => {
    if (tickets) {
      setLiveCount(tickets.filter(t => t.status === 'sold').length);
    }
  }, [tickets]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <h1 className="text-3xl font-bold">Live Ticket Sales</h1>
        <Badge variant="success" className="animate-pulse">
          🔴 LIVE
        </Badge>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <StatCard
          title="Tickets Sold"
          value={liveCount}
          subtitle="Real-time count"
          icon="🎫"
        />
        <StatCard
          title="Revenue"
          value={`$${(liveCount * 50).toLocaleString()}`}
          subtitle="Today"
          icon="💰"
        />
        <StatCard
          title="Available"
          value={tickets?.filter(t => t.status === 'available').length || 0}
          subtitle="Remaining"
          icon="📊"
        />
      </div>

      {/* Ticket list updates in real-time */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Sales</h2>
        <div className="space-y-2">
          {tickets
            ?.filter(t => t.status === 'sold')
            .slice(0, 10)
            .map((ticket) => (
              <div key={ticket.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span>Ticket #{ticket.seat_number}</span>
                <span className="text-sm text-gray-500">
                  {new Date(ticket.purchase_date).toLocaleTimeString()}
                </span>
              </div>
            ))}
        </div>
      </Card>
    </div>
  );
}
```

---

## Pattern 6: Filtered List with Search

### Example: Contacts with Filters (ATLVS)

```typescript
// apps/atlvs/src/app/contacts/page.tsx
'use client';

import { useContacts } from '@/hooks/useContacts';
import { Input, Select, Button } from '@ghxstship/ui';
import { useState } from 'react';

export default function ContactsPage() {
  const [filters, setFilters] = useState({
    company: '',
  });
  
  const [search, setSearch] = useState('');

  // Hook automatically refetches when filters change
  const { data: contacts, isLoading } = useContacts(filters);

  // Client-side search on top of server filter
  const filteredContacts = contacts?.filter(contact =>
    contact.first_name.toLowerCase().includes(search.toLowerCase()) ||
    contact.last_name.toLowerCase().includes(search.toLowerCase()) ||
    contact.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Contacts</h1>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Input
            placeholder="Filter by company..."
            value={filters.company}
            onChange={(e) => setFilters({ ...filters, company: e.target.value })}
          />
          <Button onClick={() => { setFilters({ company: '' }); setSearch(''); }}>
            Clear Filters
          </Button>
        </div>
      </Card>

      {/* Results */}
      {isLoading ? (
        <Spinner />
      ) : (
        <Card className="p-6">
          <Table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Company</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredContacts?.map((contact) => (
                <tr key={contact.id}>
                  <td>{contact.first_name} {contact.last_name}</td>
                  <td>{contact.email}</td>
                  <td>{contact.company}</td>
                  <td>
                    <Button size="sm" variant="ghost">View</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      )}
    </div>
  );
}
```

---

## Key Integration Tips

### 1. Always Handle Three States
```typescript
if (isLoading) return <LoadingState />;
if (error) return <ErrorState error={error} />;
return <SuccessState data={data} />;
```

### 2. Use Optimistic Updates
```typescript
const updateProject = useUpdateProject();

const handleQuickUpdate = (id, updates) => {
  // Optimistically update UI before server response
  queryClient.setQueryData(['projects', id], (old) => ({ ...old, ...updates }));
  
  updateProject.mutate({ id, ...updates });
};
```

### 3. Debounce Search Inputs
```typescript
import { useDebouncedValue } from '@/hooks/useDebounce';

const [search, setSearch] = useState('');
const debouncedSearch = useDebouncedValue(search, 500);

const { data } = useContacts({ search: debouncedSearch });
```

### 4. Combine Multiple Hooks
```typescript
// Fetch related data in parallel
const { data: project } = useProject(id);
const { data: tasks } = useTasks({ project_id: id });
const { data: team } = useTeam({ project_id: id });
```

### 5. Handle Mutations with Feedback
```typescript
const updateMutation = useUpdateProject();

const handleUpdate = async (data) => {
  try {
    await updateMutation.mutateAsync(data);
    toast.success('Project updated successfully!');
  } catch (error) {
    toast.error(`Failed to update: ${error.message}`);
  }
};
```

---

## Next Steps

1. **Choose a starter page** from the examples above
2. **Copy the pattern** that matches your use case
3. **Replace mock data** with the real hook calls
4. **Test the integration** with real Supabase data
5. **Repeat** for other pages

All 51 hooks follow the same patterns shown here! 🚀
