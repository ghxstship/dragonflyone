'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTabState } from '@ghxstship/config/hooks';
// Layout provided by route group
import {
  Container,
  H3,
  Body,
  Grid,
  Stack,
  StatCard,
  Input,
  Select,
  Button,
  Card,
  Tabs,
  TabsList,
  Tab,
  Badge,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Alert,
  EnterprisePageHeader,
  MainContent,
} from '@ghxstship/ui';
import {
  useJobOpportunities,
  type JobOpportunity,
} from '../../../hooks/useJobOpportunities';

export default function MobileJobSearchPage() {
  const router = useRouter();
  const { data: jobs = [] } = useJobOpportunities();
  
  // URL-synced tab state for deep-linking support
  const { setActiveTab, isActive } = useTabState({
    defaultTab: 'search',
    validTabs: ['search', 'saved', 'applied'],
  });
  const [selectedJob, setSelectedJob] = useState<JobOpportunity | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [showApplyModal, setShowApplyModal] = useState(false);

  const savedJobs = jobs.filter(j => j.saved);
  const appliedJobs = jobs.filter(j => j.applied);

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          job.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesLocation = locationFilter === 'All' || job.location.includes(locationFilter);
    const matchesType = typeFilter === 'All' || job.type === typeFilter;
    return matchesSearch && matchesLocation && matchesType;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Full-Time': return 'bg-info-800';
      case 'Gig': return 'bg-success-800';
      case 'Contract': return 'bg-violet-800';
      case 'Freelance': return 'bg-success-100 text-success-800';
      default: return 'bg-ink-700';
    }
  };

  return (
    <>
      <EnterprisePageHeader
        title="Job Search"
        subtitle="Mobile-optimized job search and quick apply"


        showFavorite
        showSettings
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={10}>

            <Grid cols={4} gap={6} className="sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Available Jobs" value={jobs.length.toString()} />
              <StatCard label="Saved" value={savedJobs.length.toString()} />
              <StatCard label="Applied" value={appliedJobs.length.toString()} />
              <StatCard label="New Today" value="2" />
            </Grid>

            <Tabs>
              <TabsList>
                <Tab active={isActive('search')} onClick={() => setActiveTab('search')}>Search</Tab>
                <Tab active={isActive('saved')} onClick={() => setActiveTab('saved')}>Saved ({savedJobs.length})</Tab>
                <Tab active={isActive('applied')} onClick={() => setActiveTab('applied')}>Applied ({appliedJobs.length})</Tab>
              </TabsList>
            </Tabs>

            {isActive('search') && (
              <Stack gap={4}>
                <Input
                  type="search"
                  placeholder="Search jobs, skills, companies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Stack direction="horizontal" gap={4}>
                  <Select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)}>
                    <option value="All">All Locations</option>
                    <option value="Los Angeles">Los Angeles</option>
                    <option value="New York">New York</option>
                    <option value="Las Vegas">Las Vegas</option>
                    <option value="Nashville">Nashville</option>
                    <option value="Remote">Remote</option>
                  </Select>
                  <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                    <option value="All">All Types</option>
                    <option value="Full-Time">Full-Time</option>
                    <option value="Gig">Gig</option>
                    <option value="Contract">Contract</option>
                    <option value="Freelance">Freelance</option>
                  </Select>
                </Stack>

                <Stack gap={3}>
                  {filteredJobs.map((job) => (
                    <Card key={job.id}>
                      <Stack gap={3}>
                        <Stack direction="horizontal" className="justify-between">
                          <Stack gap={1}>
                            <Body className="font-display">{job.title}</Body>
                            <Body size="sm" className="">{job.company}</Body>
                          </Stack>
                          <Stack gap={1} className="text-right">
                            <Badge className={getTypeColor(job.type)}>{job.type}</Badge>
                            <Body className="font-mono">{job.rate}</Body>
                          </Stack>
                        </Stack>
                        <Stack direction="horizontal" gap={4}>
                          <Body size="sm" className="">{job.location}</Body>
                          <Body size="sm" className="">{job.posted}</Body>
                        </Stack>
                        <Stack direction="horizontal" gap={2} className="flex-wrap">
                          {job.skills.slice(0, 3).map((skill, idx) => (
                            <Badge key={idx} variant="outline">{skill}</Badge>
                          ))}
                        </Stack>
                        <Stack direction="horizontal" gap={2}>
                          <Button variant="solid" size="sm" onClick={() => { setSelectedJob(job); setShowApplyModal(true); }}>
                            {job.applied ? 'Applied' : 'Quick Apply'}
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => setSelectedJob(job)}>Details</Button>
                          <Button variant="ghost" size="sm">{job.saved ? '★' : '☆'}</Button>
                        </Stack>
                      </Stack>
                    </Card>
                  ))}
                </Stack>
              </Stack>
            )}

            {isActive('saved') && (
              <Stack gap={3}>
                {savedJobs.length === 0 ? (
                  <Card>
                    <Body className="text-center">No saved jobs yet. Save jobs to review later.</Body>
                  </Card>
                ) : (
                  savedJobs.map((job) => (
                    <Card key={job.id}>
                      <Stack gap={3}>
                        <Stack direction="horizontal" className="justify-between">
                          <Stack gap={1}>
                            <Body className="font-display">{job.title}</Body>
                            <Body size="sm" className="">{job.company} • {job.location}</Body>
                          </Stack>
                          <Body className="font-mono">{job.rate}</Body>
                        </Stack>
                        <Stack direction="horizontal" gap={2}>
                          <Button variant="solid" size="sm">Quick Apply</Button>
                          <Button variant="ghost" size="sm">Remove</Button>
                        </Stack>
                      </Stack>
                    </Card>
                  ))
                )}
              </Stack>
            )}

            {isActive('applied') && (
              <Stack gap={3}>
                {appliedJobs.length === 0 ? (
                  <Card>
                    <Body className="text-center">No applications yet. Start applying to opportunities.</Body>
                  </Card>
                ) : (
                  appliedJobs.map((job) => (
                    <Card key={job.id}>
                      <Stack gap={3}>
                        <Stack direction="horizontal" className="justify-between">
                          <Stack gap={1}>
                            <Body className="font-display">{job.title}</Body>
                            <Body size="sm" className="">{job.company} • {job.location}</Body>
                          </Stack>
                          <Badge variant="solid">Applied</Badge>
                        </Stack>
                        <Stack direction="horizontal" gap={2}>
                          <Button variant="outline" size="sm">View Application</Button>
                          <Button variant="ghost" size="sm">Withdraw</Button>
                        </Stack>
                      </Stack>
                    </Card>
                  ))
                )}
              </Stack>
            )}

            <Button variant="outline" onClick={() => router.push('/opportunities')}>Back to Opportunities</Button>
          </Stack>
        </Container>
      </MainContent>

      <Modal open={!!selectedJob && !showApplyModal} onClose={() => setSelectedJob(null)}>
        <ModalHeader><H3>{selectedJob?.title}</H3></ModalHeader>
        <ModalBody>
          {selectedJob && (
            <Stack gap={4}>
              <Stack gap={1}>
                <Body size="sm" className="">Company</Body>
                <Body>{selectedJob.company}</Body>
              </Stack>
              <Stack direction="horizontal" gap={2}>
                <Badge className={getTypeColor(selectedJob.type)}>{selectedJob.type}</Badge>
                <Body className="font-mono">{selectedJob.rate}</Body>
              </Stack>
              <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
                <Stack gap={1}><Body size="sm" className="">Location</Body><Body>{selectedJob.location}</Body></Stack>
                <Stack gap={1}><Body size="sm" className="">Posted</Body><Body>{selectedJob.posted}</Body></Stack>
              </Grid>
              {selectedJob.deadline && (
                <Stack gap={1}><Body size="sm" className="">Application Deadline</Body><Body>{selectedJob.deadline}</Body></Stack>
              )}
              <Stack gap={2}>
                <Body size="sm" className="">Required Skills</Body>
                <Stack direction="horizontal" gap={2} className="flex-wrap">
                  {selectedJob.skills.map((skill, idx) => (
                    <Badge key={idx} variant="outline">{skill}</Badge>
                  ))}
                </Stack>
              </Stack>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedJob(null)}>Close</Button>
          <Button variant="ghost">{selectedJob?.saved ? 'Unsave' : 'Save'}</Button>
          <Button variant="solid" onClick={() => setShowApplyModal(true)}>Apply Now</Button>
        </ModalFooter>
      </Modal>

      <Modal open={showApplyModal} onClose={() => { setShowApplyModal(false); setSelectedJob(null); }}>
        <ModalHeader><H3>Quick Apply</H3></ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Alert variant="info">Your profile and resume will be shared with {selectedJob?.company}</Alert>
            <Stack gap={2}>
              <Body>Cover Note (Optional)</Body>
              <Input placeholder="Add a brief message..." />
            </Stack>
            <Stack gap={2}>
              <Body size="sm" className="">Attached Documents</Body>
              <Card>
                <Stack direction="horizontal" className="justify-between">
                  <Body>Resume_2024.pdf</Body>
                  <Badge variant="outline">Default</Badge>
                </Stack>
              </Card>
            </Stack>
            <Stack gap={2}>
              <Body size="sm" className="">Availability</Body>
              <Select>
                <option value="immediate">Immediately</option>
                <option value="2weeks">2 Weeks Notice</option>
                <option value="1month">1 Month Notice</option>
              </Select>
            </Stack>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => { setShowApplyModal(false); setSelectedJob(null); }}>Cancel</Button>
          <Button variant="solid" onClick={() => { setShowApplyModal(false); setSelectedJob(null); }}>Submit Application</Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
