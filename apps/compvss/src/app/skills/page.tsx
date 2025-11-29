"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreatorNavigationAuthenticated } from "../../components/navigation";
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
  LoadingSpinner,
  EmptyState,
  Container,
  Grid,
  Stack,
  Section,
  Body,
  PageLayout,
  SectionHeader,
  EnterprisePageHeader,
  MainContent,} from "@ghxstship/ui";

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
      <PageLayout background="white" header={<CreatorNavigationAuthenticated />}>
        <Section className="min-h-screen py-16">
          <Container className="flex min-h-[60vh] items-center justify-center">
            <LoadingSpinner size="lg" text="Loading skills matrix..." />
          </Container>
        </Section>
      </PageLayout>
    );
  }

  if (skillsError) {
    return (
      <PageLayout background="white" header={<CreatorNavigationAuthenticated />}>
        <Section className="min-h-screen py-16">
          <Container>
            <EmptyState
              title="Error Loading Skills"
              description={skillsError instanceof Error ? skillsError.message : "An error occurred"}
              action={{ label: "Retry", onClick: () => refetch() }}
            />
          </Container>
        </Section>
      </PageLayout>
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
    <PageLayout background="white" header={<CreatorNavigationAuthenticated />}>
      <Section className="min-h-screen py-16">
        <Container>
          <Stack gap={10}>
            <EnterprisePageHeader
        title="Skills Matrix"
        subtitle="Crew skills, certifications, and proficiency levels"
        breadcrumbs={[{ label: 'COMPVSS', href: '/dashboard' }, { label: 'Skills' }]}
        views={[
          { id: 'default', label: 'Default', icon: 'grid' },
        ]}
        activeView="default"
        showFavorite
        showSettings
      />

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
              <Table>
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
                        <Body className="text-body-sm">{member.status || member.availability || 'Active'}</Body>
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
      </Section>
    </PageLayout>
  );
}
