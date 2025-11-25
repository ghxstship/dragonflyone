'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '../../../components/navigation';
import {
  Container, H1, H3, Body, Label, Grid, Stack, StatCard, Input, Select,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Button,
  Section as UISection, Card, Tabs, TabsList, Tab, TabPanel, Badge,
  Modal, ModalHeader, ModalBody, ModalFooter,
} from '@ghxstship/ui';

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
    <UISection className="relative min-h-screen overflow-hidden bg-ink-950 text-ink-50">
      <Card className="pointer-events-none absolute inset-0 grid-overlay opacity-40" />
      <Navigation />
      <Container className="py-16">
        <Stack gap={8}>
          <Stack gap={2}>
            <H1>Directory Search</H1>
            <Label className="text-ink-400">Filter by language and specialty</Label>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard label="Total Results" value={filteredEntries.length} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Crew" value={filteredEntries.filter(e => e.type === 'Crew').length} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Vendors" value={filteredEntries.filter(e => e.type === 'Vendor').length} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Venues" value={filteredEntries.filter(e => e.type === 'Venue').length} className="bg-transparent border-2 border-ink-800" />
          </Grid>

          <Grid cols={4} gap={6}>
            <Card className="border-2 border-ink-800 bg-ink-900/50 p-4 col-span-1">
              <Stack gap={4}>
                <H3>Filters</H3>
                
                <Stack gap={2}>
                  <Label className="text-ink-400">Type</Label>
                  <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="border-ink-700 bg-black text-white">
                    <option value="All">All Types</option>
                    <option value="Crew">Crew</option>
                    <option value="Vendor">Vendor</option>
                    <option value="Venue">Venue</option>
                  </Select>
                </Stack>

                <Stack gap={2}>
                  <Label className="text-ink-400">Languages</Label>
                  <Stack gap={1}>
                    {allLanguages.map(lang => (
                      <Stack key={lang} direction="horizontal" gap={2} className="cursor-pointer" onClick={() => toggleLanguage(lang)}>
                        <Card className={`w-4 h-4 border ${selectedLanguages.includes(lang) ? 'bg-white border-white' : 'border-ink-600'}`} />
                        <Label className={selectedLanguages.includes(lang) ? 'text-white' : 'text-ink-400'}>{lang}</Label>
                      </Stack>
                    ))}
                  </Stack>
                </Stack>

                <Stack gap={2}>
                  <Label className="text-ink-400">Specialties</Label>
                  <Stack gap={1} className="max-h-48 overflow-y-auto">
                    {allSpecialties.slice(0, 10).map(spec => (
                      <Stack key={spec} direction="horizontal" gap={2} className="cursor-pointer" onClick={() => toggleSpecialty(spec)}>
                        <Card className={`w-4 h-4 border ${selectedSpecialties.includes(spec) ? 'bg-white border-white' : 'border-ink-600'}`} />
                        <Label size="xs" className={selectedSpecialties.includes(spec) ? 'text-white' : 'text-ink-400'}>{spec}</Label>
                      </Stack>
                    ))}
                  </Stack>
                </Stack>

                <Stack direction="horizontal" gap={2} className="cursor-pointer" onClick={() => setAvailableOnly(!availableOnly)}>
                  <Card className={`w-4 h-4 border ${availableOnly ? 'bg-white border-white' : 'border-ink-600'}`} />
                  <Label className={availableOnly ? 'text-white' : 'text-ink-400'}>Available Only</Label>
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
                  <Card key={entry.id} className="border-2 border-ink-800 bg-ink-900/50 p-4">
                    <Stack direction="horizontal" className="justify-between">
                      <Stack gap={2}>
                        <Stack direction="horizontal" gap={3}>
                          <Body className="font-display text-white">{entry.name}</Body>
                          <Badge variant="outline">{entry.type}</Badge>
                          {!entry.available && <Badge className="bg-ink-700 text-ink-400">Unavailable</Badge>}
                        </Stack>
                        <Stack direction="horizontal" gap={2} className="flex-wrap">
                          {entry.specialties.slice(0, 3).map(spec => (
                            <Badge key={spec} variant="outline">{spec}</Badge>
                          ))}
                          {entry.specialties.length > 3 && <Label className="text-ink-500">+{entry.specialties.length - 3} more</Label>}
                        </Stack>
                        <Stack direction="horizontal" gap={4}>
                          <Label className="text-ink-400">{entry.location}</Label>
                          <Label className="text-ink-400">Languages: {entry.languages.join(', ')}</Label>
                        </Stack>
                      </Stack>
                      <Stack gap={2} className="text-right">
                        <Label className="font-mono text-yellow-400">{entry.rating} ★</Label>
                        <Button variant="outline" size="sm">View Profile</Button>
                      </Stack>
                    </Stack>
                  </Card>
                ))}
              </Stack>
            </Stack>
          </Grid>

          <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push('/directory')}>Back to Directory</Button>
        </Stack>
      </Container>
    </UISection>
  );
}
