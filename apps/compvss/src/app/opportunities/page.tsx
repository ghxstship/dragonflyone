'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '../../components/navigation';
import { Container, Section, Display, H2, H3, Body, Button, Input, Select, Card, Grid, Badge, Stack, Modal, ModalHeader, ModalBody, ModalFooter, Textarea, Alert, Breadcrumb, BreadcrumbItem } from '@ghxstship/ui';
import { Search, Briefcase, DollarSign, MapPin, Clock, FileText } from 'lucide-react';

export default function OpportunitiesPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'rfps' | 'jobs' | 'gigs'>('rfps');
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<any>(null);
  const [applicationData, setApplicationData] = useState({ name: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('All Locations');

  const handleApply = (opportunity: any, type: string) => {
    setSelectedOpportunity({ ...opportunity, type });
    setShowApplyModal(true);
  };

  const handleSubmitApplication = async () => {
    setSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSubmitting(false);
    setSubmitSuccess(true);
    setTimeout(() => {
      setShowApplyModal(false);
      setSubmitSuccess(false);
      setApplicationData({ name: '', email: '', message: '' });
    }, 2000);
  };

  const rfps = [
    {
      id: '1',
      title: 'Ultra Music Festival 2025 - Production Services',
      client: 'Ultra Worldwide',
      budget: '2.5M - 3M',
      deadline: '2024-12-15',
      location: 'Miami, FL',
      status: 'open',
    },
    {
      id: '2',
      title: 'Corporate Event AV Package',
      client: 'Tech Corp',
      budget: '150K - 200K',
      deadline: '2024-12-01',
      location: 'San Francisco, CA',
      status: 'closing_soon',
    },
  ];

  const jobs = [
    {
      id: '1',
      title: 'Senior Production Manager',
      type: 'Full-time',
      location: 'Miami, FL',
      salary: '$85K - $110K',
      posted: '2024-11-20',
    },
    {
      id: '2',
      title: 'Lighting Designer',
      type: 'Contract',
      location: 'Remote',
      salary: '$75K - $95K',
      posted: '2024-11-18',
    },
  ];

  const gigs = [
    {
      id: '1',
      title: 'Stage Manager - Ultra 2025',
      date: '2025-03-28',
      location: 'Miami, FL',
      rate: '$500/day',
      duration: '3 days',
    },
    {
      id: '2',
      title: 'Audio Technician - Corporate Event',
      date: '2024-12-10',
      location: 'New York, NY',
      rate: '$350/day',
      duration: '1 day',
    },
  ];

  return (
    <Section className="min-h-screen bg-white">
      <Navigation />
      <Section className="py-8">
        <Container>
          {/* Breadcrumb */}
          <Breadcrumb className="mb-6">
            <BreadcrumbItem href="/dashboard">Dashboard</BreadcrumbItem>
            <BreadcrumbItem active>Opportunities</BreadcrumbItem>
          </Breadcrumb>

          <Stack gap={4} direction="horizontal" className="justify-between items-start mb-8">
            <Stack gap={2}>
              <Display>OPPORTUNITIES</Display>
              <Body className="text-grey-600">RFPs, careers, and gig board</Body>
            </Stack>
            <Button onClick={() => router.push('/opportunities/new')}>
              <FileText className="w-4 h-4 mr-2" />
              POST OPPORTUNITY
            </Button>
          </Stack>

        {/* Tabs */}
        <Stack gap={4} direction="horizontal" className="mb-8 border-b-2 border-grey-200">
          {[
            { id: 'rfps', label: 'RFPs & BIDS' },
            { id: 'jobs', label: 'FULL-TIME JOBS' },
            { id: 'gigs', label: 'FREELANCE GIGS' },
          ].map((tab) => (
            <Button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              variant={activeTab === tab.id ? 'solid' : 'ghost'}
              className={`pb-4 px-6 font-heading text-lg tracking-wider ${
                activeTab === tab.id ? 'border-b-4 border-black -mb-0.5' : ''
              }`}
            >
              {tab.label}
            </Button>
          ))}
        </Stack>

        {/* Search and Filters */}
        <Card className="p-6 mb-8">
          <Stack gap={4} direction="horizontal">
            <Stack className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-grey-500" />
              <Input placeholder="Search opportunities..." className="pl-10 w-full" />
            </Stack>
            <Select className="w-48">
              <option>All Locations</option>
              <option>Miami, FL</option>
              <option>New York, NY</option>
              <option>Los Angeles, CA</option>
            </Select>
            <Select className="w-48">
              <option>All Categories</option>
              <option>Production</option>
              <option>Technical</option>
              <option>Creative</option>
            </Select>
          </Stack>
        </Card>

        {/* RFPs Tab */}
        {activeTab === 'rfps' && (
          <Stack gap={4}>
            {rfps.map((rfp) => (
              <Card key={rfp.id} className="p-6 hover:shadow-[8px_8px_0_0_#000] transition-shadow">
                <Stack gap={4} direction="horizontal" className="justify-between items-start mb-4">
                  <Stack gap={2} className="flex-1">
                    <Stack gap={3} direction="horizontal" className="items-center">
                      <H2>{rfp.title}</H2>
                      <Badge className={rfp.status === 'closing_soon' ? 'bg-black text-white' : 'bg-white text-black border-2 border-black'}>
                        {rfp.status === 'closing_soon' ? 'CLOSING SOON' : 'OPEN'}
                      </Badge>
                    </Stack>
                    <Body className="text-grey-600">{rfp.client}</Body>
                    
                    <Grid cols={3} gap={4}>
                      <Stack gap={2} direction="horizontal" className="items-center text-sm">
                        <DollarSign className="w-4 h-4 text-grey-600" />
                        <Body>{rfp.budget}</Body>
                      </Stack>
                      <Stack gap={2} direction="horizontal" className="items-center text-sm">
                        <MapPin className="w-4 h-4 text-grey-600" />
                        <Body>{rfp.location}</Body>
                      </Stack>
                      <Stack gap={2} direction="horizontal" className="items-center text-sm">
                        <Clock className="w-4 h-4 text-grey-600" />
                        <Body>Due {new Date(rfp.deadline).toLocaleDateString()}</Body>
                      </Stack>
                    </Grid>
                  </Stack>
                  <Stack gap={2} direction="horizontal" className="ml-6">
                    <Button variant="outline" size="sm" onClick={() => router.push(`/opportunities/rfp/${rfp.id}`)}>VIEW RFP</Button>
                    <Button size="sm" onClick={() => handleApply(rfp, 'rfp')}>SUBMIT BID</Button>
                  </Stack>
                </Stack>
              </Card>
            ))}
          </Stack>
        )}

        {/* Jobs Tab */}
        {activeTab === 'jobs' && (
          <Stack gap={4}>
            {jobs.map((job) => (
              <Card key={job.id} className="p-6 hover:shadow-[8px_8px_0_0_#000] transition-shadow">
                <Stack gap={4} direction="horizontal" className="justify-between items-start">
                  <Stack gap={2} className="flex-1">
                    <Stack gap={3} direction="horizontal" className="items-center">
                      <Briefcase className="w-6 h-6" />
                      <H2>{job.title}</H2>
                      <Badge className="bg-white text-black border-2 border-black">{job.type}</Badge>
                    </Stack>
                    
                    <Grid cols={3} gap={4} className="mt-4">
                      <Stack gap={2} direction="horizontal" className="items-center text-sm">
                        <MapPin className="w-4 h-4 text-grey-600" />
                        <Body>{job.location}</Body>
                      </Stack>
                      <Stack gap={2} direction="horizontal" className="items-center text-sm">
                        <DollarSign className="w-4 h-4 text-grey-600" />
                        <Body>{job.salary}</Body>
                      </Stack>
                      <Stack gap={2} direction="horizontal" className="items-center text-sm">
                        <Clock className="w-4 h-4 text-grey-600" />
                        <Body>Posted {new Date(job.posted).toLocaleDateString()}</Body>
                      </Stack>
                    </Grid>
                  </Stack>
                  <Stack gap={2} direction="horizontal" className="ml-6">
                    <Button variant="outline" size="sm" onClick={() => router.push(`/opportunities/job/${job.id}`)}>VIEW JOB</Button>
                    <Button size="sm" onClick={() => handleApply(job, 'job')}>APPLY</Button>
                  </Stack>
                </Stack>
              </Card>
            ))}
          </Stack>
        )}

        {/* Gigs Tab */}
        {activeTab === 'gigs' && (
          <Stack gap={4}>
            {gigs.map((gig) => (
              <Card key={gig.id} className="p-6 hover:shadow-[8px_8px_0_0_#000] transition-shadow">
                <Stack gap={4} direction="horizontal" className="justify-between items-start">
                  <Stack gap={4} className="flex-1">
                    <H2 className="mb-4">{gig.title}</H2>
                    
                    <Grid cols={4} gap={4}>
                      <Stack gap={2} direction="horizontal" className="items-center text-sm">
                        <Clock className="w-4 h-4 text-grey-600" />
                        <Body>{new Date(gig.date).toLocaleDateString()}</Body>
                      </Stack>
                      <Stack gap={2} direction="horizontal" className="items-center text-sm">
                        <MapPin className="w-4 h-4 text-grey-600" />
                        <Body>{gig.location}</Body>
                      </Stack>
                      <Stack gap={2} direction="horizontal" className="items-center text-sm">
                        <DollarSign className="w-4 h-4 text-grey-600" />
                        <Body>{gig.rate}</Body>
                      </Stack>
                      <Stack>
                        <Body className="text-sm text-grey-600">Duration: {gig.duration}</Body>
                      </Stack>
                    </Grid>
                  </Stack>
                  <Button size="sm" className="ml-6" onClick={() => handleApply(gig, 'gig')}>APPLY</Button>
                </Stack>
              </Card>
            ))}
          </Stack>
        )}
        </Container>
      </Section>

      {/* Application Modal */}
      <Modal open={showApplyModal} onClose={() => setShowApplyModal(false)}>
        <ModalHeader>
          <Display size="md">
            {selectedOpportunity?.type === 'rfp' ? 'Submit Bid' : 'Apply Now'}
          </Display>
          {selectedOpportunity && (
            <Body className="text-grey-600 mt-2">{selectedOpportunity.title}</Body>
          )}
        </ModalHeader>
        <ModalBody>
          {submitSuccess ? (
            <Alert variant="success">
              Application submitted successfully! We&apos;ll be in touch soon.
            </Alert>
          ) : (
            <Stack gap={4}>
              <Input
                placeholder="Your Name"
                value={applicationData.name}
                onChange={(e) => setApplicationData({ ...applicationData, name: e.target.value })}
              />
              <Input
                placeholder="Email Address"
                type="email"
                value={applicationData.email}
                onChange={(e) => setApplicationData({ ...applicationData, email: e.target.value })}
              />
              <Textarea
                placeholder={selectedOpportunity?.type === 'rfp' ? 'Describe your proposal...' : 'Tell us about yourself...'}
                value={applicationData.message}
                onChange={(e) => setApplicationData({ ...applicationData, message: e.target.value })}
                rows={5}
              />
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowApplyModal(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmitApplication}
            disabled={submitting || !applicationData.name || !applicationData.email}
          >
            {submitting ? 'Submitting...' : 'Submit Application'}
          </Button>
        </ModalFooter>
      </Modal>
    </Section>
  );
}
