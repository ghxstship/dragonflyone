"use client";

import { useRouter } from "next/navigation";
import { useCrewSkills } from "@/hooks/useSkills";
import { useCrew } from "@/hooks/useCrew";
import {
  ListPage,
  type ListPageAction} from "@ghxstship/ui";
import { createExportHandler, getEntityColumns, getEntityFilters } from "@ghxstship/config";

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

  const columns = getEntityColumns<CrewWithSkills>('skills');
  const filters = getEntityFilters('skills');

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
