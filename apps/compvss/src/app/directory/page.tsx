'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Section,
  Display,
  Body,
  Button,
  Card,
  Field,
  Input,
  Select,
  Grid,
  Badge,
  Stack,
  LoadingSpinner,
  H3,
} from '@ghxstship/ui';
import { useCrew } from '../../hooks/useCrew';

// Available languages for filtering
const LANGUAGES = [
  { value: 'all', label: 'All Languages' },
  { value: 'english', label: 'English' },
  { value: 'spanish', label: 'Spanish' },
  { value: 'french', label: 'French' },
  { value: 'german', label: 'German' },
  { value: 'portuguese', label: 'Portuguese' },
  { value: 'mandarin', label: 'Mandarin' },
  { value: 'japanese', label: 'Japanese' },
  { value: 'korean', label: 'Korean' },
  { value: 'italian', label: 'Italian' },
  { value: 'russian', label: 'Russian' },
  { value: 'arabic', label: 'Arabic' },
];

// Available specialties for filtering
const SPECIALTIES = [
  { value: 'all', label: 'All Specialties' },
  { value: 'audio', label: 'Audio Engineering' },
  { value: 'lighting', label: 'Lighting Design' },
  { value: 'video', label: 'Video Production' },
  { value: 'rigging', label: 'Rigging' },
  { value: 'staging', label: 'Staging' },
  { value: 'backline', label: 'Backline' },
  { value: 'pyrotechnics', label: 'Pyrotechnics' },
  { value: 'carpentry', label: 'Carpentry' },
  { value: 'scenic', label: 'Scenic Design' },
  { value: 'wardrobe', label: 'Wardrobe' },
  { value: 'makeup', label: 'Hair & Makeup' },
  { value: 'catering', label: 'Catering' },
  { value: 'security', label: 'Security' },
  { value: 'transportation', label: 'Transportation' },
  { value: 'production', label: 'Production Management' },
  { value: 'stage-management', label: 'Stage Management' },
  { value: 'tour-management', label: 'Tour Management' },
];

// Experience levels
const EXPERIENCE_LEVELS = [
  { value: 'all', label: 'All Experience Levels' },
  { value: 'entry', label: 'Entry Level (0-2 years)' },
  { value: 'mid', label: 'Mid Level (3-5 years)' },
  { value: 'senior', label: 'Senior (6-10 years)' },
  { value: 'expert', label: 'Expert (10+ years)' },
];

// Availability status
const AVAILABILITY_STATUS = [
  { value: 'all', label: 'All Availability' },
  { value: 'available', label: 'Available Now' },
  { value: 'busy', label: 'Currently Busy' },
  { value: 'unavailable', label: 'Unavailable' },
];

export default function DirectoryPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [specialtyFilter, setSpecialtyFilter] = useState('all');
  const [experienceFilter, setExperienceFilter] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  const { data: crew, isLoading } = useCrew();

  // Extract unique values from crew data for dynamic filtering
  const filterOptions = useMemo(() => {
    if (!crew) return { languages: [], specialties: [], departments: [] };
    
    const languages = new Set<string>();
    const specialties = new Set<string>();
    const departments = new Set<string>();
    
    crew.forEach((member: any) => {
      if (member.languages) {
        (Array.isArray(member.languages) ? member.languages : [member.languages]).forEach((lang: string) => {
          if (lang) languages.add(lang.toLowerCase());
        });
      }
      if (member.skills) {
        (Array.isArray(member.skills) ? member.skills : [member.skills]).forEach((skill: string) => {
          if (skill) specialties.add(skill.toLowerCase());
        });
      }
      if (member.specialty) specialties.add(member.specialty.toLowerCase());
      if (member.department) departments.add(member.department);
    });
    
    return {
      languages: Array.from(languages),
      specialties: Array.from(specialties),
      departments: Array.from(departments),
    };
  }, [crew]);

  const filtered = useMemo(() => {
    return (crew || []).filter((item: any) => {
      // Search term filter
      const searchFields = [
        item.name,
        item.full_name,
        item.role,
        item.department,
        item.email,
        ...(item.skills || []),
        ...(item.languages || []),
        item.specialty,
      ].filter(Boolean).join(' ').toLowerCase();
      
      const matchesSearch = !searchTerm || searchFields.includes(searchTerm.toLowerCase());
      
      // Type filter
      const matchesType = typeFilter === 'all' || 
        item.role?.toLowerCase().includes(typeFilter.toLowerCase()) ||
        item.type?.toLowerCase() === typeFilter.toLowerCase();
      
      // Language filter
      const itemLanguages = Array.isArray(item.languages) 
        ? item.languages.map((l: string) => l.toLowerCase())
        : item.languages ? [item.languages.toLowerCase()] : [];
      const matchesLanguage = languageFilter === 'all' || 
        itemLanguages.includes(languageFilter.toLowerCase());
      
      // Specialty filter
      const itemSkills = Array.isArray(item.skills)
        ? item.skills.map((s: string) => s.toLowerCase())
        : item.skills ? [item.skills.toLowerCase()] : [];
      const itemSpecialty = item.specialty?.toLowerCase() || '';
      const matchesSpecialty = specialtyFilter === 'all' ||
        itemSkills.some((s: string) => s.includes(specialtyFilter.toLowerCase())) ||
        itemSpecialty.includes(specialtyFilter.toLowerCase());
      
      // Experience filter
      const yearsExp = item.years_experience || item.experience_years || 0;
      let matchesExperience = true;
      if (experienceFilter !== 'all') {
        switch (experienceFilter) {
          case 'entry': matchesExperience = yearsExp <= 2; break;
          case 'mid': matchesExperience = yearsExp >= 3 && yearsExp <= 5; break;
          case 'senior': matchesExperience = yearsExp >= 6 && yearsExp <= 10; break;
          case 'expert': matchesExperience = yearsExp > 10; break;
        }
      }
      
      // Availability filter
      const itemAvailability = item.availability?.toLowerCase() || item.status?.toLowerCase() || 'available';
      const matchesAvailability = availabilityFilter === 'all' ||
        itemAvailability.includes(availabilityFilter.toLowerCase());
      
      return matchesSearch && matchesType && matchesLanguage && 
             matchesSpecialty && matchesExperience && matchesAvailability;
    });
  }, [crew, searchTerm, typeFilter, languageFilter, specialtyFilter, experienceFilter, availabilityFilter]);

  const clearFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
    setLanguageFilter('all');
    setSpecialtyFilter('all');
    setExperienceFilter('all');
    setAvailabilityFilter('all');
  };

  const activeFilterCount = [
    typeFilter !== 'all',
    languageFilter !== 'all',
    specialtyFilter !== 'all',
    experienceFilter !== 'all',
    availabilityFilter !== 'all',
  ].filter(Boolean).length;

  if (isLoading) {
    return (
      <Section className="min-h-screen bg-white flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading directory..." />
      </Section>
    );
  }

  return (
    <Section className="min-h-screen bg-white">
      <Container>
        <Stack gap={8}>
          <Card className="border-b-2 border-black py-8 bg-transparent rounded-none">
            <Stack gap={2}>
              <Display>DIRECTORY</Display>
              <Body variant="muted">
                Search and filter crew, vendors, and venues by language, specialty, and more
              </Body>
            </Stack>
          </Card>

          {/* Primary Search and Filters */}
          <Card className="p-6">
            <Stack gap={6}>
              <Grid cols={4} gap={4}>
                <Field label="Search">
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name, skill, language..."
                  />
                </Field>

                <Field label="Type">
                  <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                    <option value="all">All Types</option>
                    <option value="crew">Crew</option>
                    <option value="vendor">Vendors</option>
                    <option value="venue">Venues</option>
                  </Select>
                </Field>

                <Field label="Language">
                  <Select value={languageFilter} onChange={(e) => setLanguageFilter(e.target.value)}>
                    {LANGUAGES.map((lang) => (
                      <option key={lang.value} value={lang.value}>{lang.label}</option>
                    ))}
                  </Select>
                </Field>

                <Field label="Specialty">
                  <Select value={specialtyFilter} onChange={(e) => setSpecialtyFilter(e.target.value)}>
                    {SPECIALTIES.map((spec) => (
                      <option key={spec.value} value={spec.value}>{spec.label}</option>
                    ))}
                  </Select>
                </Field>
              </Grid>

              {/* Advanced Filters Toggle */}
              <Stack direction="horizontal" gap={4} className="items-center justify-between">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                >
                  {showAdvancedFilters ? 'Hide' : 'Show'} Advanced Filters
                  {activeFilterCount > 0 && (
                    <Badge className="ml-2">{activeFilterCount}</Badge>
                  )}
                </Button>
                
                {activeFilterCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear All Filters
                  </Button>
                )}
              </Stack>

              {/* Advanced Filters */}
              {showAdvancedFilters && (
                <Grid cols={3} gap={4}>
                  <Field label="Experience Level">
                    <Select value={experienceFilter} onChange={(e) => setExperienceFilter(e.target.value)}>
                      {EXPERIENCE_LEVELS.map((level) => (
                        <option key={level.value} value={level.value}>{level.label}</option>
                      ))}
                    </Select>
                  </Field>

                  <Field label="Availability">
                    <Select value={availabilityFilter} onChange={(e) => setAvailabilityFilter(e.target.value)}>
                      {AVAILABILITY_STATUS.map((status) => (
                        <option key={status.value} value={status.value}>{status.label}</option>
                      ))}
                    </Select>
                  </Field>

                  <Stack className="justify-end">
                    <Button variant="solid" onClick={() => {}}>Apply Filters</Button>
                  </Stack>
                </Grid>
              )}
            </Stack>
          </Card>

          {/* Results Summary */}
          <Stack direction="horizontal" gap={4} className="items-center justify-between">
            <Body variant="muted">
              Showing {filtered.length} of {crew?.length || 0} results
            </Body>
            {activeFilterCount > 0 && (
              <Stack direction="horizontal" gap={2} className="flex-wrap">
                {typeFilter !== 'all' && (
                  <Badge variant="outline">Type: {typeFilter}</Badge>
                )}
                {languageFilter !== 'all' && (
                  <Badge variant="outline">Language: {languageFilter}</Badge>
                )}
                {specialtyFilter !== 'all' && (
                  <Badge variant="outline">Specialty: {specialtyFilter}</Badge>
                )}
                {experienceFilter !== 'all' && (
                  <Badge variant="outline">Experience: {experienceFilter}</Badge>
                )}
                {availabilityFilter !== 'all' && (
                  <Badge variant="outline">Availability: {availabilityFilter}</Badge>
                )}
              </Stack>
            )}
          </Stack>

          {/* Results List */}
          <Stack gap={4}>
            {filtered.length === 0 ? (
              <Card className="p-8 text-center">
                <Stack gap={4} className="items-center">
                  <H3>No Results Found</H3>
                  <Body variant="muted">
                    Try adjusting your filters or search term
                  </Body>
                  <Button variant="outline" onClick={clearFilters}>
                    Clear All Filters
                  </Button>
                </Stack>
              </Card>
            ) : (
              filtered.map((item: any) => (
                <Card key={item.id} className="p-6">
                  <Grid cols={4} gap={4}>
                    <Stack gap={2}>
                      <Body className="font-bold text-lg">{item.name || item.full_name}</Body>
                      <Stack direction="horizontal" gap={2}>
                        <Badge>CREW</Badge>
                        {item.availability === 'available' && (
                          <Badge variant="outline">Available</Badge>
                        )}
                      </Stack>
                    </Stack>
                    <Stack gap={1}>
                      <Body className="text-sm font-medium">{item.role || 'N/A'}</Body>
                      <Body className="text-sm" variant="muted">{item.department || ''}</Body>
                    </Stack>
                    <Stack gap={1}>
                      <Body className="text-sm font-medium">Languages</Body>
                      <Body className="text-sm" variant="muted">
                        {Array.isArray(item.languages) 
                          ? item.languages.join(', ') 
                          : item.languages || 'English'}
                      </Body>
                    </Stack>
                    <Stack gap={1}>
                      <Body className="text-sm font-medium">Skills</Body>
                      <Body className="text-sm" variant="muted">
                        {Array.isArray(item.skills) 
                          ? item.skills.slice(0, 3).join(', ')
                          : item.specialty || 'N/A'}
                      </Body>
                    </Stack>
                    <Stack gap={2} direction="horizontal" className="justify-end items-center">
                      <Button variant="outline" size="sm" onClick={() => router.push(`/crew/${item.id}`)}>
                        View Profile
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => router.push(`/crew/${item.id}/contact`)}>
                        Contact
                      </Button>
                    </Stack>
                  </Grid>
                </Card>
              ))
            )}
          </Stack>
        </Stack>
      </Container>
    </Section>
  );
}
