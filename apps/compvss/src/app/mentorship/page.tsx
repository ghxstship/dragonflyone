"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTabState } from "@ghxstship/config/hooks";
import { CompvssAppLayout } from "../../components/app-layout";
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
  TabPanel,
  Badge,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Textarea,
  ProgressBar,
  EnterprisePageHeader,
  MainContent,
} from "@ghxstship/ui";

import {
  DEMO_MENTORS,
  DEMO_MENTORSHIP_PROGRAMS,
  type DemoMentor as Mentor,
  type DemoMentorshipProgram as MentorshipProgram,
} from "../../lib/demo-data";

const mockMentors = DEMO_MENTORS;
const mockPrograms = DEMO_MENTORSHIP_PROGRAMS;

export default function MentorshipPage() {
  const router = useRouter();
  
  // URL-synced tab state for deep-linking support
  const { setActiveTab, isActive } = useTabState({
    defaultTab: 'mentors',
    validTabs: ['mentors', 'programs', 'resources'],
  });
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<MentorshipProgram | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);

  const availableMentors = mockMentors.filter(m => m.availability !== "Full").length;
  const totalMentees = mockMentors.reduce((sum, m) => sum + m.mentees, 0);

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Entry": return "bg-success-900/20 border-success-800";
      case "Intermediate": return "bg-warning-900/20 border-warning-800";
      case "Advanced": return "bg-purple-900/20 border-purple-800";
      default: return "bg-ink-900/50 border-ink-800";
    }
  };

  return (
    <CompvssAppLayout>
      <EnterprisePageHeader
        title="Mentorship Program"
        subtitle="Connect with experienced professionals and accelerate your career"


        showFavorite
        showSettings
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={10}>

            <Grid cols={4} gap={6}>
              <StatCard value={mockMentors.length.toString()} label="Active Mentors" />
              <StatCard value={availableMentors.toString()} label="Available" />
              <StatCard value={totalMentees.toString()} label="Active Mentees" />
              <StatCard value={mockPrograms.length.toString()} label="Programs" />
            </Grid>

            <Tabs>
              <TabsList>
                <Tab active={isActive('mentors')} onClick={() => setActiveTab('mentors')}>Find a Mentor</Tab>
                <Tab active={isActive('programs')} onClick={() => setActiveTab('programs')}>Programs</Tab>
                <Tab active={isActive('resources')} onClick={() => setActiveTab('resources')}>Resources</Tab>
              </TabsList>

              <TabPanel active={isActive('mentors')}>
                <Grid cols={2} gap={4}>
                  {mockMentors.map((mentor) => (
                    <Card key={mentor.id} className="p-6">
                      <Stack gap={4}>
                        <Stack direction="horizontal" className="items-start justify-between">
                          <Stack gap={1}>
                            <Body className="font-display">{mentor.name}</Body>
                            <Body size="sm" className="">{mentor.role}</Body>
                          </Stack>
                          <Badge variant={mentor.availability === "Available" ? "solid" : "outline"}>{mentor.availability}</Badge>
                        </Stack>
                        <Grid cols={3} gap={4}>
                          <Stack gap={1}>
                            <Body size="sm" className="">Experience</Body>
                            <Body>{mentor.yearsExperience} years</Body>
                          </Stack>
                          <Stack gap={1}>
                            <Body size="sm" className="">Rating</Body>
                            <Body>⭐ {mentor.rating}</Body>
                          </Stack>
                          <Stack gap={1}>
                            <Body size="sm" className="">Mentees</Body>
                            <Body>{mentor.mentees}/{mentor.maxMentees}</Body>
                          </Stack>
                        </Grid>
                        <Stack gap={2}>
                          <Body size="sm" className="">Specialties</Body>
                          <Stack direction="horizontal" gap={2} className="flex-wrap">
                            {mentor.specialties.map(spec => <Badge key={spec} variant="outline">{spec}</Badge>)}
                          </Stack>
                        </Stack>
                        <Stack direction="horizontal" gap={2}>
                          <Button variant="outline" size="sm" onClick={() => setSelectedMentor(mentor)}>View Profile</Button>
                          {mentor.availability !== "Full" && (
                            <Button variant="solid" size="sm" onClick={() => { setSelectedMentor(mentor); setShowRequestModal(true); }}>Request Mentorship</Button>
                          )}
                        </Stack>
                      </Stack>
                    </Card>
                  ))}
                </Grid>
              </TabPanel>

              <TabPanel active={isActive('programs')}>
                <Stack gap={4}>
                  {mockPrograms.map((program) => (
                    <Card key={program.id} className="p-6">
                      <Grid cols={4} gap={6} className="items-center">
                        <Stack gap={2}>
                          <Body className="font-display">{program.name}</Body>
                          <Badge variant="outline">{program.level}</Badge>
                        </Stack>
                        <Stack gap={1}>
                          <Body>{program.description}</Body>
                          <Body size="sm" className="">{program.duration} • {program.modules} modules</Body>
                        </Stack>
                        <Stack gap={2}>
                          <Body size="sm" className="">Enrollment</Body>
                          <ProgressBar value={(program.enrolled / program.capacity) * 100} className="h-2" />
                          <Body size="sm" className="">{program.enrolled}/{program.capacity} enrolled</Body>
                        </Stack>
                        <Button variant="solid" size="sm" onClick={() => setSelectedProgram(program)}>Enroll</Button>
                      </Grid>
                    </Card>
                  ))}
                </Stack>
              </TabPanel>

              <TabPanel active={isActive('resources')}>
                <Grid cols={3} gap={4}>
                  {[
                    { title: "Getting Started Guide", desc: "New to the industry? Start here", icon: "📚" },
                    { title: "Career Pathways", desc: "Explore different career tracks", icon: "🛤️" },
                    { title: "Skill Assessments", desc: "Identify your strengths and gaps", icon: "📊" },
                    { title: "Industry Certifications", desc: "Professional certification programs", icon: "🏆" },
                    { title: "Networking Events", desc: "Connect with industry professionals", icon: "🤝" },
                    { title: "Job Board", desc: "Find opportunities in the industry", icon: "💼" },
                  ].map((resource, idx) => (
                    <Card key={idx} className="cursor-pointer p-6">
                      <Stack gap={3} className="text-center">
                        <Body className="text-h3-md">{resource.icon}</Body>
                        <Body className="font-display">{resource.title}</Body>
                        <Body size="sm" className="">{resource.desc}</Body>
                      </Stack>
                    </Card>
                  ))}
                </Grid>
              </TabPanel>
            </Tabs>

            <Button variant="outline" onClick={() => router.push("/crew")}>Back to Crew</Button>
          </Stack>
        </Container>
      </MainContent>

      <Modal open={!!selectedMentor && !showRequestModal} onClose={() => setSelectedMentor(null)}>
        <ModalHeader><H3>Mentor Profile</H3></ModalHeader>
        <ModalBody>
          {selectedMentor && (
            <Stack gap={4}>
              <Body className="text-h6-md font-display">{selectedMentor.name}</Body>
              <Body size="sm" className="">{selectedMentor.role} • {selectedMentor.department}</Body>
              <Grid cols={2} gap={4}>
                <Stack gap={1}>
                  <Body size="sm" className="">Experience</Body>
                  <Body>{selectedMentor.yearsExperience} years</Body>
                </Stack>
                <Stack gap={1}>
                  <Body size="sm" className="">Rating</Body>
                  <Body>⭐ {selectedMentor.rating}</Body>
                </Stack>
              </Grid>
              <Stack gap={2}>
                <Body className="font-display">Specialties</Body>
                <Stack direction="horizontal" gap={2} className="flex-wrap">
                  {selectedMentor.specialties.map(spec => <Badge key={spec} variant="outline">{spec}</Badge>)}
                </Stack>
              </Stack>
              <Stack gap={1}>
                <Body size="sm" className="">Current Mentees</Body>
                <Body>{selectedMentor.mentees} of {selectedMentor.maxMentees} slots filled</Body>
              </Stack>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedMentor(null)}>Close</Button>
          {selectedMentor?.availability !== "Full" && (
            <Button variant="solid" onClick={() => setShowRequestModal(true)}>Request Mentorship</Button>
          )}
        </ModalFooter>
      </Modal>

      <Modal open={showRequestModal} onClose={() => { setShowRequestModal(false); setSelectedMentor(null); }}>
        <ModalHeader><H3>Request Mentorship</H3></ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            {selectedMentor && <Body size="sm" className="">Requesting mentorship from {selectedMentor.name}</Body>}
            <Textarea placeholder="Introduce yourself and explain your goals..." rows={4} />
            <Select>
              <option value="">Your experience level...</option>
              <option value="entry">Entry Level (0-2 years)</option>
              <option value="mid">Mid Level (3-5 years)</option>
              <option value="senior">Senior (5+ years)</option>
            </Select>
            <Input placeholder="Areas you want to develop" />
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => { setShowRequestModal(false); setSelectedMentor(null); }}>Cancel</Button>
          <Button variant="solid" onClick={() => { setShowRequestModal(false); setSelectedMentor(null); }}>Submit Request</Button>
        </ModalFooter>
      </Modal>

      {/* Program Enrollment Modal */}
      <Modal open={!!selectedProgram} onClose={() => setSelectedProgram(null)}>
        <ModalHeader>
          <H3>Enroll in {selectedProgram?.name}</H3>
        </ModalHeader>
        <ModalBody>
          {selectedProgram && (
            <Stack gap={4}>
              <Body>{selectedProgram.description}</Body>
              <Grid cols={2} gap={4}>
                <Stack gap={1}>
                  <Body size="sm" className=" text-ink-500">Duration</Body>
                  <Body className="font-display">{selectedProgram.duration}</Body>
                </Stack>
                <Stack gap={1}>
                  <Body size="sm" className=" text-ink-500">Level</Body>
                  <Badge className={getLevelColor(selectedProgram.level)}>{selectedProgram.level}</Badge>
                </Stack>
                <Stack gap={1}>
                  <Body size="sm" className=" text-ink-500">Modules</Body>
                  <Body className="font-display">{selectedProgram.modules} modules</Body>
                </Stack>
                <Stack gap={1}>
                  <Body size="sm" className=" text-ink-500">Availability</Body>
                  <Body className="font-display">{selectedProgram.capacity - selectedProgram.enrolled} spots left</Body>
                </Stack>
              </Grid>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedProgram(null)}>Cancel</Button>
          <Button variant="solid" onClick={() => setSelectedProgram(null)}>Confirm Enrollment</Button>
        </ModalFooter>
      </Modal>
    </CompvssAppLayout>
  );
}
