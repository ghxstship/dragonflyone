"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreatorNavigationAuthenticated } from "../../components/navigation";
import {
  ListPage,
  Badge,
  DetailDrawer,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
  type DetailSection,
} from "@ghxstship/ui";

interface PortfolioProject {
  id: string;
  name: string;
  client: string;
  category: string;
  date: string;
  location: string;
  description: string;
  services: string[];
  metrics: { label: string; value: string }[];
  featured: boolean;
  testimonial?: { quote: string; author: string; role: string };
}

const mockProjects: PortfolioProject[] = [
  {
    id: "PRT-001",
    name: "Summer Music Festival 2024",
    client: "Festival Productions Inc",
    category: "Festival",
    date: "2024-08-15",
    location: "Los Angeles, CA",
    description: "Three-day outdoor music festival featuring 50+ artists across 4 stages",
    services: ["Full Production", "Audio", "Lighting", "Video", "Staging"],
    metrics: [{ label: "Attendance", value: "75,000" }, { label: "Stages", value: "4" }, { label: "Artists", value: "52" }],
    featured: true,
    testimonial: { quote: "Exceptional production quality that exceeded our expectations.", author: "John Smith", role: "Festival Director" },
  },
  {
    id: "PRT-002",
    name: "Corporate Annual Gala",
    client: "Tech Corp",
    category: "Corporate",
    date: "2024-09-20",
    location: "San Francisco, CA",
    description: "Elegant corporate gala with live entertainment and awards ceremony",
    services: ["Audio", "Lighting", "Video", "Staging"],
    metrics: [{ label: "Guests", value: "1,200" }, { label: "Runtime", value: "5 hrs" }],
    featured: true,
  },
  {
    id: "PRT-003",
    name: "Arena Tour - Rock Band",
    client: "Major Label Records",
    category: "Tour",
    date: "2024-07-01",
    location: "National Tour",
    description: "30-city arena tour with full production package",
    services: ["Full Production", "Audio", "Lighting", "Video", "Rigging"],
    metrics: [{ label: "Shows", value: "30" }, { label: "Total Attendance", value: "450,000" }],
    featured: true,
    testimonial: { quote: "The crew was professional and the production was flawless every night.", author: "Tour Manager", role: "Major Label Records" },
  },
  {
    id: "PRT-004",
    name: "Product Launch Event",
    client: "Consumer Electronics Co",
    category: "Corporate",
    date: "2024-10-05",
    location: "New York, NY",
    description: "High-profile product launch with live streaming",
    services: ["Audio", "Video", "Lighting", "Streaming"],
    metrics: [{ label: "In-Person", value: "500" }, { label: "Livestream", value: "50,000" }],
    featured: false,
  },
];

const columns: ListPageColumn<PortfolioProject>[] = [
  { key: 'name', label: 'Project', accessor: 'name', sortable: true },
  { key: 'client', label: 'Client', accessor: 'client', sortable: true },
  { key: 'category', label: 'Category', accessor: 'category', sortable: true, render: (v) => <Badge variant="outline">{String(v)}</Badge> },
  { key: 'location', label: 'Location', accessor: 'location' },
  { key: 'date', label: 'Date', accessor: (r) => new Date(r.date).toLocaleDateString(), sortable: true },
  { key: 'services', label: 'Services', accessor: (r) => r.services.slice(0, 2).join(', ') + (r.services.length > 2 ? ` +${r.services.length - 2}` : '') },
  { key: 'featured', label: 'Featured', accessor: 'featured', render: (v) => v ? <Badge variant="solid">FEATURED</Badge> : <Badge variant="ghost">—</Badge> },
];

const filters: ListPageFilter[] = [
  { key: 'category', label: 'Category', options: [
    { value: 'Festival', label: 'Festival' },
    { value: 'Corporate', label: 'Corporate' },
    { value: 'Tour', label: 'Tour' },
    { value: 'Concert', label: 'Concert' },
    { value: 'Private', label: 'Private' },
  ]},
  { key: 'featured', label: 'Featured', options: [
    { value: 'true', label: 'Featured Only' },
    { value: 'false', label: 'Non-Featured' },
  ]},
];

export default function PortfolioPage() {
  const router = useRouter();
  const [selectedProject, setSelectedProject] = useState<PortfolioProject | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const featuredCount = mockProjects.filter(p => p.featured).length;

  const rowActions: ListPageAction<PortfolioProject>[] = [
    { id: 'view', label: 'View Details', icon: '👁️', onClick: (r) => { setSelectedProject(r); setDrawerOpen(true); } },
    { id: 'edit', label: 'Edit', icon: '✏️', onClick: (r) => router.push(`/portfolio/${r.id}/edit`) },
    { id: 'feature', label: 'Toggle Featured', icon: '⭐', onClick: (r) => console.log('Toggle featured:', r.id) },
  ];

  const stats = [
    { label: 'Total Projects', value: mockProjects.length },
    { label: 'Featured', value: featuredCount },
    { label: 'Total Attendance', value: '600K+' },
    { label: 'Client Satisfaction', value: '98%' },
  ];

  const detailSections: DetailSection[] = selectedProject ? [
    { id: 'overview', title: 'Project Details', content: (
      <div className="grid grid-cols-2 gap-4">
        <div><strong>Name:</strong> {selectedProject.name}</div>
        <div><strong>Client:</strong> {selectedProject.client}</div>
        <div><strong>Category:</strong> {selectedProject.category}</div>
        <div><strong>Location:</strong> {selectedProject.location}</div>
        <div><strong>Date:</strong> {new Date(selectedProject.date).toLocaleDateString()}</div>
        <div><strong>Featured:</strong> {selectedProject.featured ? 'Yes' : 'No'}</div>
        <div className="col-span-2"><strong>Description:</strong> {selectedProject.description}</div>
        <div className="col-span-2"><strong>Services:</strong> {selectedProject.services.join(', ')}</div>
      </div>
    )},
    { id: 'metrics', title: 'Key Metrics', content: (
      <div className="grid grid-cols-3 gap-4">
        {selectedProject.metrics.map((m, idx) => (
          <div key={idx} className="text-center">
            <div className="font-mono text-body-lg">{m.value}</div>
            <div className="text-body-sm text-grey-400">{m.label}</div>
          </div>
        ))}
      </div>
    )},
    ...(selectedProject.testimonial ? [{
      id: 'testimonial',
      title: 'Client Testimonial',
      content: (
        <div className="border-l-4 border-primary pl-4">
          <p className="italic">&ldquo;{selectedProject.testimonial.quote}&rdquo;</p>
          <p className="mt-2 text-body-sm text-grey-400">— {selectedProject.testimonial.author}, {selectedProject.testimonial.role}</p>
        </div>
      ),
    }] : []),
  ] : [];

  return (
    <>
      <ListPage<PortfolioProject>
        title="Portfolio"
        subtitle="Showcasing our past work and successful productions"
        data={mockProjects}
        columns={columns}
        rowKey="id"
        loading={false}
        searchPlaceholder="Search projects..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => { setSelectedProject(r); setDrawerOpen(true); }}
        createLabel="Add Project"
        onCreate={() => router.push('/portfolio/new')}
        onExport={() => console.log('Export portfolio')}
        stats={stats}
        emptyMessage="No portfolio projects found"
        emptyAction={{ label: 'Add Project', onClick: () => router.push('/portfolio/new') }}
        header={<CreatorNavigationAuthenticated />}
      />

      {selectedProject && (
        <DetailDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          record={selectedProject}
          title={(p) => p.name}
          subtitle={(p) => `${p.client} • ${p.category}`}
          sections={detailSections}
          onEdit={(p) => router.push(`/portfolio/${p.id}/edit`)}
          actions={[
            { id: 'feature', label: selectedProject.featured ? 'Remove Featured' : 'Mark Featured', icon: '⭐' },
            { id: 'pdf', label: 'Download PDF', icon: '📄' },
          ]}
          onAction={(id, p) => {
            if (id === 'feature') console.log('Toggle featured:', p.id);
            if (id === 'pdf') console.log('Download PDF:', p.id);
            setDrawerOpen(false);
          }}
        />
      )}
    </>
  );
}
