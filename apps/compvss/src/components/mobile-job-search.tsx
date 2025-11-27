'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Section,
  Display,
  H3,
  Body,
  Button,
  Input,
  Select,
  Card,
  Badge,
  Stack,
  Field,
  LoadingSpinner,
} from '@ghxstship/ui';
import { Search, MapPin, DollarSign, Clock, Briefcase, Filter, X, ChevronDown } from 'lucide-react';

interface Job {
  id: string;
  title: string;
  type: 'full-time' | 'contract' | 'freelance' | 'gig';
  location: string;
  salary?: string;
  rate?: string;
  date?: string;
  duration?: string;
  posted: string;
  company?: string;
  skills?: string[];
  remote?: boolean;
}

interface MobileJobSearchProps {
  initialJobs?: Job[];
  onApply?: (job: Job) => void;
}

const JOB_TYPES = [
  { value: 'all', label: 'All Types' },
  { value: 'full-time', label: 'Full-Time' },
  { value: 'contract', label: 'Contract' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'gig', label: 'Day Gig' },
];

const LOCATIONS = [
  { value: 'all', label: 'All Locations' },
  { value: 'remote', label: 'Remote' },
  { value: 'miami', label: 'Miami, FL' },
  { value: 'newyork', label: 'New York, NY' },
  { value: 'losangeles', label: 'Los Angeles, CA' },
  { value: 'lasvegas', label: 'Las Vegas, NV' },
  { value: 'nashville', label: 'Nashville, TN' },
  { value: 'austin', label: 'Austin, TX' },
];

const SPECIALTIES = [
  { value: 'all', label: 'All Specialties' },
  { value: 'audio', label: 'Audio' },
  { value: 'lighting', label: 'Lighting' },
  { value: 'video', label: 'Video' },
  { value: 'staging', label: 'Staging' },
  { value: 'rigging', label: 'Rigging' },
  { value: 'production', label: 'Production Management' },
  { value: 'stage-management', label: 'Stage Management' },
];

export function MobileJobSearch({ initialJobs = [], onApply }: MobileJobSearchProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [jobType, setJobType] = useState('all');
  const [location, setLocation] = useState('all');
  const [specialty, setSpecialty] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [savedJobs, setSavedJobs] = useState<string[]>([]);

  // Load saved jobs from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('savedJobs');
    if (saved) {
      setSavedJobs(JSON.parse(saved));
    }
  }, []);

  // Filter jobs
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = !searchQuery || 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.skills?.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesType = jobType === 'all' || job.type === jobType;
    
    const matchesLocation = location === 'all' || 
      (location === 'remote' && job.remote) ||
      job.location.toLowerCase().includes(location.toLowerCase());
    
    const matchesSpecialty = specialty === 'all' ||
      job.skills?.some(s => s.toLowerCase().includes(specialty.toLowerCase()));
    
    return matchesSearch && matchesType && matchesLocation && matchesSpecialty;
  });

  const toggleSaveJob = (jobId: string) => {
    setSavedJobs(prev => {
      const newSaved = prev.includes(jobId)
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId];
      localStorage.setItem('savedJobs', JSON.stringify(newSaved));
      return newSaved;
    });
  };

  const activeFilterCount = [
    jobType !== 'all',
    location !== 'all',
    specialty !== 'all',
  ].filter(Boolean).length;

  const clearFilters = () => {
    setJobType('all');
    setLocation('all');
    setSpecialty('all');
    setSearchQuery('');
  };

  return (
    <Section className="min-h-screen bg-white pb-20">
      {/* Fixed Search Header */}
      <Stack className="sticky top-0 z-10 bg-white border-b border-grey-200 p-4">
        <Stack direction="horizontal" gap={2} className="items-center">
          <Stack className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-grey-500" />
            <Input
              placeholder="Search jobs, skills, companies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full"
            />
          </Stack>
          <Button
            variant={showFilters ? 'solid' : 'outline'}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="relative"
          >
            <Filter className="w-4 h-4" />
            {activeFilterCount > 0 && (
              <Badge className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center text-mono-xs">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </Stack>

        {/* Expandable Filters */}
        {showFilters && (
          <Stack gap={4} className="mt-4 pt-4 border-t border-grey-200">
            <Field label="Job Type">
              <Select value={jobType} onChange={(e) => setJobType(e.target.value)}>
                {JOB_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </Select>
            </Field>

            <Field label="Location">
              <Select value={location} onChange={(e) => setLocation(e.target.value)}>
                {LOCATIONS.map((loc) => (
                  <option key={loc.value} value={loc.value}>{loc.label}</option>
                ))}
              </Select>
            </Field>

            <Field label="Specialty">
              <Select value={specialty} onChange={(e) => setSpecialty(e.target.value)}>
                {SPECIALTIES.map((spec) => (
                  <option key={spec.value} value={spec.value}>{spec.label}</option>
                ))}
              </Select>
            </Field>

            {activeFilterCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            )}
          </Stack>
        )}
      </Stack>

      {/* Results Count */}
      <Container className="py-4">
        <Body variant="muted" className="text-body-sm">
          {filteredJobs.length} {filteredJobs.length === 1 ? 'opportunity' : 'opportunities'} found
        </Body>
      </Container>

      {/* Job Cards - Mobile Optimized */}
      <Container>
        {isLoading ? (
          <Stack className="items-center justify-center py-12">
            <LoadingSpinner size="lg" text="Loading opportunities..." />
          </Stack>
        ) : filteredJobs.length === 0 ? (
          <Card className="p-8 text-center">
            <Stack gap={4} className="items-center">
              <Briefcase className="w-12 h-12 text-grey-500" />
              <H3>No Opportunities Found</H3>
              <Body variant="muted">Try adjusting your filters or search term</Body>
              <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
            </Stack>
          </Card>
        ) : (
          <Stack gap={4}>
            {filteredJobs.map((job) => (
              <Card 
                key={job.id} 
                className="p-4 active:bg-grey-50 transition-colors"
                onClick={() => router.push(`/opportunities/${job.type}/${job.id}`)}
              >
                <Stack gap={3}>
                  {/* Header */}
                  <Stack direction="horizontal" className="justify-between items-start">
                    <Stack gap={1} className="flex-1">
                      <H3 className="text-body-sm">{job.title}</H3>
                      {job.company && (
                        <Body className="text-body-sm" variant="muted">{job.company}</Body>
                      )}
                    </Stack>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSaveJob(job.id);
                      }}
                      className={savedJobs.includes(job.id) ? 'text-black' : 'text-grey-500'}
                    >
                      {savedJobs.includes(job.id) ? '★' : '☆'}
                    </Button>
                  </Stack>

                  {/* Tags */}
                  <Stack direction="horizontal" gap={2} className="flex-wrap">
                    <Badge variant={job.type === 'full-time' ? 'solid' : 'outline'}>
                      {job.type.toUpperCase()}
                    </Badge>
                    {job.remote && (
                      <Badge variant="outline">REMOTE</Badge>
                    )}
                  </Stack>

                  {/* Details */}
                  <Stack gap={2}>
                    <Stack direction="horizontal" gap={2} className="items-center">
                      <MapPin className="w-4 h-4 text-grey-500" />
                      <Body className="text-body-sm">{job.location}</Body>
                    </Stack>
                    
                    {(job.salary || job.rate) && (
                      <Stack direction="horizontal" gap={2} className="items-center">
                        <DollarSign className="w-4 h-4 text-grey-500" />
                        <Body className="text-body-sm">{job.salary || job.rate}</Body>
                      </Stack>
                    )}

                    {job.date && (
                      <Stack direction="horizontal" gap={2} className="items-center">
                        <Clock className="w-4 h-4 text-grey-500" />
                        <Body className="text-body-sm">
                          {new Date(job.date).toLocaleDateString()}
                          {job.duration && ` • ${job.duration}`}
                        </Body>
                      </Stack>
                    )}
                  </Stack>

                  {/* Skills */}
                  {job.skills && job.skills.length > 0 && (
                    <Stack direction="horizontal" gap={1} className="flex-wrap">
                      {job.skills.slice(0, 3).map((skill, idx) => (
                        <Badge key={idx} variant="outline" className="text-mono-xs">
                          {skill}
                        </Badge>
                      ))}
                      {job.skills.length > 3 && (
                        <Badge variant="outline" className="text-mono-xs">
                          +{job.skills.length - 3}
                        </Badge>
                      )}
                    </Stack>
                  )}

                  {/* Apply Button */}
                  <Button
                    variant="solid"
                    className="w-full mt-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      onApply?.(job);
                    }}
                  >
                    {job.type === 'gig' ? 'APPLY FOR GIG' : 'APPLY NOW'}
                  </Button>
                </Stack>
              </Card>
            ))}
          </Stack>
        )}
      </Container>

      {/* Fixed Bottom Navigation for Mobile */}
      <Stack 
        direction="horizontal" 
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-grey-200 p-2 justify-around"
      >
        <Button
          variant="ghost"
          size="sm"
          className="flex-col gap-1"
          onClick={() => router.push('/opportunities')}
        >
          <Search className="w-5 h-5" />
          <Body className="text-mono-xs">Search</Body>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="flex-col gap-1"
          onClick={() => router.push('/opportunities/saved')}
        >
          <span className="text-body-md">★</span>
          <Body className="text-mono-xs">Saved ({savedJobs.length})</Body>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="flex-col gap-1"
          onClick={() => router.push('/opportunities/applications')}
        >
          <Briefcase className="w-5 h-5" />
          <Body className="text-mono-xs">Applied</Body>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="flex-col gap-1"
          onClick={() => router.push('/profile')}
        >
          <span className="text-body-md">👤</span>
          <Body className="text-mono-xs">Profile</Body>
        </Button>
      </Stack>
    </Section>
  );
}

export default MobileJobSearch;
