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
  Input,
  Select,
  Button,
  Section,
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
  PageLayout,
  SectionHeader,
  EnterprisePageHeader,
  MainContent,} from '@ghxstship/ui';

interface JobOpportunity {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'Full-Time' | 'Gig' | 'Contract' | 'Freelance';
  rate: string;
  posted: string;
  deadline?: string;
  skills: string[];
  saved: boolean;
  applied: boolean;
}

const mockJobs: JobOpportunity[] = [
  { id: 'JOB-001', title: 'FOH Audio Engineer', company: 'Live Nation', location: 'Los Angeles, CA', type: 'Gig', rate: '$750/day', posted: '2 hours ago', deadline: '2024-12-01', skills: ['L-Acoustics', 'DiGiCo', 'Live Sound'], saved: true, applied: false },
  { id: 'JOB-002', title: 'Lighting Designer', company: 'PRG', location: 'Las Vegas, NV', type: 'Full-Time', rate: '$85K-$110K', posted: '1 day ago', skills: ['grandMA3', 'Vectorworks', 'Concert Lighting'], saved: false, applied: false },
  { id: 'JOB-003', title: 'Video Director', company: 'Screenworks', location: 'Remote', type: 'Contract', rate: '$600/day', posted: '3 days ago', deadline: '2024-11-30', skills: ['Resolume', 'LED Walls', 'Broadcast'], saved: false, applied: true },
  { id: 'JOB-004', title: 'Stage Manager', company: 'AEG Presents', location: 'New York, NY', type: 'Gig', rate: '$500/day', posted: '5 hours ago', skills: ['Stage Management', 'Intercom', 'Cue Calling'], saved: true, applied: false },
  { id: 'JOB-005', title: 'Head Rigger', company: 'Stageline', location: 'Nashville, TN', type: 'Freelance', rate: '$450/day', posted: '2 days ago', skills: ['CM Motors', 'Truss', 'ETCP Certified'], saved: false, applied: false },
];

export default function MobileJobSearchPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('search');
  const [selectedJob, setSelectedJob] = useState<JobOpportunity | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [showApplyModal, setShowApplyModal] = useState(false);

  const savedJobs = mockJobs.filter(j => j.saved);
  const appliedJobs = mockJobs.filter(j => j.applied);

  const filteredJobs = mockJobs.filter(job => {
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
      case 'Contract': return 'bg-purple-800';
      case 'Freelance': return 'bg-warning-800';
      default: return 'bg-ink-700';
    }
  };

  return (
    <PageLayout background="white" header={<CreatorNavigationAuthenticated />}>
      <Section className="min-h-screen py-16">
        <Container>
          <Stack gap={10}>
            <EnterprisePageHeader
        title="Job Search"
        subtitle="Mobile-optimized job search and quick apply"
        breadcrumbs={[{ label: 'COMPVSS', href: '/dashboard' }, { label: 'Opportunities', href: '/opportunities' }, { label: 'Mobile' }]}
        views={[
          { id: 'default', label: 'Default', icon: 'grid' },
        ]}
        activeView="default"
        showFavorite
        showSettings
      />

            <Grid cols={4} gap={6}>
              <StatCard label="Available Jobs" value={mockJobs.length.toString()} />
              <StatCard label="Saved" value={savedJobs.length.toString()} />
              <StatCard label="Applied" value={appliedJobs.length.toString()} />
              <StatCard label="New Today" value="2" />
            </Grid>

            <Tabs>
              <TabsList>
                <Tab active={activeTab === 'search'} onClick={() => setActiveTab('search')}>Search</Tab>
                <Tab active={activeTab === 'saved'} onClick={() => setActiveTab('saved')}>Saved ({savedJobs.length})</Tab>
                <Tab active={activeTab === 'applied'} onClick={() => setActiveTab('applied')}>Applied ({appliedJobs.length})</Tab>
              </TabsList>
            </Tabs>

            {activeTab === 'search' && (
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
                            <Body className="text-body-sm">{job.company}</Body>
                          </Stack>
                          <Stack gap={1} className="text-right">
                            <Badge variant="outline">{job.type}</Badge>
                            <Body className="font-mono">{job.rate}</Body>
                          </Stack>
                        </Stack>
                        <Stack direction="horizontal" gap={4}>
                          <Body className="text-body-sm">{job.location}</Body>
                          <Body className="text-body-sm">{job.posted}</Body>
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

            {activeTab === 'saved' && (
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
                            <Body className="text-body-sm">{job.company} • {job.location}</Body>
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

            {activeTab === 'applied' && (
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
                            <Body className="text-body-sm">{job.company} • {job.location}</Body>
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
      </Section>

      <Modal open={!!selectedJob && !showApplyModal} onClose={() => setSelectedJob(null)}>
        <ModalHeader><H3>{selectedJob?.title}</H3></ModalHeader>
        <ModalBody>
          {selectedJob && (
            <Stack gap={4}>
              <Stack gap={1}>
                <Body className="text-body-sm">Company</Body>
                <Body>{selectedJob.company}</Body>
              </Stack>
              <Stack direction="horizontal" gap={2}>
                <Badge variant="outline">{selectedJob.type}</Badge>
                <Body className="font-mono">{selectedJob.rate}</Body>
              </Stack>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Body className="text-body-sm">Location</Body><Body>{selectedJob.location}</Body></Stack>
                <Stack gap={1}><Body className="text-body-sm">Posted</Body><Body>{selectedJob.posted}</Body></Stack>
              </Grid>
              {selectedJob.deadline && (
                <Stack gap={1}><Body className="text-body-sm">Application Deadline</Body><Body>{selectedJob.deadline}</Body></Stack>
              )}
              <Stack gap={2}>
                <Body className="text-body-sm">Required Skills</Body>
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
              <Body className="text-body-sm">Attached Documents</Body>
              <Card>
                <Stack direction="horizontal" className="justify-between">
                  <Body>Resume_2024.pdf</Body>
                  <Badge variant="outline">Default</Badge>
                </Stack>
              </Card>
            </Stack>
            <Stack gap={2}>
              <Body className="text-body-sm">Availability</Body>
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
    </PageLayout>
  );
}
