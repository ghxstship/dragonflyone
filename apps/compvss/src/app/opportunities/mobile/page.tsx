'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreatorNavigationAuthenticated } from '../../../components/navigation';
import {
  Container, H1, H3, Body, Label, Grid, Stack, StatCard, Input, Select,
  Button, Section as UISection, Card, Tabs, TabsList, Tab, TabPanel, Badge,
  Modal, ModalHeader, ModalBody, ModalFooter, Alert,
} from '@ghxstship/ui';

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
    <UISection className="relative min-h-screen overflow-hidden bg-ink-950 text-ink-50">
      <Card className="pointer-events-none absolute inset-0 grid-overlay opacity-40" />
      <CreatorNavigationAuthenticated />
      <Container className="py-16">
        <Stack gap={8}>
          <Stack gap={2}>
            <H1>Job Search</H1>
            <Label className="text-ink-400">Mobile-optimized job search and quick apply</Label>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard label="Available Jobs" value={mockJobs.length} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Saved" value={savedJobs.length} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Applied" value={appliedJobs.length} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="New Today" value={2} className="bg-transparent border-2 border-ink-800" />
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
                className="border-ink-700 bg-black text-white"
              />
              <Stack direction="horizontal" gap={4}>
                <Select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)} className="border-ink-700 bg-black text-white flex-1">
                  <option value="All">All Locations</option>
                  <option value="Los Angeles">Los Angeles</option>
                  <option value="New York">New York</option>
                  <option value="Las Vegas">Las Vegas</option>
                  <option value="Nashville">Nashville</option>
                  <option value="Remote">Remote</option>
                </Select>
                <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="border-ink-700 bg-black text-white flex-1">
                  <option value="All">All Types</option>
                  <option value="Full-Time">Full-Time</option>
                  <option value="Gig">Gig</option>
                  <option value="Contract">Contract</option>
                  <option value="Freelance">Freelance</option>
                </Select>
              </Stack>

              <Stack gap={3}>
                {filteredJobs.map((job) => (
                  <Card key={job.id} className="border-2 border-ink-800 bg-ink-900/50 p-4">
                    <Stack gap={3}>
                      <Stack direction="horizontal" className="justify-between">
                        <Stack gap={1}>
                          <Body className="font-display text-white">{job.title}</Body>
                          <Label className="text-ink-400">{job.company}</Label>
                        </Stack>
                        <Stack gap={1} className="text-right">
                          <Badge className={getTypeColor(job.type)}>{job.type}</Badge>
                          <Label className="font-mono text-success-400">{job.rate}</Label>
                        </Stack>
                      </Stack>
                      <Stack direction="horizontal" gap={4}>
                        <Label className="text-ink-400">{job.location}</Label>
                        <Label className="text-ink-500">{job.posted}</Label>
                      </Stack>
                      <Stack direction="horizontal" gap={2} className="flex-wrap">
                        {job.skills.slice(0, 3).map((skill, idx) => (
                          <Badge key={idx} variant="outline">{skill}</Badge>
                        ))}
                      </Stack>
                      <Stack direction="horizontal" gap={2}>
                        <Button variant="solid" size="sm" className="flex-1" onClick={() => { setSelectedJob(job); setShowApplyModal(true); }}>
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
                <Card className="border-2 border-ink-800 bg-ink-900/50 p-6 text-center">
                  <Label className="text-ink-400">No saved jobs yet. Save jobs to review later.</Label>
                </Card>
              ) : (
                savedJobs.map((job) => (
                  <Card key={job.id} className="border-2 border-ink-800 bg-ink-900/50 p-4">
                    <Stack gap={3}>
                      <Stack direction="horizontal" className="justify-between">
                        <Stack gap={1}>
                          <Body className="font-display text-white">{job.title}</Body>
                          <Label className="text-ink-400">{job.company} • {job.location}</Label>
                        </Stack>
                        <Label className="font-mono text-success-400">{job.rate}</Label>
                      </Stack>
                      <Stack direction="horizontal" gap={2}>
                        <Button variant="solid" size="sm" className="flex-1">Quick Apply</Button>
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
                <Card className="border-2 border-ink-800 bg-ink-900/50 p-6 text-center">
                  <Label className="text-ink-400">No applications yet. Start applying to opportunities.</Label>
                </Card>
              ) : (
                appliedJobs.map((job) => (
                  <Card key={job.id} className="border-2 border-ink-800 bg-ink-900/50 p-4">
                    <Stack gap={3}>
                      <Stack direction="horizontal" className="justify-between">
                        <Stack gap={1}>
                          <Body className="font-display text-white">{job.title}</Body>
                          <Label className="text-ink-400">{job.company} • {job.location}</Label>
                        </Stack>
                        <Badge variant="solid" className="bg-success-800">Applied</Badge>
                      </Stack>
                      <Stack direction="horizontal" gap={2}>
                        <Button variant="outline" size="sm" className="flex-1">View Application</Button>
                        <Button variant="ghost" size="sm">Withdraw</Button>
                      </Stack>
                    </Stack>
                  </Card>
                ))
              )}
            </Stack>
          )}

          <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push('/opportunities')}>Back to Opportunities</Button>
        </Stack>
      </Container>

      <Modal open={!!selectedJob && !showApplyModal} onClose={() => setSelectedJob(null)}>
        <ModalHeader><H3>{selectedJob?.title}</H3></ModalHeader>
        <ModalBody>
          {selectedJob && (
            <Stack gap={4}>
              <Stack gap={1}>
                <Label className="text-ink-400">Company</Label>
                <Body className="text-white">{selectedJob.company}</Body>
              </Stack>
              <Stack direction="horizontal" gap={2}>
                <Badge className={getTypeColor(selectedJob.type)}>{selectedJob.type}</Badge>
                <Label className="font-mono text-success-400">{selectedJob.rate}</Label>
              </Stack>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label className="text-ink-400">Location</Label><Label className="text-white">{selectedJob.location}</Label></Stack>
                <Stack gap={1}><Label className="text-ink-400">Posted</Label><Label className="text-white">{selectedJob.posted}</Label></Stack>
              </Grid>
              {selectedJob.deadline && (
                <Stack gap={1}><Label className="text-ink-400">Application Deadline</Label><Label className="text-white">{selectedJob.deadline}</Label></Stack>
              )}
              <Stack gap={2}>
                <Label className="text-ink-400">Required Skills</Label>
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
              <Label>Cover Note (Optional)</Label>
              <Input placeholder="Add a brief message..." className="border-ink-700 bg-black text-white" />
            </Stack>
            <Stack gap={2}>
              <Label className="text-ink-400">Attached Documents</Label>
              <Card className="p-3 border border-ink-700 bg-ink-800">
                <Stack direction="horizontal" className="justify-between">
                  <Label className="text-white">Resume_2024.pdf</Label>
                  <Badge variant="outline">Default</Badge>
                </Stack>
              </Card>
            </Stack>
            <Stack gap={2}>
              <Label className="text-ink-400">Availability</Label>
              <Select className="border-ink-700 bg-black text-white">
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
    </UISection>
  );
}
