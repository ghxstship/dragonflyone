'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Section,
  H1,
  H2,
  H3,
  Body,
  Label,
  Button,
  Card,
  Field,
  Input,
  Textarea,
  Select,
  Grid,
  Stack,
  Badge,
  Alert,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  LoadingSpinner,
  StatCard,
  Tabs,
  TabsList,
  Tab,
  TabPanel,
} from '@ghxstship/ui';
import { CreatorNavigationAuthenticated } from '../../components/navigation';

interface CrewMember {
  id: string;
  name: string;
  role: string;
  department: string;
  avatar?: string;
  bio?: string;
  skills: string[];
  projects_count: number;
  connections: string[];
  is_online: boolean;
  joined_date: string;
  location?: string;
  phone?: string;
  email?: string;
}

interface CrewPhoto {
  id: string;
  url: string;
  caption?: string;
  uploaded_by: string;
  project_name?: string;
  uploaded_at: string;
  likes: number;
  liked_by: string[];
}

interface Connection {
  id: string;
  from_user_id: string;
  to_user_id: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
}

const mockCrewMembers: CrewMember[] = [
  { id: 'CREW-001', name: 'John Martinez', role: 'Audio Engineer', department: 'Audio', bio: 'FOH engineer with 15 years experience in live sound.', skills: ['FOH Mixing', 'System Design', 'RF Coordination'], projects_count: 127, connections: ['CREW-002', 'CREW-003'], is_online: true, joined_date: '2020-03-15', location: 'Los Angeles, CA', email: 'john@crew.com' },
  { id: 'CREW-002', name: 'Sarah Chen', role: 'Lighting Designer', department: 'Lighting', bio: 'Award-winning LD specializing in concert touring.', skills: ['grandMA', 'Vectorworks', 'Previz'], projects_count: 89, connections: ['CREW-001', 'CREW-004'], is_online: true, joined_date: '2019-08-22', location: 'Nashville, TN', email: 'sarah@crew.com' },
  { id: 'CREW-003', name: 'Mike Thompson', role: 'Stage Manager', department: 'Stage', bio: 'Production stage manager for festivals and arena tours.', skills: ['Cue Calling', 'Crew Management', 'Logistics'], projects_count: 156, connections: ['CREW-001', 'CREW-005'], is_online: false, joined_date: '2018-01-10', location: 'Austin, TX', email: 'mike@crew.com' },
  { id: 'CREW-004', name: 'Lisa Park', role: 'Video Director', department: 'Video', bio: 'Live video director and IMAG specialist.', skills: ['Switching', 'Camera Direction', 'LED Content'], projects_count: 72, connections: ['CREW-002'], is_online: true, joined_date: '2021-05-03', location: 'New York, NY', email: 'lisa@crew.com' },
  { id: 'CREW-005', name: 'Tom Wilson', role: 'Head Rigger', department: 'Rigging', bio: 'Certified rigger with arena and outdoor experience.', skills: ['Chain Motors', 'Truss Systems', 'Load Calculations'], projects_count: 203, connections: ['CREW-003'], is_online: false, joined_date: '2017-11-28', location: 'Chicago, IL', email: 'tom@crew.com' },
];

const mockPhotos: CrewPhoto[] = [
  { id: 'PHOTO-001', url: '/photos/crew-1.jpg', caption: 'FOH setup at Madison Square Garden', uploaded_by: 'John Martinez', project_name: 'Arena Tour 2024', uploaded_at: '2024-11-20', likes: 24, liked_by: ['CREW-002', 'CREW-003'] },
  { id: 'PHOTO-002', url: '/photos/crew-2.jpg', caption: 'Lighting rig ready for showtime', uploaded_by: 'Sarah Chen', project_name: 'Festival Main Stage', uploaded_at: '2024-11-18', likes: 31, liked_by: ['CREW-001', 'CREW-004', 'CREW-005'] },
  { id: 'PHOTO-003', url: '/photos/crew-3.jpg', caption: 'Crew dinner after load-in', uploaded_by: 'Mike Thompson', project_name: 'Corporate Event', uploaded_at: '2024-11-15', likes: 18, liked_by: ['CREW-001', 'CREW-002'] },
];

export default function CrewSocialPage() {
  const router = useRouter();
  const [crewMembers, setCrewMembers] = useState<CrewMember[]>(mockCrewMembers);
  const [photos, setPhotos] = useState<CrewPhoto[]>(mockPhotos);
  const [activeTab, setActiveTab] = useState('roster');
  const [selectedMember, setSelectedMember] = useState<CrewMember | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleConnect = (memberId: string) => {
    setSuccess('Connection request sent!');
    setShowConnectModal(false);
  };

  const handleLikePhoto = (photoId: string) => {
    setPhotos(photos.map(p => {
      if (p.id === photoId) {
        const isLiked = p.liked_by.includes('CREW-001');
        return {
          ...p,
          likes: isLiked ? p.likes - 1 : p.likes + 1,
          liked_by: isLiked
            ? p.liked_by.filter(id => id !== 'CREW-001')
            : [...p.liked_by, 'CREW-001'],
        };
      }
      return p;
    }));
  };

  const filteredMembers = crewMembers.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesDepartment = departmentFilter === 'All' || m.department === departmentFilter;
    return matchesSearch && matchesDepartment;
  });

  const onlineCount = crewMembers.filter(m => m.is_online).length;
  const totalConnections = crewMembers.reduce((sum, m) => sum + m.connections.length, 0) / 2;

  return (
    <Section className="relative min-h-screen overflow-hidden bg-ink-950 text-ink-50">
      <Card className="pointer-events-none absolute inset-0 grid-overlay opacity-40" />
      <CreatorNavigationAuthenticated />
      <Container className="py-16">
        <Stack gap={8}>
          <Stack direction="horizontal" className="justify-between items-start">
            <Stack gap={2}>
              <H1>Crew Social</H1>
              <Label className="text-ink-400">Connect with your crew, share photos, build your network</Label>
            </Stack>
            <Button variant="solid" onClick={() => router.push('/crew')}>
              Full Directory
            </Button>
          </Stack>

          {error && (
            <Alert variant="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert variant="success" onClose={() => setSuccess(null)}>
              {success}
            </Alert>
          )}

          <Grid cols={4} gap={6}>
            <StatCard label="Crew Members" value={crewMembers.length} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Online Now" value={onlineCount} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Connections" value={totalConnections} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Photos Shared" value={photos.length} className="bg-transparent border-2 border-ink-800" />
          </Grid>

          <Tabs>
            <TabsList>
              <Tab active={activeTab === 'roster'} onClick={() => setActiveTab('roster')}>
                Crew Roster
              </Tab>
              <Tab active={activeTab === 'photos'} onClick={() => setActiveTab('photos')}>
                Photos
              </Tab>
              <Tab active={activeTab === 'connections'} onClick={() => setActiveTab('connections')}>
                My Connections
              </Tab>
            </TabsList>
          </Tabs>

          {activeTab === 'roster' && (
            <Stack gap={6}>
              <Grid cols={3} gap={4}>
                <Input
                  type="search"
                  placeholder="Search crew..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-ink-700 bg-black text-white"
                />
                <Select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="border-ink-700 bg-black text-white"
                >
                  <option value="All">All Departments</option>
                  <option value="Audio">Audio</option>
                  <option value="Lighting">Lighting</option>
                  <option value="Video">Video</option>
                  <option value="Stage">Stage</option>
                  <option value="Rigging">Rigging</option>
                </Select>
                <Button variant="outline" className="border-ink-700 text-ink-400">
                  Find Connections
                </Button>
              </Grid>

              <Grid cols={3} gap={6}>
                {filteredMembers.map(member => (
                  <Card
                    key={member.id}
                    className="border-2 border-ink-800 bg-ink-900/50 p-4 cursor-pointer hover:border-ink-600"
                    onClick={() => setSelectedMember(member)}
                  >
                    <Stack gap={4}>
                      <Stack direction="horizontal" className="justify-between items-start">
                        <Stack gap={1}>
                          <Stack direction="horizontal" gap={2} className="items-center">
                            <Body className="font-display text-white">{member.name}</Body>
                            {member.is_online && (
                              <Card className="w-2 h-2 rounded-full bg-success-500" />
                            )}
                          </Stack>
                          <Label className="text-ink-400">{member.role}</Label>
                        </Stack>
                        <Badge variant="outline">{member.department}</Badge>
                      </Stack>

                      {member.bio && (
                        <Body className="text-ink-300 text-body-sm line-clamp-2">{member.bio}</Body>
                      )}

                      <Stack direction="horizontal" gap={2} className="flex-wrap">
                        {member.skills.slice(0, 3).map(skill => (
                          <Badge key={skill} className="bg-ink-800 text-ink-300 text-mono-xs">{skill}</Badge>
                        ))}
                      </Stack>

                      <Stack direction="horizontal" className="justify-between items-center">
                        <Label size="xs" className="text-ink-500">
                          {member.projects_count} projects • {member.connections.length} connections
                        </Label>
                        <Button variant="ghost" size="sm" onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMember(member);
                          setShowConnectModal(true);
                        }}>
                          Connect
                        </Button>
                      </Stack>
                    </Stack>
                  </Card>
                ))}
              </Grid>
            </Stack>
          )}

          {activeTab === 'photos' && (
            <Stack gap={6}>
              <Stack direction="horizontal" className="justify-between items-center">
                <H3>Recent Photos</H3>
                <Button variant="outline" className="border-ink-700 text-ink-400">
                  Upload Photo
                </Button>
              </Stack>

              <Grid cols={3} gap={6}>
                {photos.map(photo => (
                  <Card key={photo.id} className="border-2 border-ink-800 bg-ink-900/50 overflow-hidden">
                    <Card className="h-48 bg-ink-800 flex items-center justify-center">
                      <Body className="text-ink-500">📷 Photo</Body>
                    </Card>
                    <Stack gap={3} className="p-4">
                      {photo.caption && (
                        <Body className="text-white">{photo.caption}</Body>
                      )}
                      <Stack direction="horizontal" className="justify-between items-center">
                        <Stack gap={1}>
                          <Label className="text-ink-400">{photo.uploaded_by}</Label>
                          <Label size="xs" className="text-ink-500">{photo.project_name}</Label>
                        </Stack>
                        <Stack direction="horizontal" gap={2} className="items-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleLikePhoto(photo.id)}
                            className={photo.liked_by.includes('CREW-001') ? 'text-error-400' : ''}
                          >
                            ❤️ {photo.likes}
                          </Button>
                        </Stack>
                      </Stack>
                    </Stack>
                  </Card>
                ))}
              </Grid>
            </Stack>
          )}

          {activeTab === 'connections' && (
            <Stack gap={6}>
              <H3>My Connections</H3>
              <Grid cols={2} gap={6}>
                {crewMembers.filter(m => m.connections.includes('CREW-001')).map(member => (
                  <Card key={member.id} className="border-2 border-ink-800 bg-ink-900/50 p-4">
                    <Stack direction="horizontal" className="justify-between items-center">
                      <Stack direction="horizontal" gap={4} className="items-center">
                        <Card className="w-12 h-12 rounded-full bg-ink-700 flex items-center justify-center">
                          <Body className="text-white">{member.name.charAt(0)}</Body>
                        </Card>
                        <Stack gap={1}>
                          <Stack direction="horizontal" gap={2} className="items-center">
                            <Body className="font-display text-white">{member.name}</Body>
                            {member.is_online && (
                              <Badge className="bg-success-500 text-white text-mono-xs">Online</Badge>
                            )}
                          </Stack>
                          <Label className="text-ink-400">{member.role}</Label>
                          <Label size="xs" className="text-ink-500">{member.location}</Label>
                        </Stack>
                      </Stack>
                      <Stack direction="horizontal" gap={2}>
                        <Button variant="ghost" size="sm">Message</Button>
                        <Button variant="outline" size="sm" onClick={() => setSelectedMember(member)}>
                          Profile
                        </Button>
                      </Stack>
                    </Stack>
                  </Card>
                ))}
              </Grid>
            </Stack>
          )}

          <Grid cols={4} gap={4}>
            <Button variant="outlineWhite" onClick={() => router.push('/crew')}>Full Directory</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push('/channels')}>Channels</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400">My Profile</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400">Settings</Button>
          </Grid>
        </Stack>
      </Container>

      <Modal open={!!selectedMember && !showConnectModal} onClose={() => setSelectedMember(null)}>
        <ModalHeader><H3>Crew Profile</H3></ModalHeader>
        <ModalBody>
          {selectedMember && (
            <Stack gap={4}>
              <Stack direction="horizontal" gap={4} className="items-center">
                <Card className="w-16 h-16 rounded-full bg-ink-700 flex items-center justify-center">
                  <Body className="text-white text-h5-md">{selectedMember.name.charAt(0)}</Body>
                </Card>
                <Stack gap={1}>
                  <Stack direction="horizontal" gap={2} className="items-center">
                    <Body className="font-display text-white text-h6-md">{selectedMember.name}</Body>
                    {selectedMember.is_online && (
                      <Badge className="bg-success-500 text-white">Online</Badge>
                    )}
                  </Stack>
                  <Label className="text-ink-400">{selectedMember.role}</Label>
                  <Badge variant="outline">{selectedMember.department}</Badge>
                </Stack>
              </Stack>

              {selectedMember.bio && (
                <Body className="text-ink-300">{selectedMember.bio}</Body>
              )}

              <Grid cols={2} gap={4}>
                <Stack gap={1}>
                  <Label size="xs" className="text-ink-500">Location</Label>
                  <Label className="text-white">{selectedMember.location || 'Not specified'}</Label>
                </Stack>
                <Stack gap={1}>
                  <Label size="xs" className="text-ink-500">Member Since</Label>
                  <Label className="text-white">{new Date(selectedMember.joined_date).toLocaleDateString()}</Label>
                </Stack>
              </Grid>

              <Stack gap={2}>
                <Label size="xs" className="text-ink-500">Skills</Label>
                <Stack direction="horizontal" gap={2} className="flex-wrap">
                  {selectedMember.skills.map(skill => (
                    <Badge key={skill} variant="outline">{skill}</Badge>
                  ))}
                </Stack>
              </Stack>

              <Grid cols={2} gap={4}>
                <Card className="p-3 bg-ink-800 text-center">
                  <Body className="text-h5-md font-bold text-white">{selectedMember.projects_count}</Body>
                  <Label size="xs" className="text-ink-500">Projects</Label>
                </Card>
                <Card className="p-3 bg-ink-800 text-center">
                  <Body className="text-h5-md font-bold text-white">{selectedMember.connections.length}</Body>
                  <Label size="xs" className="text-ink-500">Connections</Label>
                </Card>
              </Grid>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedMember(null)}>Close</Button>
          <Button variant="solid" onClick={() => setShowConnectModal(true)}>Connect</Button>
        </ModalFooter>
      </Modal>

      <Modal open={showConnectModal} onClose={() => setShowConnectModal(false)}>
        <ModalHeader><H3>Send Connection Request</H3></ModalHeader>
        <ModalBody>
          {selectedMember && (
            <Stack gap={4}>
              <Body className="text-ink-300">
                Send a connection request to <span className="text-white font-bold">{selectedMember.name}</span>?
              </Body>
              <Textarea
                placeholder="Add a personal message (optional)..."
                rows={3}
                className="border-ink-700 bg-black text-white"
              />
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowConnectModal(false)}>Cancel</Button>
          <Button variant="solid" onClick={() => handleConnect(selectedMember?.id || '')}>
            Send Request
          </Button>
        </ModalFooter>
      </Modal>
    </Section>
  );
}
