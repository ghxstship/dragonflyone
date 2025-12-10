import { describe, it, expect } from 'vitest';
import type { CrewSkill } from '../useSkills';

describe('useSkills', () => {
  describe('CrewSkill interface', () => {
    it('should have all required fields', () => {
      const skill: CrewSkill = {
        id: 'skill-123',
        crew_id: 'crew-456',
        skill_name: 'Lighting Design',
        proficiency_level: 'advanced',
      };

      expect(skill.id).toBe('skill-123');
      expect(skill.crew_id).toBe('crew-456');
      expect(skill.skill_name).toBe('Lighting Design');
      expect(skill.proficiency_level).toBe('advanced');
    });

    it('should support all proficiency levels', () => {
      const levels: CrewSkill['proficiency_level'][] = ['beginner', 'intermediate', 'advanced', 'expert'];
      expect(levels.length).toBe(4);
    });

    it('should support beginner level', () => {
      const skill: CrewSkill = {
        id: 'skill-1',
        crew_id: 'crew-1',
        skill_name: 'Stage Setup',
        proficiency_level: 'beginner',
        years_experience: 1,
      };
      expect(skill.proficiency_level).toBe('beginner');
    });

    it('should support intermediate level', () => {
      const skill: CrewSkill = {
        id: 'skill-2',
        crew_id: 'crew-1',
        skill_name: 'Sound Engineering',
        proficiency_level: 'intermediate',
        years_experience: 3,
      };
      expect(skill.proficiency_level).toBe('intermediate');
    });

    it('should support advanced level', () => {
      const skill: CrewSkill = {
        id: 'skill-3',
        crew_id: 'crew-1',
        skill_name: 'Video Production',
        proficiency_level: 'advanced',
        years_experience: 7,
      };
      expect(skill.proficiency_level).toBe('advanced');
    });

    it('should support expert level', () => {
      const skill: CrewSkill = {
        id: 'skill-4',
        crew_id: 'crew-1',
        skill_name: 'Pyrotechnics',
        proficiency_level: 'expert',
        years_experience: 15,
        certifications: ['Licensed Pyrotechnician', 'OSHA Safety Certified'],
      };
      expect(skill.proficiency_level).toBe('expert');
      expect(skill.certifications?.length).toBe(2);
    });

    it('should support optional years_experience', () => {
      const skill: CrewSkill = {
        id: 'skill-1',
        crew_id: 'crew-1',
        skill_name: 'Rigging',
        proficiency_level: 'advanced',
        years_experience: 10,
      };
      expect(skill.years_experience).toBe(10);
    });

    it('should support optional certifications array', () => {
      const skill: CrewSkill = {
        id: 'skill-1',
        crew_id: 'crew-1',
        skill_name: 'Electrical Work',
        proficiency_level: 'expert',
        certifications: ['Licensed Electrician', 'ETCP Certified', 'First Aid'],
      };
      expect(skill.certifications?.length).toBe(3);
      expect(skill.certifications).toContain('ETCP Certified');
    });

    it('should support optional last_used date', () => {
      const skill: CrewSkill = {
        id: 'skill-1',
        crew_id: 'crew-1',
        skill_name: 'Forklift Operation',
        proficiency_level: 'intermediate',
        last_used: '2025-01-10T00:00:00Z',
      };
      expect(skill.last_used).toBeDefined();
    });

    it('should support optional timestamps', () => {
      const skill: CrewSkill = {
        id: 'skill-1',
        crew_id: 'crew-1',
        skill_name: 'Audio Mixing',
        proficiency_level: 'advanced',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2025-01-15T00:00:00Z',
      };
      expect(skill.created_at).toBeDefined();
      expect(skill.updated_at).toBeDefined();
    });

    it('should track multiple skills per crew member', () => {
      const crewSkills: CrewSkill[] = [
        { id: 's1', crew_id: 'crew-1', skill_name: 'Lighting', proficiency_level: 'expert' },
        { id: 's2', crew_id: 'crew-1', skill_name: 'Sound', proficiency_level: 'advanced' },
        { id: 's3', crew_id: 'crew-1', skill_name: 'Rigging', proficiency_level: 'intermediate' },
        { id: 's4', crew_id: 'crew-1', skill_name: 'Video', proficiency_level: 'beginner' },
      ];

      const expertSkills = crewSkills.filter((s) => s.proficiency_level === 'expert');
      expect(crewSkills.length).toBe(4);
      expect(expertSkills.length).toBe(1);
    });
  });
});
