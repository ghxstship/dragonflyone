'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreatorNavigationAuthenticated } from '../../../components/navigation';
import {
  Container,
  H3,
  Body,
  Grid,
  Stack,
  StatCard,
  Select,
  Button,
  Section,
  Card,
  Badge,
  PageLayout,
  SectionHeader,
  EnterprisePageHeader,
  MainContent,} from '@ghxstship/ui';

interface DirectoryEntry {
  id: string;
  name: string;
  type: 'Crew' | 'Vendor' | 'Venue';
  specialties: string[];
  languages: string[];
  location: string;
  rating: number;
  available: boolean;
}

const mockEntries: DirectoryEntry[] = [
  { id: 'DIR-001', name: 'John Smith', type: 'Crew', specialties: ['Audio Engineer', 'FOH Mixer', 'System Tech'], languages: ['English', 'Spanish'], location: 'Los Angeles, CA', rating: 4.9, available: true },
  { id: 'DIR-002', name: 'Maria Garcia', type: 'Crew', specialties: ['Lighting Designer', 'Programmer'], languages: ['Spanish', 'English', 'Portuguese'], location: 'Miami, FL', rating: 4.8, available: true },
  { id: 'DIR-003', name: 'PRG', type: 'Vendor', specialties: ['Audio', 'Lighting', 'Video', 'Staging'], languages: ['English'], location: 'Multiple', rating: 4.7, available: true },
  { id: 'DIR-004', name: 'Hans Mueller', type: 'Crew', specialties: ['Rigger', 'Head Rigger'], languages: ['German', 'English'], location: 'New York, NY', rating: 4.9, available: false },
  { id: 'DIR-005', name: 'Madison Square Garden', type: 'Venue', specialties: ['Arena', 'Concert', 'Sports'], languages: ['English'], location: 'New York, NY', rating: 4.8, available: true },
  { id: 'DIR-006', name: 'Yuki Tanaka', type: 'Crew', specialties: ['Video Director', 'LED Tech'], languages: ['Japanese', 'English'], location: 'Los Angeles, CA', rating: 4.7, available: true },
];

const allSpecialties = ['Audio Engineer', 'FOH Mixer', 'System Tech', 'Lighting Designer', 'Programmer', 'Rigger', 'Head Rigger', 'Video Director', 'LED Tech', 'Stage Manager', 'Audio', 'Lighting', 'Video', 'Staging', 'Arena', 'Concert', 'Sports'];
const allLanguages = ['English', 'Spanish', 'Portuguese', 'German', 'French', 'Japanese', 'Mandarin', 'Korean'];

export default function DirectoryFiltersPage() {
  const router = useRouter();
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [typeFilter, setTypeFilter] = useState('All');
  const [availableOnly, setAvailableOnly] = useState(false);

  const filteredEntries = mockEntries.filter(entry => {
    const matchesType = typeFilter === 'All' || entry.type === typeFilter;
    const matchesLanguages = selectedLanguages.length === 0 || selectedLanguages.some(l => entry.languages.includes(l));
    const matchesSpecialties = selectedSpecialties.length === 0 || selectedSpecialties.some(s => entry.specialties.includes(s));
    const matchesAvailable = !availableOnly || entry.available;
    return matchesType && matchesLanguages && matchesSpecialties && matchesAvailable;
  });

  const toggleLanguage = (lang: string) => {
    setSelectedLanguages(prev => prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]);
  };

  const toggleSpecialty = (spec: string) => {
    setSelectedSpecialties(prev => prev.includes(spec) ? prev.filter(s => s !== spec) : [...prev, spec]);
  };

  return (
    <PageLayout background="white" header={<CreatorNavigationAuthenticated />}>
      <Section className="min-h-screen py-16">
        <Container>
          <Stack gap={10}>
            <EnterprisePageHeader
        title="Directory Search"
        subtitle="Filter by language and specialty"
        breadcrumbs={[{ label: 'COMPVSS', href: '/dashboard' }, { label: 'Directory', href: '/directory' }, { label: 'Filters' }]}
        views={[
          { id: 'default', label: 'Default', icon: 'grid' },
        ]}
        activeView="default"
        showFavorite
        showSettings
      />

            <Grid cols={4} gap={6}>
              <StatCard value={filteredEntries.length.toString()} label="Total Results" />
              <StatCard value={filteredEntries.filter(e => e.type === 'Crew').length.toString()} label="Crew" />
              <StatCard value={filteredEntries.filter(e => e.type === 'Vendor').length.toString()} label="Vendors" />
              <StatCard value={filteredEntries.filter(e => e.type === 'Venue').length.toString()} label="Venues" />
            </Grid>

            <Grid cols={4} gap={6}>
              <Card className="col-span-1 p-4">
                <Stack gap={4}>
                  <H3>Filters</H3>
                  
                  <Stack gap={2}>
                    <Body className="font-display">Type</Body>
                    <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                      <option value="All">All Types</option>
                      <option value="Crew">Crew</option>
                      <option value="Vendor">Vendor</option>
                      <option value="Venue">Venue</option>
                    </Select>
                  </Stack>

                  <Stack gap={2}>
                    <Body className="font-display">Languages</Body>
                    <Stack gap={1}>
                      {allLanguages.map(lang => (
                        <Stack key={lang} direction="horizontal" gap={2} className="cursor-pointer" onClick={() => toggleLanguage(lang)}>
                          <Card className={`size-4 rounded-badge border-2 ${selectedLanguages.includes(lang) ? 'bg-primary-500' : ''}`} />
                          <Body className="text-body-sm">{lang}</Body>
                        </Stack>
                      ))}
                    </Stack>
                  </Stack>

                  <Stack gap={2}>
                    <Body className="font-display">Specialties</Body>
                    <Stack gap={1} className="max-h-48 overflow-y-auto">
                      {allSpecialties.slice(0, 10).map(spec => (
                        <Stack key={spec} direction="horizontal" gap={2} className="cursor-pointer" onClick={() => toggleSpecialty(spec)}>
                          <Card className={`size-4 rounded-badge border-2 ${selectedSpecialties.includes(spec) ? 'bg-primary-500' : ''}`} />
                          <Body className="text-body-sm">{spec}</Body>
                        </Stack>
                      ))}
                    </Stack>
                  </Stack>

                  <Stack direction="horizontal" gap={2} className="cursor-pointer" onClick={() => setAvailableOnly(!availableOnly)}>
                    <Card className={`size-4 rounded-badge border-2 ${availableOnly ? 'bg-primary-500' : ''}`} />
                    <Body className="text-body-sm">Available Only</Body>
                  </Stack>

                  <Button variant="outline" size="sm" onClick={() => { setSelectedLanguages([]); setSelectedSpecialties([]); setTypeFilter('All'); setAvailableOnly(false); }}>
                    Clear Filters
                  </Button>
                </Stack>
              </Card>

              <Stack gap={4} className="col-span-3">
                {selectedLanguages.length > 0 || selectedSpecialties.length > 0 ? (
                  <Stack direction="horizontal" gap={2} className="flex-wrap">
                    {selectedLanguages.map(lang => (
                      <Badge key={lang} variant="solid" className="cursor-pointer" onClick={() => toggleLanguage(lang)}>{lang} ×</Badge>
                    ))}
                    {selectedSpecialties.map(spec => (
                      <Badge key={spec} variant="outline" className="cursor-pointer" onClick={() => toggleSpecialty(spec)}>{spec} ×</Badge>
                    ))}
                  </Stack>
                ) : null}

                <Stack gap={3}>
                  {filteredEntries.map(entry => (
                    <Card key={entry.id} className="p-4">
                      <Stack direction="horizontal" className="justify-between">
                        <Stack gap={2}>
                          <Stack direction="horizontal" gap={3}>
                            <Body className="font-display">{entry.name}</Body>
                            <Badge variant="outline">{entry.type}</Badge>
                            {!entry.available && <Badge variant="outline">Unavailable</Badge>}
                          </Stack>
                          <Stack direction="horizontal" gap={2} className="flex-wrap">
                            {entry.specialties.slice(0, 3).map(spec => (
                              <Badge key={spec} variant="outline">{spec}</Badge>
                            ))}
                            {entry.specialties.length > 3 && <Body className="text-body-sm">+{entry.specialties.length - 3} more</Body>}
                          </Stack>
                          <Stack direction="horizontal" gap={4}>
                            <Body className="text-body-sm">{entry.location}</Body>
                            <Body className="text-body-sm">Languages: {entry.languages.join(', ')}</Body>
                          </Stack>
                        </Stack>
                        <Stack gap={2} className="text-right">
                          <Body className="font-display">{entry.rating} ★</Body>
                          <Button variant="outline" size="sm">View Profile</Button>
                        </Stack>
                      </Stack>
                    </Card>
                  ))}
                </Stack>
              </Stack>
            </Grid>

            <Button variant="outline" onClick={() => router.push('/directory')}>Back to Directory</Button>
          </Stack>
        </Container>
      </Section>
    </PageLayout>
  );
}
