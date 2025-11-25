'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Section,
  Display,
  H2,
  Body,
  Button,
  Card,
  Field,
  Select,
  Input,
  Grid,
  Badge,
  Stack,
} from '@ghxstship/ui';

interface CrewMember {
  id: string;
  name: string;
  role: string;
  skills: string[];
  available: boolean;
}

const mockCrew: CrewMember[] = [
  { id: '1', name: 'Mike Johnson', role: 'Lighting Tech', skills: ['ETC', 'GrandMA', 'Rigging'], available: true },
  { id: '2', name: 'Sarah Chen', role: 'Sound Engineer', skills: ['DiGiCo', 'Meyer Sound', 'RF'], available: true },
  { id: '3', name: 'David Rodriguez', role: 'Video Director', skills: ['Barco', 'Resolume', 'IMAG'], available: false },
  { id: '4', name: 'Emily Watson', role: 'Stage Manager', skills: ['Production', 'Communication', 'Cueing'], available: true },
  { id: '5', name: 'James Kim', role: 'Rigger', skills: ['Structural', 'Safety', 'Motors'], available: true },
];

export default function AssignCrewPage() {
  const router = useRouter();
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [assigned, setAssigned] = useState<string[]>([]);

  const filteredCrew = mockCrew.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !selectedRole || member.role === selectedRole;
    return matchesSearch && matchesRole && member.available;
  });

  const handleAssign = (crewId: string) => {
    setAssigned([...assigned, crewId]);
  };

  const handleUnassign = (crewId: string) => {
    setAssigned(assigned.filter(id => id !== crewId));
  };

  const handleSubmit = async () => {
    await fetch('/api/crew/assign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId: selectedProject,
        crewIds: assigned,
      }),
    });
    router.push('/dashboard');
  };

  return (
    <Section className="min-h-screen bg-white">
      <Container>
        <Stack className="border-b-2 border-black py-8 mb-8">
          <Display>ASSIGN CREW</Display>
        </Stack>

        <Grid cols={3} className="mb-8">
          <Field label="Project">
            <Select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
            >
              <option value="">Select Project</option>
              <option value="proj1">Summer Music Festival</option>
              <option value="proj2">Corporate Product Launch</option>
              <option value="proj3">Theater Production</option>
            </Select>
          </Field>

          <Field label="Filter by Role">
            <Select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              <option value="">All Roles</option>
              <option value="Lighting Tech">Lighting Tech</option>
              <option value="Sound Engineer">Sound Engineer</option>
              <option value="Video Director">Video Director</option>
              <option value="Stage Manager">Stage Manager</option>
              <option value="Rigger">Rigger</option>
            </Select>
          </Field>

          <Field label="Search">
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search crew..."
            />
          </Field>
        </Grid>

        <Grid cols={2} gap={6} className="mb-8">
          <Stack gap={4}>
            <H2>AVAILABLE CREW</H2>
            <Stack gap={3}>
              {filteredCrew.filter(c => !assigned.includes(c.id)).map(member => (
                <Card key={member.id} className="p-4">
                  <Stack direction="horizontal" className="justify-between items-start">
                    <Stack gap={1}>
                      <Body className="font-bold">{member.name}</Body>
                      <Body size="sm">{member.role}</Body>
                      <Stack direction="horizontal" gap={2} className="mt-2 flex-wrap">
                        {member.skills.map(skill => (
                          <Badge key={skill}>{skill}</Badge>
                        ))}
                      </Stack>
                    </Stack>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAssign(member.id)}
                    >
                      Assign
                    </Button>
                  </Stack>
                </Card>
              ))}
            </Stack>
          </Stack>

          <Stack gap={4}>
            <H2>ASSIGNED CREW ({assigned.length})</H2>
            <Stack gap={3}>
              {mockCrew.filter(c => assigned.includes(c.id)).map(member => (
                <Card key={member.id} className="p-4 border-l-4 border-black">
                  <Stack direction="horizontal" className="justify-between items-start">
                    <Stack gap={1}>
                      <Body className="font-bold">{member.name}</Body>
                      <Body size="sm">{member.role}</Body>
                      <Stack direction="horizontal" gap={2} className="mt-2 flex-wrap">
                        {member.skills.map(skill => (
                          <Badge key={skill}>{skill}</Badge>
                        ))}
                      </Stack>
                    </Stack>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleUnassign(member.id)}
                    >
                      Remove
                    </Button>
                  </Stack>
                </Card>
              ))}
            </Stack>
          </Stack>
        </Grid>

        <Stack direction="horizontal" gap={4}>
          <Button variant="solid" onClick={handleSubmit} disabled={assigned.length === 0}>
            Confirm Assignment ({assigned.length})
          </Button>
          <Button variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </Stack>
      </Container>
    </Section>
  );
}
