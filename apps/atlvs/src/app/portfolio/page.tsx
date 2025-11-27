"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreatorNavigationAuthenticated } from "../../components/navigation";
import {
  Container, H1, H3, Body, Label, Grid, Stack, StatCard, Input, Select, Button,
  Section as UISection, Card, Tabs, TabsList, Tab, TabPanel, Badge,
  Modal, ModalHeader, ModalBody, ModalFooter,
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

const categories = ["All", "Festival", "Corporate", "Tour", "Concert", "Private"];

export default function PortfolioPage() {
  const router = useRouter();
  const [selectedProject, setSelectedProject] = useState<PortfolioProject | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProjects = mockProjects.filter(p => {
    const matchesCategory = categoryFilter === "All" || p.category === categoryFilter;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.client.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredProjects = mockProjects.filter(p => p.featured);
  const totalAttendance = "600K+";

  return (
    <UISection className="relative min-h-screen overflow-hidden bg-ink-950 text-ink-50">
      <Card className="pointer-events-none absolute inset-0 grid-overlay opacity-40" />
      <CreatorNavigationAuthenticated />
      <Container className="py-16">
        <Stack gap={8}>
          <Stack gap={2}>
            <H1>Portfolio</H1>
            <Label className="text-ink-400">Showcasing our past work and successful productions</Label>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard label="Total Projects" value={mockProjects.length} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Featured" value={featuredProjects.length} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Total Attendance" value={totalAttendance} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Client Satisfaction" value="98%" className="bg-transparent border-2 border-ink-800" />
          </Grid>

          <Grid cols={3} gap={4}>
            <Input type="search" placeholder="Search projects..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="border-ink-700 bg-black text-white col-span-2" />
            <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="border-ink-700 bg-black text-white">
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </Select>
          </Grid>

          <Stack gap={2}>
            <H3>Featured Projects</H3>
            <Grid cols={3} gap={4}>
              {featuredProjects.map((project) => (
                <Card key={project.id} className="border-2 border-ink-800 bg-ink-900/50 overflow-hidden cursor-pointer hover:border-white transition-colors" onClick={() => setSelectedProject(project)}>
                  <Card className="h-48 bg-ink-800 flex items-center justify-center">
                    <Label className="text-h1-sm">🎪</Label>
                  </Card>
                  <Stack className="p-4" gap={3}>
                    <Stack gap={1}>
                      <Body className="font-display text-white">{project.name}</Body>
                      <Label className="text-ink-400">{project.client}</Label>
                    </Stack>
                    <Stack direction="horizontal" gap={2}>
                      <Badge variant="outline">{project.category}</Badge>
                      <Label className="text-ink-500">{project.location}</Label>
                    </Stack>
                    <Stack direction="horizontal" gap={4}>
                      {project.metrics.slice(0, 2).map((m, idx) => (
                        <Stack key={idx} gap={0}>
                          <Label className="font-mono text-white">{m.value}</Label>
                          <Label size="xs" className="text-ink-500">{m.label}</Label>
                        </Stack>
                      ))}
                    </Stack>
                  </Stack>
                </Card>
              ))}
            </Grid>
          </Stack>

          <Stack gap={2}>
            <H3>All Projects</H3>
            <Stack gap={3}>
              {filteredProjects.map((project) => (
                <Card key={project.id} className="border-2 border-ink-800 bg-ink-900/50 p-4 cursor-pointer hover:border-white transition-colors" onClick={() => setSelectedProject(project)}>
                  <Grid cols={6} gap={4} className="items-center">
                    <Stack gap={1}>
                      <Body className="font-display text-white">{project.name}</Body>
                      <Label className="text-ink-400">{project.client}</Label>
                    </Stack>
                    <Badge variant="outline">{project.category}</Badge>
                    <Label className="text-ink-400">{project.location}</Label>
                    <Label className="text-ink-400">{project.date}</Label>
                    <Stack direction="horizontal" gap={2} className="flex-wrap">
                      {project.services.slice(0, 2).map(s => <Badge key={s} variant="outline">{s}</Badge>)}
                      {project.services.length > 2 && <Label className="text-ink-500">+{project.services.length - 2}</Label>}
                    </Stack>
                    <Button variant="ghost" size="sm">View</Button>
                  </Grid>
                </Card>
              ))}
            </Stack>
          </Stack>

          <Grid cols={3} gap={4}>
            <Button variant="outline" className="border-ink-700 text-ink-400">Download Portfolio PDF</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/clients")}>Client List</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/")}>Back to Dashboard</Button>
          </Grid>
        </Stack>
      </Container>

      <Modal open={!!selectedProject} onClose={() => setSelectedProject(null)}>
        <ModalHeader><H3>{selectedProject?.name}</H3></ModalHeader>
        <ModalBody>
          {selectedProject && (
            <Stack gap={4}>
              <Card className="h-48 bg-ink-800 flex items-center justify-center">
                <Label className="text-h1-sm">🎪</Label>
              </Card>
              <Stack direction="horizontal" className="justify-between">
                <Stack gap={1}>
                  <Label className="text-ink-400">Client</Label>
                  <Body className="text-white">{selectedProject.client}</Body>
                </Stack>
                <Badge variant="outline">{selectedProject.category}</Badge>
              </Stack>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label size="xs" className="text-ink-500">Date</Label><Label className="text-white">{selectedProject.date}</Label></Stack>
                <Stack gap={1}><Label size="xs" className="text-ink-500">Location</Label><Label className="text-white">{selectedProject.location}</Label></Stack>
              </Grid>
              <Stack gap={1}><Label size="xs" className="text-ink-500">Description</Label><Body className="text-ink-300">{selectedProject.description}</Body></Stack>
              <Stack gap={2}>
                <Label className="text-ink-400">Services Provided</Label>
                <Stack direction="horizontal" gap={2} className="flex-wrap">
                  {selectedProject.services.map(s => <Badge key={s} variant="outline">{s}</Badge>)}
                </Stack>
              </Stack>
              <Grid cols={3} gap={4}>
                {selectedProject.metrics.map((m, idx) => (
                  <Card key={idx} className="p-3 border border-ink-700 text-center">
                    <Label className="font-mono text-white text-h6-md">{m.value}</Label>
                    <Label size="xs" className="text-ink-500">{m.label}</Label>
                  </Card>
                ))}
              </Grid>
              {selectedProject.testimonial && (
                <Card className="p-4 bg-ink-800 border border-ink-700">
                  <Stack gap={2}>
                    <Body className="text-ink-300 italic">&ldquo;{selectedProject.testimonial.quote}&rdquo;</Body>
                    <Label className="text-ink-400">— {selectedProject.testimonial.author}, {selectedProject.testimonial.role}</Label>
                  </Stack>
                </Card>
              )}
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedProject(null)}>Close</Button>
          <Button variant="solid">Request Similar</Button>
        </ModalFooter>
      </Modal>
    </UISection>
  );
}
