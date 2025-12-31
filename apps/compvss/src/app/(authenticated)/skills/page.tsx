"use client";

import { useRouter } from "next/navigation";
// Layout provided by route group
import { useCrewSkills } from "@/hooks/useSkills";
import { useCrew } from "@/hooks/useCrew";
import {
  ListPage, Badge, Stack,
  type ListPageColumn, type ListPageFilter, type ListPageAction} from "@ghxstship/ui";
import { getSubcategoryNames, createExportHandler } from "@ghxstship/config";

const skillCategories = getSubcategoryNames('TECH');

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
  status?: string;
}

interface CrewWithSkills extends CrewMember {
  skills: string[];
  skillDetails: CrewSkill[];
  level: string;
}

const getLevelVariant = (level: string): "solid" | "outline" | "ghost" => {
  switch (level?.toLowerCase()) {
    case "expert": return "solid";
    case "advanced": return "outline";
    default: return "ghost";
  }
};

export default function SkillsPage() {
  const router = useRouter();
  const { data: skills, isLoading: skillsLoading, refetch } = useCrewSkills();
  const { data: crew, isLoading: crewLoading } = useCrew();

  const isLoading = skillsLoading || crewLoading;

  // Use API data (empty arrays if error)
  const effectiveSkills = skills || [];
  const effectiveCrew = crew || [];

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

  const expertCount = crewWithSkills.filter((c: CrewWithSkills) => c.level === 'expert').length;
  const totalSkills = skills?.length || 0;
  const uniqueSkillNames = new Set((skills || []).map((s: CrewSkill) => s.skill_name));

  const columns: ListPageColumn<CrewWithSkills>[] = [
    {
      key: 'name',
      label: 'Crew Member',
      accessor: (m) => m.full_name || `${m.first_name || ''} ${m.last_name || ''}`.trim() || 'Unknown',
      sortable: true,
    },
    {
      key: 'skills',
      label: 'Skills',
      accessor: (m) => m.skills.join(', '),
      render: (_value: unknown, member) => (
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
      ),
    },
    {
      key: 'level',
      label: 'Level',
      accessor: 'level',
      sortable: true,
      render: (_value: unknown, member) => (
        <Badge variant={getLevelVariant(member.level)}>
          {member.level?.charAt(0).toUpperCase() + member.level?.slice(1) || 'N/A'}
        </Badge>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      accessor: (m) => m.status || 'Active',
      sortable: true,
    },
  ];

  const filters: ListPageFilter[] = [
    {
      key: 'skill',
      label: 'Skill',
      options: skillCategories.map(skill => ({ value: skill, label: skill })),
    },
  ];

  const rowActions: ListPageAction<CrewWithSkills>[] = [
    { id: 'view', label: 'View', onClick: (member) => router.push(`/crew/${member.id}`) },
    { id: 'add-skill', label: 'Add Skill', onClick: (member) => router.push(`/crew/${member.id}/skills`) },
  ];

  const stats = [
    { label: 'Total Crew', value: crewWithSkills.length },
    { label: 'Expert Level', value: expertCount },
    { label: 'Unique Skills', value: uniqueSkillNames.size },
    { label: 'Total Certifications', value: totalSkills },
  ];

  return (
    <ListPage<CrewWithSkills>
      title="Skills Matrix"
      subtitle="Crew skills, certifications, and proficiency levels"
      data={crewWithSkills}
      columns={columns}
      rowKey="id"
      loading={isLoading}
      onRetry={() => { refetch(); }}
      searchPlaceholder="Search crew..."
      filters={filters}
      rowActions={rowActions}
      onRowClick={(member) => router.push(`/crew/${member.id}`)}
      createLabel="Add Skills"
      onCreate={() => router.push('/skills/new')}
      entityType="skills"
      onExport={createExportHandler({
        filename: "skills-matrix",
        getData: () => crewWithSkills.map(m => ({
          name: m.full_name || `${m.first_name || ''} ${m.last_name || ''}`.trim(),
          skills: m.skills.join(', '),
          level: m.level,
          status: m.status || 'Active',
        })),
      })}
      stats={stats}
      emptyMessage="No crew found"
      emptyAction={{ label: 'Add Crew', onClick: () => router.push('/crew/new') }}
      enableCapabilityDetection
      onScanAction={(capability, route) => router.push(route)}
      capabilityBasePath=""
      showFavorite
      showSettings
    />
  );
}
