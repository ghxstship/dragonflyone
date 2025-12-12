"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CompvssAppLayout } from "../../components/app-layout";
import { useCrewSkills } from "../../hooks/useSkills";
import { useCrew } from "../../hooks/useCrew";
import {
  StatCard,
  Input,
  Select,
  Button,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Spinner,
  EmptyState,
  Container,
  Grid,
  Stack,
  Body,
  EnterprisePageHeader,
  MainContent,
} from "@ghxstship/ui";

const skillCategories = ["Rigging", "Audio", "Video", "Lighting", "Staging", "Electrical", "Safety"];

interface CrewSkill {
  id: string;
  crew_id: string;
  skill_name: string;
  proficiency_level: string;
  years_experience?: number;
}

interface CrewMember {
  id: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  status: string;
}

interface CrewWithSkills extends CrewMember {
  skills: string[];
  skillDetails: CrewSkill[];
  level: string;
}

// Demo data for unauthenticated users
const DEMO_SKILLS: CrewSkill[] = [
  { id: "demo-1", crew_id: "crew-1", skill_name: "Rigging", proficiency_level: "expert", years_experience: 8 },
  { id: "demo-2", crew_id: "crew-1", skill_name: "Safety", proficiency_level: "advanced", years_experience: 5 },
  { id: "demo-3", crew_id: "crew-2", skill_name: "Audio", proficiency_level: "expert", years_experience: 10 },
  { id: "demo-4", crew_id: "crew-2", skill_name: "Video", proficiency_level: "intermediate", years_experience: 3 },
  { id: "demo-5", crew_id: "crew-3", skill_name: "Lighting", proficiency_level: "advanced", years_experience: 6 },
];

const DEMO_CREW: CrewMember[] = [
  { id: "crew-1", full_name: "John Smith", status: "Active" },
  { id: "crew-2", full_name: "Sarah Johnson", status: "Active" },
  { id: "crew-3", full_name: "Mike Williams", status: "Active" },
];

export default function SkillsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSkill, setFilterSkill] = useState("all");
  
  const { data: skills, isLoading: skillsLoading, error: skillsError, refetch } = useCrewSkills();
  const { data: crew, isLoading: crewLoading } = useCrew();

  const isLoading = skillsLoading || crewLoading;

  if (isLoading) {
    return (
      <CompvssAppLayout>
        <EnterprisePageHeader
          title="Skills Matrix"
          subtitle="Crew skills, certifications, and proficiency levels"
  
  
          showFavorite
          showSettings
        />
        <MainContent padding="lg">
          <Container className="flex min-h-[60vh] items-center justify-center">
            <Spinner variant="grey" size="lg" text="Loading skills matrix..." />
          </Container>
        </MainContent>
      </CompvssAppLayout>
    );
  }

  // Use demo data when there's an error (e.g., unauthenticated)
  const effectiveSkills = skillsError ? DEMO_SKILLS : (skills || []);
  const effectiveCrew = skillsError ? DEMO_CREW : (crew || []);

  // Group skills by crew member
  const crewWithSkills: CrewWithSkills[] = effectiveCrew.map((member: CrewMember) => {
    const memberSkills = effectiveSkills.filter((s: CrewSkill) => s.crew_id === member.id);
    return {
      ...member,
      skills: memberSkills.map((s: CrewSkill) => s.skill_name),
      skillDetails: memberSkills,
      level: memberSkills.length > 0 
        ? memberSkills.reduce((highest: string, s: CrewSkill) => {
            const levels = ['beginner', 'intermediate', 'advanced', 'expert'];
            return levels.indexOf(s.proficiency_level) > levels.indexOf(highest) ? s.proficiency_level : highest;
          }, 'beginner')
        : 'N/A',
    };
  });

  const filteredCrew = crewWithSkills.filter((member: CrewWithSkills) => {
    const matchesSearch = member.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          member.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          member.last_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSkill = filterSkill === "all" || 
                         member.skills.some((s: string) => s.toLowerCase().includes(filterSkill.toLowerCase()));
    return matchesSearch && matchesSkill;
  });

  const expertCount = crewWithSkills.filter((c: CrewWithSkills) => c.level === 'expert').length;
  const totalSkills = skills?.length || 0;
  const uniqueSkillNames = new Set((skills || []).map((s: CrewSkill) => s.skill_name));

  const getLevelVariant = (level: string): "solid" | "outline" | "ghost" => {
    switch (level?.toLowerCase()) {
      case "expert":
        return "solid";
      case "advanced":
        return "outline";
      default:
        return "ghost";
    }
  };

  return (
    <CompvssAppLayout>
      <EnterprisePageHeader
        title="Skills Matrix"
        subtitle="Crew skills, certifications, and proficiency levels"


        primaryAction={{ label: 'Add Skills', onClick: () => router.push('/skills/new') }}
        secondaryActions={[{ id: 'refresh', label: 'Refresh', onClick: () => { refetch(); } }]}
        showFavorite
        showSettings
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={10}>

            <Grid cols={4} gap={6}>
              <StatCard
                value={crewWithSkills.length.toString()}
                label="Total Crew"
              />
              <StatCard
                value={expertCount.toString()}
                label="Expert Level"
              />
              <StatCard
                value={uniqueSkillNames.size.toString()}
                label="Unique Skills"
              />
              <StatCard
                value={totalSkills.toString()}
                label="Total Certifications"
              />
            </Grid>

            <Stack gap={4} direction="horizontal">
              <Input
                type="search"
                placeholder="Search crew..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Select
                value={filterSkill}
                onChange={(e) => setFilterSkill(e.target.value)}
              >
                <option value="all">All Skills</option>
                {skillCategories.map(skill => (
                  <option key={skill} value={skill}>{skill}</option>
                ))}
              </Select>
            </Stack>

            {filteredCrew.length === 0 ? (
              <EmptyState
                title="No Crew Found"
                description={searchQuery ? "Try adjusting your search criteria" : "Add crew members to get started"}
                action={{ label: "Add Crew", onClick: () => router.push("/crew/new") }}
              />
            ) : (
              <Table variant="dark">
                <TableHeader>
                  <TableRow>
                    <TableHead>Crew Member</TableHead>
                    <TableHead>Skills</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCrew.map((member: CrewWithSkills) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <Body>{member.full_name || `${member.first_name || ''} ${member.last_name || ''}`.trim() || 'Unknown'}</Body>
                      </TableCell>
                      <TableCell>
                        <Stack gap={2} direction="horizontal" className="flex-wrap">
                          {member.skills.length > 0 ? (
                            member.skills.slice(0, 4).map((skill: string, idx: number) => (
                              <Badge key={idx} variant="outline">{skill}</Badge>
                            ))
                          ) : (
                            <Badge variant="ghost">No skills</Badge>
                          )}
                          {member.skills.length > 4 && (
                            <Badge variant="ghost">+{member.skills.length - 4}</Badge>
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getLevelVariant(member.level)}>
                          {member.level?.charAt(0).toUpperCase() + member.level?.slice(1) || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Body size="sm" className="">{member.status || member.availability || 'Active'}</Body>
                      </TableCell>
                      <TableCell>
                        <Stack gap={2} direction="horizontal">
                          <Button size="sm" variant="ghost" onClick={() => router.push(`/crew/${member.id}`)}>
                            View
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => router.push(`/crew/${member.id}/skills`)}>
                            Add Skill
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            <Stack gap={3} direction="horizontal">
              <Button variant="solid" onClick={() => router.push("/skills/new")}>
                Add Skills
              </Button>
              <Button variant="outline" onClick={() => router.push("/skills/export")}>
                Export Matrix
              </Button>
            </Stack>
          </Stack>
        </Container>
      </MainContent>
    </CompvssAppLayout>
  );
}
