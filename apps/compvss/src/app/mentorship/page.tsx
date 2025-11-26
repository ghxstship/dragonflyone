"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "../../components/navigation";
import {
  Container, H1, H3, Body, Label, Grid, Stack, StatCard, Input, Select, Button,
  Section as UISection, Card, Tabs, TabsList, Tab, TabPanel, Badge,
  Modal, ModalHeader, ModalBody, ModalFooter, Textarea, ProgressBar,
} from "@ghxstship/ui";

interface Mentor {
  id: string;
  name: string;
  role: string;
  department: string;
  yearsExperience: number;
  specialties: string[];
  availability: "Available" | "Limited" | "Full";
  mentees: number;
  maxMentees: number;
  rating: number;
}

interface MentorshipProgram {
  id: string;
  name: string;
  description: string;
  duration: string;
  level: "Entry" | "Intermediate" | "Advanced";
  modules: number;
  enrolled: number;
  capacity: number;
}

const mockMentors: Mentor[] = [
  { id: "MNT-001", name: "Sarah Chen", role: "Senior Production Manager", department: "Production", yearsExperience: 15, specialties: ["Festival Production", "Large Scale Events", "Budget Management"], availability: "Available", mentees: 2, maxMentees: 4, rating: 4.9 },
  { id: "MNT-002", name: "Mike Thompson", role: "Technical Director", department: "Technical", yearsExperience: 20, specialties: ["Audio Systems", "Rigging", "Safety"], availability: "Limited", mentees: 3, maxMentees: 3, rating: 4.8 },
  { id: "MNT-003", name: "Lisa Park", role: "Lighting Designer", department: "Lighting", yearsExperience: 12, specialties: ["Concert Lighting", "Programming", "Design"], availability: "Available", mentees: 1, maxMentees: 3, rating: 4.7 },
  { id: "MNT-004", name: "John Martinez", role: "Stage Manager", department: "Stage", yearsExperience: 18, specialties: ["Run of Show", "Artist Relations", "Crew Management"], availability: "Full", mentees: 4, maxMentees: 4, rating: 4.9 },
];

const mockPrograms: MentorshipProgram[] = [
  { id: "PRG-001", name: "Production Fundamentals", description: "Learn the basics of live event production", duration: "8 weeks", level: "Entry", modules: 12, enrolled: 24, capacity: 30 },
  { id: "PRG-002", name: "Technical Operations", description: "Deep dive into technical production systems", duration: "12 weeks", level: "Intermediate", modules: 18, enrolled: 15, capacity: 20 },
  { id: "PRG-003", name: "Leadership in Production", description: "Develop management and leadership skills", duration: "16 weeks", level: "Advanced", modules: 24, enrolled: 8, capacity: 12 },
];

export default function MentorshipPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("mentors");
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<MentorshipProgram | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);

  const availableMentors = mockMentors.filter(m => m.availability !== "Full").length;
  const totalMentees = mockMentors.reduce((sum, m) => sum + m.mentees, 0);

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case "Available": return "text-success-400";
      case "Limited": return "text-warning-400";
      case "Full": return "text-error-400";
      default: return "text-ink-400";
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Entry": return "bg-success-900/20 border-success-800";
      case "Intermediate": return "bg-warning-900/20 border-warning-800";
      case "Advanced": return "bg-purple-900/20 border-purple-800";
      default: return "bg-ink-900/50 border-ink-800";
    }
  };

  return (
    <UISection className="relative min-h-screen overflow-hidden bg-ink-950 text-ink-50">
      <Card className="pointer-events-none absolute inset-0 grid-overlay opacity-40" />
      <Navigation />
      <Container className="py-16">
        <Stack gap={8}>
          <Stack gap={2}>
            <H1>Mentorship Program</H1>
            <Label className="text-ink-400">Connect with experienced professionals and accelerate your career</Label>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard label="Active Mentors" value={mockMentors.length} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Available" value={availableMentors} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Active Mentees" value={totalMentees} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Programs" value={mockPrograms.length} className="bg-transparent border-2 border-ink-800" />
          </Grid>

          <Tabs>
            <TabsList>
              <Tab active={activeTab === "mentors"} onClick={() => setActiveTab("mentors")}>Find a Mentor</Tab>
              <Tab active={activeTab === "programs"} onClick={() => setActiveTab("programs")}>Programs</Tab>
              <Tab active={activeTab === "resources"} onClick={() => setActiveTab("resources")}>Resources</Tab>
            </TabsList>

            <TabPanel active={activeTab === "mentors"}>
              <Grid cols={2} gap={4}>
                {mockMentors.map((mentor) => (
                  <Card key={mentor.id} className="border-2 border-ink-800 bg-ink-900/50 p-6">
                    <Stack gap={4}>
                      <Stack direction="horizontal" className="justify-between items-start">
                        <Stack gap={1}>
                          <Body className="font-display text-white text-lg">{mentor.name}</Body>
                          <Label className="text-ink-400">{mentor.role}</Label>
                        </Stack>
                        <Label className={getAvailabilityColor(mentor.availability)}>{mentor.availability}</Label>
                      </Stack>
                      <Grid cols={3} gap={4}>
                        <Stack gap={1}><Label size="xs" className="text-ink-500">Experience</Label><Label className="text-white">{mentor.yearsExperience} years</Label></Stack>
                        <Stack gap={1}><Label size="xs" className="text-ink-500">Rating</Label><Label className="text-white">⭐ {mentor.rating}</Label></Stack>
                        <Stack gap={1}><Label size="xs" className="text-ink-500">Mentees</Label><Label className="text-white">{mentor.mentees}/{mentor.maxMentees}</Label></Stack>
                      </Grid>
                      <Stack gap={2}>
                        <Label size="xs" className="text-ink-500">Specialties</Label>
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

            <TabPanel active={activeTab === "programs"}>
              <Stack gap={4}>
                {mockPrograms.map((program) => (
                  <Card key={program.id} className={`border-2 p-6 ${getLevelColor(program.level)}`}>
                    <Grid cols={4} gap={6} className="items-center">
                      <Stack gap={2}>
                        <Body className="font-display text-white text-lg">{program.name}</Body>
                        <Badge variant="outline">{program.level}</Badge>
                      </Stack>
                      <Stack gap={1}>
                        <Label className="text-ink-300">{program.description}</Label>
                        <Label size="xs" className="text-ink-500">{program.duration} • {program.modules} modules</Label>
                      </Stack>
                      <Stack gap={2}>
                        <Label size="xs" className="text-ink-500">Enrollment</Label>
                        <ProgressBar value={(program.enrolled / program.capacity) * 100} className="h-2" />
                        <Label size="xs" className="text-ink-400">{program.enrolled}/{program.capacity} enrolled</Label>
                      </Stack>
                      <Button variant="solid" size="sm" onClick={() => setSelectedProgram(program)}>Enroll</Button>
                    </Grid>
                  </Card>
                ))}
              </Stack>
            </TabPanel>

            <TabPanel active={activeTab === "resources"}>
              <Grid cols={3} gap={4}>
                {[
                  { title: "Getting Started Guide", desc: "New to the industry? Start here", icon: "📚" },
                  { title: "Career Pathways", desc: "Explore different career tracks", icon: "🛤️" },
                  { title: "Skill Assessments", desc: "Identify your strengths and gaps", icon: "📊" },
                  { title: "Industry Certifications", desc: "Professional certification programs", icon: "🏆" },
                  { title: "Networking Events", desc: "Connect with industry professionals", icon: "🤝" },
                  { title: "Job Board", desc: "Find opportunities in the industry", icon: "💼" },
                ].map((resource, idx) => (
                  <Card key={idx} className="border-2 border-ink-800 bg-ink-900/50 p-6 cursor-pointer hover:border-white">
                    <Stack gap={3} className="text-center">
                      <Label className="text-4xl">{resource.icon}</Label>
                      <Body className="font-display text-white">{resource.title}</Body>
                      <Label className="text-ink-400">{resource.desc}</Label>
                    </Stack>
                  </Card>
                ))}
              </Grid>
            </TabPanel>
          </Tabs>

          <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/crew")}>Back to Crew</Button>
        </Stack>
      </Container>

      <Modal open={!!selectedMentor && !showRequestModal} onClose={() => setSelectedMentor(null)}>
        <ModalHeader><H3>Mentor Profile</H3></ModalHeader>
        <ModalBody>
          {selectedMentor && (
            <Stack gap={4}>
              <Body className="font-display text-white text-xl">{selectedMentor.name}</Body>
              <Label className="text-ink-400">{selectedMentor.role} • {selectedMentor.department}</Label>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label size="xs" className="text-ink-500">Experience</Label><Label className="text-white">{selectedMentor.yearsExperience} years</Label></Stack>
                <Stack gap={1}><Label size="xs" className="text-ink-500">Rating</Label><Label className="text-white">⭐ {selectedMentor.rating}</Label></Stack>
              </Grid>
              <Stack gap={2}>
                <Label className="text-ink-400">Specialties</Label>
                <Stack direction="horizontal" gap={2} className="flex-wrap">
                  {selectedMentor.specialties.map(spec => <Badge key={spec} variant="outline">{spec}</Badge>)}
                </Stack>
              </Stack>
              <Stack gap={1}>
                <Label size="xs" className="text-ink-500">Current Mentees</Label>
                <Label className="text-white">{selectedMentor.mentees} of {selectedMentor.maxMentees} slots filled</Label>
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
            {selectedMentor && <Label className="text-ink-400">Requesting mentorship from {selectedMentor.name}</Label>}
            <Textarea placeholder="Introduce yourself and explain your goals..." className="border-ink-700 bg-black text-white" rows={4} />
            <Select className="border-ink-700 bg-black text-white">
              <option value="">Your experience level...</option>
              <option value="entry">Entry Level (0-2 years)</option>
              <option value="mid">Mid Level (3-5 years)</option>
              <option value="senior">Senior (5+ years)</option>
            </Select>
            <Input placeholder="Areas you want to develop" className="border-ink-700 bg-black text-white" />
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => { setShowRequestModal(false); setSelectedMentor(null); }}>Cancel</Button>
          <Button variant="solid" onClick={() => { setShowRequestModal(false); setSelectedMentor(null); }}>Submit Request</Button>
        </ModalFooter>
      </Modal>
    </UISection>
  );
}
