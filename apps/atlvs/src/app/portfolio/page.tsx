"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, Pencil, Star, FileText } from "lucide-react";
import { AtlvsAppLayout } from "../../components/app-layout";
import {
  ListPage,
  Badge,
  DetailDrawer,
  Grid,
  Stack,
  Body,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
  type DetailSection,
  } from "@ghxstship/ui";
import { createExportHandler, createImportHandler, getImportTemplates, createImportHandler, getImportTemplates } from '@ghxstship/config';

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
  const [projects, setProjects] = useState<PortfolioProject[]>(mockProjects);
  const [selectedProject, setSelectedProject] = useState<PortfolioProject | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const featuredCount = projects.filter(p => p.featured).length;

  const rowActions: ListPageAction<PortfolioProject>[] = [
    { id: 'view', label: 'View Details', icon: <Eye className="size-4" />, onClick: (r) => { setSelectedProject(r); setDrawerOpen(true); } },
    { id: 'edit', label: 'Edit', icon: <Pencil className="size-4" />, onClick: (r) => router.push(`/portfolio/${r.id}/edit`) },
    { id: 'feature', label: 'Toggle Featured', icon: <Star className="size-4" />, onClick: (r) => setProjects(prev => prev.map(p => p.id === r.id ? { ...p, featured: !p.featured } : p)) },
  ];

  const stats = [
    { label: 'Total Projects', value: projects.length },
    { label: 'Featured', value: featuredCount },
    { label: 'Total Attendance', value: '600K+' },
    { label: 'Client Satisfaction', value: '98%' },
  ];

  const detailSections: DetailSection[] = selectedProject ? [
    { id: 'overview', title: 'Project Details', content: (
      <Grid cols={2} gap={4}>
        <Body size="sm"><strong>Name:</strong> {selectedProject.name}</Body>
        <Body size="sm"><strong>Client:</strong> {selectedProject.client}</Body>
        <Body size="sm"><strong>Category:</strong> {selectedProject.category}</Body>
        <Body size="sm"><strong>Location:</strong> {selectedProject.location}</Body>
        <Body size="sm"><strong>Date:</strong> {new Date(selectedProject.date).toLocaleDateString()}</Body>
        <Body size="sm"><strong>Featured:</strong> {selectedProject.featured ? 'Yes' : 'No'}</Body>
        <Body size="sm" className="col-span-2"><strong>Description:</strong> {selectedProject.description}</Body>
        <Body size="sm" className="col-span-2"><strong>Services:</strong> {selectedProject.services.join(', ')}</Body>
      </Grid>
    )},
    { id: 'metrics', title: 'Key Metrics', content: (
      <Grid cols={3} gap={4}>
        {selectedProject.metrics.map((m, idx) => (
          <Stack key={idx} className="text-center">
            <Body className="font-mono text-body-lg">{m.value}</Body>
            <Body size="sm" className="text-grey-400">{m.label}</Body>
          </Stack>
        ))}
      </Grid>
    )},
    ...(selectedProject.testimonial ? [{
      id: 'testimonial',
      title: 'Client Testimonial',
      content: (
        <Stack className="border-l-4 border-primary pl-4">
          <Body className="italic">&ldquo;{selectedProject.testimonial.quote}&rdquo;</Body>
          <Body size="sm" className="mt-2 text-grey-400">— {selectedProject.testimonial.author}, {selectedProject.testimonial.role}</Body>
        </Stack>
      ),
    }] : []),
  ] : [];

  // Import handler for CSV/JSON files

  const handleImport = createImportHandler<Omit<PortfolioProject, 'id'>>({

    entityType: 'portfolio',

    requiredFields: ['portfolio', 'name', 'client'],

    onImport: async (records) => {

      for (const record of records) {

        await fetch('/api/portfolio', {

          method: 'POST',

          headers: { 'Content-Type': 'application/json' },

          body: JSON.stringify({ organization_id: 'default-org', ...record }),

        });

      }

      refetch();

    },

  });


  // Import templates for field mapping

  const importTemplates = getImportTemplates('portfolio');


  return (
    <AtlvsAppLayout>
      <ListPage<PortfolioProject>
        title="Portfolio"
        subtitle="Showcasing our past work and successful productions"
        data={projects}
        columns={columns}
        rowKey="id"
        loading={false}
        searchPlaceholder="Search projects..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => { setSelectedProject(r); setDrawerOpen(true); }}
        createLabel="Add Project"
        onCreate={() => router.push('/portfolio/new')}
        entityType="portfolio"

        onImport={handleImport}

        importTemplates={importTemplates}

        importSampleFields={['portfolio', 'name', 'client', 'category', 'location', 'date', 'services']}
        onExport={createExportHandler({
          filename: "portfolio",
          getData: () => projects.map(p => ({
            id: p.id,
            name: p.name,
            client: p.client,
            category: p.category,
            date: p.date,
            location: p.location,
            services: p.services.join(', '),
          })),
        })}
        exportFormats={["csv", "json"]}
        stats={stats}
        emptyMessage="No portfolio projects found"
        emptyAction={{ label: 'Add Project', onClick: () => router.push('/portfolio/new') }}
        onBulkAction={async (action, ids) => {
          if (action === 'delete') {
            setProjects(prev => prev.filter(p => !ids.includes(p.id)));
          } else if (action === 'feature') {
            setProjects(prev => prev.map(p => ids.includes(p.id) ? { ...p, featured: true } : p));
          }
        }}
        bulkActions={[
          { id: 'feature', label: 'Feature Selected', variant: 'default' },
          { id: 'delete', label: 'Delete Selected', variant: 'danger' },
        ]}
        showFavorite
        showSettings
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
            { id: 'feature', label: selectedProject.featured ? 'Remove Featured' : 'Mark Featured', icon: <Star className="size-4" /> },
            { id: 'pdf', label: 'Download PDF', icon: <FileText className="size-4" /> },
          ]}
          onAction={(id, p) => {
            if (id === 'feature') setProjects(prev => prev.map(proj => proj.id === p.id ? { ...proj, featured: !proj.featured } : proj));
            if (id === 'pdf') window.open(`/api/portfolio/${p.id}/pdf`, '_blank');
            setDrawerOpen(false);
          }}
        />
      )}
    </AtlvsAppLayout>
  );
}
