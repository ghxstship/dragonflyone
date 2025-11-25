"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "../../components/navigation";
import { useCrewSkills } from "../../hooks/useSkills";
import { useCrew } from "../../hooks/useCrew";
import {
  H1,
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
  LoadingSpinner,
  EmptyState,
  Container,
  Grid,
  Stack,
  Section,
} from "@ghxstship/ui";

const skillCategories = ["Rigging", "Audio", "Video", "Lighting", "Staging", "Electrical", "Safety"];

export default function SkillsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSkill, setFilterSkill] = useState("all");
  
  const { data: skills, isLoading: skillsLoading, error: skillsError, refetch } = useCrewSkills();
  const { data: crew, isLoading: crewLoading } = useCrew();

  const isLoading = skillsLoading || crewLoading;

  if (isLoading) {
    return (
      <Section className="relative min-h-screen bg-black text-white">
        <Navigation />
        <Container className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner size="lg" text="Loading skills matrix..." />
        </Container>
      </Section>
    );
  }

  if (skillsError) {
    return (
      <Section className="relative min-h-screen bg-black text-white">
        <Navigation />
        <Container className="py-16">
          <EmptyState
            title="Error Loading Skills"
            description={skillsError instanceof Error ? skillsError.message : "An error occurred"}
            action={{ label: "Retry", onClick: () => refetch() }}
          />
        </Container>
      </Section>
    );
  }

  // Group skills by crew member
  const crewWithSkills = (crew || []).map((member: any) => {
    const memberSkills = (skills || []).filter((s: any) => s.crew_id === member.id);
    return {
      ...member,
      skills: memberSkills.map((s: any) => s.skill_name),
      skillDetails: memberSkills,
      level: memberSkills.length > 0 
        ? memberSkills.reduce((highest: string, s: any) => {
            const levels = ['beginner', 'intermediate', 'advanced', 'expert'];
            return levels.indexOf(s.proficiency_level) > levels.indexOf(highest) ? s.proficiency_level : highest;
          }, 'beginner')
        : 'N/A',
    };
  });

  const filteredCrew = crewWithSkills.filter((member: any) => {
    const matchesSearch = member.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          member.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          member.last_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSkill = filterSkill === "all" || 
                         member.skills.some((s: string) => s.toLowerCase().includes(filterSkill.toLowerCase()));
    return matchesSearch && matchesSkill;
  });

  const expertCount = crewWithSkills.filter((c: any) => c.level === 'expert').length;
  const totalSkills = skills?.length || 0;
  const uniqueSkillNames = new Set((skills || []).map((s: any) => s.skill_name));

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
    <Section className="relative min-h-screen bg-black text-white">
      <Navigation />
      <Container className="py-16">
        <Stack gap={8}>
          <H1>Skills Matrix</H1>

          <Grid cols={4} gap={6}>
            <StatCard
              value={crewWithSkills.length}
              label="Total Crew"
              className="bg-black text-white border-grey-800"
            />
            <StatCard
              value={expertCount}
              label="Expert Level"
              className="bg-black text-white border-grey-800"
            />
            <StatCard
              value={uniqueSkillNames.size}
              label="Unique Skills"
              className="bg-black text-white border-grey-800"
            />
            <StatCard
              value={totalSkills}
              label="Total Certifications"
              className="bg-black text-white border-grey-800"
            />
          </Grid>

          <Stack gap={4} direction="horizontal">
            <Input
              type="search"
              placeholder="Search crew..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              fullWidth
              className="flex-1 bg-black text-white border-grey-700 placeholder:text-grey-500"
            />
            <Select
              value={filterSkill}
              onChange={(e) => setFilterSkill(e.target.value)}
              className="bg-black text-white border-grey-700"
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
            <Table variant="bordered" className="bg-black">
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
                {filteredCrew.map((member: any) => (
                  <TableRow key={member.id} className="bg-black text-white hover:bg-grey-900">
                    <TableCell className="text-white">
                      {member.full_name || `${member.first_name || ''} ${member.last_name || ''}`.trim() || 'Unknown'}
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
                    <TableCell className="text-grey-400">
                      {member.status || member.availability || 'Active'}
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
            <Button variant="outlineWhite" onClick={() => router.push("/skills/new")}>
              Add Skills
            </Button>
            <Button variant="ghost" className="text-grey-400 hover:text-white" onClick={() => router.push("/skills/export")}>
              Export Matrix
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Section>
  );
}
